import { Router } from 'express';
import { referralController } from './referral.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/summary', authMiddleware, (req: any, res: any, next: any) => {
  referralController.getSummary(req, res, next);
});

router.post('/invite', authMiddleware, (req: any, res: any, next: any) => {
  referralController.invite(req, res, next);
});

export default router;
