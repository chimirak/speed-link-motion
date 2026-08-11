import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Responsive data table                                                      */
/*  Renders a real <table> from `md` up, and stacked cards below it, so admin  */
/*  screens stay usable on a 320px phone instead of overflowing horizontally.  */
/* -------------------------------------------------------------------------- */

export type Column<T> = {
  /** Column heading. */
  header: string;
  /** Cell renderer. */
  cell: (row: T) => ReactNode;
  /** Hide this column in the mobile card view (e.g. low-signal metadata). */
  hideOnMobile?: boolean;
  /** Use as the card title on mobile instead of a labelled row. */
  primary?: boolean;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  getKey,
  onRowClick,
  empty,
  loading,
}: {
  rows: T[];
  columns: Column<T>[];
  getKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty: ReactNode;
  loading?: boolean;
}) {
  if (loading) return <TableSkeleton />;
  if (rows.length === 0) return <>{empty}</>;

  const primary = columns.find((c) => c.primary) ?? columns[0]!;
  const secondary = columns.filter((c) => c !== primary && !c.hideOnMobile);

  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={getKey(row)}>
            <button
              type="button"
              disabled={!onRowClick}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "w-full rounded-2xl border border-border p-4 text-left",
                onRowClick && "transition-colors hover:border-primary/40 hover:bg-secondary/40",
              )}
            >
              <div className="min-w-0 font-medium break-words">{primary.cell(row)}</div>
              <dl className="mt-3 space-y-1.5">
                {secondary.map((col) => (
                  <div key={col.header} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
                    <dt className="truncate text-[11px] tracking-wider text-muted-foreground uppercase">
                      {col.header}
                    </dt>
                    <dd className="min-w-0 text-sm break-words">{col.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop: real table, horizontally scrollable as a last resort */}
      <div className="hidden md:block">
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.header}
                    scope="col"
                    className="px-3 py-3 text-left text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={getKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    onRowClick && "cursor-pointer transition-colors hover:bg-secondary/50",
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.header} className={cn("px-3 py-3.5 align-middle", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  States                                                                     */
/* -------------------------------------------------------------------------- */

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl bg-secondary/60 md:h-12"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

export function AdminEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <Inbox className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function AdminError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const forbidden = /forbidden/i.test(message);
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-medium">
            {forbidden ? "You don't have access to this area" : "Couldn't load this data"}
          </p>
          <p className="mt-1 text-sm break-words text-muted-foreground">{message}</p>
          {onRetry && !forbidden && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-primary underline underline-offset-4"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} aria-hidden="true" />;
}

/* -------------------------------------------------------------------------- */
/*  Status chips                                                               */
/* -------------------------------------------------------------------------- */

const TONE: Record<string, string> = {
  positive: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/12 text-destructive",
  neutral: "bg-secondary text-muted-foreground",
  info: "bg-primary/12 text-primary",
};

export function toneForStatus(status: string): keyof typeof TONE {
  if (["delivered", "paid", "resolved", "closed", "confirmed"].includes(status)) return "positive";
  if (["cancelled", "on_hold", "delivery_attempted", "overdue"].includes(status)) return "danger";
  if (["draft", "requested", "pending", "open", "sent"].includes(status)) return "warning";
  if (status === "order_received") return "neutral";
  return "info";
}

export function Chip({ label, tone = "info" }: { label: string; tone?: keyof typeof TONE }) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE[tone],
      )}
    >
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form primitives                                                            */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  children,
  hint,
  error,
  full,
}: {
  label: string;
  children: ReactNode;
  hint?: string | undefined;
  error?: string | undefined;
  full?: boolean | undefined;
}) {
  return (
    <label className={cn("block min-w-0", full && "sm:col-span-2")}>
      <span className="mb-1.5 block text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "h-11 w-full min-w-0 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export const textareaClass = cn(inputClass, "h-auto min-h-24 py-3 leading-relaxed");

/* -------------------------------------------------------------------------- */
/*  Drawer — bottom sheet on mobile, side panel on desktop                     */
/* -------------------------------------------------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-background shadow-2xl sm:max-w-2xl sm:rounded-[1.5rem]"
      >
        <div className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
          <h2 className="truncate pr-8 font-display text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3.5 right-4 grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search / filter bar                                                        */
/* -------------------------------------------------------------------------- */

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center gap-2.5">{children}</div>;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={cn(inputClass, "h-10 flex-1 basis-48")}
    />
  );
}
