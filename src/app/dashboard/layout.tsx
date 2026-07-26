import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1112]">
      <Sidebar user={user} />
      <div className="flex-1">
        <header className="flex items-center justify-end border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-800 dark:bg-[#111314]">
          <ThemeToggle />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
