import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';
import { computeEmi } from '../../shared/emi';
import { productService } from '../products/product.service';
import { SOURCE_DEFS } from '../verification/sources';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const OFFER_VALID_DAYS = 14;

export class ApplicationService {
  /**
   * Start a new application for a product. Clamps amount/tenor to the product's
   * bounds, computes an indicative EMI, and seeds the 7 verification sources as
   * 'pending' so the verification screen has rows to connect.
   */
  async create(userId: string, input: { productKey: string; amount: number; tenorMonths: number; formData?: any }) {
    const product = productService.getByKey(input.productKey);
    const amount = clamp(Number(input.amount) || product.defaultAmount, product.minAmount, product.maxAmount);
    const tenorMonths = clamp(Number(input.tenorMonths) || product.defaultTenor, product.minTenor, product.maxTenor);
    const indicativeRate = product.maxRate; // conservative until underwriting prices it
    const breakup = computeEmi(amount, indicativeRate, tenorMonths, product.processingFeePct);

    // Validate required product-specific fields.
    const formData = input.formData || {};
    const missing = (product.formFields || [])
      .filter((f) => f.required && !String(formData[f.key] ?? '').trim())
      .map((f) => f.label);
    if (missing.length > 0) {
      throw new AppError(400, `Please complete: ${missing.join(', ')}.`);
    }

    const app = await prisma.loanApplication.create({
      data: {
        userId,
        requestedAmount: amount,
        purpose: product.name,
        productKey: product.key,
        tenorMonths,
        interestRate: indicativeRate,
        formData,
        stage: 'verifying',
        status: 'PENDING',
        verifications: {
          create: SOURCE_DEFS.map((s) => ({
            userId,
            sourceType: s.type,
            provider: s.provider,
            status: 'pending',
          })),
        },
      },
      include: { verifications: true },
    });

    return { application: this.toResponse(app), indicative: breakup, product };
  }

  async get(userId: string, id: string) {
    const app = await prisma.loanApplication.findFirst({
      where: { id, userId },
      include: { verifications: true },
    });
    if (!app) throw new AppError(404, 'Application not found.');
    return this.toResponse(app);
  }

