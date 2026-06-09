import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export class AuthController {
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      const result = await authService.sendOtp(phone);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp, deviceInfo } = req.body;
      const result = await authService.verifyOtp(phone, otp, deviceInfo);
      return res.json({
        success: true,
        message: 'OTP verified successfully.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
