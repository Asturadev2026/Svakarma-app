import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  /**
   * Request OTP for a phone number
   * @param {string} phone 
   */
  async sendOtp(phone) {
    return api.post('/auth/send-otp', { phone });
  },

  /**
   * Verify OTP and store returned token
   * @param {string} phone 
   * @param {string} otp 
   */
  async verifyOtp(phone, otp) {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    if (response.success && response.token) {
      await AsyncStorage.setItem('user_token', response.token);
      await AsyncStorage.setItem('user_profile', JSON.stringify(response.user));
    }
    return response;
  },

  /**
   * Get active logged-in user profile
   */
  async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem('user_profile');
      return profile ? JSON.parse(profile) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Terminate active user session
   */
  async logout() {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_profile');
  }
};
