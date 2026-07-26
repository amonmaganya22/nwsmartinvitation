import Link from "next/link";
import { format } from "date-fns";
import { Plus, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EventsPage() {
  const user = (await getSession())!;
  const events = await prisma.event.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { template: true, _count: { select: { guests: true } } }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Your events</h1>
        <Link href="/dashboard/events/new" className="btn-primary"><Plus size={16} /> New event</Link>
      </div>

      {events.length === 0 ? (
        <div className="card-surface mt-6 px-6 py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t created any events yet.</p>
          <Link href="/dashboard/events/new" className="btn-primary mt-4 inline-flex"><Plus size={16} /> Create your first event</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} href={`/dashboard/events/${e.id}`} className="card-surface p-0 overflow-hidden hover:shadow-lg transition">
              <div className="h-28 w-full" style={{ background: e.template?.previewColor ? `${e.template.previewColor}22` : "#4c9a2a22" }}>
                {e.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.coverImageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-5">
                <p className="font-semibold text-brand-dark dark:text-white">{e.name}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{format(new Date(e.eventDate), "PP")} · {e.venue}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{e.template?.name ?? "No template"}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {e._count.guests}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
