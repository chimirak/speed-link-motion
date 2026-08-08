import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateTrackingNumber } from "@/lib/logistics";

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
  .inputValidator((d: { full_name?: string; phone?: string; company?: string }) => d)
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
  sender_phone?: string;
  sender_email?: string;
  sender_address?: string;
  sender_city?: string;
  sender_country?: string;
  sender_postal_code?: string;
  receiver_name: string;
  receiver_phone?: string;
  receiver_email?: string;
  receiver_address?: string;
  receiver_city?: string;
  receiver_country?: string;
  receiver_postal_code?: string;
  package_type?: string;
  description?: string;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  quantity?: number;
  declared_value?: number;
  pickup_date?: string;
  pickup_time?: string;
  special_instructions?: string;
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
        ...data,
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
      label?: string;
      contact_name: string;
      phone?: string;
      email?: string;
      line1: string;
      line2?: string;
      city: string;
      postal_code?: string;
      country: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("addresses")
      .insert({ ...data, user_id: context.userId });
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
      contact_name?: string;
      contact_email?: string;
      contact_phone?: string;
      notes?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const reference = `FLT-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data: row, error } = await context.supabase
      .from("flight_bookings")
      .insert({ ...data, reference, user_id: context.userId })
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
