export const SHIPMENT_STATUSES = [
  "order_received",
  "pickup_scheduled",
  "picked_up",
  "at_sorting_facility",
  "in_transit",
  "arrived_at_destination",
  "out_for_delivery",
  "delivered",
  "delivery_attempted",
  "on_hold",
  "cancelled",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  order_received: "Order received",
  pickup_scheduled: "Pickup scheduled",
  picked_up: "Picked up",
  at_sorting_facility: "At sorting facility",
  in_transit: "In transit",
  arrived_at_destination: "Arrived at destination",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delivery_attempted: "Delivery attempted",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export const SERVICE_TYPES = [
  { value: "same_day", label: "Same-day dedicated" },
  { value: "next_day", label: "UK next day" },
  { value: "express", label: "International express" },
  { value: "economy", label: "Economy air" },
  { value: "freight", label: "Road freight & pallets" },
  { value: "ocean", label: "Ocean FCL / LCL" },
] as const;

export function serviceLabel(value: string) {
  return SERVICE_TYPES.find((s) => s.value === value)?.label ?? value;
}

/** Human-readable, non-sequential consignment reference. */
export function generateTrackingNumber(international = false) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let block = "";
  for (let i = 0; i < 6; i += 1) {
    block += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${international ? "SLE" : "SLX"}-${digits}-${block}`;
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(value?: number | null, currency = "GBP") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value);
}
