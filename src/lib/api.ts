const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzqGxB3gqNqHL1jWsDzq5t9qyj4mgsRtpOb_X7WCm3-cY6wU7GsLrVkkXsxWnTyn9oDdg/exec";

export async function gasCall(action: string, ...params: any[]): Promise<any> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return res.json();
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
