import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;

    const guest = await prisma.guest.findUnique({
      where: { qrToken: token },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Mgeni hakutambulika.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, guest }, { status: 200 });
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json(
      { success: false, message: 'Hitilafu ya seva.' },
      { status: 500 }
    );
  }
}