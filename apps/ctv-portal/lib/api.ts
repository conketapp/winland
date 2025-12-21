/**
 * API Client Configuration (CTV Portal)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

class APIClient {
  baseURL = API_BASE_URL;

  private async fetch(endpoint: string, options?: RequestInit) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ctv_token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  get(endpoint: string) {
    return this.fetch(endpoint, { method: 'GET' });
  }

  post(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export for backward compatibility
export const api = apiClient;

