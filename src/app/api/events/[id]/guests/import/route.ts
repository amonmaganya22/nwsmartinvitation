import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { guestSchema, sanitizeText } from "@/lib/validators";
import { createGuestToken } from "@/lib/qr";
import { canAddGuests } from "@/lib/plans";
import { logAudit } from "@/lib/audit";

/**
 * Accepts a CSV file (columns: name, phone, email) as multipart/form-data
 * under the field "file". Excel .xlsx files should be exported/saved as
 * CSV first — this keeps the import path simple and avoids parsing a
 * binary spreadsheet format server-side.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const event = await prisma.event.findFirst({ where: { id: params.id, userId: user.id } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No CSV file was uploaded." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
  }

  const text = await file.text();
  const parsedCsv = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase()
  });

  if (parsedCsv.errors.length > 0) {
    return NextResponse.json({ error: "Could not parse CSV file.", details: parsedCsv.errors.slice(0, 5) }, { status: 400 });
  }

  const rows = parsedCsv.data;
  const errors: { row: number; message: string }[] = [];
  const seenPhones = new Set<string>();
  const validRows: { name: string; phone: string; email?: string }[] = [];

  rows.forEach((row, idx) => {
    const candidate = {
      name: (row.name || "").trim(),
      phone: (row.phone || row["phone number"] || "").trim(),
      email: (row.email || "").trim()
    };
    const parsed = guestSchema.safeParse(candidate);
    if (!parsed.success) {
      errors.push({ row: idx + 2, message: parsed.error.issues[0]?.message || "Invalid row" });
      return;
    }
    if (seenPhones.has(parsed.data.phone)) {
      errors.push({ row: idx + 2, message: `Duplicate phone number in file: ${parsed.data.phone}` });
      return;
    }
    seenPhones.add(parsed.data.phone);
    validRows.push(parsed.data);
  });

  if (validRows.length === 0) {
    return NextResponse.json({ error: "No valid guest rows found.", rowErrors: errors }, { status: 400 });
  }

  const allowed = await canAddGuests(user.id, validRows.length);
  if (!allowed) {
    return NextResponse.json(
      { error: `Importing ${validRows.length} guests would exceed your plan's guest limit. Upgrade or buy a top-up first.` },
      { status: 403 }
    );
  }

  // Skip guests whose phone number is already on this event's list
  const existingPhones = new Set(
    (await prisma.guest.findMany({ where: { eventId: event.id }, select: { phone: true } })).map((g) => g.phone)
  );

  const toCreate = validRows.filter((r) => !existingPhones.has(r.phone));
  const skippedExisting = validRows.length - toCreate.length;

  const created = await prisma.$transaction(
    toCreate.map((r) => {
      const { qrToken, secretHash } = createGuestToken(event.id);
      return prisma.guest.create({
        data: {
          eventId: event.id,
          name: sanitizeText(r.name),
          phone: r.phone,
          email: r.email || null,
          qrToken,
          secretHash
        }
      });
    })
  );

  await logAudit({
    userId: user.id,
    action: "GUESTS_IMPORTED",
    entityType: "Event",
    entityId: event.id,
    metadata: { imported: created.length, skippedExisting, rowErrors: errors.length }
  });

  return NextResponse.json({
    imported: created.length,
    skippedExisting,
    rowErrors: errors
  });
}
