"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockRazorpayProvider = void 0;
const crypto_1 = __importDefault(require("crypto"));
const signature_1 = require("./signature");
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
class MockRazorpayProvider {
    name = 'mock';
    canSimulate = true;
    keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret_demo';
    webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret_demo';
    orders = new Map();
    randId(prefix) {
        return `${prefix}_${crypto_1.default.randomBytes(8).toString('hex')}`;
    }
    async createOrder(input) {
        const order = {
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
    verifyPayment(v) {
        return (0, signature_1.verifyPaymentSignature)(v.orderId, v.paymentId, v.signature, this.keySecret);
    }
    verifyWebhook(rawBody, signature) {
        return (0, signature_1.verifyWebhookSignature)(rawBody, signature, this.webhookSecret);
    }
    simulateSuccess(orderId) {
        const paymentId = this.randId('pay');
        const signature = (0, signature_1.signPayment)(orderId, paymentId, this.keySecret);
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
exports.MockRazorpayProvider = MockRazorpayProvider;
