import { EventForm } from "@/components/dashboard/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-brand-dark dark:text-white">Create a new event</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fill in the details and pick a template — your card builds itself.</p>
      <div className="mt-6">
        <EventForm />
      </div>
    </div>
  );
}
