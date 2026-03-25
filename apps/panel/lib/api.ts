import { getSessionToken } from "@/lib/tenant";

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
const DEV_URL = process.env.NEXT_PUBLIC_API_URL_DEV;
const PROD_URL = process.env.NEXT_PUBLIC_API_URL_PROD;

export const API_BASE_URL = isProduction ? PROD_URL : DEV_URL;

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
