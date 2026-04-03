import { clearAuth } from "@/lib/tenant";

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
const DEV_URL = process.env.NEXT_PUBLIC_API_URL_DEV;
const PROD_URL = process.env.NEXT_PUBLIC_API_URL_PROD;

export const API_BASE_URL = "";
export const PUBLIC_API_BASE_URL = (isProduction ? PROD_URL : DEV_URL) ?? "";

type ApiRequestInit = RequestInit & {
  bodyJson?: unknown;
  timeout?: number;
  retries?: number;
};

let isRefreshing = false;
type RefreshSubscriber = {
  onSuccess: () => void;
  onError: (error: Error) => void;
};

let refreshSubscribers: RefreshSubscriber[] = [];

function subscribeTokenRefresh(onSuccess: () => void, onError: (error: Error) => void) {
  refreshSubscribers.push({ onSuccess, onError });
}

function onRefreshed() {
  refreshSubscribers.forEach(({ onSuccess }) => onSuccess());
  refreshSubscribers = [];
}

function onRefreshFailed(error: Error) {
  refreshSubscribers.forEach(({ onError }) => onError(error));
  refreshSubscribers = [];
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { bodyJson, headers, timeout = DEFAULT_TIMEOUT, retries = 2, ...rest } = init;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fetchOptions: RequestInit = {
    ...rest,
    signal: controller.signal,
    credentials: "include",
    headers: {
      ...(bodyJson ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: bodyJson ? JSON.stringify(bodyJson) : rest.body,
  };

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 440) {
        if (path.includes("/api/auth/login") || path.includes("/api/auth/refresh")) {
          throw await getError(response);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({}),
            });

            if (!refreshResponse.ok) {
              throw new Error("Refresh failed");
            }

            isRefreshing = false;
            onRefreshed();
          } catch (err) {
            isRefreshing = false;
            onRefreshFailed(new Error("Session expired. Please log in again."));
            handleLogout();
            throw new Error("Session expired. Please log in again.");
          }
        }

        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            resolve(apiFetch<T>(path, init));
          }, (error) => {
            reject(error);
          });
        });
      }

      if (!response.ok) {
        throw await getError(response);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      lastError = toProfessionalNetworkError(error);
      
      // Only retry on network errors or timeouts (not 4xx/5xx errors)
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = lastError.message.includes("unable to reach the server");
      
      if (attempt < retries && (isAbortError || isNetworkError)) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
        continue;
      }
      
      clearTimeout(timeoutId);
      throw lastError;
    }
  }
  
  throw lastError || new Error("Request failed after retries");
}

async function getError(response: Response) {
  const fallback = `${response.status} ${response.statusText}`.trim();
  try {
    const data = await response.json();
    return new Error(data?.detail || data?.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

export function handleLogout() {
  if (typeof window !== "undefined") {
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {
      // best effort cookie clear
    });
  }
  
  clearAuth();
  
  if (typeof window !== "undefined") {
    // Immediate redirect to login to avoid stale dashboard state
    window.location.href = "/login";
  }
}

function toProfessionalNetworkError(error: unknown): Error {
  if (error instanceof Error && error.name === 'AbortError') {
    return new Error("The request timed out. Please check your connection and try again.");
  }
  if (error instanceof Error && error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes("failed to fetch") || msg.includes("network")) {
      return new Error(
        "We’re unable to reach the server right now. Please check your connection and try again."
      );
    }
    return new Error(error.message);
  }
  return new Error(
    "We’re unable to process this request right now. Please try again in a moment."
  );
}
