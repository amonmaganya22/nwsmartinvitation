import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminPaymentsPanel } from "@/components/dashboard/AdminPaymentsPanel";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true, email: true, plan: true } } }
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Admin · Payments</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Confirm mobile money payments to unlock plans and guest top-ups.</p>
      <div className="mt-6">
        <AdminPaymentsPanel initialPayments={payments as any} />
      </div>
    </div>
  );
}
