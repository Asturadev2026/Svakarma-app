import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { BASE_URL } from './api';

/**
 * Document Upload Service
 * ---
 * uploadDocument()  → uses raw axios with multipart/form-data (file upload)
 * getDocuments()    → uses shared api.js interceptor (JSON, auto-token)
 * getDocumentById() → uses shared api.js interceptor (JSON, auto-token)
 */
export const documentService = {
  /**
   * Upload a single document file to the backend.
   *
   * @param {object} file - Asset from expo-document-picker
   *   { uri, name, mimeType }
   * @param {'PAN_CARD'|'AADHAAR_CARD'|'GST_CERTIFICATE'|'BANK_STATEMENT'} docType
   * @returns {Promise<{ success, message, data }>}
   */
  async uploadDocument(file, docType) {
    const token = await AsyncStorage.getItem('user_token');

    const formData = new FormData();
    formData.append('docType', docType);
    // React Native FormData accepts this object shape directly
    formData.append('file', {
      uri:  file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    });

    const response = await axios.post(
      `${BASE_URL}/documents/upload`,
      formData,
      {
        headers: {
          'Content-Type':  'multipart/form-data',
          Authorization:   `Bearer ${token}`,
        },
        timeout: 30000, // 30 s — larger files may be slow on LAN
      },
    );

    return response.data;
  },

  /**
   * Fetch all documents for the authenticated user.
   * @returns {Promise<{ success, count, data: Document[] }>}
   */
  async getDocuments() {
    return api.get('/documents');
  },

  /**
   * Fetch a single document by ID.
   * @param {string} id
   * @returns {Promise<{ success, data: Document }>}
   */
  async getDocumentById(id) {
    return api.get(`/documents/${id}`);
  },
};
