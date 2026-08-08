import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyInvoices } from "@/lib/portal.functions";
import { EmptyState, Panel, StatusPill } from "@/components/portal/portal-shell";
import { formatDate, formatMoney } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/dashboard/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const list = useServerFn(getMyInvoices);
  const { data, isLoading } = useQuery({ queryKey: ["invoices"], queryFn: () => list() });

  return (
    <Panel title="Invoices & payments">
      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-secondary" />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No invoices yet"
          body="Invoices are issued once a consignment is collected."
        />
      ) : (
        <ul className="divide-y divide-border">
          {(data ?? []).map((i) => (
            <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4">
              <div className="min-w-0">
                <p className="numeric truncate font-medium">{i.invoice_number}</p>
                <p className="text-sm text-muted-foreground">
                  Issued {formatDate(i.issued_at)} · Due {formatDate(i.due_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="numeric font-medium">
                  {formatMoney(Number(i.total), i.currency)}
                </span>
                <StatusPill label={i.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
