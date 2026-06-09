"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessService = exports.BusinessService = void 0;
const prisma_1 = require("../../shared/prisma");
const errors_1 = require("../../shared/errors");
class BusinessService {
    /**
     * Create or update the BusinessProfile for a user.
     * Uses upsert so calling POST again simply updates instead of duplicating.
     */
    async upsertBusinessProfile(userId, dto) {
        if (!dto.businessType || !dto.businessName) {
            throw new errors_1.AppError(400, 'businessType and businessName are required.');
        }
        // Verify user exists
        const user = await prisma_1.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_1.AppError(404, 'User not found.');
        }
        const profile = await prisma_1.prisma.businessProfile.upsert({
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
    async getBusinessProfile(userId) {
        const profile = await prisma_1.prisma.businessProfile.findUnique({
            where: { userId },
        });
        if (!profile)
            return null;
        return this.mapProfileToResponse(profile);
    }
    /** Map Prisma model to a clean API response object */
    mapProfileToResponse(profile) {
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
exports.BusinessService = BusinessService;
exports.businessService = new BusinessService();
