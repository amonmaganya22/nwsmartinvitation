import { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: LucideIcon; accent?: string }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <Icon size={18} style={{ color: accent || "#4c9a2a" }} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-brand-dark dark:text-white">{value}</p>
    </div>
  );
}
