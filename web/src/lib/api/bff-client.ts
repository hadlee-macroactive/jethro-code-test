/**
 * BFF (Backend-For-Frontend) client for server-side API proxying.
 * Reads the backend URL from server-side env and forwards requests
 * with auth tokens from cookies or headers.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

interface BffRequestOptions {
  method?: string;
  path: string;
  token?: string;
  body?: unknown;
  params?: Record<string, string>;
}

export async function bffRequest<T>(options: BffRequestOptions): Promise<{ data: T; status: number }> {
  const { method = 'GET', path, token, body, params } = options;

  // Construct URL: BACKEND_URL already includes /v1 prefix, path is relative
  const base = BACKEND_URL.endsWith('/') ? BACKEND_URL : `${BACKEND_URL}/`;
  const relativePath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(relativePath, base);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') url.searchParams.set(key, value);
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    return { data: error as T, status: response.status };
  }

  const data = await response.json();
  return { data: data as T, status: response.status };
}

export function getAuthToken(request: Request): string | undefined {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    return authHeader.replace('Bearer ', '');
  }

  // Check cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match?.[1];
}

/**
 * Decode JWT payload without full verification.
 * The backend performs the real JWT verification - this is just
 * for extracting user info in the BFF layer.
 */
export function decodeJwtPayload(token: string): {
  userId: number;
  creatorId: number;
  role: string;
  email?: string;
  name?: string;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return {
      userId: payload.userId,
      creatorId: payload.creatorId,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user info from a request's JWT token.
 */
export function getAuthUser(request: Request): {
  userId: number;
  creatorId: number;
  role: string;
  email?: string;
  name?: string;
} | null {
  const token = getAuthToken(request);
  if (!token) return null;
  return decodeJwtPayload(token);
}
