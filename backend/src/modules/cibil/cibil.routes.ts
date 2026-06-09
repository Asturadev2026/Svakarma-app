import { Router } from 'express';
import { cibilController } from './cibil.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: any, res: any, next: any) => {
  cibilController.getCibilData(req, res, next);
});

export default router;
