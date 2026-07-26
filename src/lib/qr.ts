import crypto from "crypto";
import QRCode from "qrcode";
import { nanoid } from "nanoid";

const QR_SECRET = process.env.QR_SIGNING_SECRET || "dev-qr-secret";

/**
 * Generates a new public token (goes inside the QR image) and its
 * matching secret hash (stored in the DB, never exposed to the client).
 * The QR payload embeds both the token and the signature so the scanner
 * can reject anything that wasn't issued by this server, even before
 * hitting the database.
 */
export function createGuestToken(eventId: string) {
  const qrToken = nanoid(24);
  const secretHash = signPayload(qrToken, eventId);
  return { qrToken, secretHash };
}

function signPayload(qrToken: string, eventId: string) {
  return crypto.createHmac("sha256", QR_SECRET).update(`${qrToken}:${eventId}`).digest("hex");
}

/** Verifies that a scanned signature matches what we would have issued for this token+event. */
export function verifySignature(qrToken: string, eventId: string, signature: string) {
  const expected = signPayload(qrToken, eventId);
  // timing-safe compare to avoid leaking info via response-time side channel
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** The actual string encoded into the QR image: token + eventId + signature, base64url packed. */
export function packQrPayload(qrToken: string, eventId: string, secretHash: string) {
  const raw = JSON.stringify({ t: qrToken, e: eventId, s: secretHash });
  return Buffer.from(raw).toString("base64url");
}

export function unpackQrPayload(packed: string): { t: string; e: string; s: string } | null {
  try {
    const raw = Buffer.from(packed, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (typeof parsed.t === "string" && typeof parsed.e === "string" && typeof parsed.s === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Renders the packed payload as a PNG data URL for display/printing on the card. */
export async function renderQrDataUrl(packed: string) {
  return QRCode.toDataURL(packed, { errorCorrectionLevel: "H", margin: 1, width: 320 });
}
