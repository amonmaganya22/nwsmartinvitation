"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, Smartphone } from "lucide-react";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";
import { useCsrfBootstrap } from "@/lib/use-csrf-bootstrap";

type Settings = { payoutMobileNumber: string; payoutName: string; pricing: Record<string, number> };
type Payment = { id: string; planOrPack: string; amountTzs: number; status: "PENDING" | "CONFIRMED" | "REJECTED"; transactionReference: string; createdAt: string };

const planLabels: Record<string, string> = { BASIC: "Basic plan (30 days)", PREMIUM: "Premium plan (30 days)", TOPUP_50: "50-guest top-up" };

export default function BillingPage() {
  useCsrfBootstrap();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<"BASIC" | "PREMIUM" | "TOPUP_50">("TOPUP_50");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/billing/settings").then(setSettings);
    apiFetch("/api/billing/payments").then((d) => setPayments(d.payments));
  }, []);

  async function submitPurchase(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/billing/purchase", {
        method: "POST",
        body: JSON.stringify({ planOrPack: selected, transactionReference: reference })
      });
      setPayments([data.payment, ...payments]);
      setSuccess("Payment submitted. It'll be confirmed shortly once verified.");
      setReference("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusIcon = {
    PENDING: <Clock size={14} className="text-amber-500" />,
    CONFIRMED: <CheckCircle2 size={14} className="text-brand-green" />,
    REJECTED: <XCircle size={14} className="text-red-600" />
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Billing</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upgrade your plan or top up guest capacity via mobile money.</p>

      <div className="card-surface mt-6 p-6">
        <h3 className="font-semibold text-brand-dark dark:text-white">1. Choose what you're buying</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["TOPUP_50", "BASIC", "PREMIUM"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`rounded-xl border p-4 text-left transition ${selected === key ? "border-brand-green ring-2 ring-brand-green" : "border-gray-200 dark:border-gray-700"}`}
            >
              <p className="text-sm font-medium text-brand-dark dark:text-white">{planLabels[key]}</p>
              <p className="mt-1 text-lg font-semibold text-brand-dark dark:text-white">
                {settings ? settings.pricing[key].toLocaleString() : "…"} <span className="text-xs font-normal text-gray-400">TZS</span>
              </p>
            </button>
          ))}
        </div>

        {settings && (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-brand-green/5 p-4 text-sm">
            <Smartphone size={18} className="mt-0.5 text-brand-green" />
            <div>
              <p className="font-medium text-brand-dark dark:text-white">Pay via Mobile Money</p>
              <p className="text-gray-500 dark:text-gray-400">
                Send <span className="font-semibold">{settings.pricing[selected].toLocaleString()} TZS</span> to{" "}
                <span className="font-semibold">{settings.payoutMobileNumber}</span> ({settings.payoutName}), then enter the transaction reference below.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={submitPurchase} className="mt-5 space-y-3">
          <div>
            <Label htmlFor="reference">Transaction reference</Label>
            <Input id="reference" required value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. MP240726.1234.A12345" />
          </div>
          <FieldError>{error ?? undefined}</FieldError>
          {success && <p className="text-sm text-brand-green">{success}</p>}
          <Button type="submit" loading={loading}>Submit payment</Button>
        </form>
      </div>

      <div className="card-surface mt-6 p-0">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="font-semibold text-brand-dark dark:text-white">Payment history</h3>
        </div>
        {payments.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <div>
                  <p className="font-medium text-brand-dark dark:text-white">{planLabels[p.planOrPack] || p.planOrPack}</p>
                  <p className="text-xs text-gray-400">{p.transactionReference} · {p.amountTzs.toLocaleString()} TZS</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium">{statusIcon[p.status]} {p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
