import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import {
  getPricingRules,
  savePricingRule,
  deletePricingRule,
  quoteShipment,
  type PricingRule,
} from "@/lib/admin.functions";
import {
  AdminEmpty,
  AdminError,
  Chip,
  DataTable,
  Drawer,
  TableSkeleton,
  Toolbar,
  inputClass,
  type Column,
} from "@/components/portal/admin-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminPricing,
});

const KINDS = ["service", "per_kg", "flat_fee", "surcharge", "discount"] as const;
const SCOPES = ["any", "domestic", "international"] as const;

const blank = {
  code: "",
  label: "",
  kind: "service",
  service_type: "",
  destination_scope: "any",
  base_amount: 0,
  per_kg_amount: 0,
  min_charge: 0,
  currency: "GBP",
  active: true,
  sort_order: 100,
};

type Draft = typeof blank & { id?: string };

function money(n: number, cur: string) {
  return `${cur} ${Number(n).toFixed(2)}`;
}

function AdminPricing() {
  const fetchRules = useServerFn(getPricingRules);
  const save = useServerFn(savePricingRule);
  const remove = useServerFn(deletePricingRule);
  const quote = useServerFn(quoteShipment);
  const qc = useQueryClient();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [weight, setWeight] = useState("5");
  const [service, setService] = useState("express");
  const [intl, setIntl] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const rules = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: () => fetchRules(),
    retry: false,
  });

  const saveMut = useMutation({
    mutationFn: (d: Draft) => save({ data: d }),
    onSuccess: () => {
      toast.success("Rate saved");
      setDraft(null);
      void qc.invalidateQueries({ queryKey: ["pricing-rules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Rate removed");
      void qc.invalidateQueries({ queryKey: ["pricing-rules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // The quote is computed by the database, never in this component.
  async function runQuote() {
    try {
      const result = (await quote({
        data: {
          service_type: service,
          weight_kg: Number(weight) || 0,
          international: intl,
        },
      })) as { total?: number; currency?: string } | null;
      setPreview(
        result && typeof result.total === "number"
          ? `${result.currency ?? "GBP"} ${result.total.toFixed(2)}`
          : "No quote available",
      );
    } catch {
      toast.error("Could not calculate a quote.");
    }
  }

  const columns: Column<PricingRule>[] = [
    {
      header: "Rate",
      primary: true,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{r.label}</p>
          <p className="numeric truncate text-xs text-muted-foreground">{r.code}</p>
        </div>
      ),
    },
    { header: "Kind", cell: (r) => <Chip label={r.kind.replace("_", " ")} tone="info" /> },
    {
      header: "Applies to",
      hideOnMobile: true,
      cell: (r) => `${r.service_type ?? "all services"} · ${r.destination_scope}`,
    },
    { header: "Base", cell: (r) => money(r.base_amount, r.currency) },
    { header: "Per kg", cell: (r) => money(r.per_kg_amount, r.currency) },
    { header: "Min", hideOnMobile: true, cell: (r) => money(r.min_charge, r.currency) },
    {
      header: "Status",
      cell: (r) =>
        r.active ? (
          <Chip label="Active" tone="positive" />
        ) : (
          <Chip label="Inactive" tone="warning" />
        ),
    },
    {
      header: "",
      cell: (r) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDraft({ ...r, service_type: r.service_type ?? "" })}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Delete ${r.label}`}
            onClick={() => {
              if (
                confirm(
                  `Delete the rate "${r.label}"? Existing invoices keep their original amounts.`,
                )
              ) {
                delMut.mutate(r.id);
              }
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Pricing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rates used to quote shipments. Changes apply to future quotes only — invoices already
          issued keep their original amounts. Every change is recorded in the audit log.
        </p>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2">
          <Calculator className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-display text-sm font-bold tracking-wide uppercase">Test a quote</h2>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">Service</span>
            <select
              className={inputClass}
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="express">express</option>
              <option value="standard">standard</option>
              <option value="freight">freight</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">Weight (kg)</span>
            <input
              className={inputClass}
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={intl} onChange={(e) => setIntl(e.target.checked)} />
            International
          </label>
          <Button variant="speed" size="sm" onClick={() => void runQuote()}>
            Calculate
          </Button>
        </div>
        {preview && (
          <p className="numeric mt-3 text-lg font-semibold" role="status">
            {preview}
          </p>
        )}
      </div>

      <Toolbar>
        <span className="text-sm text-muted-foreground">{rules.data?.length ?? 0} rates</span>
        <Button variant="speed" size="sm" onClick={() => setDraft({ ...blank })}>
          <Plus className="size-3.5" /> New rate
        </Button>
      </Toolbar>

      {rules.isLoading && <TableSkeleton />}
      {rules.error && <AdminError error={rules.error} onRetry={() => void rules.refetch()} />}
      {rules.data && (
        <DataTable
          rows={rules.data}
          columns={columns}
          getKey={(r) => r.id}
          empty={<AdminEmpty title="No rates yet" body="Add a rate to start quoting shipments." />}
        />
      )}

      <Drawer
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit rate" : "New rate"}
      >
        {draft && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">Code</span>
              <input
                className={inputClass}
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="express_base"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">Label</span>
              <input
                className={inputClass}
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Express service"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-muted-foreground">Kind</span>
                <select
                  className={inputClass}
                  value={draft.kind}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-muted-foreground">Destination</span>
                <select
                  className={inputClass}
                  value={draft.destination_scope}
                  onChange={(e) => setDraft({ ...draft, destination_scope: e.target.value })}
                >
                  {SCOPES.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">
                Service type (blank = all services)
              </span>
              <input
                className={inputClass}
                value={draft.service_type}
                onChange={(e) => setDraft({ ...draft, service_type: e.target.value })}
                placeholder="express"
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["base_amount", "per_kg_amount", "min_charge"] as const).map((f) => (
                <label key={f} className="block text-sm">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    {f.replace(/_/g, " ")}
                  </span>
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={String(draft[f])}
                    onChange={(e) => setDraft({ ...draft, [f]: Number(e.target.value) || 0 })}
                  />
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-muted-foreground">Currency</span>
                <input
                  className={inputClass}
                  value={draft.currency}
                  onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-muted-foreground">Sort order</span>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={String(draft.sort_order)}
                  onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              />
              Active
            </label>
            <Button
              variant="speed"
              className="w-full justify-center"
              disabled={saveMut.isPending}
              onClick={() => saveMut.mutate(draft)}
            >
              {saveMut.isPending ? "Saving…" : "Save rate"}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
