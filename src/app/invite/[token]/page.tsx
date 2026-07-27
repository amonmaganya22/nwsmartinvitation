'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InvitePage() {
  const params = useParams();
  const token = params.token;

  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Fetch taarifa za mgeni kupitia token
  useEffect(() => {
    if (!token) return;

    fetch(`/api/guest/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGuest(data.guest);
        } else {
          setMessage(data.message || 'Mgeni hakutambulika.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage('Imeshindikana kupata taarifa za mgeni.');
        setLoading(false);
      });
  }, [token]);

  // 2. Kazi ya kubonyeza Mark as Checked-In
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token }),
      });
      const data = await res.json();

      if (data.success) {
        setGuest(data.guest);
        setMessage('✅ Amethibitishwa kufika kikamilifu!');
      } else {
        setMessage(data.message || 'Imeshindikana kufanya check-in.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Hitilafu imetokea kwenye mtandao.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white bg-slate-900">Inapakia taarifa za kadi...</div>;
  }

  if (!guest) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-6 bg-slate-900 text-white text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Kadi Siyo Sahihi</h1>
        <p className="text-gray-400">{message || 'Samahani, kadi hii haipo kwenye mfumo.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Uhakiki wa Lango (Gate Verification)</span>
        
        <h1 className="text-2xl font-bold mt-2">{guest.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{guest.title || 'Mgeni Rasmi'}</p>

        {/* Hali ya sasa ya mgeni */}
        <div className="my-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400">Hali ya Kadi:</p>
          <p className={`text-lg font-bold mt-1 ${guest.status === 'CHECKED_IN' ? 'text-green-400' : 'text-amber-400'}`}>
            {guest.status === 'CHECKED_IN' ? '✅ IMESHA-TUMIKA (CHECKED IN)' : '⏳ BADO HAJASHAFIKA (PENDING)'}
          </p>
        </div>

        {/* Ujumbe wa mafanikio au hitilafu */}
        {message && <p className="mb-4 text-sm text-amber-300 font-medium">{message}</p>}

        {/* Kitufe cha Kum-mark */}
        {guest.status !== 'CHECKED_IN' ? (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg disabled:opacity-50"
          >
            {checkingIn ? 'Inachakata...' : 'Thibitisha Kufika (Mark as Checked In)'}
          </button>
        ) : (
          <div className="bg-green-500/20 text-green-300 py-3 px-4 rounded-xl font-medium border border-green-500/30">
            Mgeni huyu ameshapita langoni tayari.
          </div>
        )}
      </div>
    </div>
  );
}