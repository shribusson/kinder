const serverBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3001";
const publicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiBaseUrl =
  typeof window === "undefined"
    ? serverBaseUrl
    : publicBaseUrl ?? "http://localhost:3001";

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    const token = authCookie?.split('=')[1];

    if (!token || token === 'undefined') {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  } catch {
    return {};
  }
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  fallback?: T
) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(init?.headers ?? {})
      }
    });

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
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

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
