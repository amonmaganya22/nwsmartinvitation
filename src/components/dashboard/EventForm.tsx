"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TemplatePicker, TemplateOption } from "@/components/dashboard/TemplatePicker";
import { CoverImageUploader } from "@/components/dashboard/CoverImageUploader";
import { EventCard, CardLayout } from "@/templates/EventCard";
import { apiFetch } from "@/lib/api-client";
import { useCsrfBootstrap } from "@/lib/use-csrf-bootstrap";

export type EventFormValues = {
  id?: string;
  name: string;
  eventDate: string; // yyyy-mm-dd
  eventTime: string;
  venue: string;
  description: string;
  coverImageUrl: string;
  templateId: string | null;
  templateLayout?: CardLayout | null;
};

const fallbackLayout: CardLayout = { bg: "#ffffff", accent: "#4c9a2a", font: "sans", border: "none", icon: "dot" };

export function EventForm({ initial }: { initial?: EventFormValues }) {
  useCsrfBootstrap();
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [values, setValues] = useState<EventFormValues>(
    initial || {
      name: "",
      eventDate: "",
      eventTime: "",
      venue: "",
      description: "",
      coverImageUrl: "",
      templateId: null
    }
  );
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/templates")
      .then((data) => setTemplates(data.templates))
      .finally(() => setTemplatesLoading(false));
  }, []);

  const previewLayout: CardLayout =
    templates.find((t) => t.id === values.templateId)?.layout || initial?.templateLayout || fallbackLayout;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        eventDate: values.eventDate,
        eventTime: values.eventTime,
        venue: values.venue,
        description: values.description,
        coverImageUrl: values.coverImageUrl,
        templateId: values.templateId || undefined
      };
      if (isEdit) {
        await apiFetch(`/api/events/${initial!.id}`, { method: "PUT", body: JSON.stringify(payload) });
        router.push(`/dashboard/events/${initial!.id}`);
      } else {
        const data = await apiFetch("/api/events", { method: "POST", body: JSON.stringify(payload) });
        router.push(`/dashboard/events/${data.event.id}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="card-surface space-y-4 p-6">
        <div>
          <Label htmlFor="name">Event name</Label>
          <Input id="name" required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Amina & John's Wedding" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="eventDate">Date</Label>
            <Input id="eventDate" type="date" required value={values.eventDate} onChange={(e) => setValues({ ...values, eventDate: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="eventTime">Time</Label>
            <Input id="eventTime" type="time" required value={values.eventTime} onChange={(e) => setValues({ ...values, eventTime: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="venue">Venue</Label>
          <Input id="venue" required value={values.venue} onChange={(e) => setValues({ ...values, venue: e.target.value })} placeholder="Mlimani City Hall, Dar es Salaam" />
        </div>
        <div>
          <Label htmlFor="description">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Textarea id="description" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} placeholder="Dress code, extra notes for guests…" />
        </div>
        <div>
          <Label>Cover image</Label>
          <CoverImageUploader value={values.coverImageUrl} onChange={(url) => setValues({ ...values, coverImageUrl: url })} />
        </div>
        <div>
          <Label>Card template</Label>
          <TemplatePicker
            templates={templates}
            loading={templatesLoading}
            value={values.templateId}
            onChange={(id) => setValues({ ...values, templateId: id })}
          />
        </div>
        <FieldError>{error ?? undefined}</FieldError>
        <Button type="submit" fullWidth loading={loading}>{isEdit ? "Save changes" : "Create event"}</Button>
      </form>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Live preview</p>
        <EventCard
          layout={previewLayout}
          eventName={values.name || "Your Event Name"}
          eventDate={values.eventDate || new Date()}
          eventTime={values.eventTime || "18:00"}
          venue={values.venue || "Venue name"}
          description={values.description}
          coverImageUrl={values.coverImageUrl}
        />
      </div>
    </div>
  );
}
