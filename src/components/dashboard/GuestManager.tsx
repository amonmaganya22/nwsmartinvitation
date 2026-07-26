"use client";

import { useState } from "react";
import { Plus, Upload, Users, Phone, Mail, Trash2 } from "lucide-react";

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
  initialGuests: Guest[];
}

export function GuestManager({ eventId, initialGuests }: GuestManagerProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Kuongeza Mgeni
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

      if (res.ok) {
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

      {/* GRID LAYOUT: Stacked kwenye Mobile, Columns 3 kwenye Desktop */}
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
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            Orodha ya Wageni
          </h3>

          {guests.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Bado hakuna mgeni aliyeongezwa.
            </p>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Inajificha kwenye simu) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Jina</th>
                      <th className="px-4 py-3">Simu</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-r-xl text-right">Kitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {guests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-white">
                          {guest.name}
                        </td>
                        <td className="px-4 py-3.5">{guest.phone || "-"}</td>
                        <td className="px-4 py-3.5">{guest.email || "-"}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full">
                            {guest.status || "INVITED"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button className="text-red-500 hover:text-red-700 p-1 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (Inaonekana kwenye Simu tu) */}
              <div className="block sm:hidden space-y-3">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-start gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 dark:text-white text-sm">
                          {guest.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-md">
                          {guest.status || "INVITED"}
                        </span>
                      </div>

                      {guest.phone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {guest.phone}
                        </p>
                      )}

                      {guest.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {guest.email}
                        </p>
                      )}
                    </div>

                    <button className="text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}