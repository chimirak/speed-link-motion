import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyShipments } from "@/lib/portal.functions";
import { EmptyState, Panel, StatusPill } from "@/components/portal/portal-shell";
import { formatDate, serviceLabel, statusLabel } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/dashboard/shipments")({
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const fetchShipments = useServerFn(getMyShipments);
  const { data, isLoading } = useQuery({
    queryKey: ["my-shipments"],
    queryFn: () => fetchShipments(),
  });

  return (
    <Panel title="Shipment history">
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-secondary" />
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No shipments yet" body="Bookings you make will be listed here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                <th className="py-3 pr-4 font-medium">Tracking</th>
                <th className="py-3 pr-4 font-medium">Route</th>
                <th className="py-3 pr-4 font-medium">Service</th>
                <th className="py-3 pr-4 font-medium">Booked</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 font-medium sr-only">Details</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border last:border-b-0">
                  <td className="numeric py-4 pr-4 font-medium">{s.tracking_number}</td>
                  <td className="py-4 pr-4 text-muted-foreground">
                    {s.sender_city ?? "—"} → {s.receiver_city ?? "—"}
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">
                    {serviceLabel(s.service_type)}
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">{formatDate(s.created_at)}</td>
                  <td className="py-4 pr-4">
                    <StatusPill label={statusLabel(s.status)} />
                  </td>
                  <td className="py-4">
                    <Link
                      to="/dashboard/shipments/$shipmentId"
                      params={{ shipmentId: s.id }}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
