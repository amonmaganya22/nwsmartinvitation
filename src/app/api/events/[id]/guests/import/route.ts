import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const { guests } = body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty guest list provided" },
        { status: 400 }
      );
    }

    // Kutengeneza array ya wageni yenye qrToken na secretHash zinazohitajika na Prisma
    const guestData = guests.map((g: any) => {
      const qrToken = crypto.randomUUID();
      const secretHash = crypto
        .createHash("sha256")
        .update(`${id}-${g.name}-${Date.now()}-${Math.random()}`)
        .digest("hex");

      return {
        eventId: id,
        name: g.name,
        email: g.email || null,
        phone: g.phone || null,
        category: g.category || "General",
        qrToken: g.qrToken || qrToken,
        secretHash: g.secretHash || secretHash,
      };
    });

    const createdGuests = await prisma.guest.createMany({
      data: guestData,
    });

    return NextResponse.json(
      { message: "Guests imported successfully", count: createdGuests.count },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to import guests" },
      { status: 500 }
    );
  }
}