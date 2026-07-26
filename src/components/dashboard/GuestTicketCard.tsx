"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, FileText, Loader2 } from "lucide-react";
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

  // 1. Download Card as JPEG Image
  const handleDownloadJpeg = async () => {
    if (!cardRef.current) return;
    setDownloadingImg(true);

    try {
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `Kadi-${guestName.replace(/\s+/g, "_")}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating card image:", err);
      alert("Haikuweza kupakua picha. Jaribu tena!");
    } finally {
      setDownloadingImg(false);
    }
  };

  // 2. Download Card as PDF
  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setDownloadingPdf(true);

    try {
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        cacheBust: true,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [384, 480], // vipimo vya card (w-full max-w-sm h-[480px])
      });

      pdf.addImage(dataUrl, "JPEG", 0, 0, 384, 480);
      pdf.save(`Kadi-${guestName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Haikuweza kupakua PDF. Jaribu tena!");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 3. Share Card via WhatsApp Direct
  const handleWhatsAppShare = () => {
    const inviteLink = `${window.location.origin}/invite/${qrToken}`;
    const textMessage = `Habari ${guestName}, Mwaliko wako wa ${eventName} uko tayari! 🎉\n\nTazama kadi na QR Code yako hapa: ${inviteLink}`;

    let formattedPhone = guestPhone ? guestPhone.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "255" + formattedPhone.slice(1);
    }

    const whatsappUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(textMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* DIGITAL INVITATION CARD TEMPLATE */}
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
        {/* HEADER */}
        <div className="space-y-1 mt-2">
          <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-widest text-amber-300 border border-white/20 shadow-sm">
            KADI YA MGENI
          </span>
          <h2 className="text-xl font-black tracking-wide drop-shadow-md pt-3">
            {eventName}
          </h2>
          {eventDate && (
            <p className="text-xs text-gray-200 font-light">{eventDate}</p>
          )}
        </div>

        {/* QR CODE CONTAINER */}
        <div className="my-auto flex flex-col items-center justify-center">
          <div className="p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-white/30 backdrop-blur-sm">
            {qrToken ? (
              <QRCodeSVG value={qrToken} size={150} />
            ) : (
              <p className="text-xs text-red-500 p-4">QR Code haipo</p>
            )}
          </div>
          <p className="text-[10px] text-gray-300 mt-2.5 tracking-widest uppercase font-medium">
            Scan Mlangoni Kuikagua
          </p>
        </div>

        {/* FOOTER: GUEST NAME */}
        <div className="space-y-1 mb-1 bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg">
          <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
            Mgeni Rasmi
          </p>
          <h3 className="text-lg font-bold text-white capitalize truncate">
            {guestName}
          </h3>
          {eventLocation && (
            <p className="text-[11px] text-gray-300 font-light truncate">
              📍 {eventLocation}
            </p>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm pt-2">
        <button
          onClick={handleDownloadJpeg}
          disabled={downloadingImg || downloadingPdf}
          className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-gray-900 py-2.5 px-3 rounded-xl text-xs font-bold shadow-lg transition active:scale-95 disabled:opacity-50"
          title="Download as JPEG"
        >
          {downloadingImg ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
          ) : (
            <Download className="w-4 h-4 text-indigo-600" />
          )}
          <span>JPEG</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={downloadingImg || downloadingPdf}
          className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-lg transition active:scale-95 disabled:opacity-50"
          title="Download as PDF"
        >
          {downloadingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>PDF</span>
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
          title="Tuma kupitia WhatsApp"
        >
          <Share2 className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
}