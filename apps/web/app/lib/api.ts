const serverBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3001";
const publicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiBaseUrl =
  typeof window === "undefined"
    ? serverBaseUrl
    : publicBaseUrl ?? "http://localhost:3001";

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
