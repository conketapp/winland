/**
 * Enhanced API Client với centralized error handling
 */

import { PaginatedResponse } from '../types/api.types';
import { APIError, handleAPIError, getErrorMessage, NetworkError } from '../errors/error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class APIClient {
  baseURL = API_BASE_URL;

  private async fetch<T = unknown>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('ctv_token') || sessionStorage.getItem('login:userId')
        : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: options?.signal || (typeof AbortController !== 'undefined' 
          ? new AbortController().signal 
          : undefined),
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json().catch(() => ({})) : {};
        throw handleAPIError(response, errorData);
      }

      if (!isJson) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return response.text() as any;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError();
      }

      // Re-throw API errors
      if (error instanceof APIError) {
        throw error;
      }

      // Wrap unknown errors
      throw new Error(getErrorMessage(error));
    }
  }

  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }

  // Paginated requests
  async getPaginated<T = unknown>(
    endpoint: string,
    params?: { page?: number; pageSize?: number; [key: string]: unknown }
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString()
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint;

    return this.get<PaginatedResponse<T>>(url);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

