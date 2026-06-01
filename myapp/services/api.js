import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
// • Android EMULATOR  → 10.0.2.2 maps to host computer's localhost
// • Android/iOS PHYSICAL DEVICE (Expo Go via QR) → must use your PC's LAN IP
//
// HOW TO FIND YOUR LAN IP:
//   Windows: run `ipconfig` in CMD → look for "IPv4 Address" (e.g. 192.168.1.5)
//   Mac/Linux: run `ifconfig` → look for "inet" under en0/wlan0
//
// ⚠️ CHANGE THIS when running on a physical device!
// ─────────────────────────────────────────────────────────────────────────────
const DEV_LAN_IP = '10.207.133.221'; // ← Your LAN IP from `ipconfig` output
const PORT = 5000;

const BASE_URL = `http://${DEV_LAN_IP}:${PORT}/api`;


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
