import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const forbidden = requireRole(auth.user, ["ADMIN"]);
  if (forbidden) return forbidden;

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true, email: true, plan: true } } }
  });

  return NextResponse.json({ payments });
}
