import { getAccessToken } from '@/lib/auth';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const { method = 'GET', body, headers = {}, skipAuth = false } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (!skipAuth) {
      const token = getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Request failed',
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error: any) {
    return {
      error: error.message || 'Network error',
      status: 500,
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, skipAuth = false) =>
    apiRequest<T>(endpoint, { method: 'GET', skipAuth }),

  post: <T = any>(endpoint: string, body: any, skipAuth = false) =>
    apiRequest<T>(endpoint, { method: 'POST', body, skipAuth }),

  put: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),

  patch: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body }),
};

