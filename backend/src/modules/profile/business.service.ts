import { BusinessType } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';

export interface CreateBusinessProfileDto {
  businessType: BusinessType;
  businessName: string;
  gstNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  industry?: string;
  annualTurnover?: string;
  udyamNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export class BusinessService {
  /**
   * Create or update the BusinessProfile for a user.
   * Uses upsert so calling POST again simply updates instead of duplicating.
   */
  async upsertBusinessProfile(userId: string, dto: CreateBusinessProfileDto) {
    if (!dto.businessType || !dto.businessName) {
      throw new AppError(400, 'businessType and businessName are required.');
    }

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    const profile = await prisma.businessProfile.upsert({
      where: { userId },
      create: {
        userId,
        businessType: dto.businessType,
        businessName: dto.businessName,
        gstNumber: dto.gstNumber ?? null,
        panNumber: dto.panNumber ?? null,
        aadhaarNumber: dto.aadhaarNumber ?? null,
        industry: dto.industry ?? null,
        annualTurnover: dto.annualTurnover ?? null,
        udyamNumber: dto.udyamNumber ?? null,
        addressLine1: dto.addressLine1 ?? null,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        pincode: dto.pincode ?? null,
      },
      update: {
        businessType: dto.businessType,
        businessName: dto.businessName,
        gstNumber: dto.gstNumber ?? null,
        panNumber: dto.panNumber ?? null,
        aadhaarNumber: dto.aadhaarNumber ?? null,
        industry: dto.industry ?? null,
        annualTurnover: dto.annualTurnover ?? null,
        udyamNumber: dto.udyamNumber ?? null,
        addressLine1: dto.addressLine1 ?? null,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        pincode: dto.pincode ?? null,
      },
    });

    return this.mapProfileToResponse(profile);
  }

  /**
   * Fetch the BusinessProfile for a user.
   * Returns null (not an error) if no profile exists yet — lets frontend
   * determine whether onboarding is required.
   */
  async getBusinessProfile(userId: string) {
    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;
    return this.mapProfileToResponse(profile);
  }

  /** Map Prisma model to a clean API response object */
  private mapProfileToResponse(profile: any) {
    return {
      id: profile.id,
      userId: profile.userId,
      businessType: profile.businessType,
      businessName: profile.businessName,
      gstNumber: profile.gstNumber,
      panNumber: profile.panNumber,
      aadhaarNumber: profile.aadhaarNumber,
      panVerified: profile.panVerified,
      gstVerified: profile.gstVerified,
      aadhaarVerified: profile.aadhaarVerified,
      industry: profile.industry,
      annualTurnover: profile.annualTurnover,
      udyamNumber: profile.udyamNumber,
      address: {
        line1: profile.addressLine1,
        line2: profile.addressLine2,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

export const businessService = new BusinessService();
