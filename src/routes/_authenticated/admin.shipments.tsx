import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createAdminShipment, getAdminShipments } from "@/lib/admin.functions";
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
import {
  SERVICE_TYPES,
  formatDate,
  generateTrackingNumber,
  serviceLabel,
  statusLabel,
} from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/shipments")({
  component: AdminShipments,
});

type Row = Awaited<ReturnType<typeof getAdminShipments>>[number];

const EMPTY = {
  tracking_number: "",
  service_type: "express",
  sender_name: "",
  sender_phone: "",
  sender_city: "",
  sender_country: "",
  receiver_name: "",
  receiver_phone: "",
  receiver_city: "",
  receiver_country: "",
  package_type: "",
  description: "",
  weight_kg: "",
  quantity: "1",
  estimated_delivery: "",
};

function AdminShipments() {
  const qc = useQueryClient();
  const fetchShipments = useServerFn(getAdminShipments);
  const createShipment = useServerFn(createAdminShipment);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-shipments"],
    queryFn: () => fetchShipments(),
    retry: false,
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) =>
      [s.tracking_number, s.sender_name, s.receiver_name, s.receiver_city, s.status].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createShipment({ data: payload }),
    onSuccess: (row) => {
      toast.success(`Shipment ${row?.tracking_number ?? ""} created`);
      setOpen(false);
      setForm({ ...EMPTY });
      setErrors({});
      void qc.invalidateQueries({ queryKey: ["admin-shipments"] });
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not create shipment"),
  });

  function set(key: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function submit() {
    const next: Record<string, string> = {};
    if (!form.sender_name.trim()) next["sender_name"] = "Sender name is required";
    if (!form.receiver_name.trim()) next["receiver_name"] = "Recipient name is required";
    const tracking = form.tracking_number.trim().toUpperCase() || generateTrackingNumber(true);
    if (tracking.length < 5)
      next["tracking_number"] = "Tracking number must be at least 5 characters";
    if (form.weight_kg && Number.isNaN(Number(form.weight_kg)))
      next["weight_kg"] = "Weight must be a number";
    if (Number(form.quantity) < 1) next["quantity"] = "Quantity must be at least 1";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    mutation.mutate({
      tracking_number: tracking,
      service_type: form.service_type,
      sender_name: form.sender_name.trim(),
      sender_phone: form.sender_phone.trim() || null,
      sender_city: form.sender_city.trim() || null,
      sender_country: form.sender_country.trim() || null,
      receiver_name: form.receiver_name.trim(),
      receiver_phone: form.receiver_phone.trim() || null,
      receiver_city: form.receiver_city.trim() || null,
      receiver_country: form.receiver_country.trim() || null,
      package_type: form.package_type.trim() || null,
      description: form.description.trim() || null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      quantity: Number(form.quantity) || 1,
      estimated_delivery: form.estimated_delivery || null,
    });
  }

  const columns: Column<Row>[] = [
    {
      header: "Tracking",
      primary: true,
      cell: (s) => <span className="numeric font-medium">{s.tracking_number}</span>,
    },
    {
      header: "Route",
      cell: (s) => (
        <span className="text-muted-foreground">
          {s.sender_city ?? "—"} → {s.receiver_city ?? "—"}
        </span>
      ),
    },
    { header: "Recipient", cell: (s) => s.receiver_name },
    { header: "Service", cell: (s) => serviceLabel(s.service_type), hideOnMobile: true },
    {
      header: "Status",
      cell: (s) => <Chip label={statusLabel(s.status)} tone={toneForStatus(s.status)} />,
    },
    { header: "Created", cell: (s) => formatDate(s.created_at), hideOnMobile: true },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel
      title="Shipments"
      action={
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New
        </Button>
      }
    >
      <Toolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search tracking, name or city"
        />
        {!isLoading && <span className="text-xs text-muted-foreground">{rows.length} shown</span>}
      </Toolbar>

      <DataTable
        rows={rows}
        columns={columns}
        getKey={(s) => s.id}
        loading={isLoading}
        empty={
          query ? (
            <AdminEmpty title="No matches" body="Try a different tracking number, name or city." />
          ) : (
            <AdminEmpty
              title="No shipments yet"
              body="Create your first consignment to get started."
            />
          )
        }
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="New shipment"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />} Create shipment
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Tracking number"
            hint="Leave blank to generate automatically"
            error={errors["tracking_number"]}
          >
            <input
              className={inputClass}
              value={form.tracking_number}
              onChange={set("tracking_number")}
              placeholder="Auto-generated"
            />
          </Field>
          <Field label="Service">
            <select className={inputClass} value={form.service_type} onChange={set("service_type")}>
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sender name" error={errors["sender_name"]}>
            <input className={inputClass} value={form.sender_name} onChange={set("sender_name")} />
          </Field>
          <Field label="Sender phone">
            <input
              className={inputClass}
              value={form.sender_phone}
              onChange={set("sender_phone")}
              inputMode="tel"
            />
          </Field>
          <Field label="Origin city">
            <input className={inputClass} value={form.sender_city} onChange={set("sender_city")} />
          </Field>
          <Field label="Origin country">
            <input
              className={inputClass}
              value={form.sender_country}
              onChange={set("sender_country")}
            />
          </Field>

          <Field label="Recipient name" error={errors["receiver_name"]}>
            <input
              className={inputClass}
              value={form.receiver_name}
              onChange={set("receiver_name")}
            />
          </Field>
          <Field label="Recipient phone">
            <input
              className={inputClass}
              value={form.receiver_phone}
              onChange={set("receiver_phone")}
              inputMode="tel"
            />
          </Field>
          <Field label="Destination city">
            <input
              className={inputClass}
              value={form.receiver_city}
              onChange={set("receiver_city")}
            />
          </Field>
          <Field label="Destination country">
            <input
              className={inputClass}
              value={form.receiver_country}
              onChange={set("receiver_country")}
            />
          </Field>

          <Field label="Package type">
            <input
              className={inputClass}
              value={form.package_type}
              onChange={set("package_type")}
              placeholder="Parcel, pallet…"
            />
          </Field>
          <Field label="Weight (kg)" error={errors["weight_kg"]}>
            <input
              className={inputClass}
              value={form.weight_kg}
              onChange={set("weight_kg")}
              inputMode="decimal"
            />
          </Field>
          <Field label="Quantity" error={errors["quantity"]}>
            <input
              className={inputClass}
              value={form.quantity}
              onChange={set("quantity")}
              inputMode="numeric"
            />
          </Field>
          <Field label="Estimated delivery">
            <input
              type="date"
              className={inputClass}
              value={form.estimated_delivery}
              onChange={set("estimated_delivery")}
            />
          </Field>
          <Field label="Description" full>
            <textarea
              className={textareaClass}
              value={form.description}
              onChange={set("description")}
            />
          </Field>
        </div>
      </Drawer>
    </Panel>
  );
}
