"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessController = exports.BusinessController = void 0;
const business_service_1 = require("./business.service");
const client_1 = require("@prisma/client");
class BusinessController {
    /**
     * POST /api/profile/business
     * Create or update the authenticated user's business profile
     */
    async upsertBusinessProfile(req, res, next) {
        try {
            const userId = req.userId;
            const { businessType, businessName, gstNumber, panNumber, aadhaarNumber, industry, annualTurnover, udyamNumber, addressLine1, addressLine2, city, state, pincode, } = req.body;
            // Validate enum value
            if (!Object.values(client_1.BusinessType).includes(businessType)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid businessType. Must be one of: ${Object.values(client_1.BusinessType).join(', ')}`,
                });
            }
            const profile = await business_service_1.businessService.upsertBusinessProfile(userId, {
                businessType,
                businessName,
                gstNumber,
                panNumber,
                aadhaarNumber,
                industry,
                annualTurnover,
                udyamNumber,
                addressLine1,
                addressLine2,
                city,
                state,
                pincode,
            });
            return res.status(200).json({
                success: true,
                message: 'Business profile saved successfully.',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/profile/business
     * Fetch the authenticated user's business profile.
     * Returns { hasProfile: false } if no business profile exists yet.
     */
    async getBusinessProfile(req, res, next) {
        try {
            const userId = req.userId;
            const profile = await business_service_1.businessService.getBusinessProfile(userId);
            if (!profile) {
                return res.status(200).json({
                    success: true,
                    hasProfile: false,
                    data: null,
                });
            }
            return res.status(200).json({
                success: true,
                hasProfile: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BusinessController = BusinessController;
exports.businessController = new BusinessController();
