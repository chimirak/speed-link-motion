import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createTicket, getMyTickets } from "@/lib/portal.functions";
import { EmptyState, Panel, StatusPill } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/dashboard/support")({
  component: SupportPage,
});

function SupportPage() {
  const queryClient = useQueryClient();
  const list = useServerFn(getMyTickets);
  const create = useServerFn(createTicket);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["tickets"], queryFn: () => list() });

  const mutation = useMutation({
    mutationFn: () => create({ data: { subject, body } }),
    onSuccess: (t) => {
      toast.success(`Ticket ${t.reference} opened.`);
      setSubject("");
      setBody("");
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: () => toast.error("Could not open that ticket."),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Your tickets">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-secondary" />
        ) : (data ?? []).length === 0 ? (
          <EmptyState title="No tickets" body="Raise one and our team replies within the hour." />
        ) : (
          <ul className="divide-y divide-border">
            {(data ?? []).map((t) => (
              <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.subject}</p>
                  <p className="numeric text-sm text-muted-foreground">
                    {t.reference} · {formatDate(t.created_at)}
                  </p>
                </div>
                <StatusPill label={t.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Open a ticket">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (subject.trim().length < 4 || body.trim().length < 10) {
              toast.error("Add a subject and a little more detail.");
              return;
            }
            mutation.mutate();
          }}
        >
          <div>
            <label htmlFor="subject" className="text-xs tracking-widest text-muted-foreground uppercase">
              Subject
            </label>
            <input
              id="subject"
              value={subject}
              maxLength={160}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-border bg-secondary px-4 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="body" className="text-xs tracking-widest text-muted-foreground uppercase">
              How can we help?
            </label>
            <textarea
              id="body"
              value={body}
              rows={6}
              maxLength={4000}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-secondary p-4 text-sm focus:outline-none"
            />
          </div>
          <Button type="submit" variant="speed" size="pill" disabled={mutation.isPending}>
            Submit ticket
          </Button>
        </form>
      </Panel>
    </div>
  );
}
