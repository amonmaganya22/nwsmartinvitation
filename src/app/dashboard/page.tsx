import Link from "next/link";
import { CalendarDays, Users, CheckCircle2, Clock, Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { format } from "date-fns";

export default async function DashboardPage() {
  const user = (await getSession())!;

  const events = await prisma.event.findMany({ where: { userId: user.id }, select: { id: true } });
  const eventIds = events.map((e) => e.id);

  const [totalGuests, checkedIn, recentEvents] = await Promise.all([
    prisma.guest.count({ where: { eventId: { in: eventIds } } }),
    prisma.guest.count({ where: { eventId: { in: eventIds }, status: "USED" } }),
    prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { template: true, _count: { select: { guests: true } } }
    })
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Welcome back, {user.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here&apos;s what&apos;s happening across your events.</p>
        </div>
        <Link href="/dashboard/events/new" className="btn-primary">
          <Plus size={16} /> New event
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total events" value={eventIds.length} icon={CalendarDays} />
        <StatCard label="Total guests" value={totalGuests} icon={Users} accent="#2f6fed" />
        <StatCard label="Checked in" value={checkedIn} icon={CheckCircle2} accent="#4c9a2a" />
        <StatCard label="Pending" value={totalGuests - checkedIn} icon={Clock} accent="#c9a227" />
      </div>

      <div className="mt-8 card-surface p-0">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-brand-dark dark:text-white">Recent events</h2>
          <Link href="/dashboard/events" className="text-sm font-medium text-brand-green">View all</Link>
        </div>
        {recentEvents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No events yet. Create your first one to get started.</p>
            <Link href="/dashboard/events/new" className="btn-primary mt-4 inline-flex">
              <Plus size={16} /> Create event
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentEvents.map((e) => (
              <li key={e.id}>
                <Link href={`/dashboard/events/${e.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-brand-dark dark:text-white">{e.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(e.eventDate), "PP")} · {e.venue} {e.template ? `· ${e.template.name}` : ""}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">{e._count.guests} guests</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
