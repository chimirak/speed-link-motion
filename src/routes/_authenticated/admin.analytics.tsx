import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminOverview } from "@/lib/admin.functions";
import { Panel, StatCard } from "@/components/portal/portal-shell";
import { AdminEmpty, AdminError } from "@/components/portal/admin-ui";
import { formatMoney, statusLabel } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalytics,
});

const tooltipStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--border)",
  background: "var(--background)",
  fontSize: "0.8rem",
};

function AdminAnalytics() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    retry: false,
  });

  const shipments = useMemo(() => data?.shipments ?? [], [data]);

  /** Shipments created per day over the last 30 days. */
  const overTime = useMemo(() => {
    if (shipments.length === 0) return [];
    const days: { date: string; label: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        count: 0,
      });
    }
    const index = new Map(days.map((d) => [d.date, d]));
    for (const s of shipments) {
      const key = String(s.created_at).slice(0, 10);
      const bucket = index.get(key);
      if (bucket) bucket.count += 1;
    }
    return days;
  }, [shipments]);

  const hasTimeData = overTime.some((d) => d.count > 0);

  const deliveredRate = useMemo(() => {
    if (shipments.length === 0) return 0;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    return Math.round((delivered / shipments.length) * 100);
  }, [shipments]);

  const invoiceTotals = useMemo(() => {
    const invoices = data?.invoices ?? [];
    const paid = invoices
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + Number(i.total ?? 0), 0);
    const open = invoices
      .filter((i) => !["paid", "cancelled"].includes(i.status))
      .reduce((s, i) => s + Number(i.total ?? 0), 0);
    return { paid, open };
  }, [data]);

  const topDestinations = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of shipments) {
      const key = s.receiver_country || s.receiver_city;
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [shipments]);

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total shipments" value={isLoading ? "—" : shipments.length} />
        <StatCard label="Delivery rate" value={isLoading ? "—" : `${deliveredRate}%`} />
        <StatCard
          label="Invoiced (paid)"
          value={isLoading ? "—" : formatMoney(invoiceTotals.paid)}
        />
        <StatCard label="Outstanding" value={isLoading ? "—" : formatMoney(invoiceTotals.open)} />
      </div>

      <Panel title="Shipments over the last 30 days">
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-secondary/60" />
        ) : !hasTimeData ? (
          <AdminEmpty
            title="No data available yet"
            body="Volume trends appear once shipments are created."
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overTime} margin={{ top: 8, right: 12, bottom: 4, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top destinations">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
          ) : topDestinations.length === 0 ? (
            <AdminEmpty
              title="No data available yet"
              body="Destination mix appears once shipments exist."
            />
          ) : (
            <ul className="divide-y divide-border">
              {topDestinations.map(([place, count]) => (
                <li key={place} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
                  <span className="truncate">{place}</span>
                  <span className="numeric font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Status mix">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
          ) : shipments.length === 0 ? (
            <AdminEmpty
              title="No data available yet"
              body="Status mix appears once shipments exist."
            />
          ) : (
            <ul className="divide-y divide-border">
              {[
                ...shipments.reduce(
                  (m, s) => m.set(s.status, (m.get(s.status) ?? 0) + 1),
                  new Map<string, number>(),
                ),
              ]
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <li key={status} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
                    <span className="truncate">{statusLabel(status)}</span>
                    <span className="numeric font-medium">{count}</span>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
