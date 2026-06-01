import api from './api';

export const loanService = {
  /**
   * Fetch user loan applications
   */
  async getApplications() {
    return api.get('/loans/applications');
  },

  /**
   * Submit new loan application
   * @param {object} details 
   */
  async applyForLoan(details) {
    return api.post('/loans/apply', details);
  },

  /**
   * Calculate EMI and amortization locally or via backend API simulation
   */
  async calculateEMI(amount, rate, tenureMonths) {
    return api.post('/loans/calculator', { amount, rate, tenureMonths });
  }
};
