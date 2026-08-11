import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateTrackingNumber } from "@/lib/logistics";

/** Drops undefined keys so inserts satisfy exactOptionalPropertyTypes. */
function clean<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]-?: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]-?: Exclude<T[K], undefined>;
  };
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return (data ?? []).map((r) => r.role as string);
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { full_name?: string | undefined; phone?: string | undefined; company?: string }) => d,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.full_name?.slice(0, 120) ?? null,
        phone: data.phone?.slice(0, 40) ?? null,
        company: data.company?.slice(0, 120) ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [shipments, invoices, tickets, notifications] = await Promise.all([
      context.supabase
        .from("shipments")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(50),
      context.supabase
        .from("invoices")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(20),
      context.supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(20),
      context.supabase
        .from("notifications")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    return {
      shipments: shipments.data ?? [],
      invoices: invoices.data ?? [],
      tickets: tickets.data ?? [],
      notifications: notifications.data ?? [],
    };
  });

export const getMyShipments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("shipments")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export type ShipmentInput = {
  service_type: string;
  sender_name: string;
  sender_phone?: string | undefined;
  sender_email?: string | undefined;
  sender_address?: string | undefined;
  sender_city?: string | undefined;
  sender_country?: string | undefined;
  sender_postal_code?: string | undefined;
  receiver_name: string;
  receiver_phone?: string | undefined;
  receiver_email?: string | undefined;
  receiver_address?: string | undefined;
  receiver_city?: string | undefined;
  receiver_country?: string | undefined;
  receiver_postal_code?: string | undefined;
  package_type?: string | undefined;
  description?: string | undefined;
  weight_kg?: number | undefined;
  length_cm?: number | undefined;
  width_cm?: number | undefined;
  height_cm?: number | undefined;
  quantity?: number | undefined;
  declared_value?: number | undefined;
  pickup_date?: string | undefined;
  pickup_time?: string | undefined;
  special_instructions?: string | undefined;
};

export const createShipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: ShipmentInput) => d)
  .handler(async ({ data, context }) => {
    const international =
      (data.receiver_country ?? "").trim().toLowerCase() !== "united kingdom" &&
      (data.receiver_country ?? "").trim().toUpperCase() !== "UK";
    const tracking_number = generateTrackingNumber(international);

    const { data: row, error } = await context.supabase
      .from("shipments")
      .insert({
        ...clean(data),
        quantity: data.quantity ?? 1,
        tracking_number,
        user_id: context.userId,
        status: "order_received",
        current_location: data.sender_city ?? null,
      })
      .select("id, tracking_number")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("tracking_events").insert({
      shipment_id: row.id,
      status: "order_received",
      location: data.sender_city ?? null,
      description: "Booking received and awaiting collection.",
      created_by: context.userId,
    });

    await context.supabase.from("notifications").insert({
      user_id: context.userId,
      title: `Booking confirmed — ${row.tracking_number}`,
      body: "A coordinator will confirm collection within 30 minutes.",
      link: `/tracking?ref=${row.tracking_number}`,
    });

    return row;
  });

export const getMyAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("addresses")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const saveAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      label?: string | undefined;
      contact_name: string;
      phone?: string | undefined;
      email?: string | undefined;
      line1: string;
      line2?: string | undefined;
      city: string;
      postal_code?: string | undefined;
      country: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("addresses")
      .insert({ ...clean(data), user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("addresses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: tickets } = await context.supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return tickets ?? [];
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { subject: string; body: string; priority?: string }) => d)
  .handler(async ({ data, context }) => {
    const reference = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .insert({
        reference,
        user_id: context.userId,
        subject: data.subject.slice(0, 160),
        priority: data.priority ?? "normal",
      })
      .select("id, reference")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: context.userId,
      body: data.body.slice(0, 4000),
    });
    return ticket;
  });

export const getTicketMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticketId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: messages } = await context.supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true });
    return messages ?? [];
  });

export const replyToTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticketId: string; body: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("support_messages").insert({
      ticket_id: data.ticketId,
      sender_id: context.userId,
      body: data.body.slice(0, 4000),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const getMyFlightBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("flight_bookings")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const createFlightBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      trip_type: string;
      origin: string;
      destination: string;
      depart_date: string;
      return_date?: string | null;
      adults: number;
      children: number;
      infants: number;
      cabin_class: string;
      contact_name?: string | undefined;
      contact_email?: string | undefined;
      contact_phone?: string | undefined;
      notes?: string | undefined;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const reference = `FLT-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data: row, error } = await context.supabase
      .from("flight_bookings")
      .insert({ ...clean(data), reference, user_id: context.userId })
      .select("id, reference")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", context.userId)
      .eq("read", false);
    return { ok: true };
  });

/**
 * A single shipment owned by the caller, plus its public tracking timeline.
 *
 * Ownership is filtered here AND enforced by RLS, so a customer passing another
 * customer's shipment id simply gets null rather than someone else's record.
 * Internal notes are deliberately not selected.
 */
export const getMyShipmentDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { shipmentId: string }) => ({
    shipmentId: String(d.shipmentId ?? "").slice(0, 60),
  }))
  .handler(async ({ data, context }) => {
    const { data: shipment } = await context.supabase
      .from("shipments")
      .select(
        "id,tracking_number,status,service_type,sender_name,sender_phone,sender_address,sender_city,sender_country,receiver_name,receiver_phone,receiver_address,receiver_city,receiver_country,package_type,description,weight_kg,quantity,declared_value,pickup_date,estimated_delivery,current_location,created_at,updated_at",
      )
      .eq("id", data.shipmentId)
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!shipment) return null;

    const { data: events } = await context.supabase
      .from("tracking_events")
      .select("id,status,location,description,occurred_at")
      .eq("shipment_id", shipment.id)
      .eq("is_public", true)
      .order("occurred_at", { ascending: false });

    const { data: invoices } = await context.supabase
      .from("invoices")
      .select("id,invoice_number,status,total,currency,issued_at")
      .eq("shipment_id", shipment.id)
      .eq("user_id", context.userId);

    return { shipment, events: events ?? [], invoices: invoices ?? [] };
  });
