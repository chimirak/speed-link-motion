import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, MapPin, PackageX, LifeBuoy, MessageCircle } from "lucide-react";
import { getMyShipmentDetail } from "@/lib/portal.functions";
import {
  AdminEmpty,
  AdminError,
  Chip,
  TableSkeleton,
  toneForStatus,
} from "@/components/portal/admin-ui";
import { Button } from "@/components/ui/button";
import { statusLabel, serviceLabel, formatDate, formatDateTime } from "@/lib/logistics";
import { whatsappShipmentMessage, whatsappUrl } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/dashboard/shipments_/$shipmentId")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: ShipmentDetail,
});

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words font-medium">{value ?? "—"}</dd>
    </div>
  );
}

function ShipmentDetail() {
  const { shipmentId } = Route.useParams();
  const fetchDetail = useServerFn(getMyShipmentDetail);

  const query = useQuery({
    queryKey: ["shipment-detail", shipmentId],
    queryFn: () => fetchDetail({ data: { shipmentId } }),
    retry: false,
  });

  if (query.isLoading) return <TableSkeleton />;
  if (query.error) {
    return <AdminError error={query.error} onRetry={() => void query.refetch()} />;
  }

  // Null covers both "does not exist" and "belongs to someone else" — the server
  // never distinguishes the two, so no shipment ids can be probed from here.
  if (!query.data) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/shipments">
            <ArrowLeft className="size-3.5" /> Back to shipments
          </Link>
        </Button>
        <AdminEmpty
          title="Shipment not found"
          body="We couldn't find this shipment on your account. It may have been removed, or the link may be incorrect."
        />
      </div>
    );
  }

  const { shipment, events, invoices } = query.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/shipments">
            <ArrowLeft className="size-3.5" /> Back to shipments
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={whatsappUrl(whatsappShipmentMessage(shipment.tracking_number))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-3.5" /> WhatsApp support
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/support">
              <LifeBuoy className="size-3.5" /> Get help with this shipment
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Consignment</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="numeric font-display text-2xl font-extrabold">
            {shipment.tracking_number}
          </h1>
          <Chip label={statusLabel(shipment.status)} tone={toneForStatus(shipment.status)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border p-5">
            <h2 className="font-display text-sm font-bold tracking-wide uppercase">Summary</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <Row label="Service" value={serviceLabel(shipment.service_type)} />
              <Row label="Booked" value={formatDate(shipment.created_at)} />
              <Row label="Current location" value={shipment.current_location} />
              <Row label="Estimated delivery" value={formatDate(shipment.estimated_delivery)} />
              <Row label="Pieces" value={shipment.quantity} />
              <Row
                label="Weight"
                value={shipment.weight_kg != null ? `${shipment.weight_kg} kg` : null}
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-border p-5">
            <h2 className="font-display text-sm font-bold tracking-wide uppercase">Route</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <Row label="Sender" value={shipment.sender_name} />
              <Row label="Recipient" value={shipment.receiver_name} />
              <Row
                label="From"
                value={[shipment.sender_address, shipment.sender_city, shipment.sender_country]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Row
                label="To"
                value={[
                  shipment.receiver_address,
                  shipment.receiver_city,
                  shipment.receiver_country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </dl>
          </section>

          {shipment.description && (
            <section className="rounded-2xl border border-border p-5">
              <h2 className="font-display text-sm font-bold tracking-wide uppercase">Contents</h2>
              <p className="mt-3 text-sm text-muted-foreground">{shipment.description}</p>
            </section>
          )}

          {invoices.length > 0 && (
            <section className="rounded-2xl border border-border p-5">
              <h2 className="font-display text-sm font-bold tracking-wide uppercase">Invoices</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3">
                    <span className="numeric truncate">{inv.invoice_number}</span>
                    <span className="flex items-center gap-3">
                      <span className="numeric">
                        {inv.currency} {Number(inv.total).toFixed(2)}
                      </span>
                      <Chip label={inv.status} tone={toneForStatus(inv.status)} />
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/dashboard/invoices">View invoices</Link>
              </Button>
            </section>
          )}
        </div>

        <section className="rounded-2xl border border-border p-5">
          <h2 className="font-display text-sm font-bold tracking-wide uppercase">
            Tracking history
          </h2>

          {events.length === 0 ? (
            <div className="grid min-h-40 place-items-center text-center">
              <div>
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <PackageX className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-medium">No scan events yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Milestones appear here as your consignment moves through the network.
                </p>
              </div>
            </div>
          ) : (
            <ol className="mt-5">
              {events.map((ev, i) => (
                <li
                  key={ev.id}
                  className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4 pb-6 last:pb-0"
                >
                  {i < events.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-8 left-[15px] h-full w-px bg-border"
                    />
                  )}
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full border ${
                      i === 0
                        ? "border-primary/40 bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    <MapPin className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{statusLabel(ev.status)}</p>
                    <p className="text-sm text-muted-foreground">
                      {ev.location ?? ev.description ?? "—"}
                    </p>
                    <p className="numeric mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(ev.occurred_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
