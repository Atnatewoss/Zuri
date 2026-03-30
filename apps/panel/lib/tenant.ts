const TENANT_STORAGE_KEY = "zuri_hotel_id";
const TENANT_RESORT_NAME_KEY = "zuri_resort_name";

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

export function clearAuth(): void {
  clearTenantHotelId();
  clearTenantResortName();
  if (typeof window !== "undefined") {
    // Cleanup legacy token keys from older clients.
    window.localStorage.removeItem("zuri_access_token");
    window.localStorage.removeItem("zuri_refresh_token");
  }
}
