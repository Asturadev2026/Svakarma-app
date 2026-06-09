import { Request, Response, NextFunction } from 'express';
import { adminService } from '../modules/admin/admin.service';

export interface AdminRequest extends Request {
  adminId?: string;
  adminEmail?: string;
  adminRole?: string;
}

export function adminAuthMiddleware(req: AdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = adminService.verifyToken(token);
    if (!decoded.isAdmin) throw new Error('Not an admin token.');
    req.adminId    = decoded.adminId;
    req.adminEmail = decoded.email;
    req.adminRole  = decoded.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token.' });
  }
}
