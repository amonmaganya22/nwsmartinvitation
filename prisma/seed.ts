import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const templates = [
  { key: "wedding", name: "Wedding", category: "wedding", isPremium: false, previewColor: "#c98ba0",
    layoutJson: { bg: "#fff5f7", accent: "#c98ba0", font: "serif", border: "double", icon: "rings" } },
  { key: "birthday", name: "Birthday", category: "birthday", isPremium: false, previewColor: "#f2b84b",
    layoutJson: { bg: "#fffaf0", accent: "#f2b84b", font: "sans", border: "confetti", icon: "balloon" } },
  { key: "conference", name: "Conference", category: "corporate", isPremium: false, previewColor: "#2f6fed",
    layoutJson: { bg: "#f4f8ff", accent: "#2f6fed", font: "sans", border: "solid", icon: "mic" } },
  { key: "church", name: "Church", category: "church", isPremium: false, previewColor: "#8b5e3c",
    layoutJson: { bg: "#fbf6ee", accent: "#8b5e3c", font: "serif", border: "ornate", icon: "cross" } },
  { key: "vip", name: "VIP", category: "vip", isPremium: true, previewColor: "#111111",
    layoutJson: { bg: "#0e0e0e", accent: "#c9a227", font: "serif", border: "gold-line", icon: "star" } },
  { key: "corporate", name: "Corporate", category: "corporate", isPremium: false, previewColor: "#1c1f22",
    layoutJson: { bg: "#ffffff", accent: "#1c1f22", font: "sans", border: "minimal", icon: "briefcase" } },
  { key: "graduation", name: "Graduation", category: "graduation", isPremium: false, previewColor: "#2e4a34",
    layoutJson: { bg: "#f2f7f3", accent: "#2e4a34", font: "serif", border: "solid", icon: "cap" } },
  { key: "modern-minimal", name: "Modern Minimal", category: "minimal", isPremium: false, previewColor: "#4c9a2a",
    layoutJson: { bg: "#ffffff", accent: "#4c9a2a", font: "sans", border: "none", icon: "dot" } },
  { key: "luxury-gold", name: "Luxury Gold", category: "luxury", isPremium: true, previewColor: "#c9a227",
    layoutJson: { bg: "#141414", accent: "#c9a227", font: "serif", border: "gold-frame", icon: "diamond" } }
];

async function main() {
  console.log("Seeding templates...");
  for (const t of templates) {
    await prisma.template.upsert({
      where: { key: t.key },
      update: t,
      create: t
    });
  }

  console.log("Seeding default settings (payout config, pricing)...");
  const defaultSettings: Record<string, string> = {
    payout_mobile_number: process.env.DEFAULT_PAYOUT_MOBILE_NUMBER || "0768940971",
    payout_name: process.env.DEFAULT_PAYOUT_NAME || "Amon Maganya",
    price_per_50_guests_tzs: process.env.DEFAULT_PRICE_PER_50_GUESTS_TZS || "25000",
    price_basic_tzs: "15000",
    price_premium_tzs: "45000",
    free_plan_event_limit: "1",
    free_plan_guest_limit: "20",
    basic_plan_event_limit: "5",
    basic_plan_guest_limit: "200"
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  console.log("Seeding demo admin + owner accounts...");
  const adminPass = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@nwsmartinvitation.com" },
    update: {},
    create: {
      fullName: "NWSmartInvitation Admin",
      email: "admin@nwsmartinvitation.com",
      passwordHash: adminPass,
      role: "ADMIN",
      plan: "PREMIUM"
    }
  });

  const ownerPass = await bcrypt.hash("Owner@12345", 10);
  await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      fullName: "Demo Organizer",
      email: "owner@example.com",
      passwordHash: ownerPass,
      role: "OWNER",
      plan: "FREE"
    }
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
