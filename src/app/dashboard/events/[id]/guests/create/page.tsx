"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default function CreateGuestPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [createdGuest, setCreatedGuest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");

  // Hii inazuia makosa ya window kwenye Vercel
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedGuest(data);
      } else {
        alert(data.error || "Imeshindwa kutengeneza mgeni");
      }
    } catch (err) {
      console.error(err);
      alert("Hitilafu ya mtandao");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Ongeza Mgeni & Genereti QR</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jina Kamili</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border p-2 rounded mt-1 text-black"
              placeholder="Mf. Juma Ally"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Namba ya Simu</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded mt-1 text-black"
              placeholder="Mf. 0712345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Barua Pepe (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded mt-1 text-black"
              placeholder="Mf. juma@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition"
          >
            {loading ? "Inatengeneza..." : "Genereti QR Code"}
          </button>
        </form>

        {/* Sehemu ya Kuonyesha QR Code Baada ya Kutengenezwa */}
        {createdGuest && origin && (
          <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg text-center">
            <h3 className="font-bold text-green-700 mb-2">Mgeni Ameongezwa Kikamilifu!</h3>
            <p className="text-sm text-gray-700 mb-4">Jina: <b>{createdGuest.name}</b></p>

            <div className="flex justify-center bg-white p-4 rounded shadow-inner inline-block">
              <QRCodeSVG
                value={`${origin}/verify?token=${createdGuest.qrToken}&eventId=${eventId}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Scan QR hii kwa simu yako, itafunguka moja kwa moja na kitufe cha Mark In.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}