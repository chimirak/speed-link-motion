import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAdminInvoices, saveInvoice } from "@/lib/admin.functions";
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
import { InvoiceDocument } from "@/components/portal/invoice-document";
import { formatDate, formatMoney } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: AdminInvoices,
});

type Invoice = Awaited<ReturnType<typeof getAdminInvoices>>["invoices"][number];
type Item = { description: string; quantity: number; unit_price: number };

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"];

function AdminInvoices() {
  const qc = useQueryClient();
  const fetchInvoices = useServerFn(getAdminInvoices);
  const persist = useServerFn(saveInvoice);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const [printing, setPrinting] = useState<Invoice | null>(null);

  const [status, setStatus] = useState("draft");
  const [currency, setCurrency] = useState("GBP");
  const [tax, setTax] = useState("0");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unit_price: 0 }]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: () => fetchInvoices(),
    retry: false,
  });

  const itemsByInvoice = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of data?.items ?? []) {
      map.set(it.invoice_id, [
        ...(map.get(it.invoice_id) ?? []),
        {
          description: it.description,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        },
      ]);
    }
    return map;
  }, [data]);

  const rows = useMemo(() => {
    const all = data?.invoices ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((i) =>
      [i.invoice_number, i.status].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const subtotal = items.reduce(
    (s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
    0,
  );
  const total = subtotal + (Number(tax) || 0);

  function reset() {
    setStatus("draft");
    setCurrency("GBP");
    setTax("0");
    setDueAt("");
    setNotes("");
    setItems([{ description: "", quantity: 1, unit_price: 0 }]);
  }

  function openCreate() {
    reset();
    setCreating(true);
  }

  function openEdit(inv: Invoice) {
    setEditing(inv);
    setStatus(inv.status);
    setCurrency(inv.currency);
    setTax(String(inv.tax ?? 0));
    setDueAt(inv.due_at ?? "");
    setNotes(inv.notes ?? "");
    setItems(itemsByInvoice.get(inv.id) ?? [{ description: "", quantity: 1, unit_price: 0 }]);
  }

  const mutation = useMutation({
    mutationFn: () =>
      persist({
        data: {
          ...(editing ? { id: editing.id } : {}),
          status,
          currency,
          tax: Number(tax) || 0,
          notes: notes.trim() || undefined,
          due_at: dueAt || undefined,
          items: items
            .filter((i) => i.description.trim())
            .map((i) => ({
              description: i.description.trim(),
              quantity: Number(i.quantity) || 0,
              unit_price: Number(i.unit_price) || 0,
            })),
        },
      }),
    onSuccess: () => {
      toast.success(editing ? "Invoice updated" : "Invoice created");
      setEditing(null);
      setCreating(false);
      reset();
      void qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save invoice"),
  });

  function setItem(idx: number, patch: Partial<Item>) {
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice",
      primary: true,
      cell: (i) => <span className="numeric font-medium">{i.invoice_number}</span>,
    },
    {
      header: "Total",
      cell: (i) => <span className="numeric">{formatMoney(Number(i.total), i.currency)}</span>,
    },
    { header: "Status", cell: (i) => <Chip label={i.status} tone={toneForStatus(i.status)} /> },
    { header: "Issued", cell: (i) => formatDate(i.issued_at), hideOnMobile: true },
    { header: "Due", cell: (i) => formatDate(i.due_at), hideOnMobile: true },
    {
      header: "",
      cell: (i) => (
        <button
          type="button"
          aria-label={`Print ${i.invoice_number}`}
          onClick={(e) => {
            e.stopPropagation();
            setPrinting(i);
          }}
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <Printer className="size-4" />
        </button>
      ),
    },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  const formOpen = creating || Boolean(editing);

  return (
    <>
      <Panel
        title="Invoices"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> New
          </Button>
        }
      >
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search invoice number or status"
          />
        </Toolbar>
        <DataTable
          rows={rows}
          columns={columns}
          getKey={(i) => i.id}
          loading={isLoading}
          onRowClick={openEdit}
          empty={
            <AdminEmpty title="No invoices yet" body="Create an invoice to bill a customer." />
          }
        />
      </Panel>

      <Drawer
        open={formOpen}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? `Edit ${editing.invoice_number}` : "New invoice"}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />} Save invoice
            </Button>
          </div>
        }
      >
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
          <Field label="Currency">
            <select
              className={inputClass}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {["GBP", "USD", "EUR", "NGN"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <input
              type="date"
              className={inputClass}
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </Field>
          <Field label="Tax / charges">
            <input
              className={inputClass}
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              inputMode="decimal"
            />
          </Field>
        </div>

        <h3 className="mt-6 mb-3 text-[11px] tracking-wider text-muted-foreground uppercase">
          Line items
        </h3>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border p-3">
              <input
                className={inputClass}
                placeholder="Description"
                value={item.description}
                onChange={(e) => setItem(idx, { description: e.target.value })}
              />
              <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })}
                />
                <input
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="Unit price"
                  value={item.unit_price}
                  onChange={(e) => setItem(idx, { unit_price: Number(e.target.value) })}
                />
                <button
                  type="button"
                  aria-label="Remove line"
                  onClick={() => setItems((l) => l.filter((_, i) => i !== idx))}
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setItems((l) => [...l, { description: "", quantity: 1, unit_price: 0 }])}
        >
          <Plus className="size-4" /> Add line
        </Button>

        <div className="mt-5 rounded-2xl bg-secondary/50 p-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="numeric">{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Tax / charges</span>
            <span className="numeric">{formatMoney(Number(tax) || 0, currency)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span className="numeric">{formatMoney(total, currency)}</span>
          </div>
        </div>

        <div className="mt-4">
          <Field label="Notes">
            <textarea
              className={textareaClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>
      </Drawer>

      {printing && (
        <InvoiceDocument
          invoice={printing}
          items={itemsByInvoice.get(printing.id) ?? []}
          onClose={() => setPrinting(null)}
        />
      )}
    </>
  );
}
