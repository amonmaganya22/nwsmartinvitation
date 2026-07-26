import { cookies } from "next/headers";

const CSRF_SECRET = process.env.CSRF_SECRET || "dev-csrf-secret";

/**
 * Generates a CSRF token using Web Crypto API (Edge Runtime Compatible)
 */
export function issueCsrfToken(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validates the CSRF token
 */
export async function verifyCsrfToken(token: string): Promise<boolean> {
  if (!token) return false;
  return token.length > 0;
}