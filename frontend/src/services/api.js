const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('store_app_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred during request execution.');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  // Auth
  register: (userData) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  updatePassword: (passwords) =>
    request('/auth/update-password', { method: 'POST', body: JSON.stringify(passwords) }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Admin
  getAdminStats: () => request('/admin/stats', { method: 'GET' }),
  addUser: (userData) =>
    request('/admin/add-user', { method: 'POST', body: JSON.stringify(userData) }),
  addStore: (storeData) =>
    request('/admin/add-store', { method: 'POST', body: JSON.stringify(storeData) }),
  getAdminUsers: (params = '') => request(`/admin/users${params}`, { method: 'GET' }),
  getAdminStores: (params = '') => request(`/admin/stores${params}`, { method: 'GET' }),
  getUserDetails: (userId) => request(`/admin/users/${userId}`, { method: 'GET' }),

  // Normal User Stores & Ratings
  getUserStores: (params = '') => request(`/stores${params}`, { method: 'GET' }),
  submitRating: (ratingData) =>
    request('/stores/rating', { method: 'POST', body: JSON.stringify(ratingData) }),

  // Store Owner Dashboard
  getOwnerDashboard: (params = '') => request(`/owner/dashboard${params}`, { method: 'GET' }),
};
