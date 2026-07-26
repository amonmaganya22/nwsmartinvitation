import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/auth";
import { issueCsrfToken } from "@/lib/csrf";
import { loginSchema } from "@/lib/validators";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ip = clientKeyFromRequest(req).split(":")[0];
  // Rate limit by IP AND by the attempted email, so one bad actor can't lock out someone else's account
  // nor hammer a single account from many IPs unnoticed.
  const ipLimit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const emailLimit = rateLimit(`login-email:${email.toLowerCase()}`, 8, 15 * 60 * 1000);
  if (!emailLimit.allowed) {
    return NextResponse.json({ error: "Too many login attempts for this account. Please try again later." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  const genericError = () => NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  if (!user) {
    await logAudit({ action: "LOGIN_FAILED", entityType: "User", ipAddress: ip, metadata: { email } });
    return genericError();
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    await logAudit({ userId: user.id, action: "LOGIN_FAILED", entityType: "User", entityId: user.id, ipAddress: ip });
    return genericError();
  }

  const sessionUser = { id: user.id, email: user.email, fullName: user.fullName, role: user.role, plan: user.plan };
  const accessToken = signAccessToken(sessionUser);
  const refreshToken = signRefreshToken(user.id);
  setAuthCookies(accessToken, refreshToken);
  const csrfToken = issueCsrfToken();

  await logAudit({ userId: user.id, action: "LOGIN_SUCCESS", entityType: "User", entityId: user.id, ipAddress: ip });

  return NextResponse.json({ user: sessionUser, csrfToken });
}
