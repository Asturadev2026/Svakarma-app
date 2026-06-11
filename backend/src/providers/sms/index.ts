import { SmsProvider } from './sms.provider';
import { MockSmsProvider } from './mock.sms.provider';
import { TwilioSmsProvider } from './twilio.sms.provider';

export * from './sms.provider';

let instance: SmsProvider | null = null;

/**
 * Returns the configured SMS provider (singleton).
 * Driven by env SMS_PROVIDER: 'mock' (default) | 'twilio'.
 */
export function getSmsProvider(): SmsProvider {
  if (instance) return instance;

  const choice = (process.env.SMS_PROVIDER || 'mock').toLowerCase();
  instance = choice === 'twilio' ? new TwilioSmsProvider() : new MockSmsProvider();

  // eslint-disable-next-line no-console
  console.log(`[SMS] provider = ${instance.name}`);
  return instance;
}

/** True when running the mock provider (used to decide whether to expose the demo OTP). */
export function isMockSms(): boolean {
  return (process.env.SMS_PROVIDER || 'mock').toLowerCase() !== 'twilio';
}
