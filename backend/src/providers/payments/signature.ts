import crypto from 'crypto';

/**
 * Razorpay signature helpers.
 *
 * These implement Razorpay's *actual* signing algorithm (HMAC-SHA256). Because
 * the mock and live providers share this exact code, the verification path your
 * app runs in a demo is identical to the one it runs against the real gateway —
 * when you switch to live keys, nothing about verification changes.
 *
 * Reference:
 *   payment signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 *   webhook signature = HMAC_SHA256(raw_request_body, webhook_secret)
 */

export function signPayment(orderId: string, paymentId: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const expected = signPayment(orderId, paymentId, secret);
  return timingSafeEqualHex(expected, signature);
}

export function signWebhook(rawBody: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = signWebhook(rawBody, secret);
  return timingSafeEqualHex(expected, signature);
}

/** Constant-time compare of two hex strings (guards against timing attacks). */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (!a || !b) return false;
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
