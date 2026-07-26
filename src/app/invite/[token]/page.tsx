import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { packQrPayload, renderQrDataUrl } from "@/lib/qr";
import { EventCard, CardLayout } from "@/templates/EventCard";
import { CardDownloadActions } from "@/components/CardDownloadActions";
import { Logo } from "@/components/Logo";

const fallbackLayout: CardLayout = { bg: "#ffffff", accent: "#4c9a2a", font: "sans", border: "none", icon: "dot" };

export default async function InviteCardPage({ params }: { params: { token: string } }) {
  const guest = await prisma.guest.findUnique({
    where: { qrToken: params.token },
    include: { event: { include: { template: true } } }
  });

  if (!guest) return notFound();

  const packed = packQrPayload(guest.qrToken, guest.eventId, guest.secretHash);
  const qrDataUrl = await renderQrDataUrl(packed);
  const layout = (guest.event.template?.layoutJson as unknown as CardLayout) || fallbackLayout;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-[#0f1112]">
      <div className="mx-auto mb-8 flex justify-center"><Logo /></div>

      <EventCard
        layout={layout}
        eventName={guest.event.name}
        eventDate={guest.event.eventDate}
        eventTime={guest.event.eventTime}
        venue={guest.event.venue}
        description={guest.event.description}
        guestName={guest.name}
        qrDataUrl={qrDataUrl}
        coverImageUrl={guest.event.coverImageUrl}
      />

      <div className="mt-6">
        <CardDownloadActions fileName={`${guest.event.name}-${guest.name}`.replace(/[^a-z0-9]+/gi, "-")} />
      </div>

      {guest.status === "USED" && (
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-amber-600">
          This QR code has already been checked in at the venue.
        </p>
      )}
    </main>
  );
}
