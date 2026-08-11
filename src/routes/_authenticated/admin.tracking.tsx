import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { getAdminShipments, getShipmentDetail, updateShipmentStatus } from "@/lib/admin.functions";
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
import { SHIPMENT_STATUSES, formatDateTime, statusLabel } from "@/lib/logistics";
import type { ShipmentStatus } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/tracking")({
  component: TrackingDesk,
});

type Row = Awaited<ReturnType<typeof getAdminShipments>>[number];

function TrackingDesk() {
  const qc = useQueryClient();
  const fetchShipments = useServerFn(getAdminShipments);
  const fetchDetail = useServerFn(getShipmentDetail);
  const pushUpdate = useServerFn(updateShipmentStatus);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [status, setStatus] = useState<ShipmentStatus>("in_transit");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [eta, setEta] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-shipments"],
    queryFn: () => fetchShipments(),
    retry: false,
  });

  const detail = useQuery({
    queryKey: ["shipment-detail", selected?.id],
    queryFn: () => fetchDetail({ data: { shipmentId: selected!.id } }),
    enabled: Boolean(selected),
    retry: false,
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) =>
      [s.tracking_number, s.receiver_name, s.receiver_city, s.current_location].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const mutation = useMutation({
    mutationFn: () =>
      pushUpdate({
        data: {
          shipmentId: selected!.id,
          status,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          estimated_delivery: eta || undefined,
          isPublic,
        },
      }),
    onSuccess: () => {
      toast.success("Tracking updated");
      setLocation("");
      setDescription("");
      setEta("");
      void qc.invalidateQueries({ queryKey: ["admin-shipments"] });
      void qc.invalidateQueries({ queryKey: ["shipment-detail", selected?.id] });
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  function openShipment(row: Row) {
    setSelected(row);
    setStatus(row.status as ShipmentStatus);
    setLocation(row.current_location ?? "");
    setEta(row.estimated_delivery ?? "");
    setDescription("");
    setIsPublic(true);
  }

  const columns: Column<Row>[] = [
    {
      header: "Tracking",
      primary: true,
      cell: (s) => <span className="numeric font-medium">{s.tracking_number}</span>,
    },
    {
      header: "Current location",
      cell: (s) => s.current_location ?? <span className="text-muted-foreground">Not set</span>,
    },
    {
      header: "Destination",
      cell: (s) => <span className="text-muted-foreground">{s.receiver_city ?? "—"}</span>,
    },
    {
      header: "Status",
      cell: (s) => <Chip label={statusLabel(s.status)} tone={toneForStatus(s.status)} />,
    },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel title="Tracking desk">
      <Toolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by tracking number or city"
        />
      </Toolbar>

      <DataTable
        rows={rows}
        columns={columns}
        getKey={(s) => s.id}
        loading={isLoading}
        onRowClick={openShipment}
        empty={
          <AdminEmpty title="Nothing to track" body="Shipments will appear here once created." />
        }
      />

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Update ${selected.tracking_number}` : ""}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />} Post update
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New status">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
            >
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Current location">
            <input
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lagos hub"
            />
          </Field>
          <Field label="Estimated delivery">
            <input
              type="date"
              className={inputClass}
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
          </Field>
          <Field label="Visibility" hint="Internal notes stay hidden from public tracking">
            <select
              className={inputClass}
              value={isPublic ? "public" : "internal"}
              onChange={(e) => setIsPublic(e.target.value === "public")}
            >
              <option value="public">Show on public tracking</option>
              <option value="internal">Internal only</option>
            </select>
          </Field>
          <Field label="Note" full>
            <textarea
              className={textareaClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Departed sorting facility"
            />
          </Field>
        </div>

        <div className="mt-7">
          <h3 className="mb-3 text-[11px] tracking-wider text-muted-foreground uppercase">
            Tracking history
          </h3>
          {detail.isLoading ? (
            <div className="h-24 animate-pulse rounded-2xl bg-secondary/60" />
          ) : (detail.data?.events.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No tracking events recorded yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-5">
              {detail.data!.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[1.6rem] top-1.5 grid size-3 place-items-center rounded-full bg-primary" />
                  <p className="text-sm font-medium">{statusLabel(e.status)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(e.occurred_at)}
                    {e.location ? ` · ${e.location}` : ""}
                    {!e.is_public ? " · internal" : ""}
                  </p>
                  {e.description && <p className="mt-1 text-sm break-words">{e.description}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </Drawer>
    </Panel>
  );
}
