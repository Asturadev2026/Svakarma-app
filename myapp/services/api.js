import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
// API base URL is read from the .env file (EXPO_PUBLIC_API_URL).
//
// SETUP (one-time per developer):
//   1. Copy myapp/.env.example → myapp/.env
//   2. Set EXPO_PUBLIC_API_URL=http://<your-lan-ip>:5000/api
//      Windows: run `ipconfig` → IPv4 Address
//      Mac/Linux: run `ifconfig` → inet under en0/wlan0
//
// ⚠️  .env is gitignored — never commit real IPs.
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject bearer token if it exists in storage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('Failed to fetch auth token from storage:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Graceful API error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please check your connection.';
    return Promise.reject({ ...error, message });
  }
);

export default api;
