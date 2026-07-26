import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

// GET /api/events/[id] - Kuleta taarifa za event
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
      include: {
        guests: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Kusasisha taarifa za event
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    const body = await req.json();

    // Map vigezo vyote vinavyoweza kutumwa kutoka Frontend
    const eventName = body.name || body.title;
    const rawDate = body.eventDate || body.date;
    const locationName = body.venue || body.location;
    const coverUrl = body.coverImageUrl || body.coverUrl || body.cover;
    const description = body.description;

    // Tengeneza update payload kiustadi
    const updateData: Record<string, any> = {};

    if (eventName) updateData.name = eventName;
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        updateData.date = parsedDate;
      }
    }
    if (locationName !== undefined) updateData.location = locationName;
    if (description !== undefined) updateData.description = description;
    
    // Inahifadhi ama URL ya picha au null (kama mtumiaji amefuta picha)
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl || null;

    const updatedEvent = await prisma.event.updateMany({
      where: {
        id,
        userId: auth.user.id,
      },
      data: updateData,
    });

    if (updatedEvent.count === 0) {
      return NextResponse.json(
        { error: "Event not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("PUT_EVENT_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Kufuta event
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    const deletedEvent = await prisma.event.deleteMany({
      where: {
        id,
        userId: auth.user.id,
      },
    });

    if (deletedEvent.count === 0) {
      return NextResponse.json(
        { error: "Event not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}