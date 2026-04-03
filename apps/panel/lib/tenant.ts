const TENANT_STORAGE_KEY = "zuri_hotel_id";
const TENANT_RESORT_NAME_KEY = "zuri_resort_name";

function setCookie(name: string, value: string, days: number) {
  if (typeof window === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

function eraseCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = name + '=; Max-Age=-99999999;path=/;SameSite=Lax';
}

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
  setCookie(TENANT_STORAGE_KEY, hotelId, 7); // Sync to cookie for middleware
}

export function clearTenantHotelId(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TENANT_STORAGE_KEY);
  eraseCookie(TENANT_STORAGE_KEY);
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
  setCookie(TENANT_RESORT_NAME_KEY, name, 7);
}

export function clearTenantResortName(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TENANT_RESORT_NAME_KEY);
  eraseCookie(TENANT_RESORT_NAME_KEY);
}

export function clearAuth(): void {
  clearTenantHotelId();
  clearTenantResortName();
  if (typeof window !== "undefined") {
    // Cleanup legacy token keys from older clients.
    window.localStorage.removeItem("zuri_access_token");
    window.localStorage.removeItem("zuri_refresh_token");
    eraseCookie("zuri_access_token");
    eraseCookie("zuri_refresh_token");
  }
}
