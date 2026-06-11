import { PaymentProvider } from './payment.provider';
import { MockRazorpayProvider } from './mock.razorpay.provider';
import { RazorpayProvider } from './razorpay.provider';

export * from './payment.provider';

let instance: PaymentProvider | null = null;

/**
 * Returns the configured payment provider (singleton).
 * Driven by env PAYMENT_PROVIDER: 'mock' (default) | 'razorpay'.
 */
export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;

  const choice = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
  instance = choice === 'razorpay' ? new RazorpayProvider() : new MockRazorpayProvider();

  // eslint-disable-next-line no-console
  console.log(`[PAY] provider = ${instance.name}`);
  return instance;
}
