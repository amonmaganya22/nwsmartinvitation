import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

/**
 * NOTE: no email/SMS provider is wired up yet. This route generates and stores
 * a reset token exactly the way it would in production; the only missing piece
 * is the "send it to the user" step. Swap the TODO below for your provider of
 * choice (e.g. Resend, Postmark, or a Tanzanian SMS gateway) when ready.
 */
export async function POST(req: NextRequest) {
  const ip = clientKeyFromRequest(req).split(":")[0];
  const limited = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always respond the same way whether or not the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  const genericResponse = NextResponse.json({
    message: "If an account exists for that email, a reset link has been generated."
  });

  if (!user) return genericResponse;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: tokenHash, resetTokenExpiry: expiry }
  });

  await logAudit({ userId: user.id, action: "PASSWORD_RESET_REQUESTED", entityType: "User", entityId: user.id, ipAddress: ip });

  // TODO: send `rawToken` to the user via email/SMS instead of logging it.
  // The link they'd receive is: `${APP_URL}/reset-password?token=${rawToken}`
  console.log(`[dev-only] Password reset link for ${user.email}: /reset-password?token=${rawToken}`);

  return genericResponse;
}
