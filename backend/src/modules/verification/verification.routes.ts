import { Router } from 'express';
import { verificationController } from './verification.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// GET /api/verification/sources?applicationId=...
router.get('/sources', authMiddleware, (req: any, res: any, next: any) => verificationController.list(req, res, next));

// POST /api/verification/connect  { applicationId, sourceType }
router.post('/connect', authMiddleware, (req: any, res: any, next: any) => verificationController.connect(req, res, next));

export default router;
