import { format } from "date-fns";

export type CardLayout = {
  bg: string;
  accent: string;
  font: "serif" | "sans";
  border: string;
  icon: string;
};

export type EventCardProps = {
  layout: CardLayout;
  eventName: string;
  eventDate: string | Date;
  eventTime: string;
  venue: string;
  description?: string | null;
  guestName?: string;
  qrDataUrl?: string | null;
  coverImageUrl?: string | null;
};

const borderStyleMap: Record<string, string> = {
  double: "6px double",
  solid: "3px solid",
  ornate: "4px solid",
  "gold-line": "2px solid",
  "gold-frame": "10px solid",
  minimal: "1px solid",
  confetti: "4px dashed",
  none: "none"
};

export function EventCard({ layout, eventName, eventDate, eventTime, venue, description, guestName, qrDataUrl, coverImageUrl }: EventCardProps) {
  const isDark = layout.bg.startsWith("#0") || layout.bg.startsWith("#1");
  const textColor = isDark ? "#f5f5f5" : "#1c1f22";

  return (
    <div
      id="event-card-root"
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl"
      style={{
        background: layout.bg,
        color: textColor,
        border: borderStyleMap[layout.border] ?? "1px solid #e5e5e5",
        borderColor: layout.accent,
        fontFamily: layout.font === "serif" ? "Georgia, 'Times New Roman', serif" : "Inter, system-ui, sans-serif"
      }}
    >
      {coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImageUrl} alt="" className="h-40 w-full object-cover" />
      )}
      <div className="px-8 py-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: layout.accent }}>You&apos;re invited</p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight">{eventName}</h2>

        {guestName && <p className="mt-2 text-sm opacity-80">for {guestName}</p>}

        <div className="mt-6 space-y-1 text-sm opacity-90">
          <p>{format(new Date(eventDate), "EEEE, MMMM d, yyyy")}</p>
          <p>{eventTime}</p>
          <p>{venue}</p>
        </div>

        {description && <p className="mt-4 text-sm opacity-70">{description}</p>}

        {qrDataUrl && (
          <div className="mt-6 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Guest QR code" className="h-40 w-40 rounded-lg bg-white p-2" />
            <p className="mt-2 text-[11px] opacity-60">Present this code at entry · single use only</p>
          </div>
        )}

        <div className="mt-6 h-px w-full" style={{ background: layout.accent, opacity: 0.4 }} />
        <p className="mt-3 text-[10px] uppercase tracking-widest opacity-50">NWSmartInvitation</p>
      </div>
    </div>
  );
}
