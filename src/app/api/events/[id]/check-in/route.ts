import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { guestId } = body;

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID inahitajika" }, { status: 400 });
    }

    // Hakikisha mgeni yupo na ni wa tukio hili
    const guest = await db.guest.findFirst({
      where: {
        id: guestId,
        eventId: id,
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Mgeni hajapatikana kwenye tukio hili" }, { status: 404 });
    }

    // Sasisha hali ya mgeni kulingana na muundo wa schema yako (hakikisha status ni sahihi au iondoe kama haipo kwenye enum)
    const updatedGuest = await db.guest.update({
      where: { id: guestId },
      data: {
        // Kama Prisma bado inaleta shida kwenye status, unaweza kuangalia jina halisi kwenye schema.prisma yako 
        // (Mfano: "CHECKED" au kuacha updatedA t tu kama status inajiset yenyewe)
        checkedInAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Check-in imefanikiwa",
      guest: updatedGuest,
    });
  } catch (error) {
    console.error("Hitilafu wakati wa check-in:", error);
    return NextResponse.json({ error: "Imeshindwa kufanya check-in" }, { status: 500 });
  }
}