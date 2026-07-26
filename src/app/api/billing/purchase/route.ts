import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { purchaseSchema } from "@/lib/validators";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

async function getSetting(key: string, fallback: string) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const ip = clientKeyFromRequest(req).split(":")[0];
  const limited = rateLimit(`purchase:${user.id}`, 10, 60 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many purchase attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { planOrPack, transactionReference } = parsed.data;

  const [payoutNumber, priceTopup, priceBasic, pricePremium] = await Promise.all([
    getSetting("payout_mobile_number", "0768940971"),
    getSetting("price_per_50_guests_tzs", "25000"),
    getSetting("price_basic_tzs", "15000"),
    getSetting("price_premium_tzs", "45000")
  ]);

  const amountMap: Record<string, number> = {
    TOPUP_50: Number(priceTopup),
    BASIC: Number(priceBasic),
    PREMIUM: Number(pricePremium)
  };
  const guestQuotaMap: Record<string, number> = { TOPUP_50: 50, BASIC: 0, PREMIUM: 0 };

  // Prevent duplicate submissions of the same transaction reference (double-spend of one mobile money receipt).
  const duplicate = await prisma.payment.findFirst({ where: { transactionReference } });
  if (duplicate) {
    return NextResponse.json({ error: "This transaction reference has already been submitted." }, { status: 409 });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      planOrPack,
      amountTzs: amountMap[planOrPack],
      guestQuota: guestQuotaMap[planOrPack],
      mobileMoneyNumber: payoutNumber,
      transactionReference,
      status: "PENDING"
    }
  });

  await logAudit({ userId: user.id, action: "PAYMENT_SUBMITTED", entityType: "Payment", entityId: payment.id, ipAddress: ip });

  return NextResponse.json({ payment }, { status: 201 });
}
