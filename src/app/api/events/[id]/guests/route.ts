import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { guestSchema, sanitizeText } from "@/lib/validators";
import { createGuestToken } from "@/lib/qr";
import { canAddGuests } from "@/lib/plans";
import { logAudit } from "@/lib/audit";

async function getOwnedEvent(eventId: string, userId: string) {
  return prisma.event.findFirst({ where: { id: eventId, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const event = await getOwnedEvent(params.id, auth.user.id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const guests = await prisma.guest.findMany({ where: { eventId: params.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ guests });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const event = await getOwnedEvent(params.id, user.id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const allowed = await canAddGuests(user.id, 1);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached your guest limit. Upgrade your plan or buy a guest top-up." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = guestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const { qrToken, secretHash } = createGuestToken(event.id);

  const guest = await prisma.guest.create({
    data: {
      eventId: event.id,
      name: sanitizeText(data.name),
      phone: data.phone,
      email: data.email || null,
      qrToken,
      secretHash
    }
  });

  await logAudit({ userId: user.id, action: "GUEST_ADDED", entityType: "Guest", entityId: guest.id });

  return NextResponse.json({ guest }, { status: 201 });
}
