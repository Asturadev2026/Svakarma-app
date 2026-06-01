import api from './api';

export const referralService = {
  /**
   * Fetch referral points and active counts
   */
  async getSummary() {
    return api.get('/referrals/summary');
  },

  /**
   * Send invite contact
   * @param {string} name 
   * @param {string} phone 
   */
  async sendInvite(name, phone) {
    return api.post('/referrals/invite', { name, phone });
  }
};
