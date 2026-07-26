import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const guest = await prisma.guest.findUnique({ where: { id: params.id }, include: { event: true } });
  if (!guest || guest.event.userId !== auth.user.id) {
    return NextResponse.json({ error: "Guest not found." }, { status: 404 });
  }

  await prisma.guest.delete({ where: { id: params.id } });
  await logAudit({ userId: auth.user.id, action: "GUEST_DELETED", entityType: "Guest", entityId: params.id });

  return NextResponse.json({ ok: true });
}
