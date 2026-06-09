import { Router } from 'express';
import { loanController } from './loan.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: any, res: any, next: any) => {
  loanController.getActiveLoans(req, res, next);
});

router.get('/applications', authMiddleware, (req: any, res: any, next: any) => {
  loanController.getApplications(req, res, next);
});

router.post('/apply', authMiddleware, (req: any, res: any, next: any) => {
  loanController.apply(req, res, next);
});

router.post('/calculator', (req: any, res: any, next: any) => {
  loanController.calculateEmi(req, res, next);
});

export default router;
