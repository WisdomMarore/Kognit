import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

function resolvePending(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle a 401 once per request, and never for the refresh call itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh/')) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // A refresh is already in flight — wait for it, then retry with the new token
        return new Promise((resolve) => {
          pendingRequests.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        isRefreshing = false;
        resolvePending(newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return client(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
// Send users whose access has ended to the billing page
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (
      error.response?.status === 403 &&
      typeof detail === 'string' &&
      detail.startsWith('Your access has ended') &&
      window.location.pathname !== '/billing'
    ) {
      window.location.href = '/billing?expired=1';
    }
    return Promise.reject(error);
  }
);
