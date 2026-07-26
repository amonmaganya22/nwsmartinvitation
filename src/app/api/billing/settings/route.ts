import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

async function getSetting(key: string, fallback: string) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const [payoutNumber, payoutName, priceTopup, priceBasic, pricePremium] = await Promise.all([
    getSetting("payout_mobile_number", "0768940971"),
    getSetting("payout_name", "Amon Maganya"),
    getSetting("price_per_50_guests_tzs", "25000"),
    getSetting("price_basic_tzs", "15000"),
    getSetting("price_premium_tzs", "45000")
  ]);

  return NextResponse.json({
    payoutMobileNumber: payoutNumber,
    payoutName,
    pricing: {
      TOPUP_50: Number(priceTopup),
      BASIC: Number(priceBasic),
      PREMIUM: Number(pricePremium)
    }
  });
}
