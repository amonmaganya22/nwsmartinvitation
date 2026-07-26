"use client";

import { Lock, Check } from "lucide-react";
import clsx from "clsx";
import type { CardLayout } from "@/templates/EventCard";

export type TemplateOption = {
  id: string;
  key: string;
  name: string;
  category: string;
  isPremium: boolean;
  previewColor: string;
  locked: boolean;
  layout: CardLayout;
};

export function TemplatePicker({
  templates,
  loading,
  value,
  onChange
}: {
  templates: TemplateOption[];
  loading: boolean;
  value: string | null;
  onChange: (id: string) => void;
}) {
  if (loading) return <p className="text-sm text-gray-400">Loading templates…</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {templates.map((t) => {
        const selected = value === t.id;
        return (
          <button
            type="button"
            key={t.id}
            disabled={t.locked}
            onClick={() => onChange(t.id)}
            className={clsx(
              "relative flex flex-col items-start rounded-xl border p-4 text-left transition",
              selected ? "border-brand-green ring-2 ring-brand-green" : "border-gray-200 dark:border-gray-700",
              t.locked ? "opacity-50 cursor-not-allowed" : "hover:border-brand-green"
            )}
          >
            <span className="h-8 w-8 rounded-full" style={{ background: t.previewColor }} />
            <span className="mt-3 text-sm font-medium text-brand-dark dark:text-white">{t.name}</span>
            {t.isPremium && <span className="mt-1 text-[10px] uppercase tracking-wide text-brand-gold">Premium</span>}
            {selected && <Check size={16} className="absolute top-3 right-3 text-brand-green" />}
            {t.locked && <Lock size={14} className="absolute top-3 right-3 text-gray-400" />}
          </button>
        );
      })}
    </div>
  );
}
