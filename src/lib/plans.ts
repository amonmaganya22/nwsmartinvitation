import { prisma } from "./prisma";

export const PLAN_DEFAULTS = {
  FREE: { events: 1, guestsPerAccount: 20, premiumTemplates: false },
  BASIC: { events: 5, guestsPerAccount: 200, premiumTemplates: false },
  PREMIUM: { events: Infinity, guestsPerAccount: Infinity, premiumTemplates: true }
} as const;

async function getSettingNumber(key: string, fallback: number) {
  const row = await prisma.setting.findUnique({ where: { key } });
  const n = row ? Number(row.value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function getEventLimit(plan: keyof typeof PLAN_DEFAULTS) {
  if (plan === "FREE") return getSettingNumber("free_plan_event_limit", PLAN_DEFAULTS.FREE.events);
  if (plan === "BASIC") return getSettingNumber("basic_plan_event_limit", PLAN_DEFAULTS.BASIC.events);
  return Infinity;
}

export async function getGuestLimit(plan: keyof typeof PLAN_DEFAULTS, extraPurchased: number) {
  if (plan === "PREMIUM") return Infinity;
  const base =
    plan === "FREE"
      ? await getSettingNumber("free_plan_guest_limit", PLAN_DEFAULTS.FREE.guestsPerAccount)
      : await getSettingNumber("basic_plan_guest_limit", PLAN_DEFAULTS.BASIC.guestsPerAccount);
  return base + extraPurchased;
}

export async function canCreateEvent(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const limit = await getEventLimit(user.plan);
  const count = await prisma.event.count({ where: { userId } });
  return count < limit;
}

export async function canAddGuests(userId: string, countToAdd: number) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const limit = await getGuestLimit(user.plan, user.guestQuotaExtra);
  const events = await prisma.event.findMany({ where: { userId }, select: { id: true } });
  const currentTotal = await prisma.guest.count({ where: { eventId: { in: events.map((e) => e.id) } } });
  return currentTotal + countToAdd <= limit;
}

export function isPremiumTemplateAllowed(plan: "FREE" | "BASIC" | "PREMIUM") {
  return PLAN_DEFAULTS[plan].premiumTemplates;
}
