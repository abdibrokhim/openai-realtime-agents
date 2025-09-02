/**
 * Utility functions for managing API keys in localStorage
 */

const API_KEY_STORAGE_KEY = 'englify_openai_api_key';

export interface ApiKeyStorage {
  getApiKey(): string | null;
  setApiKey(apiKey: string): void;
  removeApiKey(): void;
  hasApiKey(): boolean;
}

class LocalStorageApiKeyStorage implements ApiKeyStorage {
  getApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }

  setApiKey(apiKey: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
  }

  removeApiKey(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  hasApiKey(): boolean {
    return !!this.getApiKey();
  }
}

export const apiKeyStorage = new LocalStorageApiKeyStorage();

/**
 * Validates if the provided API key has the correct format
 */
export function validateApiKey(apiKey: string): boolean {
  // OpenAI API keys start with 'sk-' and are typically 56 characters long
  const trimmedKey = apiKey.trim();
  return trimmedKey.startsWith('sk-') && trimmedKey.length >= 40;
}

/**
 * Masks an API key for display purposes
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 10) return '••••••••';
  const start = apiKey.slice(0, 7);
  const end = apiKey.slice(-4);
  return `${start}••••••••••••${end}`;
}
