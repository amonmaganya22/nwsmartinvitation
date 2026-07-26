"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";
import { useCsrfBootstrap } from "@/lib/use-csrf-bootstrap";

type Payment = {
  id: string;
  planOrPack: string;
  amountTzs: number;
  transactionReference: string;
  mobileMoneyNumber: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  createdAt: string;
  user: { fullName: string; email: string; plan: string };
};

export function AdminPaymentsPanel({ initialPayments }: { initialPayments: Payment[] }) {
  useCsrfBootstrap();
  const [payments, setPayments] = useState(initialPayments);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(id: string, action: "confirm" | "reject") {
    setBusyId(id);
    try {
      const data = await apiFetch(`/api/admin/payments/${id}`, { method: "POST", body: JSON.stringify({ action }) });
      setPayments(payments.map((p) => (p.id === id ? { ...p, status: data.payment.status } : p)));
    } finally {
      setBusyId(null);
    }
  }

  const pending = payments.filter((p) => p.status === "PENDING");
  const resolved = payments.filter((p) => p.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div className="card-surface p-0">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="font-semibold text-brand-dark dark:text-white">Pending payments ({pending.length})</h3>
        </div>
        {pending.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Nothing waiting on confirmation.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-brand-dark dark:text-white">{p.user.fullName} · {p.user.email}</p>
                  <p className="text-xs text-gray-400">{p.planOrPack} · {p.amountTzs.toLocaleString()} TZS · ref: {p.transactionReference} → {p.mobileMoneyNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Button loading={busyId === p.id} onClick={() => act(p.id, "confirm")}><CheckCircle2 size={16} /> Confirm</Button>
                  <Button variant="danger" loading={busyId === p.id} onClick={() => act(p.id, "reject")}><XCircle size={16} /> Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-surface p-0">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="font-semibold text-brand-dark dark:text-white">History</h3>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {resolved.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
              <span>{p.user.fullName} · {p.planOrPack} · {p.amountTzs.toLocaleString()} TZS</span>
              <span className={p.status === "CONFIRMED" ? "text-brand-green" : "text-red-600"}>{p.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
