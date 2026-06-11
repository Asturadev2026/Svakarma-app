/**
 * Payment provider abstraction (Razorpay-shaped).
 *
 * The app talks only to this interface, never to Razorpay directly. The mock
 * and live providers are interchangeable; switching is a one-line env change
 * (PAYMENT_PROVIDER=mock -> razorpay). See ./index.ts for the factory.
 *
 * Amounts follow the Razorpay convention: the smallest currency unit (paise).
 * ₹1,000 => amount = 100000.
 */

export interface PaymentOrder {
  id: string;            // e.g. order_ABC123  (Razorpay-shaped)
  entity: 'order';
  amount: number;        // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;      // 'INR'
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  notes: Record<string, string>;
  created_at: number;    // unix seconds
}

export interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

/** Result of simulating a checkout (mock provider only). */
export interface SimulatedPayment {
  paymentId: string;
  signature: string;
}

export interface CreateOrderInput {
  amount: number;        // in paise
  currency?: string;     // default INR
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentProvider {
  readonly name: 'mock' | 'razorpay';
  /** Whether this provider can simulate a successful payment (mock/demo only). */
  readonly canSimulate: boolean;

  createOrder(input: CreateOrderInput): Promise<PaymentOrder>;

  /** Verify the checkout signature returned to the client after payment. */
  verifyPayment(v: PaymentVerification): boolean;

  /** Verify a webhook payload signature (raw body + header signature). */
  verifyWebhook(rawBody: string, signature: string): boolean;

  /**
   * Mock-only: produce a valid paymentId + signature for an order, exactly as a
   * real successful checkout would. Throws on the live provider.
   */
  simulateSuccess(orderId: string): SimulatedPayment;
}
