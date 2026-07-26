import crypto from "crypto";
import { cookies } from "next/headers";

const CSRF_SECRET = process.env.CSRF_SECRET || "dev-csrf-secret";

/** Issues a CSRF token tied to the session and sets it as a readable (non-httpOnly) cookie. */
export function issueCsrfToken(): string {
  const token = crypto.randomBytes(24).toString("hex");
  const signature = sign(token);
  const value = `${token}.${signature}`;
  cookies().set("nwsi_csrf", value, {
    httpOnly: false, // the client JS must be able to read this to echo it back in a header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return value;
}

function sign(token: string) {
  return crypto.createHmac("sha256", CSRF_SECRET).update(token).digest("hex");
}

/** Validates the header token against the cookie token (double-submit pattern). */
export function verifyCsrf(cookieValue: string | undefined, headerValue: string | undefined): boolean {
  if (!cookieValue || !headerValue || cookieValue !== headerValue) return false;
  const [token, signature] = cookieValue.split(".");
  if (!token || !signature) return false;
  return sign(token) === signature;
}
