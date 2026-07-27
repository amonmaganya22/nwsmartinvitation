"use client";

import { useState, use } from "react";
import { CheckCircle2, XCircle, UserCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

interface GuestData {
  id: string;
  name: string;
  phone?: string;
  status: string;
}

export default function EventScanPage({ params }: PageProps) {
  const { eventId } = use(params);
  
  const [guestIdInput, setGuestIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Kazi ya Kutafuta Mgeni kabla ya kumuingiza
  const handleLookupGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestIdInput.trim()) return;

    setLoading(true);
    setMessage(null);
    setGuest(null);

    try {
      const res = await fetch(`/api/events/${eventId}/check-in?guestId=${guestIdInput.trim()}`);
      const data = await res.json();

      if (res.ok && data.guest) {
        setGuest(data.guest);
        if (data.guest.status === "CHECKED_IN") {
          setMessage({ type: "error", text: `Onyo! Mgeni huyu tayari ameshawahi kuingia ukumbini.` });
        } else {
          setMessage({ type: "success", text: "Mgeni amepatikana. Yuko tayari kuhakikiwa." });
        }
      } else {
        setMessage({ type: "error", text: data.message || "Mgeni hapatikani kwenye mfumo." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Hitilafu ya mtandao." });
    } finally {
      setLoading(false);
    }
  };

  // 2. Kazi ya kubonyeza kitufe cha kumruhusu kuingia (Mark as Checked In)
  const handleConfirmCheckIn = async () => {
    if (!guest) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGuest({ ...guest, status: "CHECKED_IN" });
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.message || "Imeshindikana kufanya check-in." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Hitilafu ya kimfumo wakati wa kuhifadhi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        
        {/* Kichwa & Kurudi */}
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/events/${eventId}`} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Mlango / Check-in Scanner</h1>
          <div className="w-8" />
        </div>

        {/* Fomu ya kuweka/kuscan Guest ID */}
        <form onSubmit={handleLookupGuest} className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Weka au Scan Guest ID (QR Link)</label>
            <input
              type="text"
              value={guestIdInput}
              onChange={(e) => setGuestIdInput(e.target.value)}
              placeholder="Bandika Guest ID hapa..."
              className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? "Inatafuta..." : "Tafuta Mgeni"}
          </button>
        </form>

        {/* Ujumbe wa Hali (Status Message) */}
        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === "success" 
              ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300" 
              : "bg-red-950/60 border-red-800/50 text-red-300"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Taarifa za Mgeni aliyepatikana & Kitendo cha Kumpa Marked In */}
        {guest && (
          <div className="bg-black/50 border border-gray-800 rounded-2xl p-4 space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-gray-500">Jina la Mgeni Mwalikwa</span>
              <h3 className="text-base font-extrabold text-white">{guest.name}</h3>
              <p className="text-xs text-gray-400">{guest.phone || "Hana namba ya simu"}</p>
            </div>

            <div className="pt-2">
              {guest.status === "CHECKED_IN" ? (
                <div className="w-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Mgeni Ameshathibitishwa (Checked In)
                </div>
              ) : (
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" /> Mark as Checked In ( Ruhusu Aingie )
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}