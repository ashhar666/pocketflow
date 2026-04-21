import axios from 'axios';

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
          const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
          const isPublicRoute = PUBLIC_ROUTES.includes(window.location.pathname);
          
          if (!isPublicRoute) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
