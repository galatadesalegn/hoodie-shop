import axios from 'axios';

const CSRF_HEADER = 'X-CSRF-Token';
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? 'https://hoodie-shop.onrender.com/api' : '/api'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfTokenPromise: Promise<void> | null = null;

const fetchCsrfToken = async () => {
  const { data } = await axios.get(`${API_BASE_URL.replace(/\/$/, '')}/csrf-token`, { withCredentials: true });
  api.defaults.headers.common[CSRF_HEADER] = data.csrfToken;
};

const ensureCsrfToken = async () => {
  if (!api.defaults.headers.common[CSRF_HEADER]) {
    if (!csrfTokenPromise) {
      csrfTokenPromise = fetchCsrfToken().finally(() => {
        csrfTokenPromise = null;
      });
    }
    await csrfTokenPromise;
  }
};

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
    try {
      await ensureCsrfToken();
    } catch (err) {
      console.error('CSRF token fetch failed', err);
    }
  }
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
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
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
        
        const newAccessToken = response.data.data.accessToken;
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
