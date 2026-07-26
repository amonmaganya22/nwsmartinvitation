"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, CalendarDays, ScanLine, CreditCard, LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/api-client";
import type { SessionUser } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/scanner", label: "Scanner", icon: ScanLine },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard }
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-6 dark:border-gray-800 dark:bg-[#111314]">
      <div className="px-2"><Logo size={32} /></div>

      <nav className="mt-8 flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-green/10 text-brand-green"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
        {user.role === "ADMIN" && (
          <Link
            href="/dashboard/admin"
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              pathname?.startsWith("/dashboard/admin")
                ? "bg-brand-green/10 text-brand-green"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <ShieldCheck size={18} />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
        <p className="truncate px-3 text-sm font-medium text-brand-dark dark:text-white">{user.fullName}</p>
        <p className="truncate px-3 text-xs text-gray-400">{user.email} · {user.plan}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>
    </aside>
  );
}
