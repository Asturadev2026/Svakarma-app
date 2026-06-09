"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralController = exports.ReferralController = void 0;
const referral_service_1 = require("./referral.service");
class ReferralController {
    async getSummary(req, res, next) {
        try {
            const userId = req.userId;
            const summary = await referral_service_1.referralService.getSummary(userId);
            return res.json({
                success: true,
                data: summary,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async invite(req, res, next) {
        try {
            const userId = req.userId;
            const { name, phone } = req.body;
            const referral = await referral_service_1.referralService.invite(userId, name, phone);
            return res.json({
                success: true,
                message: 'Referral invite sent successfully!',
                data: referral,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReferralController = ReferralController;
exports.referralController = new ReferralController();
