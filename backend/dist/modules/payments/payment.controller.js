"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
class PaymentController {
    async createOrder(req, res, next) {
        try {
            const userId = req.userId;
            const { loanId } = req.body || {};
            const result = await payment_service_1.paymentService.createEmiOrder(userId, loanId);
            return res.status(201).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async verify(req, res, next) {
        try {
            const userId = req.userId;
            const { orderId, paymentId, signature } = req.body || {};
            const result = await payment_service_1.paymentService.confirmPayment(userId, { orderId, paymentId, signature });
            return res.json({ success: true, message: 'Payment verified and EMI recorded.', ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async simulate(req, res, next) {
        try {
            const userId = req.userId;
            const { orderId } = req.body || {};
            const result = await payment_service_1.paymentService.simulatePayment(userId, orderId);
            return res.json({ success: true, simulated: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const userId = req.userId;
            const data = await payment_service_1.paymentService.listPayments(userId);
            return res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Webhook endpoint. Mounted with a raw body parser (see index.ts) so the
     * signature can be verified against the exact bytes Razorpay sent.
     */
    async webhook(req, res, next) {
        try {
            const signature = req.headers['x-razorpay-signature'] || '';
            const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
            const result = await payment_service_1.paymentService.handleWebhook(rawBody, signature);
            return res.json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
