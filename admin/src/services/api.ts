import axios from 'axios';

const CSRF_HEADER = 'X-CSRF-Token';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfTokenPromise: Promise<void> | null = null;

const fetchCsrfToken = async () => {
  const base = import.meta.env.VITE_API_URL || '/api';
  const { data } = await axios.get(`${base.replace(/\/$/, '')}/csrf-token`, { withCredentials: true });
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

    // Avoid retrying the refresh endpoint itself.
    if (originalRequest.url?.includes('/auth/refresh')) {
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
        await api.post('/auth/refresh');
        processQueue(null, null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
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
