import { NextResponse, NextRequest } from "next/server";
import { prisma as db } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");

    if (!guestId) {
      return NextResponse.json({ success: false, message: "Taarifa za mgeni hazijatulia (Guest ID haipo)." }, { status: 400 });
    }

    // Tafuta mgeni kwenye database
    const guest = await db.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      return NextResponse.json({ success: false, message: "Mgeni hapatikani kwenye mfumo." }, { status: 404 });
    }

    // Angalia kama kadi imeshawahi kutumika
    if ((guest.status as string) === "CHECKED_IN") {
      return NextResponse.json({ 
        success: false, 
        message: `KIONDOO KIMEKATALIWA! Mgeni ${guest.name} tayari ameshascaniwa na kuingia ukumbini hapo awali.` 
      }, { status: 400 });
    }

    // Sasisha status iwe CHECKED_IN moja kwa moja
    const updatedGuest = await db.guest.update({
      where: { id: guestId },
      data: { status: "CHECKED_IN" as any },
    });

    return NextResponse.json({ 
      success: true, 
      message: `IMEEFAULU! Mgeni ${updatedGuest.name} amehakikiwa (Verified) na kuruhusiwa kuingia ukumbini.`,
      guest: updatedGuest 
    });

  } catch (error) {
    console.error("Hitilafu wakati wa Check-in:", error);
    return NextResponse.json({ success: false, message: "Hitilafu ya kimfumo." }, { status: 500 });
  }
}