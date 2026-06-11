import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Fetch CSRF token on startup
const fetchCsrfToken = async () => {
  try {
    const base = import.meta.env.VITE_API_URL || '/api';
    const { data } = await axios.get(`${base.replace(/\/$/, '')}/csrf-token`, { withCredentials: true });
    api.defaults.headers.common['X-CSRF-Token'] = data.csrfToken;
  } catch (err) {
    console.error('Failed to fetch CSRF token', err);
  }
};

fetchCsrfToken();

// Request interceptor - attach access token (REMOVED - Using Cookies)
api.interceptors.request.use((config) => {
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (v: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Response interceptor - handle 401 and refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Auth endpoints are expected to return 401 for bad credentials or
    // missing sessions; do not turn those into refresh attempts.
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to get refresh token from localStorage first, then from cookies
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh', {
          refreshToken: storedRefreshToken || undefined
        });
        
        const newRefreshToken = response.data.data.refreshToken;
        
        // Store new refresh token
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        processQueue(null, null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
