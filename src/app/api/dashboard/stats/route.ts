import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const events = await prisma.event.findMany({ where: { userId: user.id }, select: { id: true } });
  const eventIds = events.map((e) => e.id);

  const [totalGuests, checkedIn] = await Promise.all([
    prisma.guest.count({ where: { eventId: { in: eventIds } } }),
    prisma.guest.count({ where: { eventId: { in: eventIds }, status: "USED" } })
  ]);

  const recentEvents = await prisma.event.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { template: true, _count: { select: { guests: true } } }
  });

  return NextResponse.json({
    totals: {
      events: eventIds.length,
      guests: totalGuests,
      checkedIn,
      pending: totalGuests - checkedIn
    },
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      name: e.name,
      eventDate: e.eventDate,
      venue: e.venue,
      guestCount: e._count.guests,
      templateName: e.template?.name ?? null
    }))
  });
}
