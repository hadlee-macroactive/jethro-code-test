/**
 * Client-side API client.
 * All calls go through the Next.js BFF routes (/api/*) which handle
 * authentication via httpOnly cookies.
 */

const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');

async function request<T>(
  method: string,
  path: string,
  options?: { params?: Record<string, string>; body?: unknown }
): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      credentials: 'include',
    });

    if (response.status === 401) {
      const error = new Error('Unauthorized');
      (error as any).status = 401;
      throw error;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw error;
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body }),
  delete: <T>(path: string) =>
    request<T>('DELETE', path),
};

export default api;
