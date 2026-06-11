"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const prisma_1 = require("../../shared/prisma");
const errors_1 = require("../../shared/errors");
const payments_1 = require("../../providers/payments");
const isProd = () => process.env.NODE_ENV === 'production';
const toPaise = (rupees) => Math.round(rupees * 100);
class PaymentService {
    /**
     * Create an EMI payment order for a loan.
     * In non-production, if no loanId is supplied (or none exists), a demo ACTIVE
     * loan is created so the flow is always demonstrable.
     */
    async createEmiOrder(userId, loanId) {
        let loan = loanId
            ? await prisma_1.prisma.loan.findFirst({ where: { id: loanId, userId } })
            : await prisma_1.prisma.loan.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
        if (!loan && !isProd()) {
            loan = await this.createDemoLoan(userId);
        }
        if (!loan) {
            throw new errors_1.AppError(404, 'No active loan found for this user.');
        }
        const amountPaise = toPaise(loan.emiDue);
        const provider = (0, payments_1.getPaymentProvider)();
        const order = await provider.createOrder({
            amount: amountPaise,
            currency: 'INR',
            receipt: `emi_${loan.id}_${Date.now()}`,
            notes: { loanId: loan.id, userId },
        });
        await prisma_1.prisma.payment.create({
            data: {
                userId,
                loanId: loan.id,
                orderId: order.id,
                amount: amountPaise,
                currency: order.currency,
                status: 'created',
                provider: provider.name,
            },
        });
        return {
            order,
            // The client needs the public key id to open the real checkout. In mock
            // mode there is no real key, so a placeholder is returned.
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_mock_key',
            provider: provider.name,
            canSimulate: provider.canSimulate,
            loan: { id: loan.id, loanNumber: loan.loanNumber, emiDue: loan.emiDue, nextDueDate: loan.nextDueDate },
        };
    }
    /**
     * Confirm a payment after checkout. Verifies the gateway signature, then marks
     * the EMI paid and advances the schedule — all inside a transaction with an
     * idempotency guard so concurrent/duplicate confirmations cannot double-apply.
     */
    async confirmPayment(userId, input) {
        const { orderId, paymentId, signature } = input;
        if (!orderId || !paymentId || !signature) {
            throw new errors_1.AppError(400, 'orderId, paymentId and signature are required.');
        }
        const provider = (0, payments_1.getPaymentProvider)();
        const valid = provider.verifyPayment({ orderId, paymentId, signature });
        if (!valid) {
            throw new errors_1.AppError(400, 'Payment signature verification failed.');
        }
        const payment = await prisma_1.prisma.payment.findUnique({ where: { orderId } });
        if (!payment || payment.userId !== userId) {
            throw new errors_1.AppError(404, 'Payment order not found.');
        }
        if (payment.status === 'paid') {
            return { alreadyProcessed: true, payment }; // idempotent
        }
        return prisma_1.prisma.$transaction(async (tx) => {
            // Idempotency / concurrency guard: only the transaction that flips the row
            // from 'created' -> 'paid' proceeds to mutate the loan schedule.
            const flipped = await tx.payment.updateMany({
                where: { orderId, status: 'created' },
                data: { status: 'paid', paymentId, signature, paidAt: new Date() },
            });
            if (flipped.count === 0) {
                const existing = await tx.payment.findUnique({ where: { orderId } });
                return { alreadyProcessed: true, payment: existing };
            }
            // Advance the loan's next due date by one month (demo schedule logic).
            const loan = await tx.loan.findUnique({ where: { id: payment.loanId } });
            if (loan) {
                const next = new Date(loan.nextDueDate);
                next.setMonth(next.getMonth() + 1);
                await tx.loan.update({ where: { id: loan.id }, data: { nextDueDate: next } });
            }
            const updated = await tx.payment.findUnique({ where: { orderId } });
            return { alreadyProcessed: false, payment: updated };
        });
    }
    /**
     * Razorpay-style webhook handler. Verifies the raw-body signature and marks the
     * order paid (idempotent). Wired for payment.captured / order.paid events.
     */
    async handleWebhook(rawBody, signature) {
        const provider = (0, payments_1.getPaymentProvider)();
        if (!provider.verifyWebhook(rawBody, signature)) {
            throw new errors_1.AppError(400, 'Invalid webhook signature.');
        }
        const event = JSON.parse(rawBody);
        const type = event?.event || '';
        const orderId = event?.payload?.payment?.entity?.order_id || event?.payload?.order?.entity?.id;
        const paymentId = event?.payload?.payment?.entity?.id;
        if ((type === 'payment.captured' || type === 'order.paid') && orderId) {
            await prisma_1.prisma.payment.updateMany({
                where: { orderId, status: 'created' },
                data: { status: 'paid', paymentId: paymentId || undefined, paidAt: new Date() },
            });
        }
        return { received: true, event: type };
    }
    /**
     * DEV/DEMO ONLY: simulate a successful gateway checkout for an order, returning
     * the paymentId + signature a real checkout would hand back. The client then
     * calls confirmPayment(), exercising the genuine verification path.
     */
    async simulatePayment(userId, orderId) {
        if (isProd()) {
            throw new errors_1.AppError(403, 'Payment simulation is disabled in production.');
        }
        const provider = (0, payments_1.getPaymentProvider)();
        if (!provider.canSimulate) {
            throw new errors_1.AppError(400, 'The active payment provider does not support simulation.');
        }
        const payment = await prisma_1.prisma.payment.findUnique({ where: { orderId } });
        if (!payment || payment.userId !== userId) {
            throw new errors_1.AppError(404, 'Payment order not found.');
        }
        const { paymentId, signature } = provider.simulateSuccess(orderId);
        return { orderId, paymentId, signature };
    }
    async listPayments(userId) {
        return prisma_1.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    async createDemoLoan(userId) {
        const amount = 1000000; // ₹10,00,000
        const emi = 47073; // ~₹47,073/mo @ 24% p.a. over 24 months
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + 5);
        return prisma_1.prisma.loan.create({
            data: {
                userId,
                loanNumber: `DEMO-${Date.now()}`,
                amount,
                status: 'ACTIVE',
                emiDue: emi,
                nextDueDate: nextDue,
            },
        });
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
