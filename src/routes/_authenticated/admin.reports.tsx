import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { getAdminOverview } from "@/lib/admin.functions";
import { Panel } from "@/components/portal/portal-shell";
import { AdminEmpty, AdminError, Field, inputClass } from "@/components/portal/admin-ui";
import { formatMoney, statusLabel } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/reports")({ component: AdminReports });

type ReportKind = "shipments" | "invoices" | "tickets";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join(
    "\n",
  );
}

function AdminReports() {
  const fetchOverview = useServerFn(getAdminOverview);
  const [kind, setKind] = useState<ReportKind>("shipments");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    retry: false,
  });

  const rows = useMemo(() => {
    const inRange = (iso: string) => {
      const d = String(iso).slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    };
    if (kind === "shipments") {
      return (data?.shipments ?? [])
        .filter((s) => inRange(s.created_at))
        .map((s) => ({
          tracking_number: s.tracking_number,
          status: statusLabel(s.status),
          origin: s.sender_city ?? "",
          destination: s.receiver_city ?? "",
          created_at: String(s.created_at).slice(0, 10),
        }));
    }
    if (kind === "invoices") {
      return (data?.invoices ?? [])
        .filter((i) => inRange(i.created_at))
        .map((i) => ({
          invoice_number: i.invoice_number,
          status: i.status,
          total: Number(i.total ?? 0),
          currency: i.currency,
          created_at: String(i.created_at).slice(0, 10),
        }));
    }
    return (data?.tickets ?? [])
      .filter((t) => inRange(t.created_at))
      .map((t) => ({
        reference: t.reference,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        created_at: String(t.created_at).slice(0, 10),
      }));
  }, [data, kind, from, to]);

  function download() {
    const csv = toCsv(rows as Record<string, unknown>[]);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speedlink-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  const totalValue =
    kind === "invoices" ? (rows as { total: number }[]).reduce((s, r) => s + r.total, 0) : null;

  return (
    <Panel
      title="Reports"
      action={
        <Button size="sm" onClick={download} disabled={rows.length === 0}>
          <Download className="size-4" /> Export CSV
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Field label="Report">
          <select
            className={inputClass}
            value={kind}
            onChange={(e) => setKind(e.target.value as ReportKind)}
          >
            <option value="shipments">Shipments</option>
            <option value="invoices">Invoices</option>
            <option value="tickets">Support tickets</option>
          </select>
        </Field>
        <Field label="From">
          <input
            type="date"
            className={inputClass}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            className={inputClass}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
      ) : rows.length === 0 ? (
        <AdminEmpty
          title="No data available yet"
          body="No records match this report and date range."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {rows.length} record{rows.length === 1 ? "" : "s"}
            {totalValue != null ? ` · ${formatMoney(totalValue)} total` : ""}
          </p>
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  {Object.keys(rows[0]!).map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
                    >
                      {h.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rows as Record<string, unknown>[]).slice(0, 100).map((r, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    {Object.keys(rows[0]!).map((h) => (
                      <td key={h} className="px-3 py-3">
                        {String(r[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 100 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Showing the first 100 rows — export the CSV for the full set.
            </p>
          )}
        </>
      )}
    </Panel>
  );
}
