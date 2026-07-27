"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const eventId = searchParams.get("eventId");

  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleMarkIn = async () => {
    if (!eventId || !token) {
      setErrorMsg("Taarifa za QR Code hazijakamilika.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: token }),
      });

      const data = await res.json();
      if (res.ok) {
        setGuest(data.guest);
        setSuccessMsg("Check-in imefanikiwa! Mgeni ameingia.");
      } else {
        setErrorMsg(data.error || "Imeshindwa kufanya check-in");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Hitilafu imetokea kwenye mtandao.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Uhakiki wa Mgeni</h1>
        <p className="text-sm text-gray-500 mb-6">Skrini ya Kuingia (Check-in)</p>

        {successMsg ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg mb-4">
            <p className="font-bold text-lg mb-1">✅ Imekamilika!</p>
            <p className="text-sm mb-3">{successMsg}</p>
            {guest && (
              <div className="text-left bg-white p-3 rounded border border-green-100 text-black">
                <p className="text-sm"><b>Jina:</b> {guest.name}</p>
                <p className="text-sm"><b>Simu:</b> {guest.phone || "N/A"}</p>
                <p className="text-sm mt-2"><b>Hali:</b> <span className="text-green-600 font-bold">USED (Ameshatinga)</span></p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg mb-4 text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left border">
              <p className="text-xs text-gray-400 uppercase font-semibold">Token:</p>
              <p className="text-xs font-mono text-gray-700 break-all">{token || "Hakuna Token"}</p>
            </div>

            <button
              onClick={handleMarkIn}
              disabled={loading || !token}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-lg transition duration-200 disabled:opacity-50 shadow"
            >
              {loading ? "Inachakata..." : "Mark In (Thibitisha Kuwasili)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-black">Inapakia taarifa...</div>}>
      <VerifyContent />
    </Suspense>
  );
}