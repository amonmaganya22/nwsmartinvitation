import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "OWNER" | "SCANNER" | "ADMIN";
  plan: "FREE" | "BASIC" | "PREMIUM";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(user: SessionUser) {
  return jwt.sign(user, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = cookies();
  store.set("nwsi_access", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15
  });
  store.set("nwsi_refresh", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearAuthCookies() {
  const store = cookies();
  store.delete("nwsi_access");
  store.delete("nwsi_refresh");
}

/** Reads the current session from the access-token cookie. Use in Server Components / route handlers. */
export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get("nwsi_access")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

/** Fetches a fresh copy of the user from the DB (use when plan/role must be current). */
export async function getFreshUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
