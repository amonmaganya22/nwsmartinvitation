"use client";

import { useRef, useState } from "react";
import { UserPlus, Upload, Trash2, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch, getCsrfToken } from "@/lib/api-client";
import { useCsrfBootstrap } from "@/lib/use-csrf-bootstrap";

type Guest = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: "UNUSED" | "USED";
  qrToken: string;
};

export function GuestManager({ eventId, initialGuests }: { eventId: string; initialGuests: Guest[] }) {
  useCsrfBootstrap();
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAdding(true);
    try {
      const data = await apiFetch(`/api/events/${eventId}/guests`, { method: "POST", body: JSON.stringify(form) });
      setGuests([data.guest, ...guests]);
      setForm({ name: "", phone: "", email: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function deleteGuest(id: string) {
    await apiFetch(`/api/guests/${id}`, { method: "DELETE" });
    setGuests(guests.filter((g) => g.id !== id));
  }

  async function importCsv(file: File) {
    setImporting(true);
    setImportSummary(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const csrf = getCsrfToken();
      const res = await fetch(`/api/events/${eventId}/guests/import`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: csrf ? { "x-csrf-token": csrf } : undefined
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");
      setImportSummary(
        `Imported ${data.imported} guest(s).${data.skippedExisting ? ` Skipped ${data.skippedExisting} duplicate phone number(s).` : ""}${data.rowErrors?.length ? ` ${data.rowErrors.length} row(s) had errors.` : ""}`
      );
      // Refresh guest list
      const refreshed = await apiFetch(`/api/events/${eventId}/guests`);
      setGuests(refreshed.guests);
    } catch (err: any) {
      setImportSummary(err.message);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-surface p-6">
        <h3 className="font-semibold text-brand-dark dark:text-white">Add a guest</h3>
        <form onSubmit={addGuest} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="sm:col-span-3 flex items-center gap-3">
            <Button type="submit" loading={adding}><UserPlus size={16} /> Add guest</Button>
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} loading={importing}>
              <Upload size={16} /> Import CSV
            </Button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
          </div>
        </form>
        <FieldError>{error ?? undefined}</FieldError>
        {importSummary && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{importSummary}</p>}
        <p className="mt-2 text-xs text-gray-400">CSV columns: name, phone, email (optional). First row must be headers.</p>
      </div>

      <div className="card-surface p-0">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="font-semibold text-brand-dark dark:text-white">Guest list ({guests.length})</h3>
        </div>
        {guests.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No guests yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {guests.map((g) => (
              <li key={g.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-brand-dark dark:text-white">{g.name}</p>
                  <p className="text-xs text-gray-400">{g.phone}{g.email ? ` · ${g.email}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-xs font-medium ${g.status === "USED" ? "text-brand-green" : "text-amber-500"}`}>
                    {g.status === "USED" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {g.status === "USED" ? "Checked in" : "Pending"}
                  </span>
                  <a href={`/invite/${g.qrToken}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-green" title="View invitation">
                    <ExternalLink size={16} />
                  </a>
                  <button onClick={() => deleteGuest(g.id)} className="text-gray-400 hover:text-red-600" title="Remove guest">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
