import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { isPremiumTemplateAllowed } from "@/lib/plans";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const templates = await prisma.template.findMany({ orderBy: { name: "asc" } });
  const allowedPremium = isPremiumTemplateAllowed(auth.user.plan);

  return NextResponse.json({
    templates: templates.map((t) => ({
      id: t.id,
      key: t.key,
      name: t.name,
      category: t.category,
      isPremium: t.isPremium,
      previewColor: t.previewColor,
      layout: t.layoutJson,
      locked: t.isPremium && !allowedPremium
    }))
  });
}
