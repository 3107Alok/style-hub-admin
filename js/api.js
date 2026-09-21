/**
 * StyleHub Admin Portal - API Client
 */

const API_BASE_URL = 'https://ecommerce-backend-irl8.onrender.com';

const API = {
  getToken() {
    return localStorage.getItem('stylehub_admin_token');
  },

  setToken(token) {
    localStorage.setItem('stylehub_admin_token', token);
  },

  clearToken() {
    localStorage.removeItem('stylehub_admin_token');
    localStorage.removeItem('stylehub_admin_user');
  },

  getUser() {
    const u = localStorage.getItem('stylehub_admin_user');
    return u ? JSON.parse(u) : null;
  },

  setUser(user) {
    localStorage.setItem('stylehub_admin_user', JSON.stringify(user));
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 401) {
        // Unauthorized
        this.clearToken();
        Auth.showLogin();
        Toast.error('Session expired. Please log in again.');
        throw new Error('Unauthorized');
      }

      if (response.status === 403) {
        Toast.error('Access Denied: Admin role required.');
        throw new Error('Forbidden');
      }

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new Error(json.message || 'API request failed');
      }

      return json;
    } catch (error) {
      if (error.name === 'AbortError') {
        Toast.error('Server timed out (Render cold start). Please retry in 10s.');
      } else if (error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
        Toast.error(error.message || 'Network error occurred');
      }
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
