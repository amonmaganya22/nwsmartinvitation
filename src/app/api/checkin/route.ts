import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token ya mgeni haipatikani.' },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.findUnique({
      where: { qrToken: token },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Mgeni hakutambulika kwenye mfumo.' },
        { status: 404 }
      );
    }

    if ((guest.status as string) === 'CHECKED_IN') {
      return NextResponse.json({
        success: false,
        message: `Kadi ya ${guest.name} imeshawahi kutumika!`,
      });
    }

    // Sasisha hali ya mgeni kuwa ameingia (Checked In)
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: { status: 'CHECKED_IN' as any },
    });

    return NextResponse.json({
      success: true,
      message: `Karibu sana, ${guest.name}! Kadi imethibitishwa.`,
      guest: updatedGuest,
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    return NextResponse.json(
      { success: false, message: 'Hitilafu ya seva wakati wa kuhakiki.' },
      { status: 500 }
    );
  }
}