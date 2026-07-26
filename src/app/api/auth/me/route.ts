import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { issueCsrfToken } from "@/lib/csrf";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });
  const csrfToken = issueCsrfToken();
  return NextResponse.json({ user: session, csrfToken });
}
