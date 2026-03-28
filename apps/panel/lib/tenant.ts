const TENANT_STORAGE_KEY = "zuri_hotel_id";
const TENANT_RESORT_NAME_KEY = "zuri_resort_name";
const ACCESS_TOKEN_STORAGE_KEY = "zuri_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "zuri_refresh_token";

export function getTenantHotelId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TENANT_STORAGE_KEY);
}

export function setTenantHotelId(hotelId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TENANT_STORAGE_KEY, hotelId);
}

export function clearTenantHotelId(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TENANT_STORAGE_KEY);
}

export function getTenantResortName(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TENANT_RESORT_NAME_KEY);
}

export function setTenantResortName(name: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TENANT_RESORT_NAME_KEY, name);
}

export function clearTenantResortName(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TENANT_RESORT_NAME_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
}

export function clearRefreshToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function clearAuth(): void {
  clearAccessToken();
  clearRefreshToken();
  clearTenantHotelId();
}
