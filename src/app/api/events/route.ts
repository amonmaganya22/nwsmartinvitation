import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();

    // Map vigezo vyote kutoka frontend
    const titleName = body.name || body.title || body.eventName;
    const rawDate = body.eventDate || body.date;
    const eventTime = body.eventTime || body.time || "00:00"; // Fallback kama muda haukutumwa
    const locationName = body.venue || body.location || null;
    const description = body.description || null;
    const coverUrl = body.coverImageUrl || body.coverUrl || body.cover || null;

    // 2. Validation
    if (!titleName || !rawDate) {
      return NextResponse.json(
        { error: "Title na Date vinahitajika!" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Format ya tarehe sio sahihi!" },
        { status: 400 }
      );
    }

    // 3. Save to Prisma (ikihusisha na eventTime)
    const newEvent = await prisma.event.create({
      data: {
        name: titleName,
        eventDate: parsedDate,
        eventTime: eventTime, // <--- HAPA: Prisma schema inahitaji eventTime!
        venue: locationName,
        description,
        coverImageUrl: coverUrl,
        userId: auth.user.id,
      },
    });

    return NextResponse.json(
      { 
        message: "Event imeundwa kikamilifu!", 
        event: newEvent 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Kuna tatizo limetokea wakati wa kutengeneza event" },
      { status: 500 }
    );
  }
}