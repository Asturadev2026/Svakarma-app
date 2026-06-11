import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { Request } from 'express';
import { paymentService } from './payment.service';

export class PaymentController {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { loanId } = req.body || {};
      const result = await paymentService.createEmiOrder(userId, loanId);
      return res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { orderId, paymentId, signature } = req.body || {};
      const result = await paymentService.confirmPayment(userId, { orderId, paymentId, signature });
      return res.json({ success: true, message: 'Payment verified and EMI recorded.', ...result });
    } catch (error) {
      next(error);
    }
  }

  async simulate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { orderId } = req.body || {};
      const result = await paymentService.simulatePayment(userId, orderId);
      return res.json({ success: true, simulated: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const data = await paymentService.listPayments(userId);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Webhook endpoint. Mounted with a raw body parser (see index.ts) so the
   * signature can be verified against the exact bytes Razorpay sent.
   */
  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || '';
      const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
      const result = await paymentService.handleWebhook(rawBody, signature);
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