  async list(userId: string) {
    const apps = await prisma.loanApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { verifications: true },
    });
    return apps.map((a) => this.toResponse(a));
  }

  /**
   * Run the underwriting engine. Requires all required sources verified, reads
   * the pulled data (CIBIL score, GST turnover, bank cash-flow), prices the
   * loan, and produces an offer. Deterministic — same inputs, same offer.
   */
  async underwrite(userId: string, id: string) {
    const app = await prisma.loanApplication.findFirst({
      where: { id, userId },
      include: { verifications: true },
    });
    if (!app) throw new AppError(404, 'Application not found.');
    if (!app.productKey) throw new AppError(400, 'Application has no product.');

    const product = productService.getByKey(app.productKey);
    const required = SOURCE_DEFS.filter((s) => s.required).map((s) => s.type);
    const verified = new Set(app.verifications.filter((v) => v.status === 'verified').map((v) => v.sourceType));
    const missing = required.filter((t) => !verified.has(t));
    if (missing.length > 0) {
      throw new AppError(400, `Cannot underwrite — ${missing.length} verification(s) pending: ${missing.join(', ')}.`);
    }

    // Pull decision inputs from the verified source data (fallbacks for safety).
    const dataOf = (t: string) => (app.verifications.find((v) => v.sourceType === t)?.data as any) || {};
    const cibil = Number(dataOf('CIBIL').score ?? 742);
    const turnover = Number(dataOf('GST').annualTurnover ?? 6800000);

    const decision = this.runUnderwriting({
      requested: app.requestedAmount,
      tenorMonths: app.tenorMonths ?? product.defaultTenor,
      cibil,
      turnover,
      product,
    });

    if (decision.rejected) {
      const updated = await prisma.loanApplication.update({
        where: { id: app.id },
        data: { stage: 'rejected', status: 'REJECTED', notes: decision.reason },
        include: { verifications: true },
      });
      return { application: this.toResponse(updated), offer: null, rejected: true, reason: decision.reason };
    }

    const breakup = computeEmi(decision.amount, decision.rate, decision.tenorMonths, product.processingFeePct);
    const offerExpiresAt = new Date(Date.now() + OFFER_VALID_DAYS * 24 * 60 * 60 * 1000);

    const updated = await prisma.loanApplication.update({
      where: { id: app.id },
      data: {
        stage: 'offer',
        status: 'APPROVED',
        offerAmount: decision.amount,
        offerRate: decision.rate,
        offerTenorMonths: decision.tenorMonths,
        offerEmi: breakup.emi,
        offerApr: breakup.apr,
        offerExpiresAt,
      },
      include: { verifications: true },
    });

    return {
      application: this.toResponse(updated),
      offer: {
        amount: decision.amount,
        rate: decision.rate,
        tenorMonths: decision.tenorMonths,
        emi: breakup.emi,
        apr: breakup.apr,
        totalInterest: breakup.totalInterest,
        totalPayable: breakup.totalPayable,
        processingFeePct: product.processingFeePct,
        expiresAt: offerExpiresAt,
        rationale: decision.rationale,
      },
      rejected: false,
    };
  }

  /** Deterministic, transparent demo underwriting rules. */
  private runUnderwriting(p: {
    requested: number; tenorMonths: number; cibil: number; turnover: number;
    product: { key: string; minRate: number; maxRate: number; maxAmount: number };
  }) {
    const rationale: string[] = [];

    if (p.cibil < 600) {
      return { rejected: true, reason: `CIBIL score ${p.cibil} is below the minimum of 600.`, amount: 0, rate: 0, tenorMonths: p.tenorMonths, rationale };
    }

    // Eligibility cap: 40% of annual turnover, within product ceiling.
    const turnoverCap = Math.round(p.turnover * 0.4);
    const eligibleCap = Math.min(turnoverCap, p.product.maxAmount);
    const amount = Math.min(p.requested, eligibleCap);
    rationale.push(`Eligibility cap ₹${eligibleCap.toLocaleString('en-IN')} (40% of ₹${p.turnover.toLocaleString('en-IN')} turnover).`);
    if (amount < p.requested) rationale.push(`Offered ₹${amount.toLocaleString('en-IN')} vs requested ₹${p.requested.toLocaleString('en-IN')}.`);

    // Risk-based pricing off CIBIL band.
    let premium = 5;
    if (p.cibil >= 750) premium = 0;
    else if (p.cibil >= 700) premium = 1.5;
    else if (p.cibil >= 650) premium = 3;
    const rate = clamp(p.product.minRate + premium, p.product.minRate, p.product.maxRate);
    rationale.push(`Rate ${rate}% (base ${p.product.minRate}% + ${premium}% risk premium for CIBIL ${p.cibil}).`);

    return { rejected: false, reason: '', amount, rate, tenorMonths: p.tenorMonths, rationale };
  }

  /** Accept the offer → move to the references step. */
  async acceptOffer(userId: string, id: string) {
    const app = await this.requireApp(userId, id);
    if (app.stage !== 'offer') throw new AppError(400, 'No offer to accept on this application.');
    const updated = await prisma.loanApplication.update({
      where: { id }, data: { stage: 'references' }, include: { verifications: true },
    });
    return this.toResponse(updated);
  }

  /** Save 2 references (+ optional guarantor) → move to the bank step. */
  async saveReferences(userId: string, id: string, input: { references: any[]; guarantor?: any }) {
    const app = await this.requireApp(userId, id);
    const refs = (input.references || []).filter((r) => r && r.name && r.phone);
    if (refs.length < 2) throw new AppError(400, 'Two references are required.');

    await prisma.reference.deleteMany({ where: { applicationId: id } });
    const rows = refs.map((r) => ({
      userId, applicationId: id, name: String(r.name), phone: String(r.phone),
      relationship: String(r.relationship || 'Other'), isGuarantor: false,
    }));
    if (input.guarantor && input.guarantor.name && input.guarantor.phone) {
      rows.push({
        userId, applicationId: id, name: String(input.guarantor.name), phone: String(input.guarantor.phone),
        relationship: 'Guarantor', isGuarantor: true,
      });
    }
    await prisma.reference.createMany({ data: rows });
    await prisma.loanApplication.update({ where: { id }, data: { stage: 'bank' } });
    return { saved: rows.length };
  }

  /** Save the disbursal bank account (stores only last 4 digits). */
  async saveBankAccount(userId: string, id: string, input: { accountNumber: string; ifsc: string }) {
    await this.requireApp(userId, id);
    const acc = String(input.accountNumber || '').replace(/\s/g, '');
    const ifsc = String(input.ifsc || '').trim().toUpperCase();
    if (acc.length < 6 || ifsc.length < 8) throw new AppError(400, 'Valid account number and IFSC are required.');
    const last4 = acc.slice(-4);

    const bank = await prisma.bankAccount.upsert({
      where: { applicationId: id },
      update: { accountLast4: last4, ifsc, verified: false, pennyDropRef: null, accountName: null },
      create: { userId, applicationId: id, accountLast4: last4, ifsc },
    });
    return { accountLast4: bank.accountLast4, ifsc: bank.ifsc, verified: bank.verified };
  }

  /** Mock ₹1 penny-drop (NPCI via Decentro). Confirms the account name match. */
  async pennyDrop(userId: string, id: string) {
    await this.requireApp(userId, id);
    const bank = await prisma.bankAccount.findUnique({ where: { applicationId: id } });
    if (!bank) throw new AppError(400, 'Add a bank account first.');
    const accountName = 'Rajesh Kumar Mehta'; // mock name returned by the bank
    const updated = await prisma.bankAccount.update({
      where: { applicationId: id },
      data: { verified: true, accountName, pennyDropRef: 'pd_' + Math.random().toString(36).slice(2, 10) },
    });
    return { verified: true, nameMatch: true, accountName, accountLast4: updated.accountLast4, bank: 'HDFC Bank' };
  }

  /** Mock NACH e-mandate setup → move to the e-Sign step. */
  async setupNach(userId: string, id: string) {
    await this.requireApp(userId, id);
    const bank = await prisma.bankAccount.findUnique({ where: { applicationId: id } });
    if (!bank || !bank.verified) throw new AppError(400, 'Verify the bank account (penny drop) first.');
    const mandateId = 'NACH' + Date.now().toString().slice(-10);
    await prisma.bankAccount.update({ where: { applicationId: id }, data: { nachMandateId: mandateId, nachStatus: 'active' } });
    await prisma.loanApplication.update({ where: { id }, data: { stage: 'esign' } });
    return { nachMandateId: mandateId, nachStatus: 'active' };
  }

  /** Key Fact Statement summary for the agreement screen. */
  async getKfs(userId: string, id: string) {
    const app = await prisma.loanApplication.findFirst({
      where: { id, userId },
      include: { user: { include: { businessProfile: true } }, verifications: true },
    });
    if (!app) throw new AppError(404, 'Application not found.');
    if (app.offerAmount == null) throw new AppError(400, 'No offer to sign yet.');

    const bp = app.user?.businessProfile;
    const panData = (app.verifications.find((v) => v.sourceType === 'PAN')?.data as any) || {};
    const borrower = bp?.businessName || app.user?.name || 'Borrower';
    const pan = bp?.panNumber || panData.pan || null;

    return {
      borrower, pan,
      amount: app.offerAmount,
      rate: app.offerRate,
      tenorMonths: app.offerTenorMonths,
      emi: app.offerEmi,
      apr: app.offerApr,
      coolingOffDays: 3,
    };
  }

  /**
   * Mock Aadhaar e-Sign, then disburse. One tap signs the KFS, sets up the
   * cooling-off window, creates the active Loan, and records the disbursement
   * with a UTR + first-EMI date.
   */
  async esignAndDisburse(userId: string, id: string) {
    const app = await this.requireApp(userId, id);
    if (app.offerAmount == null) throw new AppError(400, 'No approved offer to disburse.');
    const bank = await prisma.bankAccount.findUnique({ where: { applicationId: id } });
    if (!bank || !bank.verified) throw new AppError(400, 'Bank account is not verified.');

    const now = new Date();
    const coolingOffEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const firstEmiDate = new Date(now); firstEmiDate.setMonth(firstEmiDate.getMonth() + 1);
    const utr = 'SVK' + now.getFullYear() + Math.floor(100000000 + Math.random() * 900000000);

    // Create the active loan from the accepted offer.
    const loan = await prisma.loan.create({
      data: {
        userId,
        loanNumber: 'SVK-' + Math.floor(1000000 + Math.random() * 9000000),
        amount: app.offerAmount,
        status: 'ACTIVE',
        emiDue: app.offerEmi ?? 0,
        nextDueDate: firstEmiDate,
      },
    });

    const disb = await prisma.disbursement.upsert({
      where: { applicationId: id },
      update: { loanId: loan.id, amount: app.offerAmount, accountLast4: bank.accountLast4, utr, firstEmiDate },
      create: { userId, applicationId: id, loanId: loan.id, amount: app.offerAmount, accountLast4: bank.accountLast4, utr, firstEmiDate },
    });

    await prisma.loanApplication.update({
      where: { id },
      data: { esignStatus: 'signed', signedAt: now, coolingOffEndsAt, stage: 'disbursed', status: 'APPROVED' },
    });

    return {
      disbursement: {
        amount: disb.amount,
        accountLast4: disb.accountLast4,
        utr: disb.utr,
        firstEmiDate: disb.firstEmiDate,
        emi: app.offerEmi,
      },
      loanId: loan.id,
      loanNumber: loan.loanNumber,
    };
  }

  private async requireApp(userId: string, id: string) {
    const app = await prisma.loanApplication.findFirst({ where: { id, userId } });
    if (!app) throw new AppError(404, 'Application not found.');
    return app;
  }

  private toResponse(app: any) {
    return {
      id: app.id,
      productKey: app.productKey,
      purpose: app.purpose,
      requestedAmount: app.requestedAmount,
      tenorMonths: app.tenorMonths,
      interestRate: app.interestRate,
      stage: app.stage,
      status: app.status,
      offer: app.offerAmount != null ? {
        amount: app.offerAmount,
        rate: app.offerRate,
        tenorMonths: app.offerTenorMonths,
        emi: app.offerEmi,
        apr: app.offerApr,
        expiresAt: app.offerExpiresAt,
      } : null,
      verifications: (app.verifications || []).map((v: any) => ({
        sourceType: v.sourceType,
        provider: v.provider,
        status: v.status,
        referenceId: v.referenceId,
      })),
      createdAt: app.createdAt,
    };
  }
}

export const applicationService = new ApplicationService();
