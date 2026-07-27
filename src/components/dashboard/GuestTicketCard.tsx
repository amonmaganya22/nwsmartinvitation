"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, ArrowLeft } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  qrToken?: string;
}

interface GuestTicketCardProps {
  guest: Guest;
  event: {
    name?: string;
    date?: string;
    location?: string;
  };
  onClose?: () => void;
}

export default function GuestTicketCard({ guest, event, onClose }: GuestTicketCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<"royal" | "neon" | "minimal">("neon");
  const [customTitle, setCustomTitle] = useState("VIP INVITATION PASS");
  const [customSubtitle, setCustomSubtitle] = useState("KARIBU SANA KWENYE HII HAFENI");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement("a");
      link.download = `kadi-${guest.name.replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Hitilafu ya kudownload picha:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getTemplateStyles = () => {
    switch (template) {
      case "royal":
        return "bg-gradient-to-br from-amber-950 via-gray-900 to-black border-amber-500/50 text-amber-100";
      case "minimal":
        return "bg-white text-gray-900 border-gray-300";
      case "neon":
      default:
        return "bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 border-indigo-500/50 text-indigo-100";
    }
  };

  return (
    <div className="space-y-4 max-h-[85vh] overflow-y-auto px-1">
      {/* Vifaa vya Kubinafsisha (Customization Controls) */}
      <div className="bg-gray-950/80 border border-gray-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-400">Badilisha Muundo na Maneno</span>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-gray-800 px-2.5 py-1 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Rudi / Funga
            </button>
          )}
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Kichwa cha Juu (Title)</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Ujumbe Mfupi (Subtitle)</label>
          <input
            type="text"
            value={customSubtitle}
            onChange={(e) => setCustomSubtitle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Chagua Aina ya Template</label>
          <div className="grid grid-cols-3 gap-2">
            {(["royal", "neon", "minimal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`py-1.5 rounded-xl text-xs font-semibold capitalize border transition ${
                  template === t 
                    ? "bg-indigo-600 text-white border-indigo-400" 
                    : "bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sehemu ya Kadi Inayodownloadwa (Ref) */}
      <div className="flex justify-center">
        <div 
          ref={cardRef}
          className={`w-full max-w-xs p-6 rounded-3xl border shadow-2xl space-y-4 text-center relative ${getTemplateStyles()}`}
        >
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 border border-white/20">
            {customTitle}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold tracking-wide">{event.name || "Hafla Maalum"}</h3>
            <p className="text-[11px] opacity-80">{event.date || "Tarehe haijapangwa"} | {event.location || "Eneo linatajwa"}</p>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase tracking-wider opacity-70">Mgeni Mwalikwa</p>
            <h4 className="text-sm font-bold">{guest.name}</h4>
            <p className="text-xs opacity-90">{guest.phone || guest.email || "Hana namba"}</p>
            <p className="text-[10px] italic opacity-75 mt-1">{customSubtitle}</p>
          </div>

          <div className="bg-white p-3 rounded-2xl inline-block shadow-inner">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(guest.qrToken || guest.id)}`} 
              alt="QR Code" 
              className="w-24 h-24 mx-auto object-contain"
            />
          </div>

          <p className="text-[9px] opacity-70">Wasilisha kadi hii langoni wakati wa kuingia</p>
        </div>
      </div>

      {/* Kitufe cha Download */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {isDownloading ? "Inatengeneza Picha..." : "Download Kadi (PNG)"}
      </button>
    </div>
  );
}