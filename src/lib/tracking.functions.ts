import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type TrackingResult = {
  shipment: {
    tracking_number: string;
    status: string;
    service_type: string;
    sender_city: string | null;
    sender_country: string | null;
    receiver_city: string | null;
    receiver_country: string | null;
    current_location: string | null;
    estimated_delivery: string | null;
    weight_kg: number | null;
    quantity: number;
    package_type: string | null;
    created_at: string;
  };
  events: Array<{
    id: string;
    status: string;
    location: string | null;
    description: string | null;
    occurred_at: string;
  }>;
} | null;

export const trackShipment = createServerFn({ method: "GET" })
  .inputValidator((data: { trackingNumber: string }) => ({
    trackingNumber: String(data.trackingNumber ?? "")
      .trim()
      .toUpperCase()
      .slice(0, 40),
  }))
  .handler(async ({ data }): Promise<TrackingResult> => {
    if (data.trackingNumber.length < 5) return null;
    const supabase = publicClient();

    const { data: shipment } = await supabase
      .from("shipments")
      .select(
        "id, tracking_number, status, service_type, sender_city, sender_country, receiver_city, receiver_country, current_location, estimated_delivery, weight_kg, quantity, package_type, created_at",
      )
      .eq("tracking_number", data.trackingNumber)
      .maybeSingle();

    if (!shipment) return null;

    const { data: events } = await supabase
      .from("tracking_events")
      .select("id, status, location, description, occurred_at")
      .eq("shipment_id", shipment.id)
      .order("occurred_at", { ascending: true });

    const { id: _id, ...rest } = shipment;
    return { shipment: rest, events: events ?? [] };
  });
