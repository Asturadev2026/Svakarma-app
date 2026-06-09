"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const prisma_1 = require("../../shared/prisma");
const errors_1 = require("../../shared/errors");
const auth_service_1 = require("../auth/auth.service");
class UserService {
    async getProfile(userId) {
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null,
            },
            include: {
                businessProfile: true,
            },
        });
        if (!user) {
            throw new errors_1.AppError(404, 'User profile not found.');
        }
        const completion = (0, auth_service_1.calculateProfileCompletion)(user);
        const bp = user.businessProfile;
        // Format to match exact existing frontend API contract.
        // DB values are used when available; null/empty otherwise (no fake data).
        return {
            personalDetails: {
                fullName: user.name ?? 'Complete Your Profile',
                email: null, // not in schema yet — return null cleanly
                mobile: user.phone,
                dob: null, // not in schema yet
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
            kycStatus: {
                panVerified: bp?.panVerified ?? false,
                aadhaarVerified: bp?.aadhaarVerified ?? false,
                gstVerified: bp?.gstVerified ?? false,
                udyamVerified: false, // udyam verification not yet implemented
                completionPercentage: completion,
            },
        };
    }
    async updateProfile(userId, personalDetails, businessDetails) {
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null,
            },
        });
        if (!user) {
            throw new errors_1.AppError(404, 'User profile not found.');
        }
        const updateData = {};
        if (personalDetails) {
            if (personalDetails.fullName !== undefined) {
                updateData.name = personalDetails.fullName;
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
        // Recalculate profile completion based on updated database values
        const mergedUser = {
            name: updateData.name !== undefined ? updateData.name : user.name,
            companyName: updateData.companyName !== undefined ? updateData.companyName : user.companyName,
            location: updateData.location !== undefined ? updateData.location : user.location,
        };
        updateData.profileCompletion = (0, auth_service_1.calculateProfileCompletion)(mergedUser);
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        return this.getProfile(updatedUser.id);
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
