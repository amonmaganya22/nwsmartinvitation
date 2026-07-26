"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, FileText, Loader2, Edit3 } from "lucide-react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

interface GuestTicketCardProps {
  guestName: string;
  guestPhone?: string | null;
  qrToken: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  templateBgUrl?: string;
}

export function GuestTicketCard({
  guestName,
  guestPhone,
  qrToken,
  eventName = "Sherehe / Mkutano",
  eventDate,
  eventLocation,
  templateBgUrl,
}: GuestTicketCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // States za Maneno Yanayoweza Kubadilishwa (Customizable Fields)
  const [cardBadge, setCardBadge] = useState("KADI YA MWALIKO");
  const [customEventName, setCustomEventName] = useState(eventName);
  const [customSubtext, setCustomSubtext] = useState("Scan Mlangoni Kuikagua");
  const [customGuestTitle, setCustomGuestTitle] = useState("Mgeni Rasmi");
  const [isEditing, setIsEditing] = useState(false);

  const handleDownloadJpeg = async () => {
    if (!cardRef.current) return;
    setDownloadingImg(true);

    try {
      const dataUrl = await toJpeg(cardRef.current, { quality: 0.95, cacheBust: true });
      const link = document.createElement("a");
      link.download = `Kadi-${guestName.replace(/\s+/g, "_")}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Haikuweza kupakua picha.");
    } finally {
      setDownloadingImg(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setDownloadingPdf(true);

    try {
      const dataUrl = await toJpeg(cardRef.current, { quality: 0.95, cacheBust: true });
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [384, 480] });
      pdf.addImage(dataUrl, "JPEG", 0, 0, 384, 480);
      pdf.save(`Kadi-${guestName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Haikuweza kupakua PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleWhatsAppShare = () => {
    const inviteLink = `${window.location.origin}/invite/${qrToken}`;
    const textMessage = `Habari ${guestName}, ${cardBadge} wa ${customEventName} uko tayari! 🎉\n\nTazama kadi yako hapa: ${inviteLink}`;

    let formattedPhone = guestPhone ? guestPhone.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) formattedPhone = "255" + formattedPhone.slice(1);

    const whatsappUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(textMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* TOGGLE EDIT FORM */}
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="text-xs flex items-center gap-1.5 text-indigo-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition"
      >
        <Edit3 className="w-3.5 h-3.5" />
        {isEditing ? "Funga Marekebisho" : "Badilisha Maneno ya Kadi"}
      </button>

      {/* EDITING FORM */}
      {isEditing && (
        <div className="w-full max-w-sm bg-slate-900 p-3.5 rounded-2xl border border-white/10 text-xs space-y-2.5 text-left text-gray-200">
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Kichwa cha Juu (Badge)</label>
            <input
              type="text"
              value={cardBadge}
              onChange={(e) => setCardBadge(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Jina la Sherehe/Tukio</label>
            <input
              type="text"
              value={customEventName}
              onChange={(e) => setCustomEventName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Title ya Mgeni (Mf. Mgeni Rasmi / VIP)</label>
            <input
              type="text"
              value={customGuestTitle}
              onChange={(e) => setCustomGuestTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Maelezo ya Chini ya QR Code</label>
            <input
              type="text"
              value={customSubtext}
              onChange={(e) => setCustomSubtext(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
            />
          </div>
        </div>
      )}

      {/* CARD DISPLAY */}
      <div
        ref={cardRef}
        className="relative w-full max-w-sm h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between p-6 text-center text-white bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 shrink-0"
        style={
          templateBgUrl
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.85)), url(${templateBgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="space-y-1 mt-2">
          <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-widest text-amber-300 border border-white/20 shadow-sm">
            {cardBadge}
          </span>
          <h2 className="text-xl font-black tracking-wide drop-shadow-md pt-3">
            {customEventName}
          </h2>
          {eventDate && <p className="text-xs text-gray-200 font-light">{eventDate}</p>}
        </div>

        <div className="my-auto flex flex-col items-center justify-center">
          <div className="p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-white/30 backdrop-blur-sm">
            <QRCodeSVG value={qrToken} size={150} />
          </div>
          <p className="text-[10px] text-gray-300 mt-2.5 tracking-widest uppercase font-medium">
            {customSubtext}
          </p>
        </div>

        <div className="space-y-1 mb-1 bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg">
          <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
            {customGuestTitle}
          </p>
          <h3 className="text-lg font-bold text-white capitalize truncate">{guestName}</h3>
          {eventLocation && (
            <p className="text-[11px] text-gray-300 font-light truncate">📍 {eventLocation}</p>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm pt-1">
        <button
          onClick={handleDownloadJpeg}
          disabled={downloadingImg || downloadingPdf}
          className="flex items-center justify-center gap-1 bg-white text-gray-900 py-2.5 rounded-xl text-xs font-bold shadow transition active:scale-95 disabled:opacity-50"
        >
          {downloadingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-indigo-600" />}
          <span>JPEG</span>
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingImg || downloadingPdf}
          className="flex items-center justify-center gap-1 bg-rose-600 text-white py-2.5 rounded-xl text-xs font-bold shadow transition active:scale-95 disabled:opacity-50"
        >
          {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          <span>PDF</span>
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-1 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold shadow transition active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
}