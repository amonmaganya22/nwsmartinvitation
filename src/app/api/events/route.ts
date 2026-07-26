import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { eventSchema, sanitizeText } from "@/lib/validators";
import { canCreateEvent } from "@/lib/plans";
import { logAudit } from "@/lib/audit";
import { clientKeyFromRequest } from "@/lib/rateLimit";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const events = await prisma.event.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    include: { template: true, _count: { select: { guests: true } } }
  });

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const allowed = await canCreateEvent(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached the event limit for your plan. Upgrade to create more events." },
      { status: 403 }
    );
  }

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

  const event = await prisma.event.create({
    data: {
      userId: user.id,
      name: sanitizeText(data.name),
      eventDate: new Date(data.eventDate),
      eventTime: data.eventTime,
      venue: sanitizeText(data.venue),
      description: data.description ? sanitizeText(data.description) : null,
      coverImageUrl: data.coverImageUrl || null,
      templateId: data.templateId || null
    }
  });

  await logAudit({
    userId: user.id,
    action: "EVENT_CREATED",
    entityType: "Event",
    entityId: event.id,
    ipAddress: clientKeyFromRequest(req).split(":")[0]
  });

  return NextResponse.json({ event }, { status: 201 });
}
