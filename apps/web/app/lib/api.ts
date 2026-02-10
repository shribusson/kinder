const serverBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3001";
const publicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiBaseUrl =
  typeof window === "undefined"
    ? serverBaseUrl
    : publicBaseUrl ?? "http://localhost:3001";

function getCookie(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const match = document.cookie.split(';').find(c => c.trim().startsWith(`${name}=`));
  return match?.split('=')[1];
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const authToken = cookieStore.get('auth_token');
      if (authToken?.value) {
        return { Authorization: `Bearer ${authToken.value}` };
      }
    } catch {}
    return {};
  }

  try {
    const token = getCookie('auth_token');
    if (!token || token === 'undefined') {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = getCookie('refresh_token');
      if (!refreshToken) return false;

      const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.accessToken) {
        document.cookie = `auth_token=${data.accessToken}; path=/; max-age=604800`;
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  fallback?: T
) {
  try {
    const doFetch = () => fetch(`${apiBaseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(init?.headers ?? {})
      }
    });

    let response = await doFetch();

    if (response.status === 401 && typeof window !== "undefined") {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        response = await doFetch();
      } else {
        document.cookie = 'auth_token=; path=/; max-age=0';
        document.cookie = 'refresh_token=; path=/; max-age=0';
        window.location.href = '/crm/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

export async function apiCall(
  path: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
) {
  const doFetch = () => fetch(`${apiBaseUrl}${path}`, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  let response = await doFetch();

  if (response.status === 401 && typeof window !== "undefined") {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await doFetch();
    } else {
      document.cookie = 'auth_token=; path=/; max-age=0';
      document.cookie = 'refresh_token=; path=/; max-age=0';
      window.location.href = '/crm/login';
      throw new Error('Session expired');
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw {
      response: {
        data: data,
      },
    };
  }

  return data;
}
