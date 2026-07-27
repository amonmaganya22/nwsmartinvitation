import { NextResponse, NextRequest } from "next/server";
import { prisma as db } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.guest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Mgeni amefutwa mafanikio." });
  } catch (error) {
    console.error("Hitilafu wakati wa kufuta mgeni:", error);
    return NextResponse.json({ success: false, message: "Imeshindikana kumfuta mgeni." }, { status: 500 });
  }
}