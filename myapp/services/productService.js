import api from './api';

export const productService = {
  /** List the loan product catalog. */
  async getProducts() {
    return api.get('/products');
  },
  /** Fetch one product by key (e.g. "samridhi"). */
  async getProduct(key) {
    return api.get(`/products/${key}`);
  },
};
