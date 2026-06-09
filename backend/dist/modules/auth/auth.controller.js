"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    async sendOtp(req, res, next) {
        try {
            const { phone } = req.body;
            const result = await auth_service_1.authService.sendOtp(phone);
            return res.json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { phone, otp, deviceInfo } = req.body;
            const result = await auth_service_1.authService.verifyOtp(phone, otp, deviceInfo);
            return res.json({
                success: true,
                message: 'OTP verified successfully.',
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
