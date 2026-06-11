import crypto from 'crypto';
import {
  CreateOrderInput,
  PaymentOrder,
  PaymentProvider,
  PaymentVerification,
  SimulatedPayment,
} from './payment.provider';
import {
  signPayment,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from './signature';

/**
 * Mock Razorpay provider.
 *
 * Creates Razorpay-shaped orders in memory and signs simulated payments with the
 * SAME HMAC algorithm Razorpay uses (see ./signature.ts). The verification path
 * is therefore real — `simulateSuccess()` returns a paymentId + signature that
 * `verifyPayment()` genuinely validates. When you switch to the live provider,
 * the verification code is unchanged; only the source of the signature differs.
 *
 * Uses RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET if set, otherwise stable
 * demo secrets, so it works with zero configuration.
 */
export class MockRazorpayProvider implements PaymentProvider {
  readonly name = 'mock' as const;
  readonly canSimulate = true;

  private keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret_demo';
  private webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret_demo';
  private orders = new Map<string, PaymentOrder>();

  private randId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
  }

  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    const order: PaymentOrder = {
      id: this.randId('order'),
      entity: 'order',
      amount: input.amount,
      amount_paid: 0,
      amount_due: input.amount,
      currency: input.currency || 'INR',
      receipt: input.receipt,
      status: 'created',
      notes: input.notes || {},
      created_at: Math.floor(Date.now() / 1000),
    };
    this.orders.set(order.id, order);
    // eslint-disable-next-line no-console
    console.log(`[PAY:mock] order created ${order.id} amount=${order.amount} receipt=${order.receipt}`);
    return order;
  }

  verifyPayment(v: PaymentVerification): boolean {
    return verifyPaymentSignature(v.orderId, v.paymentId, v.signature, this.keySecret);
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    return verifyWebhookSignature(rawBody, signature, this.webhookSecret);
  }

  simulateSuccess(orderId: string): SimulatedPayment {
    const paymentId = this.randId('pay');
    const signature = signPayment(orderId, paymentId, this.keySecret);
    const order = this.orders.get(orderId);
    if (order) {
      order.status = 'paid';
      order.amount_paid = order.amount;
      order.amount_due = 0;
    }
    // eslint-disable-next-line no-console
    console.log(`[PAY:mock] simulated success for ${orderId} -> ${paymentId}`);
    return { paymentId, signature };
  }
}
