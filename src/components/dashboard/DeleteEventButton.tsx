"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        <Trash2 size={16} /> Delete event
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Delete this event and all its guests?</span>
      <Button variant="danger" loading={loading} onClick={async () => {
        setLoading(true);
        try {
          await apiFetch(`/api/events/${eventId}`, { method: "DELETE" });
          router.push("/dashboard/events");
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}>Yes, delete</Button>
      <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
    </div>
  );
}
