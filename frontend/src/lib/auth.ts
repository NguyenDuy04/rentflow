const LEGACY_TOKEN_KEY = "rentflow_token";

export function clearLegacyToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}
