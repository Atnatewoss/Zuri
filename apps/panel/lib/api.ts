import { clearAuth } from "@/lib/tenant";

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
const DEV_URL = process.env.NEXT_PUBLIC_API_URL_DEV;
const PROD_URL = process.env.NEXT_PUBLIC_API_URL_PROD;

export const API_BASE_URL = isProduction ? PROD_URL : DEV_URL;

type ApiRequestInit = RequestInit & {
  bodyJson?: unknown;
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

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { bodyJson, headers, ...rest } = init;
  const fetchOptions: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      ...(bodyJson ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: bodyJson ? JSON.stringify(bodyJson) : rest.body,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
  } catch (error) {
    throw toProfessionalNetworkError(error);
  }

  if (response.status === 401 || response.status === 440) {
    if (path.includes("/api/auth/login") || path.includes("/api/auth/refresh")) {
      throw await getError(response);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        let refreshResponse: Response;
        try {
          refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
          });
        } catch (error) {
          throw toProfessionalNetworkError(error);
        }

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

    // Wait for refresh to complete and retry
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(() => {
        resolve(apiFetch<T>(path, {
          ...init,
        }));
      }, (error) => {
        reject(error);
      });
    });
  }

  if (!response.ok) {
    throw await getError(response);
  }

  return response.json() as Promise<T>;
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

function handleLogout() {
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
    window.location.href = "/login";
  }
}

function toProfessionalNetworkError(error: unknown): Error {
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
