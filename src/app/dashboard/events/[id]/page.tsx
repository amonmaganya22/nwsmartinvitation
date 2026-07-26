import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Calendar, MapPin, Clock } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER SECTION (Inajirekebisha vizuri kwenye Mobile na Desktop) */}
      <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {event.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {format(new Date(event.eventDate), "EEEE, MMMM d, yyyy")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              {event.eventTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-500" />
              {event.venue}
            </span>
          </div>

          {event.template && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/50 w-fit px-2.5 py-1 rounded-md">
              Template: {event.template.name}
            </p>
          )}
        </div>

        {/* ACTION BUTTONS (Wider & Touch-friendly kwenye simu) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Link 
            href={`/dashboard/events/${event.id}/edit`} 
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition"
          >
            <Pencil size={15} /> Edit
          </Link>
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>

      {/* DESCRIPTION */}
      {event.description && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
          {event.description}
        </div>
      )}

      {/* GUEST MANAGEMENT COMPONENT */}
      <div className="pt-2">
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