import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { GuestStatus } from "@prisma/client";
import crypto from "crypto";

// 1. KUONGEZA MGENI MPYA (POST)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, phone, email } = body;

    if (!name) {
      return NextResponse.json({ error: "Jina la mgeni linahitajika" }, { status: 400 });
    }

    const qrToken = crypto.randomBytes(16).toString("hex");
    const secretHash = crypto.randomBytes(32).toString("hex");

    const newGuest = await db.guest.create({
      data: {
        name,
        phone,
        email,
        eventId: id,
        // Tumia thamani sahihi iliyopo kwenye enum yako (kama vile GuestStatus.UNUSED badala ya PENDING)
        status: GuestStatus.UNUSED, 
        qrToken,
        secretHash,
      },
    });

    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error("Hitilafu wakati wa kuongeza mgeni:", error);
    return NextResponse.json({ error: "Imeshindwa kuongeza mgeni" }, { status: 500 });
  }
}

// 2. KUFUTA MGENI (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get("guestId");

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID inahitajika" }, { status: 400 });
    }

    await db.guest.delete({
      where: { id: guestId },
    });

    return NextResponse.json({ success: true, message: "Mgeni amefutwa mafanikio" });
  } catch (error) {
    console.error("Hitilafu wakati wa kufuta mgeni:", error);
    return NextResponse.json({ error: "Imeshindwa kufuta mgeni" }, { status: 500 });
  }
}