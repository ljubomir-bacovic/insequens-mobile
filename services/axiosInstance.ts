import axios, { InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

const publicAuthPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/confirm-email',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [
    (data: unknown) => {
      return JSON.stringify(data);
    },
  ],
});

// Prevent concurrent token refresh attempts
let refreshPromise: Promise<string> | null = null;

const refreshToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
        token,
        refreshToken: storedRefreshToken,
      });

      await SecureStore.setItemAsync('token', refreshResponse.data.token);
      await SecureStore.setItemAsync('refreshToken', refreshResponse.data.refreshToken);

      return refreshResponse.data.token as string;
    } catch (error) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('refreshToken');
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const isPublicAuth = publicAuthPaths.some((path) => config.url === path);

    if (isPublicAuth) {
      return config;
    }

    let token = await SecureStore.getItemAsync('token');

    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      const isTokenExpired = decodedToken.exp * 1000 < Date.now();

      if (isTokenExpired) {
        try {
          token = await refreshToken();
        } catch (error) {
          console.error('Token refresh failed', error);
          return Promise.reject(error);
        }
      }

      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
