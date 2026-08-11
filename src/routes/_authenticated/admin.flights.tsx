import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getAdminFlights, updateFlightStatus } from "@/lib/admin.functions";
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
import { formatDate, formatMoney } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/flights")({ component: AdminFlights });

type Booking = Awaited<ReturnType<typeof getAdminFlights>>[number];
const STATUSES = ["requested", "quoted", "confirmed", "ticketed", "cancelled"];

function AdminFlights() {
  const qc = useQueryClient();
  const fetchFlights = useServerFn(getAdminFlights);
  const update = useServerFn(updateFlightStatus);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [status, setStatus] = useState("requested");
  const [quote, setQuote] = useState("");
  const [staffNotes, setStaffNotes] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-flights"],
    queryFn: () => fetchFlights(),
    retry: false,
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((b) =>
      [b.reference, b.origin, b.destination, b.contact_name, b.status].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const mutation = useMutation({
    mutationFn: () =>
      update({
        data: {
          bookingId: selected!.id,
          status,
          quoted_amount: quote ? Number(quote) : undefined,
          staff_notes: staffNotes.trim() || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Booking updated");
      setSelected(null);
      void qc.invalidateQueries({ queryKey: ["admin-flights"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  function open(b: Booking) {
    setSelected(b);
    setStatus(b.status);
    setQuote(b.quoted_amount == null ? "" : String(b.quoted_amount));
    setStaffNotes(b.staff_notes ?? "");
  }

  const columns: Column<Booking>[] = [
    {
      header: "Reference",
      primary: true,
      cell: (b) => <span className="numeric font-medium">{b.reference}</span>,
    },
    { header: "Route", cell: (b) => `${b.origin} → ${b.destination}` },
    { header: "Departs", cell: (b) => formatDate(b.depart_date) },
    { header: "Pax", cell: (b) => b.adults + b.children + b.infants, hideOnMobile: true },
    {
      header: "Quote",
      cell: (b) =>
        b.quoted_amount == null ? (
          "—"
        ) : (
          <span className="numeric">{formatMoney(Number(b.quoted_amount), b.currency)}</span>
        ),
    },
    { header: "Status", cell: (b) => <Chip label={b.status} tone={toneForStatus(b.status)} /> },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel title="Flight bookings">
      <p className="mb-5 text-sm text-muted-foreground">
        Booking requests are handled internally — Speed Link staff quote and confirm manually. No
        external airline inventory is connected.
      </p>
      <Toolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search reference, route or passenger"
        />
      </Toolbar>
      <DataTable
        rows={rows}
        columns={columns}
        getKey={(b) => b.id}
        loading={isLoading}
        onRowClick={open}
        empty={
          <AdminEmpty
            title="No booking requests"
            body="Customer flight requests will appear here."
          />
        }
      />

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Booking ${selected.reference}` : ""}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />} Save
            </Button>
          </div>
        }
      >
        {selected && (
          <dl className="mb-6 grid gap-3 rounded-2xl bg-secondary/50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Passenger</dt>
              <dd className="break-words">{selected.contact_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Contact</dt>
              <dd className="break-all">
                {selected.contact_email ?? selected.contact_phone ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Trip</dt>
              <dd>
                {selected.trip_type} · {selected.cabin_class}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Returns</dt>
              <dd>{formatDate(selected.return_date)}</dd>
            </div>
            {selected.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground uppercase">Customer notes</dt>
                <dd className="break-words">{selected.notes}</dd>
              </div>
            )}
          </dl>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quoted amount">
            <input
              className={inputClass}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              inputMode="decimal"
            />
          </Field>
          <Field label="Internal notes" full hint="Not shown to the customer">
            <textarea
              className={textareaClass}
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
            />
          </Field>
        </div>
      </Drawer>
    </Panel>
  );
}
