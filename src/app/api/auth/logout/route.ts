import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  clearAuthCookies();
  if (session) {
    await logAudit({ userId: session.id, action: "LOGOUT", entityType: "User", entityId: session.id });
  }
  return NextResponse.json({ ok: true });
}
