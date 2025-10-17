/**
 * API Client
 * Axios instance with interceptors for authentication
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; statusCode: number }>) => {
    // Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Format error message
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    return Promise.reject({
      message: Array.isArray(message) ? message.join(', ') : message,
      statusCode: error.response?.status || 500,
    });
  }
);

// Generic API request function
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}

