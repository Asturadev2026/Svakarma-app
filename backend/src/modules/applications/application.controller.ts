import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { applicationService } from './application.service';

export class ApplicationController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { productKey, amount, tenorMonths, formData } = req.body || {};
      const result = await applicationService.create(userId, { productKey, amount, tenorMonths, formData });
      return res.status(201).json({ success: true, ...result });
    } catch (e) { next(e); }
  }

  async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.get(req.userId!, req.params.id);
      return res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.list(req.userId!);
      return res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  async underwrite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await applicationService.underwrite(req.userId!, req.params.id);
      return res.json({ success: true, ...result });
    } catch (e) { next(e); }
  }

  async acceptOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.acceptOffer(req.userId!, req.params.id);
      return res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  async references(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { references, guarantor } = req.body || {};
      const data = await applicationService.saveReferences(req.userId!, req.params.id, { references, guarantor });
      return res.json({ success: true, ...data });
    } catch (e) { next(e); }
  }

  async bankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountNumber, ifsc } = req.body || {};
      const data = await applicationService.saveBankAccount(req.userId!, req.params.id, { accountNumber, ifsc });
      return res.json({ success: true, ...data });
    } catch (e) { next(e); }
  }

  async pennyDrop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.pennyDrop(req.userId!, req.params.id);
      return res.json({ success: true, ...data });
    } catch (e) { next(e); }
  }

  async nach(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.setupNach(req.userId!, req.params.id);
      return res.json({ success: true, ...data });
    } catch (e) { next(e); }
  }

  async kfs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.getKfs(req.userId!, req.params.id);
      return res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  async esign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.esignAndDisburse(req.userId!, req.params.id);
      return res.json({ success: true, ...data });
    } catch (e) { next(e); }
  }
}

export const applicationController = new ApplicationController();
