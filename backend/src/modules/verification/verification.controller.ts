import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { verificationService } from './verification.service';

export class VerificationController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicationId = (req.query.applicationId as string) || (req.params.applicationId as string);
      const data = await verificationService.listForApplication(req.userId!, applicationId);
      return res.json({ success: true, ...data });
    } catch (e) { next(e); }
  }

  async connect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationId, sourceType } = req.body || {};
      const data = await verificationService.connect(req.userId!, applicationId, sourceType);
      return res.json({ success: true, ...data });
    } catch (e) { next(e); }
  }
}

export const verificationController = new VerificationController();
