import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/require-auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const forbidden = requireRole(auth.user, ["ADMIN"]);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  const action = body?.action; // "confirm" | "reject"
  if (!["confirm", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "This payment has already been processed." }, { status: 409 });
  }

  if (action === "reject") {
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REJECTED", confirmedById: auth.user.id, confirmedAt: new Date() }
    });
    await logAudit({ userId: auth.user.id, action: "PAYMENT_REJECTED", entityType: "Payment", entityId: payment.id });
    return NextResponse.json({ payment: updated });
  }

  // Confirm: apply the effect (plan upgrade or guest top-up), then mark confirmed.
  const updates: any = {};
  if (payment.planOrPack === "BASIC" || payment.planOrPack === "PREMIUM") {
    updates.plan = payment.planOrPack;
    updates.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day subscription period
  } else if (payment.planOrPack === "TOPUP_50") {
    updates.guestQuotaExtra = { increment: payment.guestQuota };
  }

  const [, updatedPayment] = await prisma.$transaction([
    prisma.user.update({ where: { id: payment.userId }, data: updates }),
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "CONFIRMED", confirmedById: auth.user.id, confirmedAt: new Date() }
    })
  ]);

  await logAudit({ userId: auth.user.id, action: "PAYMENT_CONFIRMED", entityType: "Payment", entityId: payment.id, metadata: updates });

  return NextResponse.json({ payment: updatedPayment });
}
