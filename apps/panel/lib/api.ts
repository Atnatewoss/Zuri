import { getSessionToken } from "@/lib/tenant";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

type ApiRequestInit = RequestInit & {
  bodyJson?: unknown;
};

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { bodyJson, headers, ...rest } = init;
  const sessionToken = getSessionToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(bodyJson ? { "Content-Type": "application/json" } : {}),
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...headers,
    },
    body: bodyJson ? JSON.stringify(bodyJson) : rest.body,
  });

  if (!response.ok) {
    const fallback = `${response.status} ${response.statusText}`.trim();
    try {
      const data = await response.json();
      throw new Error(data?.detail || data?.message || fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return response.json() as Promise<T>;
}
