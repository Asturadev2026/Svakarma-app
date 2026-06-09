import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';

export interface AdminRequest extends Request {
  adminId?: string;
  adminEmail?: string;
  adminRole?: string;
}

export class AdminController {

  async login(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ success: false, message: 'email and password are required.' });

      const result = await adminService.login(email, password);
      return res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getDashboard(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }

  async getApplications(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { status, page = '1', limit = '20' } = req.query as any;
      const result = await adminService.getApplications(status, +page, +limit);
      return res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async getApplicationById(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const app = await adminService.getApplicationById(req.params.id);
      return res.json({ success: true, data: app });
    } catch (error) { next(error); }
  }

  async updateApplicationStatus(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status))
        return res.status(400).json({ success: false, message: 'status must be PENDING | APPROVED | REJECTED' });

      const updated = await adminService.updateApplicationStatus(
        req.params.id, status, notes, req.adminEmail!,
      );
      return res.json({ success: true, message: `Application ${status.toLowerCase()}.`, data: updated });
    } catch (error) { next(error); }
  }

  async getUsers(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20' } = req.query as any;
      const result = await adminService.getUsers(+page, +limit);
      return res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
}

export const adminController = new AdminController();
