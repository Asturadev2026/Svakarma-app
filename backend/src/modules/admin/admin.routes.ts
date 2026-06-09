import { Router } from 'express';
import { adminController } from './admin.controller';
import { adminAuthMiddleware } from '../../middleware/adminAuth';

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────

/** POST /api/admin/login */
router.post('/login', (req: any, res: any, next: any) =>
  adminController.login(req, res, next));

// ── Protected ────────────────────────────────────────────────────────────────

/** GET /api/admin/dashboard */
router.get('/dashboard', adminAuthMiddleware, (req: any, res: any, next: any) =>
  adminController.getDashboard(req, res, next));

/** GET /api/admin/applications?status=PENDING&page=1&limit=20 */
router.get('/applications', adminAuthMiddleware, (req: any, res: any, next: any) =>
  adminController.getApplications(req, res, next));

/** GET /api/admin/applications/:id */
router.get('/applications/:id', adminAuthMiddleware, (req: any, res: any, next: any) =>
  adminController.getApplicationById(req, res, next));

/** PATCH /api/admin/applications/:id/status */
router.patch('/applications/:id/status', adminAuthMiddleware, (req: any, res: any, next: any) =>
  adminController.updateApplicationStatus(req, res, next));

/** GET /api/admin/users?page=1&limit=20 */
router.get('/users', adminAuthMiddleware, (req: any, res: any, next: any) =>
  adminController.getUsers(req, res, next));

export default router;
