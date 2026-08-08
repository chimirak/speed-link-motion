import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { Panel } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { createShipment } from "@/lib/portal.functions";
import { SERVICE_TYPES } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/dashboard/new-shipment")({
  component: NewShipmentPage,
});

const schema = z.object({
  sender_name: z.string().trim().min(2).max(120),
  sender_city: z.string().trim().min(2).max(80),
  sender_country: z.string().trim().min(2).max(80),
  sender_address: z.string().trim().max(240).optional(),
  receiver_name: z.string().trim().min(2).max(120),
  receiver_city: z.string().trim().min(2).max(80),
  receiver_country: z.string().trim().min(2).max(80),
  receiver_address: z.string().trim().max(240).optional(),
  service_type: z.string(),
  weight_kg: z.coerce.number().min(0.1).max(30000),
  description: z.string().trim().max(400).optional(),
  pickup_date: z.string().optional(),
});

function NewShipmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submit = useServerFn(createShipment);
  const [values, setValues] = useState<Record<string, string>>({
    service_type: "express",
    sender_country: "United Kingdom",
  });

  const mutation = useMutation({
    mutationFn: (input: z.infer<typeof schema>) => submit({ data: input }),
    onSuccess: (row) => {
      toast.success(`Booking created — ${row.tracking_number}`);
      void queryClient.invalidateQueries();
      void navigate({ to: "/dashboard/shipments" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create booking."),
  });

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    mutation.mutate(parsed.data);
  }

  return (
    <Panel title="Book a shipment">
      <form onSubmit={onSubmit} className="space-y-8" noValidate>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Collection
          </legend>
          <Input label="Sender name" k="sender_name" values={values} set={set} />
          <Input label="Sender city" k="sender_city" values={values} set={set} />
          <Input label="Sender country" k="sender_country" values={values} set={set} />
          <Input label="Sender address" k="sender_address" values={values} set={set} />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Delivery
          </legend>
          <Input label="Receiver name" k="receiver_name" values={values} set={set} />
          <Input label="Receiver city" k="receiver_city" values={values} set={set} />
          <Input label="Receiver country" k="receiver_country" values={values} set={set} />
          <Input label="Receiver address" k="receiver_address" values={values} set={set} />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Consignment
          </legend>
          <div>
            <label
              htmlFor="service_type"
              className="text-xs tracking-widest text-muted-foreground uppercase"
            >
              Service
            </label>
            <select
              id="service_type"
              value={values["service_type"] ?? "express"}
              onChange={(e) => set("service_type", e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-border bg-secondary px-4 text-sm"
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <Input label="Weight (kg)" k="weight_kg" values={values} set={set} type="number" />
          <Input label="Pickup date" k="pickup_date" values={values} set={set} type="date" />
          <Input label="Contents" k="description" values={values} set={set} />
        </fieldset>

        <Button type="submit" variant="speed" size="pill-lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating…" : "Create booking"}
        </Button>
      </form>
    </Panel>
  );
}

function Input({
  label,
  k,
  values,
  set,
  type = "text",
}: {
  label: string;
  k: string;
  values: Record<string, string>;
  set: (k: string, v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={k} className="text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </label>
      <input
        id={k}
        type={type}
        value={values[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-border bg-secondary px-4 text-sm focus:outline-none"
      />
    </div>
  );
}
