import api from './api';

export const verificationService = {
  /** List the 7 data sources + connected count for an application. */
  async getSources(applicationId) {
    return api.get(`/verification/sources?applicationId=${applicationId}`);
  },
  /** Connect (pull) one data source. { applicationId, sourceType } */
  async connect(applicationId, sourceType) {
    return api.post('/verification/connect', { applicationId, sourceType });
  },
};
