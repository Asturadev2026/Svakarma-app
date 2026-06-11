"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayProvider = void 0;
const signature_1 = require("./signature");
const errors_1 = require("../../shared/errors");
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
class RazorpayProvider {
    name = 'razorpay';
    canSimulate = false;
    client;
    keySecret;
    webhookSecret;
    constructor() {
        const keyId = process.env.RAZORPAY_KEY_ID;
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
        if (!keyId || !this.keySecret) {
            throw new errors_1.AppError(500, 'Razorpay is selected (PAYMENT_PROVIDER=razorpay) but RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is missing.');
        }
        let Razorpay;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            Razorpay = require('razorpay');
        }
        catch {
            throw new errors_1.AppError(500, 'Razorpay package not installed. Run: npm install razorpay');
        }
        this.client = new Razorpay({ key_id: keyId, key_secret: this.keySecret });
    }
    async createOrder(input) {
        const order = await this.client.orders.create({
            amount: input.amount,
            currency: input.currency || 'INR',
            receipt: input.receipt,
            notes: input.notes || {},
        });
        return order;
    }
    verifyPayment(v) {
        return (0, signature_1.verifyPaymentSignature)(v.orderId, v.paymentId, v.signature, this.keySecret);
    }
    verifyWebhook(rawBody, signature) {
        return (0, signature_1.verifyWebhookSignature)(rawBody, signature, this.webhookSecret);
    }
    simulateSuccess() {
        throw new errors_1.AppError(400, 'simulateSuccess is not available on the live Razorpay provider.');
    }
}
exports.RazorpayProvider = RazorpayProvider;
