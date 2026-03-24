const TENANT_STORAGE_KEY = "zuri_hotel_id";
const SESSION_TOKEN_STORAGE_KEY = "zuri_session_token";

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

export function getSessionToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
}

export function setSessionToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
}

export function clearSessionToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
}
