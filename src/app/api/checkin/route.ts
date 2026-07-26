import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { checkinSchema } from "@/lib/validators";
import { unpackQrPayload, verifySignature } from "@/lib/qr";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const ip = clientKeyFromRequest(req).split(":")[0];
  const limited = rateLimit(`checkin:${ip}`, 60, 60 * 1000); // 60 scans/minute — generous for a busy door, blocks brute force
  if (!limited.allowed) {
    return NextResponse.json({ status: "INVALID", message: "Too many scans too quickly. Slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ status: "INVALID", message: "Invalid QR Code" }, { status: 400 });
  }

  const unpacked = unpackQrPayload(parsed.data.payload);
  if (!unpacked) {
    await prisma.checkinLog.create({
      data: { result: "INVALID", rawToken: parsed.data.payload.slice(0, 100), ipAddress: ip, scannedById: user.id }
    });
    return NextResponse.json({ status: "INVALID", message: "Invalid QR Code" }, { status: 200 });
  }

  const { t: qrToken, e: eventId, s: signature } = unpacked;

  // Signature must match what our server would have issued — rejects forged or tampered codes
  // before we even touch guest data.
  if (!verifySignature(qrToken, eventId, signature)) {
    await prisma.checkinLog.create({
      data: { result: "INVALID", rawToken: qrToken.slice(0, 100), ipAddress: ip, scannedById: user.id }
    });
    return NextResponse.json({ status: "INVALID", message: "Invalid QR Code" }, { status: 200 });
  }

  const guest = await prisma.guest.findUnique({ where: { qrToken }, include: { event: true } });

  if (!guest || guest.eventId !== eventId || guest.secretHash !== signature) {
    await prisma.checkinLog.create({
      data: { result: "INVALID", rawToken: qrToken, ipAddress: ip, scannedById: user.id }
    });
    return NextResponse.json({ status: "INVALID", message: "Invalid QR Code" }, { status: 200 });
  }

  // Authorization: the event owner, any ADMIN, or a designated SCANNER may check guests in.
  const canScan = user.role === "ADMIN" || user.role === "SCANNER" || guest.event.userId === user.id;
  if (!canScan) {
    return NextResponse.json({ status: "INVALID", message: "You're not authorized to scan for this event." }, { status: 403 });
  }

  // Atomic, race-condition-safe: only flips to USED if it is still UNUSED.
  const update = await prisma.guest.updateMany({
    where: { id: guest.id, status: "UNUSED" },
    data: { status: "USED", checkedInAt: new Date() }
  });

  if (update.count === 0) {
    await prisma.checkinLog.create({
      data: { guestId: guest.id, result: "ALREADY_USED", rawToken: qrToken, ipAddress: ip, scannedById: user.id }
    });
    return NextResponse.json({
      status: "ALREADY_USED",
      message: "Already Checked In",
      guestName: guest.name,
      eventName: guest.event.name
    });
  }

  await prisma.checkinLog.create({
    data: { guestId: guest.id, result: "SUCCESS", rawToken: qrToken, ipAddress: ip, scannedById: user.id }
  });

  return NextResponse.json({
    status: "SUCCESS",
    message: "Allow Entry",
    guestName: guest.name,
    eventName: guest.event.name,
    checkedInAt: new Date().toISOString()
  });
}
