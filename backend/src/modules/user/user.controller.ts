import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { userService } from './user.service';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const profile = await userService.getProfile(userId);
      return res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { personalDetails, businessDetails } = req.body;
      const updatedProfile = await userService.updateProfile(userId, personalDetails, businessDetails);
      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkOnboarding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { prisma } = await import('../../shared/prisma');
      const profile = await prisma.businessProfile.findUnique({
        where: { userId },
      });

      return res.json({
        success: true,
        onboardingComplete: !!profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
