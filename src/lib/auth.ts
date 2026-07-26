import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
  // Tunachukua tu field muhimu ili kuzuia metadata zisizo za lazima kuingia kwenye JWT
  const payload: SessionUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    plan: user.plan,
  };

  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as SessionUser & {
      iat?: number;
      exp?: number;
    };

    // Tunasafisha iat na exp kabla ya kurejesha session
    const { iat, exp, ...user } = decoded;
    return user as SessionUser;
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

/**
 * Anawasha Auth Cookies. Ina-support kuset kupitia `next/headers`
 * au moja kwa moja kwenye `NextResponse` (kama itapitishwa).
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  response?: NextResponse
) {
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  // Kama tunayo NextResponse object (Standard kwenye API Routes)
  if (response) {
    response.cookies.set("nwsi_access", accessToken, {
      ...cookieOptions,
      maxAge: 60 * 15, // Dk 15
    });

    response.cookies.set("nwsi_refresh", refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // Siku 30
    });
    return;
  }

  // Kama inaitwa kutoka kwenye Server Actions au Server Side kawaida
  const store = await cookies();

  store.set("nwsi_access", accessToken, {
    ...cookieOptions,
    maxAge: 60 * 15, // Dk 15
  });

  store.set("nwsi_refresh", refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30, // Siku 30
  });
}

export async function clearAuthCookies(response?: NextResponse) {
  if (response) {
    response.cookies.delete("nwsi_access");
    response.cookies.delete("nwsi_refresh");
    return;
  }

  const store = await cookies();
  store.delete("nwsi_access");
  store.delete("nwsi_refresh");
}

/** Reads the current session from the access-token cookie. Use in Server Components / route handlers. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get("nwsi_access")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

/** Fetches a fresh copy of the user from the DB (use when plan/role must be current). */
export async function getFreshUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}