import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';
import { SOURCE_DEFS, SOURCE_TYPES } from './sources';
import { getMockResult } from './verification.providers';

export class VerificationService {
  /**
   * List the verification sources for an application, merged with the catalog
   * definition (label + provider name). Ensures all 7 rows exist (creates any
   * missing as 'pending').
   */
  async listForApplication(userId: string, applicationId: string) {
    const app = await prisma.loanApplication.findFirst({ where: { id: applicationId, userId } });
    if (!app) throw new AppError(404, 'Application not found.');

    let rows = await prisma.verificationSource.findMany({ where: { applicationId, userId } });

    // Backfill any missing source rows.
    const have = new Set(rows.map((r) => r.sourceType));
    const toCreate = SOURCE_DEFS.filter((d) => !have.has(d.type));
    if (toCreate.length > 0) {
      await prisma.verificationSource.createMany({
        data: toCreate.map((d) => ({ userId, applicationId, sourceType: d.type, provider: d.provider, status: 'pending' })),
      });
      rows = await prisma.verificationSource.findMany({ where: { applicationId, userId } });
    }

    const byType = new Map(rows.map((r) => [r.sourceType, r]));
    const sources = SOURCE_DEFS.map((d) => {
      const r = byType.get(d.type);
      return {
        sourceType: d.type,
        label: d.label,
        providerLabel: d.providerLabel,
        required: d.required,
        status: r?.status ?? 'pending',
        referenceId: r?.referenceId ?? null,
      };
    });

    const connected = sources.filter((s) => s.status === 'verified').length;
    return { applicationId, total: sources.length, connected, remaining: sources.length - connected, sources };
  }

  /**
   * "Connect" one data source — in mock mode this pulls structured data via the
   * mock provider and marks it verified. The same call shape works against a
   * real vendor once a live provider is plugged in.
   */
  async connect(userId: string, applicationId: string, sourceType: string) {
    if (!SOURCE_TYPES.includes(sourceType as any)) {
      throw new AppError(400, `Unknown source type "${sourceType}".`);
    }
    const def = SOURCE_DEFS.find((d) => d.type === sourceType)!;

    const app = await prisma.loanApplication.findFirst({ where: { id: applicationId, userId } });
    if (!app) throw new AppError(404, 'Application not found.');

    const result = getMockResult(def);

    const row = await prisma.verificationSource.upsert({
      where: { applicationId_sourceType: { applicationId, sourceType } },
      update: { status: result.status, provider: def.provider, referenceId: result.referenceId, data: result.data },
      create: { userId, applicationId, sourceType, provider: def.provider, status: result.status, referenceId: result.referenceId, data: result.data },
    });

    // Once everything is verified, advance the application stage.
    const summary = await this.listForApplication(userId, applicationId);
    if (summary.remaining === 0 && app.stage === 'verifying') {
      await prisma.loanApplication.update({ where: { id: applicationId }, data: { stage: 'underwriting' } });
    }

    return {
      source: { sourceType, label: def.label, providerLabel: def.providerLabel, status: row.status, referenceId: row.referenceId },
      summary,
    };
  }
}

export const verificationService = new VerificationService();
