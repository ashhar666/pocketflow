import axios from 'axios';
import { PUBLIC_ROUTES } from './constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HTTP-only cookies with requests
});

// Response Interceptor: Handle 401s and token refresh automatically
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/token/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token via HTTP-only cookie (browser handles it)
        await axios.post(`${API_URL}/auth/token/refresh/`, {}, {
          withCredentials: true,
        });

        // Retry the original request (cookies are automatically sent)
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login ONLY for protected routes
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          // Standardize pathname (remove trailing slash for comparison)
          const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
          const isPublicRoute = PUBLIC_ROUTES.includes(currentPath);
          
          if (!isPublicRoute) {
            console.warn(`[API] Auth refresh failed on protected route: ${currentPath}. Redirecting to /login`);
            window.location.href = '/login';
          } else {
            console.info(`[API] Auth refresh failed on public route: ${currentPath}. Staying on page.`);
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
