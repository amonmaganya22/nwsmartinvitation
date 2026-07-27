"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Sparkles, LayoutTemplate } from "lucide-react";
import { toPng } from "html-to-image";

interface GuestTicketCardProps {
  guest: {
    name: string;
    phone?: string | null;
    qrToken?: string | null;
  };
  event: {
    name?: string;
    date?: string;
    location?: string;
  };
}

export default function GuestTicketCard({ guest, event }: GuestTicketCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // State za Customization ya Maneno na Aina ya Template
  const [customTitle, setCustomTitle] = useState("VIP INVITATION PASS");
  const [customSubtitle, setCustomSubtitle] = useState("KARIBU SANA KWENYE HII HAFENI");
  const [cardTemplate, setCardTemplate] = useState<"royal" | "neon" | "minimal">("royal");

  // Kazi ya Kudownload Kadi
  const handleDownload = async () => {
    if (cardRef.current) {
      setDownloading(true);
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
        const link = document.createElement("a");
        link.download = `${guest.name.replace(/\s+/g, "_")}_ticket.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Imeshindwa kudownload kadi:", err);
        alert("Kuna hitilafu imetokea wakati wa kudownload.");
      } finally {
        setDownloading(false);
      }
    }
  };

  // Miundo mbalimbali ya Templates
  const templateStyles = {
    royal: "bg-gradient-to-br from-amber-950 via-gray-900 to-amber-900 text-amber-100 border-amber-500/40 shadow-amber-900/20",
    neon: "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-indigo-100 border-indigo-500/40 shadow-indigo-900/20",
    minimal: "bg-gradient-to-br from-gray-900 to-gray-950 text-white border-gray-700 shadow-xl",
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* VIDHIBITI VYA CUSTOMIZATION (Templates & Text) */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-xs space-y-3 text-white">
        <div className="flex items-center gap-1.5 font-bold text-indigo-400">
          <Sparkles className="w-4 h-4" /> Badilisha Muundo na Maneno ya Kadi
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-gray-400">Kichwa cha Juu (Title)</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-gray-400">Ujumbe Mfupi (Subtitle)</label>
          <input
            type="text"
            value={customSubtitle}
            onChange={(e) => setCustomSubtitle(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 flex items-center gap-1">
            <LayoutTemplate className="w-3 h-3" /> Chagua Aina ya Template
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCardTemplate("royal")}
              className={`py-1.5 rounded-lg font-semibold transition ${cardTemplate === "royal" ? "bg-amber-600 text-white" : "bg-gray-950 text-gray-400 border border-gray-800"}`}
            >
              Royal
            </button>
            <button
              onClick={() => setCardTemplate("neon")}
              className={`py-1.5 rounded-lg font-semibold transition ${cardTemplate === "neon" ? "bg-indigo-600 text-white" : "bg-gray-950 text-gray-400 border border-gray-800"}`}
            >
              Neon
            </button>
            <button
              onClick={() => setCardTemplate("minimal")}
              className={`py-1.5 rounded-lg font-semibold transition ${cardTemplate === "minimal" ? "bg-gray-700 text-white" : "bg-gray-950 text-gray-400 border border-gray-800"}`}
            >
              Minimal
            </button>
          </div>
        </div>
      </div>

      {/* KADI INAYOTENGENEZWA (TICKET PREVIEW & GENERATOR) */}
      <div
        ref={cardRef}
        className={`relative w-full rounded-3xl p-6 border flex flex-col items-center text-center shadow-2xl overflow-hidden ${templateStyles[cardTemplate]}`}
      >
        <span className="text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-3 border border-white/10">
          {customTitle}
        </span>

        <div className="space-y-1 mb-3">
          <h2 className="text-base font-bold tracking-wide">{event.name || "Hafla Maalum"}</h2>
          <p className="text-[11px] opacity-75">{event.date || "Tarehe haijapangwa"} | {event.location || "Eneo linatajwa"}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md w-full py-3 px-4 rounded-2xl mb-4 border border-white/10 space-y-0.5">
          <p className="text-[9px] uppercase tracking-wider opacity-60">Mgeni Mwalikwa</p>
          <h3 className="text-sm font-extrabold tracking-wide">{guest.name}</h3>
          {guest.phone && <p className="text-[10px] opacity-75">{guest.phone}</p>}
          <p className="text-[9px] italic opacity-60 pt-1">{customSubtitle}</p>
        </div>

        {/* QR Code ya Mgeni */}
        {guest.qrToken ? (
          <div className="bg-white p-2.5 rounded-2xl shadow-inner mb-2">
            <QRCodeSVG value={guest.qrToken} size={100} />
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-xs opacity-50">QR Code haipatikani</div>
        )}

        <p className="text-[9px] opacity-50 tracking-tighter">Wasilisha kadi hii langoni wakati wa kuingia</p>
      </div>

      {/* Kitufe cha Kudownload Kadi */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-xs transition shadow-lg disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {downloading ? "Inatengeneza Picha..." : "Download Kadi (PNG)"}
      </button>
    </div>
  );
}