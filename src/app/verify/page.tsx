'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const eventId = searchParams.get('eventId');

    const [guest, setGuest] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Unaweza kuongeza mantiki ya kuleta taarifa za mgeni hapa kwanza kama unataka kuonesha jina lake kabla ya kubonyeza Mark In
    
    const handleMarkIn = async () => {
        if (!token || !eventId) {
            setMessage({ text: "Taarifa za QR code hazijakamilika.", type: 'error' });
            return;
        }

        setCheckingIn(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/events/${eventId}/check-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrToken: token }),
            });

            const data = await res.json();

            if (res.ok) {
                setGuest(data.guest);
                setMessage({ text: "Amefanikiwa! Mgeni ameingia.", type: 'success' });
            } else {
                // Hapa ndipo tunamkataa kama tayari ameshaingia au kuna kosa
                if (data.error === "Already checked in") {
                    setMessage({ text: "Huyu mtu tayari ameshaingia (Checked-in)!", type: 'error' });
                } else {
                    setMessage({ text: data.error || "Imeshindikana kufanya check-in.", type: 'error' });
                }
            }
        } catch (err) {
            setMessage({ text: "Kosa la mtandao limetokea.", type: 'error' });
        } finally {
            setCheckingIn(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Uhakiki wa Wageni</h1>
                
                {token && eventId ? (
                    <div className="mb-6 text-sm text-gray-600">
                        <p>Token: <span className="font-mono bg-gray-100 p-1 rounded">{token.substring(0, 10)}...</span></p>
                    </div>
                ) : (
                    <p className="text-red-500 mb-4">QR code hii haina taarifa sahihi.</p>
                )}

                {message && (
                    <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {guest && (
                    <div className="mb-4 p-4 bg-gray-50 rounded border text-left">
                        <p><strong>Jina:</strong> {guest.name || 'Mgeni'}</p>
                        <p><strong>Hali:</strong> {guest.status}</p>
                    </div>
                )}

                <button
                    onClick={handleMarkIn}
                    disabled={checkingIn || !token}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                    {checkingIn ? 'Inachakata...' : 'Mark In (Thibitisha Kuingia)'}
                </button>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Inapakia...</div>}>
            <VerifyContent />
        </Suspense>
    );
}