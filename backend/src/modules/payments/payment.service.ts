import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';
import { getPaymentProvider } from '../../providers/payments';

const isProd = () => process.env.NODE_ENV === 'production';
const toPaise = (rupees: number) => Math.round(rupees * 100);

export class PaymentService {
  /**
   * Create an EMI payment order for a loan.
   * In non-production, if no loanId is supplied (or none exists), a demo ACTIVE
   * loan is created so the flow is always demonstrable.
   */
  async createEmiOrder(userId: string, loanId?: string) {
    let loan = loanId
      ? await prisma.loan.findFirst({ where: { id: loanId, userId } })
      : await prisma.loan.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });

    if (!loan && !isProd()) {
      loan = await this.createDemoLoan(userId);
    }
    if (!loan) {
      throw new AppError(404, 'No active loan found for this user.');
    }

    const amountPaise = toPaise(loan.emiDue);
    const provider = getPaymentProvider();
    const order = await provider.createOrder({
      amount: amountPaise,
      currency: 'INR',
      receipt: `emi_${loan.id}_${Date.now()}`,
      notes: { loanId: loan.id, userId },
    });

    await prisma.payment.create({
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
  async confirmPayment(userId: string, input: { orderId: string; paymentId: string; signature: string }) {
    const { orderId, paymentId, signature } = input;
    if (!orderId || !paymentId || !signature) {
      throw new AppError(400, 'orderId, paymentId and signature are required.');
    }

    const provider = getPaymentProvider();
    const valid = provider.verifyPayment({ orderId, paymentId, signature });
    if (!valid) {
      throw new AppError(400, 'Payment signature verification failed.');
    }

    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment || payment.userId !== userId) {
      throw new AppError(404, 'Payment order not found.');
    }
    if (payment.status === 'paid') {
      return { alreadyProcessed: true, payment }; // idempotent
    }

    return prisma.$transaction(async (tx) => {
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
  async handleWebhook(rawBody: string, signature: string) {
    const provider = getPaymentProvider();
    if (!provider.verifyWebhook(rawBody, signature)) {
      throw new AppError(400, 'Invalid webhook signature.');
    }

    const event = JSON.parse(rawBody);
    const type: string = event?.event || '';
    const orderId: string | undefined =
      event?.payload?.payment?.entity?.order_id || event?.payload?.order?.entity?.id;
    const paymentId: string | undefined = event?.payload?.payment?.entity?.id;

    if ((type === 'payment.captured' || type === 'order.paid') && orderId) {
      await prisma.payment.updateMany({
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
  async simulatePayment(userId: string, orderId: string) {
    if (isProd()) {
      throw new AppError(403, 'Payment simulation is disabled in production.');
    }
    const provider = getPaymentProvider();
    if (!provider.canSimulate) {
      throw new AppError(400, 'The active payment provider does not support simulation.');
    }
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment || payment.userId !== userId) {
      throw new AppError(404, 'Payment order not found.');
    }
    const { paymentId, signature } = provider.simulateSuccess(orderId);
    return { orderId, paymentId, signature };
  }

  async listPayments(userId: string) {
    return prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  private async createDemoLoan(userId: string) {
    const amount = 1000000; // ₹10,00,000
    const emi = 47073; // ~₹47,073/mo @ 24% p.a. over 24 months
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 5);
    return prisma.loan.create({
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

export const paymentService = new PaymentService();
