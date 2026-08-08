import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyFlightBookings } from "@/lib/portal.functions";
import { EmptyState, Panel, StatusPill } from "@/components/portal/portal-shell";
import { formatDate } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/dashboard/flights")({
  component: FlightsPage,
});

function FlightsPage() {
  const list = useServerFn(getMyFlightBookings);
  const { data, isLoading } = useQuery({ queryKey: ["flight-bookings"], queryFn: () => list() });

  return (
    <Panel title="Flight bookings">
      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-secondary" />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No travel booked"
          body="Requests made from the flight booking page appear here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {(data ?? []).map((b) => (
            <li key={b.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {b.origin} → {b.destination}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(b.depart_date)}
                  {b.return_date ? ` · returning ${formatDate(b.return_date)}` : ""} ·{" "}
                  {b.cabin_class}
                </p>
              </div>
              <StatusPill label={b.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
