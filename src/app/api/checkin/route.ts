import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { qrToken } = await req.json();

    if (!qrToken) {
      return NextResponse.json(
        { success: false, error: "QR Token haikupatikana!" },
        { status: 400 }
      );
    }

    // 1. Tafuta Mgeni mwenye Token hii
    const guest = await prisma.guest.findUnique({
      where: { qrToken },
      include: { event: true },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, error: "Kadi hii sio halali au haijasajiliwa!" },
        { status: 404 }
      );
    }

    // Convert status to string ili TypeScript isiweke mipaka
    const currentStatus = String(guest.status).toUpperCase();

    // 2. Angalia kama tayari ameshascaniwa
    if (
      currentStatus === "CHECKED_IN" ||
      currentStatus === "CHECKEDIN" ||
      currentStatus === "USED"
    ) {
      return NextResponse.json(
        {
          success: false,
          alreadyCheckedIn: true,
          error: "⚠️ KADI HII TAYARI IMESHATUMIKA!",
          guest: {
            name: guest.name,
            status: guest.status,
            checkedInAt: new Date(), // Tumetumia new Date() badala ya guest.updatedAt
          },
        },
        { status: 400 }
      );
    }

    // 3. Badilisha status
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status: "CHECKEDIN" as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "✅ KADI IMETHIBITISHWA! MGENI RUHUSA KUINGIA.",
      guest: updatedGuest,
    });
  } catch (error) {
    console.error("Checkin Error:", error);
    return NextResponse.json(
      { success: false, error: "Kuna tatizo kwenye mfumo!" },
      { status: 500 }
    );
  }
}