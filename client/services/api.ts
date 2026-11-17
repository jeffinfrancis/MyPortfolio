// The one place the client talks to the Express API.
// VITE_API_URL may be either the server origin (http://localhost:3000)
// or an API base that already ends in /api (http://localhost:3000/api).
// Avoid producing the common but incorrect /api/api URL.
const configuredApiUrl = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');
const API_BASE = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : '/api';

const TOKEN_KEY = 'myportfolio.token';

export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage can be blocked; the session just won't persist */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }
};

// Fired when the server rejects a stored token, so AuthContext can sign out.
export const AUTH_EXPIRED_EVENT = 'myportfolio:auth-expired';

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStore.get();

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError('Could not reach the server. Check that it is running.', 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token && tokenStore.get() === token) {
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    const fallback =
      response.status >= 500
        ? 'The server is unavailable. Check that it is running.'
        : `Request failed (${response.status}).`;
    throw new ApiError(data?.message ?? fallback, response.status, data?.errors);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  del: <T = { message: string }>(path: string) => request<T>('DELETE', path)
};
