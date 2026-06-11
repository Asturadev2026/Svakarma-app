/**
 * SMS provider abstraction.
 *
 * Every SMS/OTP integration implements this interface, so the rest of the app
 * never talks to Twilio (or any vendor) directly. Swapping the live provider in
 * is a one-line env change (SMS_PROVIDER=mock -> twilio) with no code changes
 * elsewhere. See ./index.ts for the factory.
 */

export interface SmsResult {
  /** Provider message id (Twilio: messageSid). Mock returns a SM_mock_* id. */
  messageSid: string;
  /** Lifecycle status as reported by the provider (queued | sent | delivered | failed). */
  status: string;
  /** Which provider actually handled the send. */
  provider: 'mock' | 'twilio';
}

export interface SmsProvider {
  readonly name: 'mock' | 'twilio';
  /** Send an arbitrary SMS body to a phone number (E.164 or 10-digit). */
  sendSms(to: string, body: string): Promise<SmsResult>;
  /** Send a one-time passcode. Returns the provider result (never the code). */
  sendOtp(to: string, code: string): Promise<SmsResult>;
}
