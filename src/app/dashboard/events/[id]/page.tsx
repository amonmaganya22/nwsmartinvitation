import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeleteEventButton } from "@/components/dashboard/DeleteEventButton";
import { GuestManager } from "@/components/dashboard/GuestManager";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const user = (await getSession())!;
  const event = await prisma.event.findFirst({
    where: { id: params.id, userId: user.id },
    include: { template: true, guests: { orderBy: { createdAt: "desc" } } }
  });

  if (!event) return notFound();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">{event.name}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(event.eventDate), "EEEE, MMMM d, yyyy")} · {event.eventTime} · {event.venue}
          </p>
          {event.template && <p className="mt-1 text-xs text-gray-400">Template: {event.template.name}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/events/${event.id}/edit`} className="btn-secondary">
            <Pencil size={16} /> Edit
          </Link>
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>

      {event.description && <p className="mt-4 max-w-2xl text-sm text-gray-600 dark:text-gray-300">{event.description}</p>}

      <div className="mt-8">
        <GuestManager
          eventId={event.id}
          initialGuests={event.guests.map((g) => ({
            id: g.id,
            name: g.name,
            phone: g.phone,
            email: g.email,
            status: g.status,
            qrToken: g.qrToken
          }))}
        />
      </div>
    </div>
  );
}
