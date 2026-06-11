import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Mount user profile routes
router.get('/check-onboarding', authMiddleware, (req: any, res: any, next: any) => {
  userController.checkOnboarding(req, res, next);
});

router.get('/', authMiddleware, (req: any, res: any, next: any) => {
  userController.getProfile(req, res, next);
});

router.put('/', authMiddleware, (req: any, res: any, next: any) => {
  userController.updateProfile(req, res, next);
});

router.post('/references', authMiddleware, (req: any, res: any, next: any) => {
  userController.saveReferences(req, res, next);
});

export default router;
