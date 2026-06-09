import api from './api';

export const cibilService = {
  /**
   * Fetch detailed CIBIL analysis and credits history.
   * Passing generate = true will prompt the backend to create a score if none exists.
   */
  async getCibilScore(generate = true) {
    return api.get(`/cibil?generate=${generate}`);
  }
};
