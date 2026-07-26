import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(9).max(15).optional(),
  password: z.string().min(8).max(72)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(72)
});

export const eventSchema = z.object({
  name: z.string().min(2).max(150),
  eventDate: z.string(), // ISO date string from <input type="date">
  eventTime: z.string(),
  venue: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  coverImageUrl: z.string().max(500).optional().or(z.literal("")),
  templateId: z.string().optional()
});

export const guestSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(9).max(15),
  email: z.string().email().optional().or(z.literal(""))
});

export const checkinSchema = z.object({
  payload: z.string().min(10)
});

export const purchaseSchema = z.object({
  planOrPack: z.enum(["BASIC", "PREMIUM", "TOPUP_50"]),
  transactionReference: z.string().min(4).max(64)
});

export function sanitizeText(value: string) {
  // strip anything that looks like HTML/script tags before it ever reaches the DB
  return value.replace(/<[^>]*>?/gm, "").trim();
}
