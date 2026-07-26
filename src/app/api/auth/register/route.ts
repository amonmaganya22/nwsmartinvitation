import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/auth";
import { issueCsrfToken } from "@/lib/csrf";
import { registerSchema, sanitizeText } from "@/lib/validators";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const key = clientKeyFromRequest(req, "register");
    const limited = rateLimit(key, 5, 15 * 60 * 1000); // Registration limit: 5 kwa min 15
    if (!limited.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { fullName, email, phone, password } = parsed.data;
    const cleanName = sanitizeText(fullName);

    // 1. Angalia kama Email AU Phone Number tayari vimeshasajiliwa
    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const existingPhone = phone ? await prisma.user.findUnique({ where: { phone } }) : null;

    if (existingEmail || existingPhone) {
      return NextResponse.json(
        { error: "Unable to create account with these details." }, 
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName: cleanName,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        role: "OWNER",
        plan: "FREE"
      }
    });

    const sessionUser = { id: user.id, email: user.email, fullName: user.fullName, role: user.role, plan: user.plan };
    const accessToken = signAccessToken(sessionUser);
    const refreshToken = signRefreshToken(user.id);
    const csrfToken = issueCsrfToken();

    await logAudit({
      userId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      ipAddress: clientKeyFromRequest(req).split(":")[0]
    });

    // 2. Tengeneza Response Kwanza
    const response = NextResponse.json({ user: sessionUser, csrfToken }, { status: 201 });

    // 3. Weka Cookies Kwenye Response
    await setAuthCookies(accessToken, refreshToken, response);

    return response;

  } catch (error: any) {
    console.error("REGISTER_ERROR_DETAILS:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message || String(error) },
      { status: 500 }
    );
  }
}