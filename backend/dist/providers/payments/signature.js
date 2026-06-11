"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signPayment = signPayment;
exports.verifyPaymentSignature = verifyPaymentSignature;
exports.signWebhook = signWebhook;
exports.verifyWebhookSignature = verifyWebhookSignature;
const crypto_1 = __importDefault(require("crypto"));
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
function signPayment(orderId, paymentId, secret) {
    return crypto_1.default.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}
function verifyPaymentSignature(orderId, paymentId, signature, secret) {
    const expected = signPayment(orderId, paymentId, secret);
    return timingSafeEqualHex(expected, signature);
}
function signWebhook(rawBody, secret) {
    return crypto_1.default.createHmac('sha256', secret).update(rawBody).digest('hex');
}
function verifyWebhookSignature(rawBody, signature, secret) {
    const expected = signWebhook(rawBody, secret);
    return timingSafeEqualHex(expected, signature);
}
/** Constant-time compare of two hex strings (guards against timing attacks). */
function timingSafeEqualHex(a, b) {
    if (!a || !b)
        return false;
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length)
        return false;
    return crypto_1.default.timingSafeEqual(ba, bb);
}
