import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Create an EMI payment order (Razorpay-shaped).
router.post('/emi/order', authMiddleware, (req: any, res: any, next: any) =>
  paymentController.createOrder(req, res, next)
);

// Verify checkout result (orderId + paymentId + signature) and record the EMI.
router.post('/verify', authMiddleware, (req: any, res: any, next: any) =>
  paymentController.verify(req, res, next)
);

// DEV/DEMO ONLY: simulate a successful checkout for an order.
router.post('/mock/pay', authMiddleware, (req: any, res: any, next: any) =>
  paymentController.simulate(req, res, next)
);

// List the user's payments.
router.get('/', authMiddleware, (req: any, res: any, next: any) =>
  paymentController.list(req, res, next)
);

export default router;
