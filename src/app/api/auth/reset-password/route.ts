import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ip = clientKeyFromRequest(req).split(":")[0];
  const limited = rateLimit(`reset-password:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: { resetToken: tokenHash, resetTokenExpiry: { gt: new Date() } }
  });

  if (!user) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null }
  });

  await logAudit({ userId: user.id, action: "PASSWORD_RESET_COMPLETED", entityType: "User", entityId: user.id, ipAddress: ip });

  return NextResponse.json({ message: "Password updated. You can now log in." });
}
