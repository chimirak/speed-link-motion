import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Throws unless the caller holds a staff role. Uses the caller's own client (RLS). */
async function assertStaff(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  const staff = ["super_admin", "admin", "operations", "support", "content_manager", "staff"];
  if (!roles.some((r: string) => staff.includes(r))) throw new Error("Forbidden");
  return roles as string[];
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const [shipments, tickets, flights, invoices, posts] = await Promise.all([
      context.supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      context.supabase
        .from("flight_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      context.supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      context.supabase
        .from("blog_posts")
        .select("id, title, slug, published, published_at, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    return {
      shipments: shipments.data ?? [],
      tickets: tickets.data ?? [],
      flights: flights.data ?? [],
      invoices: invoices.data ?? [],
      posts: posts.data ?? [],
    };
  });

export const getAdminCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const [profiles, roles] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    return { profiles: profiles.data ?? [], roles: roles.data ?? [] };
  });

export const updateShipmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { shipmentId: string; status: string; location?: string; description?: string }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);

    const { error } = await context.supabase
      .from("shipments")
      .update({
        status: data.status,
        current_location: data.location || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.shipmentId);
    if (error) throw new Error(error.message);

    await context.supabase.from("tracking_events").insert({
      shipment_id: data.shipmentId,
      status: data.status,
      location: data.location || null,
      description: data.description || null,
      created_by: context.userId,
    });

    const { data: shipment } = await context.supabase
      .from("shipments")
      .select("user_id, tracking_number")
      .eq("id", data.shipmentId)
      .maybeSingle();

    if (shipment?.user_id) {
      await context.supabase.from("notifications").insert({
        user_id: shipment.user_id,
        title: `${shipment.tracking_number} status updated`,
        body: data.description || data.status,
        link: `/tracking?ref=${shipment.tracking_number}`,
      });
    }

    await context.supabase.from("audit_logs").insert({
      actor_id: context.userId,
      action: "shipment.status_updated",
      entity: "shipments",
      entity_id: data.shipmentId,
      metadata: { status: data.status },
    });

    return { ok: true };
  });

export const getAdminAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data } = await context.supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const getAdminPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data } = await context.supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      slug: string;
      title: string;
      excerpt?: string;
      body?: string;
      cover_image?: string;
      published: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const payload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      body: data.body ?? null,
      cover_image: data.cover_image ?? null,
      published: data.published,
      published_at: data.published ? new Date().toISOString() : null,
      author_id: context.userId,
      updated_at: new Date().toISOString(),
    };
    const query = data.id
      ? context.supabase.from("blog_posts").update(payload).eq("id", data.id)
      : context.supabase.from("blog_posts").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAdminSlides = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data } = await context.supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });
    return data ?? [];
  });

export const saveSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      kicker?: string;
      title: string;
      highlight?: string;
      copy?: string;
      image_url?: string;
      sort_order?: number;
      active: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...payload } = data;
    const query = id
      ? context.supabase
          .from("hero_slides")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", id)
      : context.supabase.from("hero_slides").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticketId: string; status: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("support_tickets")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.ticketId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateFlightStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bookingId: string; status: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("flight_bookings")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
