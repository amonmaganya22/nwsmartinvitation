"use client";

import React, { useState } from "react";
import { Trash2, FileText, CheckCircle2, XCircle, Search, UserPlus, Download } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  qrToken?: string;
}

interface GuestManagerProps {
  initialGuests: Guest[];
  eventId: string;
  event?: {
    name?: string;
    date?: string;
    location?: string;
    time?: string;
  };
}

export default function GuestManager({ initialGuests, eventId, event }: GuestManagerProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuestForCard, setSelectedGuestForCard] = useState<Guest | null>(null);

  const [template, setTemplate] = useState<"royal" | "neon" | "minimal">("neon");
  const [customTitle, setCustomTitle] = useState("VIP INVITATION PASS");
  const [cardHeading, setCardHeading] = useState(event?.name || "Jina la Tukio");
  const [cardTime, setCardTime] = useState(event?.time || "14:00");
  const [cardLocation, setCardLocation] = useState(event?.location || "Eneo linatajwa");

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          email: newEmail,
        }),
      });

      if (res.ok) {
        const createdGuest = await res.json();
        setGuests([createdGuest, ...guests]);
        setSelectedGuestForCard(createdGuest);
        setNewName("");
        setNewPhone("");
        setNewEmail("");
      }
    } catch (error) {
      console.error("Hitilafu wakati wa kuongeza mgeni:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Je, una uhakika unataka kufuta mgeni huyu?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}/guests?guestId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setGuests(guests.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error("Hitilafu wakati wa kufuta:", error);
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement("a");
      link.download = `kadi-${selectedGuestForCard?.name ? selectedGuestForCard.name.replace(/\s+/g, "-") : "mgeni"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Hitilafu ya kudownload picha:", err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = 90; 
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const x = (210 - pdfWidth) / 2;
      const y = 30;

      pdf.addImage(dataUrl, "PNG", x, y, pdfWidth, pdfHeight);
      pdf.save(`kadi-${selectedGuestForCard?.name ? selectedGuestForCard.name.replace(/\s+/g, "-") : "mgeni"}.pdf`);
    } catch (err) {
      console.error("Hitilafu ya kudownload PDF:", err);
    }
  };

  const getTemplateStyles = (tmpl: string) => {
    switch (tmpl) {
      case "royal":
        return "bg-gradient-to-br from-amber-950 via-gray-900 to-black border-amber-500/50 text-amber-100";
      case "minimal":
        return "bg-white text-gray-900 border-gray-300";
      case "neon":
      default:
        return "bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 border-indigo-500/50 text-indigo-100";
    }
  };

  const filteredGuests = guests.filter((g) => {
    if (!g || !g.name) return false;
    return g.name.toLowerCase().includes((searchTerm || "").toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Ongeza Mgeni Mpya & Hariri Kadi</h3>
          </div>

          <form onSubmit={handleAddGuest} className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Jina Kamili la Mgeni *</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Mf. Juma Kassim" 
                required
                className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Namba ya Simu</label>
              <input 
                type="text" 
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Mf. 0712345678" 
                className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Kichwa cha Juu (Title)</label>
                <input 
                  type="text" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Jina la Tukio</label>
                <input 
                  type="text" 
                  value={cardHeading}
                  onChange={(e) => setCardHeading(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Saa / Muda</label>
                <input 
                  type="text" 
                  value={cardTime}
                  onChange={(e) => setCardTime(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Mahali / Eneo</label>
                <input 
                  type="text" 
                  value={cardLocation}
                  onChange={(e) => setCardLocation(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Chagua Mtindo wa Kadi (Template)</label>
              <div className="grid grid-cols-3 gap-2">
                {(["royal", "neon", "minimal"] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`py-1.5 rounded-xl text-xs font-semibold capitalize border transition ${
                      template === t 
                        ? "bg-indigo-600 text-white border-indigo-400" 
                        : "bg-black text-gray-400 border-gray-800 hover:bg-gray-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? "Inahifadhi..." : "Hifadhi Mgeni & Tengeneza Kadi"}
            </button>
          </form>
        </div>

        {/* Hakiki ya Kadi (Live Preview) */}
        <div className="bg-black/40 border border-gray-800/80 p-4 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Muonekano wa Kadi (Live Preview)</span>
          
          <div className={`w-full max-w-[260px] p-5 rounded-3xl border shadow-xl space-y-3 text-center relative ${getTemplateStyles(template)}`}>
            <div className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-white/10 border border-white/20">
              {customTitle}
            </div>

            <div className="space-y-0.5">
              <h4 className="text-sm font-extrabold tracking-wide">{cardHeading}</h4>
              <p className="text-[10px] opacity-80">{cardTime} | {cardLocation}</p>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl space-y-0.5">
              <p className="text-[9px] uppercase tracking-wider opacity-70">Mgeni Mwalikwa</p>
              <h5 className="text-xs font-bold">{newName || "Jina la Mgeni"}</h5>
              <p className="text-[10px] opacity-90">{newPhone || "07XXXXXXXX"}</p>
            </div>

            <div className="bg-white p-2 rounded-xl inline-block shadow-inner">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=VERIFY_CHECKIN_PREVIEW" 
                alt="QR Code" 
                className="w-20 h-20 mx-auto object-contain"
              />
            </div>
            <p className="text-[8px] opacity-70">Wasilisha kadi hii langoni</p>
          </div>
        </div>
      </div>

      {/* Orodha ya Wageni */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tafuta mgeni kwa jina kwenye orodha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-xs w-full focus:outline-none"
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-800">
            {filteredGuests.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-500">Hakuna wageni waliopatikana.</p>
            ) : (
              filteredGuests.map((guest) => (
                <div key={guest.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white">{guest.name}</h4>
                    <p className="text-xs text-gray-400">{guest.phone || guest.email || "Hana mawasiliano"}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                      guest.status === "CHECKED_IN" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50" : "bg-gray-800 text-gray-400"
                    }`}>
                      {guest.status === "CHECKED_IN" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {guest.status === "CHECKED_IN" ? "VERIFIED" : guest.status}
                    </span>

                    <button
                      onClick={() => setSelectedGuestForCard(guest)}
                      className="p-2 bg-gray-800 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-400 rounded-lg transition"
                      title="Tazama/Download Kadi"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="p-2 bg-gray-800 hover:bg-red-600/20 text-gray-300 hover:text-red-400 rounded-lg transition"
                      title="Futa Mgeni"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal ya Kadi ya Mgeni (QR Code imerekebishwa kutumia mfumo mpya wa /api/guest/id/[id]) */}
      {selectedGuestForCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-sm w-full p-6 relative space-y-4">
            <button
              onClick={() => setSelectedGuestForCard(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xs font-bold bg-gray-800 px-2.5 py-1 rounded-lg"
            >
              Funga X
            </button>
            <h3 className="text-sm font-bold text-white mb-2">Kadi ya Mgeni</h3>
            
            <div className="flex justify-center">
              <div 
                ref={cardRef}
                className={`w-full max-w-xs p-6 rounded-3xl border shadow-2xl space-y-4 text-center relative ${getTemplateStyles(template)}`}
              >
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 border border-white/20">
                  {customTitle}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold tracking-wide">{cardHeading}</h3>
                  <p className="text-[11px] opacity-80">{cardTime} | {cardLocation}</p>
                </div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl space-y-1">
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Mgeni Mwalikwa</p>
                  <h4 className="text-sm font-bold">{selectedGuestForCard.name}</h4>
                  <p className="text-xs opacity-90">{selectedGuestForCard.phone || "Hana namba"}</p>
                </div>
                <div className="bg-white p-2.5 rounded-2xl inline-block shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      typeof window !== "undefined" ? `${window.location.origin}/api/guest/id/${selectedGuestForCard.id}` : ``
                    )}`} 
                    alt="QR Code" 
                    className="w-24 h-24 mx-auto object-contain"
                  />
                </div>
                <p className="text-[9px] opacity-70">Wasilisha kadi hii langoni wakati wa kuingia</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadCard}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/30"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}