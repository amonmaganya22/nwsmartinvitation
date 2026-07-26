import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { eventSchema, sanitizeText } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { clientKeyFromRequest } from "@/lib/rateLimit";

async function getOwnedEvent(eventId: string, userId: string) {
  return prisma.event.findFirst({ where: { id: eventId, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const event = await prisma.event.findFirst({
    where: { id: params.id, userId: auth.user.id },
    include: { template: true, guests: { orderBy: { createdAt: "desc" } } }
  });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  return NextResponse.json({ event });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const existing = await getOwnedEvent(params.id, user.id);
  if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.templateId) {
    const template = await prisma.template.findUnique({ where: { id: data.templateId } });
    if (template?.isPremium) {
      const { isPremiumTemplateAllowed } = await import("@/lib/plans");
      if (!isPremiumTemplateAllowed(user.plan)) {
        return NextResponse.json({ error: "This template requires a Premium plan." }, { status: 403 });
      }
    }
  }

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      name: sanitizeText(data.name),
      eventDate: new Date(data.eventDate),
      eventTime: data.eventTime,
      venue: sanitizeText(data.venue),
      description: data.description ? sanitizeText(data.description) : null,
      coverImageUrl: data.coverImageUrl || null,
      templateId: data.templateId || null
    }
  });

  await logAudit({ userId: user.id, action: "EVENT_UPDATED", entityType: "Event", entityId: event.id });

  return NextResponse.json({ event });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const existing = await getOwnedEvent(params.id, user.id);
  if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  await prisma.event.delete({ where: { id: params.id } });

  await logAudit({
    userId: user.id,
    action: "EVENT_DELETED",
    entityType: "Event",
    entityId: params.id,
    ipAddress: clientKeyFromRequest(req).split(":")[0]
  });

  return NextResponse.json({ ok: true });
}
