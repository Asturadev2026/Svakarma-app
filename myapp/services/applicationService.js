import api from './api';

export const applicationService = {
  /** Start an application. { productKey, amount, tenorMonths } */
  async create(payload) {
    return api.post('/applications', payload);
  },
  async get(id) {
    return api.get(`/applications/${id}`);
  },
  async list() {
    return api.get('/applications');
  },
  /** Run AI underwriting → returns { offer } or { rejected, reason }. */
  async underwrite(id) {
    return api.post(`/applications/${id}/underwrite`, {});
  },

  // ── Journey steps after the offer ──
  async accept(id) {
    return api.post(`/applications/${id}/accept`, {});
  },
  async saveReferences(id, payload) {
    return api.post(`/applications/${id}/references`, payload);
  },
  async saveBankAccount(id, payload) {
    return api.post(`/applications/${id}/bank-account`, payload);
  },
  async pennyDrop(id) {
    return api.post(`/applications/${id}/penny-drop`, {});
  },
  async setupNach(id) {
    return api.post(`/applications/${id}/nach`, {});
  },
  async getKfs(id) {
    return api.get(`/applications/${id}/kfs`);
  },
  async esign(id) {
    return api.post(`/applications/${id}/esign`, {});
  },
};
