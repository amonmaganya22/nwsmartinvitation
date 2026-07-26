"use client";

import { useState } from "react";
import { Plus, Upload, Users, Phone, Mail, Trash2, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GuestTicketCard } from "./GuestTicketCard";

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
  qrToken?: string | null;
}

interface GuestManagerProps {
  eventId: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  templateBgUrl?: string;
  initialGuests: Guest[];
}

export function GuestManager({
  eventId,
  eventName,
  eventDate,
  eventLocation,
  templateBgUrl,
  initialGuests,
}: GuestManagerProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State ya kuonyesha Ticket Pass Modal
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Kuongeza Mgeni Mpya
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });

      const data = await res.json();

      if (res.ok && data.guest) {
        setGuests((prev) => [data.guest, ...prev]);
        setName("");
        setPhone("");
        setEmail("");
      } else {
        alert(data.error || "Kuna tatizo limetokea!");
      }
    } catch (error) {
      console.error("Error adding guest:", error);
      alert("Haikuweza kuongeza mgeni.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION TITLE & ACTIONS */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Usimamizi wa Wageni ({guests.length})
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ongeza mgeni mmoja mmoja au ingiza kwa wingi kupitia CSV.
          </p>
        </div>

        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition">
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM: Kuongeza Mgeni */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            Ongeza Mgeni Mpya
          </h3>

          <form onSubmit={handleAddGuest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Jina Kamili *
              </label>
              <input
                type="text"
                required
                placeholder="Mf. Grace Imani"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Namba ya Simu
              </label>
              <input
                type="tel"
                placeholder="0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="mgeni@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50 mt-2"
            >
              <Plus className="w-4 h-4" />
              {loading ? "Inahifadhi..." : "Hifadhi Mgeni"}
            </button>
          </form>
        </div>

        {/* LIST: Orodha ya Wageni */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            Orodha ya Wageni
          </h3>

          {guests.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Bado hakuna mgeni aliyeongezwa.
            </p>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-3 rounded-l-xl">QR Code</th>
                      <th className="px-3 py-3">Jina</th>
                      <th className="px-3 py-3">Simu / Email</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 rounded-r-xl text-right">Kadi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {guests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                        {/* QR CODE ICON & BUTTON */}
                        <td className="px-3 py-3">
                          {guest.qrToken ? (
                            <button
                              onClick={() => setSelectedGuest(guest)}
                              className="p-1 bg-white border border-gray-200 rounded-lg block hover:scale-105 transition shadow-sm"
                              title="Bonyeza kutazama kadi ya mgeni"
                            >
                              <QRCodeSVG value={guest.qrToken} size={34} />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        {/* JINA */}
                        <td className="px-3 py-3 font-semibold text-gray-800 dark:text-white">
                          {guest.name}
                        </td>

                        {/* MAWASILIANO */}
                        <td className="px-3 py-3 text-xs space-y-0.5">
                          <div className="text-gray-700 dark:text-gray-300 font-medium">
                            {guest.phone || "-"}
                          </div>
                          <div className="text-gray-400 text-[11px]">
                            {guest.email || ""}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-3 py-3">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full">
                            {guest.status || "UNUSED"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedGuest(guest)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition"
                              title="Tazama Kadi"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-red-500 hover:text-red-700 rounded-lg transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="block sm:hidden space-y-3">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* MINI QR CODE ON MOBILE */}
                      {guest.qrToken && (
                        <div
                          onClick={() => setSelectedGuest(guest)}
                          className="p-1 bg-white rounded-lg border border-gray-200 shrink-0 cursor-pointer shadow-sm"
                        >
                          <QRCodeSVG value={guest.qrToken} size={42} />
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-800 dark:text-white text-sm block">
                          {guest.name}
                        </span>
                        {guest.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guest.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedGuest(guest)}
                      className="p-2 bg-indigo-600 text-white rounded-xl text-xs font-medium shrink-0 shadow-sm"
                      title="Onyesha Kadi"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* POP-UP MODAL: KADI YA MGENI YENYE TEMPLATE NA QR CODE */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative max-w-sm w-full my-auto">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedGuest(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 backdrop-blur-md transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* TEMPLATE CARD COMPONENT WITH ACTIONS */}
            <GuestTicketCard
              guestName={selectedGuest.name}
              guestPhone={selectedGuest.phone}
              qrToken={selectedGuest.qrToken || ""}
              eventName={eventName}
              eventDate={eventDate}
              eventLocation={eventLocation}
              templateBgUrl={templateBgUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
}