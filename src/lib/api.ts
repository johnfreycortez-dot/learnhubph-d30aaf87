const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzqGxB3gqNqHL1jWsDzq5t9qyj4mgsRtpOb_X7WCm3-cY6wU7GsLrVkkXsxWnTyn9oDdg/exec";

// ---- Admin session token ---------------------------------------------
// The 6-digit PIN only gates the /admin login screen. Every admin* action
// sent to Apps Script must also carry a short-lived, server-issued token so
// the backend can reject calls made directly against the GAS URL (which is
// visible in the JS bundle) without going through adminLogin first.
//
// Stored in sessionStorage (not localStorage) so it doesn't outlive the
// browser tab/session. Expiry is enforced both here (soft check, purely for
// UX — instantly bounces an obviously-stale session without a network
// round trip) and on the server (the real check).
const ADMIN_TOKEN_KEY = "lhph_admin_token";
const ADMIN_TOKEN_EXPIRY_KEY = "lhph_admin_token_expiry";
const DEFAULT_ADMIN_SESSION_MS = 30 * 60 * 1000; // 30 min fallback if backend omits expiresAt

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function getAdminTokenExpiry(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
  return raw ? Number(raw) : null;
}

export function isAdminTokenValid(): boolean {
  const token = getAdminToken();
  const expiry = getAdminTokenExpiry();
  if (!token || !expiry) return false;
  return Date.now() < expiry;
}

/**
 * Call after a successful adminLogin response.
 * `expiresAt` can be a ms epoch number or an ISO string from Apps Script;
 * if omitted, falls back to a client-side 30-minute window.
 */
export function saveAdminToken(token: string, expiresAt?: number | string): void {
  if (typeof window === "undefined") return;
  const expiryMs =
    expiresAt !== undefined
      ? typeof expiresAt === "number"
        ? expiresAt
        : new Date(expiresAt).getTime()
      : Date.now() + DEFAULT_ADMIN_SESSION_MS;
  window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  window.sessionStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, String(expiryMs));
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  window.sessionStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
  // Drop the legacy client-only flag too, in case it's still lingering
  // from before this change (old sessions, etc.)
  window.sessionStorage.removeItem("lhph_admin");
}

/**
 * CONTRACT (needs matching Apps Script changes, see chat):
 * - adminLogin(pin) should return { ok: true, token, expiresAt } on success.
 * - Every admin* handler should validate the token param first and, if it's
 *   missing/invalid/expired, return { ok: false, authError: true, msg }
 *   instead of doing the action. gasCall below watches for authError:true
 *   on any admin* response and force-logs-out + redirects automatically.
 */
export async function gasCall(action: string, ...params: any[]): Promise<any> {
  const isAdminAction = action.startsWith("admin") && action !== "adminLogin";
  const finalParams = isAdminAction ? [...params, getAdminToken()] : params;

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: {},
      body: JSON.stringify({ action, params: finalParams }),
      redirect: "follow",
    });
    const data = await res.json();

    if (isAdminAction && data && data.authError === true) {
      clearAdminToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      // Keep the { ok, msg } shape every admin.dashboard.tsx call site
      // already expects, so nothing crashes while the redirect happens.
      return { ok: false, msg: data.msg || "Your admin session expired. Please log in again." };
    }

    return data;
  } catch (err) {
    throw err;
  }
}

const TOKEN_KEY = "lhph_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
