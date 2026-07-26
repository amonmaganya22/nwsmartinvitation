import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Inachukua 'title' au 'name' au 'eventName'
    const title = body.title || body.name || body.eventName;
    
    // Inachukua 'date' au 'eventDate'
    const rawDate = body.date || body.eventDate;

    // Inachukua 'location' au 'venue'
    const location = body.location || body.venue || null;

    // Description na Cover Image (za hiari / optional)
    const description = body.description || null;
    const coverUrl = body.coverUrl || body.cover || body.coverImageUrl || null;

    // 1. Validation ya vifaa vya lazima
    if (!title || !rawDate) {
      return NextResponse.json(
        { error: "Title na Date vinahitajika!" },
        { status: 400 }
      );
    }

    // 2. Hakikisha Date ipo kwenye mfumo sahihi
    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Format ya tarehe sio sahihi!" },
        { status: 400 }
      );
    }

    // 3. Hapa utakapokuwa tayari ku-save kwenye Prisma/Database:
    /*
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: parsedDate,
        location,
        coverUrl,
      },
    });
    */

    // Tunaweka mock ID ili frontend redirects zifanye kazi bila crash
    const createdEvent = {
      id: "demo-event-" + Date.now(),
      title,
      description,
      date: parsedDate,
      location,
      coverUrl
    };

    return NextResponse.json(
      { 
        message: "Event imeundwa kikamilifu!", 
        event: createdEvent 
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