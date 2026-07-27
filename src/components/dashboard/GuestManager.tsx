"use client";

import React, { useState } from "react";
import { Trash2, FileText, CheckCircle2, XCircle, Search } from "lucide-react";
import GuestTicketCard from "./GuestTicketCard";

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
  };
}

export default function GuestManager({ initialGuests, eventId, event }: GuestManagerProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuestForCard, setSelectedGuestForCard] = useState<Guest | null>(null);

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

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Sehemu ya kutafuta mgeni */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tafuta mgeni kwa jina..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-white text-xs w-full focus:outline-none"
        />
      </div>

      {/* Orodha ya Wageni */}
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
                  {/* Hali ya Check-in */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    guest.status === "CHECKED_IN" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50" : "bg-gray-800 text-gray-400"
                  }`}>
                    {guest.status === "CHECKED_IN" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {guest.status}
                  </span>

                  {/* Alama ya Kadi / File */}
                  <button
                    onClick={() => setSelectedGuestForCard(guest)}
                    className="p-2 bg-gray-800 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-400 rounded-lg transition"
                    title="Tazama/Generate Kadi"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {/* Kitufe cha Kufuta */}
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

      {/* Modal ya Kadi ya Mgeni Aliyeteuliwa */}
      {selectedGuestForCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-sm w-full p-6 relative space-y-4">
            <button
              onClick={() => setSelectedGuestForCard(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xs font-bold bg-gray-800 px-2.5 py-1 rounded-lg"
            >
              Funga X
            </button>
            <h3 className="text-sm font-bold text-white mb-2">Usimamizi wa Kadi ya Mgeni</h3>
            <GuestTicketCard 
              guest={selectedGuestForCard} 
              event={event || { name: "Hafla Maalum" }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}