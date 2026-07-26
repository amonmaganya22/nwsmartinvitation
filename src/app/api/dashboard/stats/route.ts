import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

// GET /api/dashboard/stats
export async function GET(_req: NextRequest) {
  try {
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    const totalEvents = await prisma.event.count({
      where: { userId: auth.user.id },
    });

    const totalGuests = await prisma.guest.count({
      where: { event: { userId: auth.user.id } },
    });

    return NextResponse.json({
      totalEvents,
      totalGuests,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}