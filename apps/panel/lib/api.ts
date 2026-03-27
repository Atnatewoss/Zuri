import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearAuth } from "@/lib/tenant";

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
const DEV_URL = process.env.NEXT_PUBLIC_API_URL_DEV;
const PROD_URL = process.env.NEXT_PUBLIC_API_URL_PROD;

export const API_BASE_URL = isProduction ? PROD_URL : DEV_URL;

type ApiRequestInit = RequestInit & {
  bodyJson?: unknown;
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { bodyJson, headers, ...rest } = init;
  const accessToken = getAccessToken();

  const fetchOptions: RequestInit = {
    ...rest,
    headers: {
      ...(bodyJson ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: bodyJson ? JSON.stringify(bodyJson) : rest.body,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

  if (response.status === 401 || response.status === 440) {
    if (path.includes("/api/auth/login") || path.includes("/api/auth/refresh")) {
      throw await getError(response);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Refresh failed");
        }

        const { access_token, refresh_token } = await refreshResponse.json();
        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        isRefreshing = false;
        onRefreshed(access_token);
      } catch (err) {
        isRefreshing = false;
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }
    }

    // Wait for refresh to complete and retry
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        resolve(apiFetch<T>(path, {
          ...init,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        }));
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
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
