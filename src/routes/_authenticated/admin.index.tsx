import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAdminOverview } from "@/lib/admin.functions";
import { Panel, StatCard } from "@/components/portal/portal-shell";
import {
  AdminEmpty,
  AdminError,
  Chip,
  TableSkeleton,
  toneForStatus,
} from "@/components/portal/admin-ui";
import { formatDate, formatMoney, statusLabel } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

const ACTIVE_STATUSES = [
  "pickup_scheduled",
  "picked_up",
  "at_sorting_facility",
  "in_transit",
  "arrived_at_destination",
  "out_for_delivery",
];

function AdminDashboard() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    retry: false,
  });

  const shipments = useMemo(() => data?.shipments ?? [], [data]);
  const perms = data?.permissions ?? [];

  const counts = useMemo(() => {
    const active = shipments.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const pending = shipments.filter((s) => s.status === "order_received").length;
    return { active, delivered, pending, total: shipments.length };
  }, [shipments]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of shipments) map.set(s.status, (map.get(s.status) ?? 0) + 1);
    return [...map.entries()]
      .map(([status, count]) => ({ status: statusLabel(status), count }))
      .sort((a, b) => b.count - a.count);
  }, [shipments]);

  const openInvoiceTotal = useMemo(
    () =>
      (data?.invoices ?? [])
        .filter((i) => i.status !== "paid" && i.status !== "cancelled")
        .reduce((sum, i) => sum + Number(i.total ?? 0), 0),
    [data],
  );

  const openTickets = (data?.tickets ?? []).filter(
    (t) => t.status !== "closed" && t.status !== "resolved",
  );

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total shipments"
          value={isLoading ? "—" : counts.total}
          hint={isLoading ? undefined : `${counts.pending} awaiting pickup`}
        />
        <StatCard label="In transit" value={isLoading ? "—" : counts.active} />
        <StatCard label="Delivered" value={isLoading ? "—" : counts.delivered} />
        <StatCard
          label={perms.includes("invoices.read") ? "Outstanding" : "Customers"}
          value={
            isLoading
              ? "—"
              : perms.includes("invoices.read")
                ? formatMoney(openInvoiceTotal)
                : (data?.customers.length ?? 0)
          }
        />
      </div>

      {perms.includes("analytics.read") && (
        <Panel title="Shipments by status">
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-2xl bg-secondary/60" />
          ) : byStatus.length === 0 ? (
            <AdminEmpty
              title="No data available yet"
              body="Once shipments are created, the status breakdown appears here."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Latest shipments"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/shipments">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        >
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : shipments.length === 0 ? (
            <AdminEmpty title="No shipments yet" body="Created consignments will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {shipments.slice(0, 6).map((s) => (
                <li
                  key={s.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="numeric truncate font-medium">{s.tracking_number}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.sender_city ?? "—"} → {s.receiver_city ?? "—"} · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <Chip label={statusLabel(s.status)} tone={toneForStatus(s.status)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {perms.includes("support.read") && (
          <Panel
            title="Open tickets"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/support">
                  View all <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          >
            {isLoading ? (
              <TableSkeleton rows={4} />
            ) : openTickets.length === 0 ? (
              <AdminEmpty title="Inbox clear" body="No open support tickets right now." />
            ) : (
              <ul className="divide-y divide-border">
                {openTickets.slice(0, 6).map((t) => (
                  <li
                    key={t.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.subject}</p>
                      <p className="numeric truncate text-sm text-muted-foreground">
                        {t.reference} · {formatDate(t.created_at)}
                      </p>
                    </div>
                    <Chip label={t.priority} tone={t.priority === "high" ? "danger" : "neutral"} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}
