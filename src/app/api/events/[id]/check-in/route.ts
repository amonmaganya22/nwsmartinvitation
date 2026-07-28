import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await req.json();
        const { qrToken } = body;

        if (!qrToken) {
            return NextResponse.json({ error: "Token haipatikani." }, { status: 400 });
        }

        // Tafuta mgeni kupitia token yake
        const guest = await prisma.guest.findUnique({
            where: { qrToken: qrToken },
        });

        if (!guest) {
            return NextResponse.json({ error: "Mgeni hajapatikana kwenye mfumo." }, { status: 404 });
        }

        // UHAKIKI: Angalia kama tayari ameshachekiwa (Checked-in)
        if (guest.status === 'USED') {
            return NextResponse.json({ error: "Already checked in" }, { status: 400 });
        }

        // Sasisha hadhi ya mgeni kuwa ameingia
        const updatedGuest = await prisma.guest.update({
            where: { id: guest.id },
            data: { status: 'USED' },
        });

        return NextResponse.json({ success: true, guest: updatedGuest }, { status: 200 });

    } catch (error) {
        console.error("Check-in error:", error);
        return NextResponse.json({ error: "Hitilafu ya seva (Internal Server Error)." }, { status: 500 });
    }
}