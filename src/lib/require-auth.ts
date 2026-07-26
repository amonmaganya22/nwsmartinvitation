import { NextResponse } from "next/server";
import { getSession, SessionUser } from "./auth";

export async function requireUser(): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const user = await getSession();
  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  return { user };
}

export function requireRole(user: SessionUser, roles: SessionUser["role"][]): NextResponse | null {
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "You don't have permission to do this." }, { status: 403 });
  }
  return null;
}
