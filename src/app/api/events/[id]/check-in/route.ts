import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { GuestStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { qrToken, guestId } = body;

    if (!qrToken && !guestId) {
      return NextResponse.json(
        { error: "Token ya QR au Kitambulisho cha Mgeni kinahitajika" },
        { status: 400 }
      );
    }

    const guest = await db.guest.findFirst({
      where: {
        eventId: id,
        OR: [
          ...(qrToken ? [{ qrToken }] : []),
          ...(guestId ? [{ id: guestId }] : []),
        ],
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Mgeni hajapatikana kwenye tukio hili" },
        { status: 404 }
      );
    }

    if (guest.status === GuestStatus.USED) {
      return NextResponse.json(
        { error: "QR code hii imeshawahi kutumika tayari (Imekwisha fanyiwa Check-in)" },
        { status: 400 }
      );
    }

    const updatedGuest = await db.guest.update({
      where: { id: guest.id },
      data: {
        status: GuestStatus.USED,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Check-in imefanikiwa! Mgeni amethibitishwa.",
      guest: updatedGuest,
    });
  } catch (error) {
    console.error("Hitilafu wakati wa kufanya check-in:", error);
    return NextResponse.json(
      { error: "Imeshindwa kufanya verification ya mgeni" },
      { status: 500 }
    );
  }
}