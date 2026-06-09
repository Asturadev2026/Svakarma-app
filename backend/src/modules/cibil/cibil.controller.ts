import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { cibilService } from './cibil.service';

export class CibilController {
  async getCibilData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const generate = req.query.generate === 'true';
      const data = await cibilService.getCibilData(userId, generate);
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cibilController = new CibilController();
