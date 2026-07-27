"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default function GuestCardGenerator() {
  const params = useParams();
  const eventId = params.id as string;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [createdGuest, setCreatedGuest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
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
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Unda Kadi na QR Code</h2>
      
      <form onSubmit={handleGenerate} className="space-y-3">
        <input
          type="text"
          placeholder="Jina la Mgeni (Mf. Ben Juma)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded text-black"
        />
        <input
          type="text"
          placeholder="Namba ya Simu"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded text-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700"
        >
          {loading ? "Inatengeneza..." : "Genereti Kadi"}
        </button>
      </form>

      {/* Hapa ndipo QR Code inajenga URL sahihi ya kwenda kwenye /verify */}
      {createdGuest && origin && (
        <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
          <p className="font-bold text-gray-800">Kadi ya: {createdGuest.name}</p>
          <div className="my-4 flex justify-center bg-white p-3 rounded shadow inline-block">
            <QRCodeSVG
              value={`${origin}/verify?token=${createdGuest.qrToken}&eventId=${eventId}`}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-xs text-gray-500">
            Skana hii itafungua ukurasa wa uhakiki moja kwa moja bila blank page.
          </p>
        </div>
      )}
    </div>
  );
}