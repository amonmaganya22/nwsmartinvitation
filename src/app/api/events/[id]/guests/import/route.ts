import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // <-- params sasa ni Promise!
) {
  try {
    // 1. Fanya await kwenye params kwanza ili kupata id
    const { id: eventId } = await context.params;

    const body = await request.json();
    const { guests } = body;

    if (!guests || !Array.isArray(guests)) {
      return NextResponse.json(
        { error: "Orodha ya wageni haijapatikana au haina muundo sahihi." },
        { status: 400 }
      );
    }

    // 2. Kutengeneza data yenye qrToken na secretHash
    const formattedGuests = guests.map((guest: any) => {
      const qrToken = crypto.randomUUID();
      const secretHash = crypto
        .createHash("sha256")
        .update(`${eventId}-${qrToken}`)
        .digest("hex");

      return {
        name: guest.name,
        phone: guest.phone || null,
        email: guest.email || null,
        eventId: eventId,
        qrToken: qrToken,
        secretHash: secretHash,
      };
    });

    const createdGuests = await prisma.guest.createMany({
      data: formattedGuests,
    });

    return NextResponse.json({
      message: "Wageni wameingizwa kikamilifu!",
      count: createdGuests.count,
    });
  } catch (error) {
    console.error("Error importing guests:", error);
    return NextResponse.json(
      { error: "Kuna tatizo limetokea wakati wa ku-import wageni." },
      { status: 500 }
    );
  }
}