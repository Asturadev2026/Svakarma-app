import api from './api';

export const cibilService = {
  /**
   * Fetch detailed CIBIL analysis and credits history
   */
  async getCibilScore() {
    return api.get('/cibil');
  }
};
