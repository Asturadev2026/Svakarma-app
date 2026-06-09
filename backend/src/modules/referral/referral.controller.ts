import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { referralService } from './referral.service';

export class ReferralController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const summary = await referralService.getSummary(userId);
      return res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async invite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { name, phone } = req.body;
      const referral = await referralService.invite(userId, name, phone);
      return res.json({
        success: true,
        message: 'Referral invite sent successfully!',
        data: referral,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const referralController = new ReferralController();
