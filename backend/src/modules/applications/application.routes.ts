import { Router } from 'express';
import { applicationController } from './application.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.post('/', authMiddleware, (req: any, res: any, next: any) => applicationController.create(req, res, next));
router.get('/', authMiddleware, (req: any, res: any, next: any) => applicationController.list(req, res, next));
router.get('/:id', authMiddleware, (req: any, res: any, next: any) => applicationController.get(req, res, next));
router.post('/:id/underwrite', authMiddleware, (req: any, res: any, next: any) => applicationController.underwrite(req, res, next));

// ── Journey steps after the offer ──
router.post('/:id/accept', authMiddleware, (req: any, res: any, next: any) => applicationController.acceptOffer(req, res, next));
router.post('/:id/references', authMiddleware, (req: any, res: any, next: any) => applicationController.references(req, res, next));
router.post('/:id/bank-account', authMiddleware, (req: any, res: any, next: any) => applicationController.bankAccount(req, res, next));
router.post('/:id/penny-drop', authMiddleware, (req: any, res: any, next: any) => applicationController.pennyDrop(req, res, next));
router.post('/:id/nach', authMiddleware, (req: any, res: any, next: any) => applicationController.nach(req, res, next));
router.get('/:id/kfs', authMiddleware, (req: any, res: any, next: any) => applicationController.kfs(req, res, next));
router.post('/:id/esign', authMiddleware, (req: any, res: any, next: any) => applicationController.esign(req, res, next));

export default router;
