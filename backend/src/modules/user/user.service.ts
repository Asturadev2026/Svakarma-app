import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';

// Documents that count toward KYC completion.
const REQUIRED_KYC_DOCS = ['PAN_CARD', 'AADHAAR_CARD'] as const;
// The six profile sections shown in the app, each worth an equal share.
const TOTAL_SECTIONS = 6;

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        businessProfile: true,
        documents: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User profile not found.');
    }

    const bp = user.businessProfile;
    const docs = user.documents ?? [];
    const references = await prisma.userReference.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });

    // ── Build a per-doc-type summary so the UI can show real upload status ──
    // For each docType keep the newest record's status.
    const docByType: Record<string, { uploaded: boolean; status: string; fileName: string | null; fileUrl: string | null; uploadedAt: Date | null }> = {};
    for (const d of docs) {
      const existing = docByType[d.docType];
      if (!existing || (d.createdAt && existing.uploadedAt && d.createdAt > existing.uploadedAt) || !existing.uploadedAt) {
        docByType[d.docType] = {
          uploaded: true,
          status: d.status,
          fileName: d.fileName ?? null,
          fileUrl: d.fileUrl ?? null,
          uploadedAt: d.createdAt ?? null,
        };
      }
    }
    const isUploaded = (t: string) => !!docByType[t]?.uploaded;
    const isVerified = (t: string) => docByType[t]?.status === 'verified';

    // ── Section completion — derived from the SAME data the screen shows ──
    const sectionsStatus = {
      personal: !!(user.name && user.name.trim().length > 0),
      business: !!(bp?.businessName && bp?.businessType),
      financial: !!(bp?.annualTurnover && String(bp.annualTurnover).trim().length > 0),
      address: !!(bp?.city && bp?.state),
      // KYC section is complete once the required documents are uploaded.
      kyc: REQUIRED_KYC_DOCS.every((t) => isUploaded(t)),
      // References section is complete with at least two references.
      references: references.length >= 2,
    };

    const doneCount = Object.values(sectionsStatus).filter(Boolean).length;
    const completion = Math.round((doneCount / TOTAL_SECTIONS) * 100);

    // Keep the cached value on the user fresh (used by login/home).
    if (user.profileCompletion !== completion) {
      prisma.user
        .update({ where: { id: user.id }, data: { profileCompletion: completion } })
        .catch(() => { /* non-blocking cache refresh */ });
    }

    return {
      personalDetails: {
        fullName: user.name ?? 'Complete Your Profile',
        email: user.email ?? null,
        mobile: user.phone,
        dob: null,             // not in schema yet
        pan: bp?.panNumber ?? null,
        aadhaar: bp?.aadhaarNumber ?? null,
      },
      businessDetails: {
        businessName: bp?.businessName ?? (user.companyName ?? ''),
        udyamId: bp?.udyamNumber ?? null,
        gstin: bp?.gstNumber ?? null,
        businessType: bp?.businessType ?? null,
        industry: bp?.industry ?? null,
        annualTurnover: bp?.annualTurnover ?? null,
        location: user.location ?? '',
        city: bp?.city ?? null,
        state: bp?.state ?? null,
        pincode: bp?.pincode ?? null,
        addressLine1: bp?.addressLine1 ?? null,
        addressLine2: bp?.addressLine2 ?? null,
      },
      // Per-section completion flags — the frontend's single source of truth.
      sectionsStatus,
      references: references.map((r) => ({ id: r.id, name: r.name, phone: r.phone, relationship: r.relationship })),
      // Full document list + a by-type map for quick lookups.
      documents: docs
        .map((d) => ({
          id: d.id,
          docType: d.docType,
          status: d.status,
          fileName: d.fileName,
          fileUrl: d.fileUrl,
          uploadedAt: d.createdAt,
        }))
        .sort((a, b) => (b.uploadedAt?.getTime?.() ?? 0) - (a.uploadedAt?.getTime?.() ?? 0)),
      kycStatus: {
        // Upload status (reflects what the user has actually submitted).
        panUploaded: isUploaded('PAN_CARD'),
        aadhaarUploaded: isUploaded('AADHAAR_CARD'),
        gstUploaded: isUploaded('GST_CERTIFICATE'),
        bankUploaded: isUploaded('BANK_STATEMENT'),
        // Verification status (set once a reviewer/ops verifies a document).
        panVerified: isVerified('PAN_CARD') || (bp?.panVerified ?? false),
        aadhaarVerified: isVerified('AADHAAR_CARD') || (bp?.aadhaarVerified ?? false),
        gstVerified: isVerified('GST_CERTIFICATE') || (bp?.gstVerified ?? false),
        udyamVerified: false,  // udyam verification not yet implemented
        documents: docByType,
        completionPercentage: completion,
      },
    };
  }

  async updateProfile(userId: string, personalDetails?: any, businessDetails?: any) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new AppError(404, 'User profile not found.');
    }

    const updateData: any = {};

    if (personalDetails) {
      if (personalDetails.fullName !== undefined) {
        updateData.name = personalDetails.fullName;
      }
      if (personalDetails.email !== undefined) {
        updateData.email = personalDetails.email ? String(personalDetails.email).trim() : null;
      }
    }

    if (businessDetails) {
      if (businessDetails.businessName !== undefined) {
        updateData.companyName = businessDetails.businessName;
      }
      if (businessDetails.location !== undefined) {
        updateData.location = businessDetails.location;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // getProfile recomputes completion across ALL sections (personal, business,
    // financial, address, KYC docs, references) and caches it — single source.
    return this.getProfile(updatedUser.id);
  }

  /** Replace the user's profile-level references (2+ expected to complete the section). */
  async saveReferences(userId: string, references: any[]) {
    const clean = (references || [])
      .filter((r) => r && r.name && r.phone)
      .map((r) => ({
        userId,
        name: String(r.name).trim(),
        phone: String(r.phone).replace(/[^0-9]/g, ''),
        relationship: String(r.relationship || 'Other'),
      }));
    if (clean.length < 2) throw new AppError(400, 'Please add at least two references.');

    await prisma.userReference.deleteMany({ where: { userId } });
    await prisma.userReference.createMany({ data: clean });
    return this.getProfile(userId);
  }
}

export const userService = new UserService();
