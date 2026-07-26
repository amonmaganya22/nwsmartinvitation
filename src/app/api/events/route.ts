import { NextResponse } from "next/server";
// Hakikisha ume-import prisma au supabase client wako hapa kama unaitumia
// import { prisma } from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Tenga data zinazokuja kutoka frontend
    const { title, description, date, location, coverUrl } = body;

    // 1. Check za lazima (Title na Date pekee ndio vya lazima)
    if (!title || !date) {
      return NextResponse.json(
        { error: "Title na Date vinahitajika!" },
        { status: 400 }
      );
    }

    // 2. Hapa weka code ya kuhifadhi kwenye Database yako.
    // Notice jinsi `coverUrl` inavyoshughulikiwa kama optional (kama haipo inakuwa null)
    /*
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        coverUrl: coverUrl || null, // <-- Hapa: Kama hakuna picha, inaweka null bila kuleta error!
      },
    });
    */

    // Mfano wa return context mpaka utakapoconnect na DB yako
    return NextResponse.json(
      { 
        message: "Event imeundwa kikamilifu!", 
        event: { title, description, date, location, coverUrl: coverUrl || null } 
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