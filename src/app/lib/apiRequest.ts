import { apiKeyStorage } from './apiKeyStorage';

/**
 * Utility to create headers with API key for requests
 */
export function createApiHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const apiKey = apiKeyStorage.getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  return headers;
}

/**
 * Wrapper around fetch that automatically includes API key headers
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = createApiHeaders(options.headers as Record<string, string> || {});
  
  return fetch(url, {
    ...options,
    headers,
  });
}
