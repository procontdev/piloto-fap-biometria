import axios from 'axios';

const isProduction = import.meta.env.PROD;
const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (isProduction && (!configuredApiUrl || configuredApiUrl.trim().length === 0)) {
  throw new Error('Missing VITE_API_URL in production build. Configure it in EasyPanel build args.');
}

const api = axios.create({
  baseURL: (configuredApiUrl && configuredApiUrl.trim().length > 0)
    ? configuredApiUrl.trim().replace(/\/$/, '')
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth');
  if (stored) {
    const auth = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Response interceptor — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
