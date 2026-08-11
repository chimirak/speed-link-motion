import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import {
  getAdminTicketMessages,
  getAdminTickets,
  replyToTicketAsStaff,
  updateTicketStatus,
} from "@/lib/admin.functions";
import { Panel } from "@/components/portal/portal-shell";
import {
  AdminEmpty,
  AdminError,
  Chip,
  DataTable,
  Drawer,
  Field,
  SearchInput,
  Spinner,
  Toolbar,
  inputClass,
  textareaClass,
  toneForStatus,
  type Column,
} from "@/components/portal/admin-ui";
import { formatDateTime } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/support")({ component: AdminSupport });

type Ticket = Awaited<ReturnType<typeof getAdminTickets>>[number];
const STATUSES = ["open", "pending", "resolved", "closed"];

function AdminSupport() {
  const qc = useQueryClient();
  const fetchTickets = useServerFn(getAdminTickets);
  const fetchMessages = useServerFn(getAdminTicketMessages);
  const reply = useServerFn(replyToTicketAsStaff);
  const setTicketStatus = useServerFn(updateTicketStatus);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: () => fetchTickets(),
    retry: false,
  });

  const messages = useQuery({
    queryKey: ["ticket-messages", selected?.id],
    queryFn: () => fetchMessages({ data: { ticketId: selected!.id } }),
    enabled: Boolean(selected),
    retry: false,
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((t) =>
      [t.reference, t.subject, t.status, t.priority].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const replyMutation = useMutation({
    mutationFn: () => reply({ data: { ticketId: selected!.id, body, isInternal: internal } }),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["ticket-messages", selected?.id] });
      toast.success("Reply sent");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not send reply"),
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { status: string; assignToMe?: boolean }) =>
      setTicketStatus({ data: { ticketId: selected!.id, ...vars } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket updated");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const columns: Column<Ticket>[] = [
    {
      header: "Subject",
      primary: true,
      cell: (t) => <span className="font-medium">{t.subject}</span>,
    },
    {
      header: "Reference",
      cell: (t) => <span className="numeric text-muted-foreground">{t.reference}</span>,
    },
    {
      header: "Priority",
      cell: (t) => <Chip label={t.priority} tone={t.priority === "high" ? "danger" : "neutral"} />,
    },
    { header: "Status", cell: (t) => <Chip label={t.status} tone={toneForStatus(t.status)} /> },
    { header: "Opened", cell: (t) => formatDateTime(t.created_at), hideOnMobile: true },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel title="Support tickets">
      <Toolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search subject, reference or status"
        />
      </Toolbar>
      <DataTable
        rows={rows}
        columns={columns}
        getKey={(t) => t.id}
        loading={isLoading}
        onRowClick={(t) => {
          setSelected(t);
          setBody("");
          setInternal(false);
        }}
        empty={<AdminEmpty title="Inbox clear" body="Customer tickets will appear here." />}
      />

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? ""}
        footer={
          <div className="flex flex-col gap-2">
            <textarea
              className={textareaClass}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                internal ? "Internal note (hidden from customer)…" : "Reply to customer…"
              }
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                />
                Internal note
              </label>
              <Button
                size="sm"
                onClick={() => replyMutation.mutate()}
                disabled={replyMutation.isPending || !body.trim()}
              >
                {replyMutation.isPending ? <Spinner /> : <Send className="size-4" />} Send
              </Button>
            </div>
          </div>
        }
      >
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <Field label="Status">
            <select
              className={inputClass}
              value={selected?.status ?? "open"}
              onChange={(e) => statusMutation.mutate({ status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignment">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => statusMutation.mutate({ status: selected!.status, assignToMe: true })}
            >
              Assign to me
            </Button>
          </Field>
        </div>

        {messages.isLoading ? (
          <div className="h-24 animate-pulse rounded-2xl bg-secondary/60" />
        ) : (messages.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No messages on this ticket yet.</p>
        ) : (
          <ul className="space-y-3">
            {messages.data!.map((m) => (
              <li
                key={m.id}
                className={`rounded-2xl border p-3.5 ${m.is_internal ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}
              >
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(m.created_at)}
                  {m.is_internal ? " · internal note" : ""}
                </p>
                <p className="mt-1.5 text-sm break-words whitespace-pre-wrap">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </Panel>
  );
}
