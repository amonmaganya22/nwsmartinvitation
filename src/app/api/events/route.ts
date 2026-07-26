import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Hakikisha mtumiaji ameingia kwenye mfumo (Authenticated)
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();

    // Map vigezo vyote vinavyoweza kutumwa kutoka Frontend
    const titleName = body.title || body.name || body.eventName;
    const rawDate = body.date || body.eventDate;
    const location = body.location || body.venue || null;
    const description = body.description || null;
    const coverUrl = body.coverUrl || body.cover || body.coverImageUrl || null;

    // 2. Validation ya vifaa vya lazima
    if (!titleName || !rawDate) {
      return NextResponse.json(
        { error: "Title na Date vinahitajika!" },
        { status: 400 }
      );
    }

    // 3. Hakikisha Date ipo kwenye mfumo sahihi
    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Format ya tarehe sio sahihi!" },
        { status: 400 }
      );
    }

    // 4. Hifadhi Event halisi kwenye Database kupitia Prisma
    // Ukaguzi wa field ya name/title kwenye Prisma Schema yako
    const newEvent = await prisma.event.create({
      data: {
        name: titleName, // Kama schema yako inatumia 'title', badilisha hapa kuwa `title: titleName`
        description,
        date: parsedDate,
        location,
        coverUrl,
        userId: auth.user.id, // Inaunganisha event na mtumiaji aliyetengeneza
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