import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { businessController } from './business.controller';

const router = Router();

/**
 * POST /api/profile/business
 * Create or update the authenticated user's business profile.
 */
router.post('/', authMiddleware, (req: any, res: any, next: any) => {
  businessController.upsertBusinessProfile(req, res, next);
});

/**
 * GET /api/profile/business
 * Retrieve the authenticated user's business profile.
 */
router.get('/', authMiddleware, (req: any, res: any, next: any) => {
  businessController.getBusinessProfile(req, res, next);
});

export default router;
