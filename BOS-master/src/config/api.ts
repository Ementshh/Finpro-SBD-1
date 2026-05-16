const DEFAULT_API_URL = 'http://localhost:5000/api';

const sanitizeEnvUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  // Vercel UI sometimes stores quotes as part of the value.
  // Also common: users paste URLs with surrounding quotes.
  const trimmed = value.trim();
  const stripped = trimmed.replace(/^['"]+/, '').replace(/['"]+$/, '').trim();

  return stripped || undefined;
};

const normalizeApiBaseUrl = (value: string | undefined): string => {
  const sanitized = sanitizeEnvUrl(value);
  const candidate = sanitized ?? DEFAULT_API_URL;

  // Absolute URL path handling
  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate);
      const path = url.pathname.replace(/\/+$/, '');

      if (path === '' || path === '/') {
        url.pathname = '/api';
      } else if (path === '/api') {
        // ok
      } else if (path.startsWith('/api/')) {
        // If someone accidentally provides a deeper endpoint, keep only base /api
        url.pathname = '/api';
      } else {
        url.pathname = `${path}/api`;
      }

      // Ensure no trailing slash
      url.pathname = url.pathname.replace(/\/+$/, '');
      return url.toString().replace(/\/+$/, '');
    } catch {
      // fall through to string-based normalization
    }
  }

  // Relative/invalid URL string handling
  const withoutTrailingSlash = candidate.replace(/\/+$/, '');
  if (withoutTrailingSlash === '' || withoutTrailingSlash === '/') return '/api';
  if (withoutTrailingSlash.endsWith('/api')) return withoutTrailingSlash;
  if (withoutTrailingSlash.includes('/api/')) return withoutTrailingSlash.split('/api/')[0] + '/api';

  return `${withoutTrailingSlash}/api`;
};

export const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const rawText = await response.text();
  const trimmed = rawText.trim();

  if (!trimmed) {
    // No content (shouldn't happen in this app, but keeps it safe)
    return {} as T;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const snippet = trimmed.slice(0, 160);
    throw new Error(
      `Unexpected response (not JSON). Check VITE_API_URL. Response starts with: ${JSON.stringify(snippet)}`
    );
  }
};
