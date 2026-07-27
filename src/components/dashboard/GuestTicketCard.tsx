'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Weka named export na default export kwa pamoja ili kuepusha error za import
export function GuestTicketCard({ guest, event }: { guest: any; event: any }) {
  // Unaweza kuweka logic ya kadi yako hapa au kuacha ile uliyokuwa nayo
  return (
    <div className="p-6 bg-slate-900 border border-white/10 rounded-2xl text-white">
      <h3 className="text-xl font-bold">{guest.name}</h3>
      <p className="text-sm text-gray-400">{guest.title || event?.name}</p>
      <div className="mt-4 bg-white p-4 rounded-xl inline-block">
        <QRCodeSVG value={`${window.location.origin}/invite/${guest.qrToken}`} size={128} />
      </div>
    </div>
  );
}

export default GuestTicketCard;