import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  PackageCheck,
  MapPin,
  Warehouse,
  Plane,
  CheckCircle2,
  Loader2,
  PackageX,
  AlertCircle,
  Clock,
  Ban,
  PauseCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { trackShipment, type TrackingResult } from "@/lib/tracking.functions";
import { statusLabel, serviceLabel, formatDate, formatDateTime } from "@/lib/logistics";

const STATUS_ICON: Record<string, typeof MapPin> = {
  order_received: PackageCheck,
  pickup_scheduled: Clock,
  picked_up: PackageCheck,
  at_sorting_facility: Warehouse,
  in_transit: Plane,
  arrived_at_destination: MapPin,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  delivery_attempted: AlertCircle,
  on_hold: PauseCircle,
  cancelled: Ban,
};

type View =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; data: NonNullable<TrackingResult> }
  | { kind: "notfound"; code: string }
  | { kind: "error"; message: string };

function routeOf(s: NonNullable<TrackingResult>["shipment"]) {
  const from = [s.origin_city, s.origin_country].filter(Boolean).join(", ");
  const to = [s.destination_city, s.destination_country].filter(Boolean).join(", ");
  if (!from && !to) return null;
  return `${from || "—"} → ${to || "—"}`;
}

export function TrackingSearch() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = value.trim().toUpperCase();
    if (code.length < 5) {
      setError("Enter a tracking number with at least 5 characters.");
      return;
    }
    setError(null);
    setView({ kind: "loading" });
    try {
      const data = await trackShipment({ data: { trackingNumber: code } });
      setView(data ? { kind: "found", data } : { kind: "notfound", code });
    } catch {
      setView({
        kind: "error",
        message: "We couldn't reach the tracking service. Please try again in a moment.",
      });
    }
  };

  return (
    <section id="track" className="section-pad relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-[var(--gradient-speed)] opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <Reveal>
              <p className="text-xs tracking-[0.3em] text-primary uppercase">Live tracking</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                Know exactly where it is. Every second.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-md text-muted-foreground">
                Every consignment carries a live scan trail. Enter your tracking number for
                real-time status, current location and an accurate ETA.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <form onSubmit={onSubmit} className="mt-8" noValidate>
                <label htmlFor="tracking-number" className="sr-only">
                  Tracking number
                </label>
                <div className="flex flex-col gap-3 rounded-3xl surface-card p-3 sm:flex-row sm:items-center sm:rounded-full">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                    <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <input
                      id="tracking-number"
                      name="tracking"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="e.g. SLE-4471-GB"
                      autoComplete="off"
                      aria-describedby="tracking-help"
                      aria-invalid={error ? true : undefined}
                      className="numeric h-12 w-full min-w-0 bg-transparent text-base text-foreground uppercase placeholder:text-muted-foreground placeholder:normal-case focus:outline-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="speed"
                    size="pill"
                    className="sm:min-w-36"
                    disabled={view.kind === "loading"}
                  >
                    {view.kind === "loading" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Tracking…
                      </>
                    ) : (
                      "Track parcel"
                    )}
                  </Button>
                </div>
                <p id="tracking-help" className="mt-3 pl-1 text-xs text-muted-foreground">
                  UK consignments start SLX, international start SLE.
                </p>
                <p role="status" aria-live="polite" className="min-h-5 pl-1 text-xs text-primary">
                  {error}
                </p>
              </form>
            </Reveal>
          </div>

          <Reveal direction="left" delay={0.1}>
            <div className="relative rounded-[2rem] surface-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
              {view.kind === "idle" && (
                <div className="grid min-h-64 place-items-center text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <Search className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-medium">Track a consignment</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enter your tracking number to see its live journey.
                    </p>
                  </div>
                </div>
              )}

              {view.kind === "loading" && (
                <div className="space-y-6" aria-busy="true">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-44" />
                    </div>
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view.kind === "notfound" && (
                <div className="grid min-h-64 place-items-center text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <PackageX className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-medium">No consignment found</p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                      We couldn&apos;t find{" "}
                      <span className="numeric font-medium text-foreground">{view.code}</span>.
                      Check the reference and try again, or contact support.
                    </p>
                  </div>
                </div>
              )}

              {view.kind === "error" && (
                <div className="grid min-h-64 place-items-center text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                      <AlertCircle className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-medium">Tracking unavailable</p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">{view.message}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setView({ kind: "idle" })}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              )}

              {view.kind === "found" && (
                <>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-xs tracking-widest text-muted-foreground uppercase">
                        Consignment
                      </p>
                      <p className="numeric truncate text-xl font-semibold">
                        {view.data.shipment.tracking_number}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
                      {statusLabel(view.data.shipment.status)}
                    </span>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-4 text-sm">
                    {routeOf(view.data.shipment) && (
                      <div className="col-span-2 min-w-0">
                        <dt className="text-xs text-muted-foreground">Route</dt>
                        <dd className="truncate font-medium">{routeOf(view.data.shipment)}</dd>
                      </div>
                    )}
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Current location</dt>
                      <dd className="truncate font-medium">
                        {view.data.shipment.current_location ?? "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Estimated delivery</dt>
                      <dd className="truncate font-medium">
                        {formatDate(view.data.shipment.estimated_delivery)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Service</dt>
                      <dd className="truncate font-medium">
                        {serviceLabel(view.data.shipment.service_type)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Pieces</dt>
                      <dd className="numeric truncate font-medium">
                        {view.data.shipment.quantity}
                        {view.data.shipment.weight_kg != null &&
                          ` · ${view.data.shipment.weight_kg} kg`}
                      </dd>
                    </div>
                  </dl>

                  {view.data.events.length === 0 ? (
                    <p className="mt-8 text-sm text-muted-foreground">
                      This consignment has been booked. Scan milestones will appear here as it moves
                      through our network.
                    </p>
                  ) : (
                    <ol className="mt-8 space-y-0">
                      <AnimatePresence initial={false}>
                        {[...view.data.events].reverse().map((ev, i, arr) => {
                          const Icon = STATUS_ICON[ev.status] ?? MapPin;
                          const isLatest = i === 0;
                          return (
                            <motion.li
                              key={ev.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.06 * i,
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 pb-7 last:pb-0"
                            >
                              {i < arr.length - 1 && (
                                <span
                                  aria-hidden="true"
                                  className="absolute top-9 left-[17px] h-full w-px bg-border"
                                />
                              )}
                              <span
                                className={`grid size-9 shrink-0 place-items-center rounded-full border ${
                                  isLatest
                                    ? "border-primary/40 bg-primary text-primary-foreground"
                                    : "border-border bg-secondary text-muted-foreground"
                                }`}
                              >
                                <Icon className="size-4" aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium">
                                  {statusLabel(ev.status)}
                                </span>
                                <span className="block truncate text-sm text-muted-foreground">
                                  {ev.location ?? ev.description ?? "—"}
                                </span>
                              </span>
                              <span className="numeric shrink-0 text-right text-xs text-muted-foreground">
                                {formatDateTime(ev.occurred_at)}
                              </span>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </ol>
                  )}
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
