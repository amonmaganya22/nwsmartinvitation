"use client";

import { useState } from "react";
import { Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CardDownloadActions({ fileName }: { fileName: string }) {
  const [loading, setLoading] = useState<"pdf" | "png" | null>(null);

  async function renderToCanvas() {
    const node = document.getElementById("event-card-root");
    if (!node) throw new Error("Card not found.");
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(node, { scale: 3, useCORS: true, backgroundColor: null });
  }

  async function downloadPng() {
    setLoading("png");
    try {
      const canvas = await renderToCanvas();
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setLoading(null);
    }
  }

  async function downloadPdf() {
    setLoading("pdf");
    try {
      const canvas = await renderToCanvas();
      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex justify-center gap-3">
      <Button variant="secondary" onClick={downloadPng} loading={loading === "png"}>
        <FileImage size={16} /> PNG
      </Button>
      <Button onClick={downloadPdf} loading={loading === "pdf"}>
        <Download size={16} /> PDF
      </Button>
    </div>
  );
}
