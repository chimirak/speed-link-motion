import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Anonymous Supabase client. It carries only the publishable key, and RLS
 * denies `anon` on the shipments table outright. Public tracking therefore goes
 * exclusively through the `track_shipment` RPC, a SECURITY DEFINER function that
 * returns a whitelisted projection: no names, phones, emails, addresses or
 * internal notes ever cross this boundary.
 */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
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

export type PublicTrackingEvent = {
  id: string;
  status: string;
  location: string | null;
  description: string | null;
  occurred_at: string;
};

export type PublicShipment = {
  tracking_number: string;
  status: string;
  service_type: string;
  origin_city: string | null;
  origin_country: string | null;
  destination_city: string | null;
  destination_country: string | null;
  current_location: string | null;
  estimated_delivery: string | null;
  package_type: string | null;
  weight_kg: number | null;
  quantity: number;
  created_at: string;
};

export type TrackingResult = {
  shipment: PublicShipment;
  events: PublicTrackingEvent[];
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
    const { data: result, error } = await supabase.rpc("track_shipment", {
      _tracking_number: data.trackingNumber,
    });

    if (error) {
      console.error("[tracking] lookup failed:", error.message);
      throw new Error("We could not reach the tracking service. Please try again.");
    }
    if (!result) return null;
    return result as unknown as TrackingResult;
  });
