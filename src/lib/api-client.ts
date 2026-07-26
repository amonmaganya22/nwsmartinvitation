"use client";

let cachedCsrfToken: string | null = null;

export function setCsrfToken(token: string) {
  cachedCsrfToken = token;
}

export function getCsrfToken() {
  return cachedCsrfToken;
}

/** Wraps fetch: always sends cookies, attaches the CSRF header on mutating requests. */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && cachedCsrfToken) {
    headers.set("x-csrf-token", cachedCsrfToken);
  }

  const res = await fetch(url, { ...options, headers, credentials: "include" });
  const data = await res.json().catch(() => ({}));

  if (data?.csrfToken) setCsrfToken(data.csrfToken);

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }
  return data;
}
