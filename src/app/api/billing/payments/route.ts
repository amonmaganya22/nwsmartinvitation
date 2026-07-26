import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const payments = await prisma.payment.findMany({ where: { userId: auth.user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ payments });
}
