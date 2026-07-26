import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Next.js 15/16 Async Params
) {
  try {
    // 1. Await params kupata eventId
    const { id: eventId } = await context.params;

    const body = await request.json();
    const { name, phone, email } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Jina la mgeni linahitajika." },
        { status: 400 }
      );
    }

    // 2. Zalisha qrToken na secretHash zinazohitajika na Prisma
    const qrToken = crypto.randomUUID();
    const secretHash = crypto
      .createHash("sha256")
      .update(`${eventId}-${qrToken}`)
      .digest("hex");

    // 3. Tengeneza mgeni mpya
    const guest = await prisma.guest.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        eventId,
        qrToken,
        secretHash,
      },
    });

    return NextResponse.json({
      message: "Mgeni ameongezwa kikamilifu!",
      guest,
    });
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: "Kuna tatizo limetokea wakati wa kuongeza mgeni." },
      { status: 500 }
    );
  }
}