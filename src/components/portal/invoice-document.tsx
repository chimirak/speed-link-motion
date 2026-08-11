import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/logistics";

type InvoiceLike = {
  invoice_number: string;
  status: string;
  currency: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  issued_at?: string | null;
  due_at?: string | null;
  notes?: string | null;
};

type LineItem = { description: string; quantity: number; unit_price: number };

/**
 * Full-screen printable invoice. Printing uses the browser's own
 * print-to-PDF — no third-party invoice/PDF service is involved.
 * The `print-surface` / `print-hide` classes are handled in styles.css.
 */
export function InvoiceDocument({
  invoice,
  items,
  onClose,
  customerName,
}: {
  invoice: InvoiceLike;
  items: LineItem[];
  onClose: () => void;
  customerName?: string | null;
}) {
  const currency = invoice.currency || "GBP";

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-background">
      <div className="print-hide sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <p className="numeric truncate text-sm font-medium">{invoice.invoice_number}</p>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="size-4" /> Print / Save as PDF
          </Button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <article className="print-surface mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-primary uppercase">Speed Link Express</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              International courier &amp; logistics
              <br />
              speedlinkexpress.com
            </p>
          </div>
          <div className="sm:text-right">
            <h1 className="font-display text-2xl font-extrabold">Invoice</h1>
            <p className="numeric mt-1 text-sm">{invoice.invoice_number}</p>
            <p className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase">
              {invoice.status}
            </p>
          </div>
        </header>

        <section className="grid gap-6 py-8 sm:grid-cols-3">
          <div>
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">Billed to</p>
            <p className="mt-1.5 text-sm font-medium break-words">
              {customerName ?? "Account holder"}
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">Issued</p>
            <p className="mt-1.5 text-sm">{formatDate(invoice.issued_at)}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">Due</p>
            <p className="mt-1.5 text-sm">{formatDate(invoice.due_at)}</p>
          </div>
        </section>

        {/* Line items — stacked on phones, tabular on paper and desktop */}
        <div className="border-t border-border">
          <div className="hidden grid-cols-[minmax(0,1fr)_5rem_7rem_7rem] gap-3 border-b border-border py-3 text-[11px] tracking-wider text-muted-foreground uppercase sm:grid print:grid">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit</span>
            <span className="text-right">Amount</span>
          </div>
          {items.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No line items on this invoice.</p>
          ) : (
            items.map((item, i) => (
              <div
                key={i}
                className="grid gap-1 border-b border-border/60 py-3.5 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_7rem] sm:gap-3 print:grid-cols-[minmax(0,1fr)_5rem_7rem_7rem]"
              >
                <span className="text-sm break-words">{item.description}</span>
                <span className="numeric text-sm text-muted-foreground sm:text-right print:text-right">
                  <span className="sm:hidden print:hidden">Qty </span>
                  {item.quantity}
                </span>
                <span className="numeric text-sm text-muted-foreground sm:text-right print:text-right">
                  {formatMoney(item.unit_price, currency)}
                </span>
                <span className="numeric text-sm font-medium sm:text-right print:text-right">
                  {formatMoney(item.quantity * item.unit_price, currency)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="numeric">{formatMoney(Number(invoice.subtotal), currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax / charges</dt>
              <dd className="numeric">{formatMoney(Number(invoice.tax), currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total due</dt>
              <dd className="numeric">{formatMoney(Number(invoice.total), currency)}</dd>
            </div>
          </dl>
        </div>

        {invoice.notes && (
          <section className="mt-8 border-t border-border pt-6">
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">Notes</p>
            <p className="mt-2 text-sm break-words whitespace-pre-wrap">{invoice.notes}</p>
          </section>
        )}

        <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          Thank you for shipping with Speed Link Express.
        </footer>
      </article>
    </div>
  );
}
