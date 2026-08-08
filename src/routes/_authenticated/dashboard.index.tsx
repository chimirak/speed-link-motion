import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Bell } from "lucide-react";
import { getDashboard } from "@/lib/portal.functions";
import { EmptyState, Panel, StatCard, StatusPill } from "@/components/portal/portal-shell";
import { formatDate, formatMoney, statusLabel } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  const shipments = data?.shipments ?? [];
  const active = shipments.filter((s) => !["delivered", "cancelled"].includes(s.status));
  const delivered = shipments.filter((s) => s.status === "delivered");
  const outstanding = (data?.invoices ?? []).filter((i) => i.status !== "paid");

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active shipments" value={isLoading ? "—" : active.length} />
        <StatCard label="Delivered" value={isLoading ? "—" : delivered.length} />
        <StatCard label="Open invoices" value={isLoading ? "—" : outstanding.length} />
        <StatCard label="Support tickets" value={isLoading ? "—" : (data?.tickets.length ?? 0)} />
      </div>

      <Panel
        title="Recent shipments"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/shipments">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        {isLoading ? (
          <SkeletonRows />
        ) : shipments.length === 0 ? (
          <EmptyState
            title="No shipments yet"
            body="Book your first consignment and it will appear here with live tracking."
          />
        ) : (
          <ul className="divide-y divide-border">
            {shipments.slice(0, 6).map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="numeric truncate font-medium">{s.tracking_number}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {s.sender_city ?? "—"} → {s.receiver_city ?? "—"} · {formatDate(s.created_at)}
                  </p>
                </div>
                <StatusPill label={statusLabel(s.status)} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Invoices">
          {outstanding.length === 0 ? (
            <EmptyState title="Nothing outstanding" body="All invoices are settled." />
          ) : (
            <ul className="divide-y divide-border">
              {outstanding.slice(0, 5).map((i) => (
                <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
                  <span className="numeric truncate">{i.invoice_number}</span>
                  <span className="numeric shrink-0 font-medium">
                    {formatMoney(Number(i.total), i.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Notifications">
          {(data?.notifications ?? []).length === 0 ? (
            <EmptyState title="All quiet" body="Status updates will show up here." />
          ) : (
            <ul className="space-y-4">
              {(data?.notifications ?? []).slice(0, 5).map((n) => (
                <li key={n.id} className="flex gap-3">
                  <Bell className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-12 animate-pulse rounded-xl bg-secondary" />
      ))}
    </ul>
  );
}
