import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/dashboard/EventForm";
import { format } from "date-fns";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const user = (await getSession())!;
  const event = await prisma.event.findFirst({ where: { id: params.id, userId: user.id }, include: { template: true } });
  if (!event) return notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Edit event</h1>
      <div className="mt-6">
        <EventForm
          initial={{
            id: event.id,
            name: event.name,
            eventDate: format(new Date(event.eventDate), "yyyy-MM-dd"),
            eventTime: event.eventTime,
            venue: event.venue,
            description: event.description || "",
            coverImageUrl: event.coverImageUrl || "",
            templateId: event.templateId,
            templateLayout: (event.template?.layoutJson as any) || null
          }}
        />
      </div>
    </div>
  );
}
