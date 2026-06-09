import api from './api';

/**
 * Business Profile Service
 * Handles all API calls related to the user's business profile.
 * All endpoints are auth-protected — the JWT token is auto-attached by api.js interceptor.
 */
export const businessService = {
  /**
   * Create or update the authenticated user's business profile.
   * Calling this again will update the existing profile (upsert).
   *
   * @param {object} profileData
   * @param {'PROPRIETORSHIP'|'LLP'|'PRIVATE_LIMITED'} profileData.businessType
   * @param {string} profileData.businessName
   * @param {string} [profileData.gstNumber]
   * @param {string} [profileData.panNumber]
   * @param {string} [profileData.aadhaarNumber]
   * @param {string} [profileData.industry]
   * @param {string} [profileData.annualTurnover]
   * @param {string} [profileData.udyamNumber]
   * @param {string} [profileData.addressLine1]
   * @param {string} [profileData.addressLine2]
   * @param {string} [profileData.city]
   * @param {string} [profileData.state]
   * @param {string} [profileData.pincode]
   */
  async saveBusinessProfile(profileData) {
    return api.post('/profile/business', profileData);
  },

  /**
   * Fetch the current user's business profile.
   * Returns { success: true, hasProfile: false, data: null } if not set yet.
   */
  async getBusinessProfile() {
    return api.get('/profile/business');
  },
};
