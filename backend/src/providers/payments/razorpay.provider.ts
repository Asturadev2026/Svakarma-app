import {
  CreateOrderInput,
  PaymentOrder,
  PaymentProvider,
  PaymentVerification,
  SimulatedPayment,
} from './payment.provider';
import { verifyPaymentSignature, verifyWebhookSignature } from './signature';
import { AppError } from '../../shared/errors';

/**
 * Live Razorpay provider, ready to activate.
 *
 * The `razorpay` SDK is lazy-required so the backend builds/runs in mock mode
 * without the dependency. Signature verification reuses the SAME shared helpers
 * as the mock provider, so only order creation actually hits Razorpay.
 *
 * To go live:
 *   1. npm install razorpay
 *   2. set PAYMENT_PROVIDER=razorpay
 *   3. set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 *   4. (optional) test mode: use Razorpay test keys (rzp_test_*) — same code path
 */
export class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay' as const;
  readonly canSimulate = false;

  private client: any;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (!keyId || !this.keySecret) {
      throw new AppError(
        500,
        'Razorpay is selected (PAYMENT_PROVIDER=razorpay) but RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is missing.'
      );
    }

    let Razorpay: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      Razorpay = require('razorpay');
    } catch {
      throw new AppError(500, 'Razorpay package not installed. Run: npm install razorpay');
    }
    this.client = new Razorpay({ key_id: keyId, key_secret: this.keySecret });
  }

  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    const order = await this.client.orders.create({
      amount: input.amount,
      currency: input.currency || 'INR',
      receipt: input.receipt,
      notes: input.notes || {},
    });
    return order as PaymentOrder;
  }

  verifyPayment(v: PaymentVerification): boolean {
    return verifyPaymentSignature(v.orderId, v.paymentId, v.signature, this.keySecret);
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    return verifyWebhookSignature(rawBody, signature, this.webhookSecret);
  }

  simulateSuccess(): SimulatedPayment {
    throw new AppError(400, 'simulateSuccess is not available on the live Razorpay provider.');
  }
}
