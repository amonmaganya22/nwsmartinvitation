"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ScanLine } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useCsrfBootstrap } from "@/lib/use-csrf-bootstrap";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

type ScanResult = {
  status: "SUCCESS" | "ALREADY_USED" | "INVALID";
  message: string;
  guestName?: string;
  eventName?: string;
} | null;

export default function ScannerPage() {
  useCsrfBootstrap();
  const scannerRef = useRef<any>(null);
  const [result, setResult] = useState<ScanResult>(null);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let html5QrCode: any;
    let cancelled = false;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText: string) => {
            if (busyRef.current) return;
            await handleScan(decodedText);
          },
          () => {} // ignore per-frame "no QR found" noise
        );
        setScanning(true);
      } catch (err: any) {
        setCameraError("Couldn't access the camera. Please allow camera permission and reload.");
      }
    })();

    return () => {
      cancelled = true;
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref mirror of `busy` so the scan callback (captured once) reads the latest value.
  const busyRef = useRef(false);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  async function handleScan(payload: string) {
    setBusy(true);
    try {
      const data = await apiFetch("/api/checkin", { method: "POST", body: JSON.stringify({ payload }) });
      setResult(data);
    } catch (err: any) {
      setResult({ status: "INVALID", message: err.message || "Invalid QR Code" });
    } finally {
      // brief cooldown so the same code isn't re-submitted mid-animation
      setTimeout(() => setBusy(false), 1500);
    }
  }

  const banner = {
    SUCCESS: { icon: CheckCircle2, bg: "bg-brand-green", label: "Allow Entry" },
    ALREADY_USED: { icon: AlertTriangle, bg: "bg-amber-500", label: "Already Checked In" },
    INVALID: { icon: XCircle, bg: "bg-red-600", label: "Invalid QR Code" }
  } as const;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1112]">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <ThemeToggle />
      </header>

      <div className="mx-auto max-w-md px-4 pb-16">
        <div className="flex items-center gap-2 text-brand-dark dark:text-white">
          <ScanLine size={20} />
          <h1 className="text-xl font-semibold">Guest Scanner</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Point the camera at a guest&apos;s QR code.</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-black dark:border-gray-800">
          <div id="qr-reader" className="w-full" />
        </div>

        {cameraError && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">{cameraError}</p>
        )}
        {!cameraError && !scanning && <p className="mt-4 text-center text-sm text-gray-400">Starting camera…</p>}

        {result && (
          <div className={`mt-6 rounded-2xl ${banner[result.status].bg} p-6 text-center text-white shadow-lg`}>
            {(() => {
              const Icon = banner[result.status].icon;
              return <Icon size={40} className="mx-auto" />;
            })()}
            <p className="mt-3 text-lg font-semibold">{banner[result.status].label}</p>
            {result.guestName && <p className="mt-1 text-sm opacity-90">{result.guestName}</p>}
            {result.eventName && <p className="text-sm opacity-75">{result.eventName}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
