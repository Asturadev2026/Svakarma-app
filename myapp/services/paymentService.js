import api from './api';

/**
 * Payment service (Razorpay-shaped EMI collection).
 *
 * The same calls work in mock mode and live mode — only the backend provider
 * differs. In mock mode the backend exposes `mockPay()` to simulate a successful
 * checkout; in live mode the real Razorpay SDK/checkout produces the same
 * { paymentId, signature } that `verify()` validates.
 */
export const paymentService = {
  /**
   * Create an EMI payment order. Pass a loanId, or omit it in demo mode to let
   * the backend pick/create an active loan.
   * @param {string} [loanId]
   */
  async createEmiOrder(loanId) {
    return api.post('/payments/emi/order', loanId ? { loanId } : {});
  },

  /**
   * DEMO ONLY: ask the backend's mock provider to simulate a successful checkout.
   * Returns { orderId, paymentId, signature } — the same shape a real checkout
   * hands back — which is then passed to verify().
   * @param {string} orderId
   */
  async mockPay(orderId) {
    return api.post('/payments/mock/pay', { orderId });
  },

  /**
   * Verify the checkout result and record the EMI as paid.
   * @param {{orderId:string, paymentId:string, signature:string}} result
   */
  async verify(result) {
    return api.post('/payments/verify', result);
  },

  /** List the user's payments. */
  async list() {
    return api.get('/payments');
  },
};
