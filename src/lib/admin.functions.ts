import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { ShipmentStatus } from "@/lib/logistics";

type Ctx = { supabase: SupabaseClient<Database>; userId: string };

export const PERMISSIONS = [
  "shipments.read",
  "shipments.write",
  "tracking.write",
  "customers.read",
  "invoices.read",
  "invoices.write",
  "support.read",
  "support.write",
  "flights.read",
  "flights.write",
  "cms.write",
  "analytics.read",
  "audit.read",
  "staff.manage",
  "settings.write",
  // Owner-only. Never granted to super_admin or below.
  "platform.manage",
  "admin.manage",
  "sessions.revoke",
  "security.read",
  "owner.only",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/** Permissions reserved to platform_owner. Mirrors public.has_permission(). */
export const OWNER_ONLY = [
  "platform.manage",
  "admin.manage",
  "sessions.revoke",
  "security.read",
  "owner.only",
] as const;

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  platform_owner: [...PERMISSIONS],
  // Client administrator: full business admin, no platform controls.
  super_admin: PERMISSIONS.filter((p) => !OWNER_ONLY.includes(p as (typeof OWNER_ONLY)[number])),
  admin: PERMISSIONS.filter(
    (p) => p !== "staff.manage" && !OWNER_ONLY.includes(p as (typeof OWNER_ONLY)[number]),
  ),
  operations: [
    "shipments.read",
    "shipments.write",
    "tracking.write",
    "customers.read",
    "flights.read",
    "flights.write",
    "analytics.read",
  ],
  support: [
    "support.read",
    "support.write",
    "customers.read",
    "shipments.read",
    "invoices.read",
    "flights.read",
  ],
  content_manager: ["cms.write"],
  staff: ["shipments.read"],
  customer: [],
};

export function permissionsForRoles(roles: string[]): Permission[] {
  const set = new Set<Permission>();
  for (const r of roles) for (const p of ROLE_PERMISSIONS[r] ?? []) set.add(p);
  return [...set];
}

async function rolesOf(context: Ctx): Promise<string[]> {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  return (data ?? []).map((r) => r.role as string);
}

/**
 * Server-side authorisation gate. This mirrors the database permission model —
 * RLS remains the real enforcement boundary, this just fails fast with a clear
 * error instead of returning empty result sets.
 */
async function requirePermission(context: Ctx, perm: Permission): Promise<string[]> {
  const roles = await rolesOf(context);
  if (!permissionsForRoles(roles).includes(perm)) {
    throw new Error(`Forbidden: ${perm} required`);
  }
  return roles;
}

/** Roles + derived permissions for the signed-in staff member. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await rolesOf(context);
    return { roles, permissions: permissionsForRoles(roles) };
  });

/* ------------------------------- DASHBOARD ------------------------------- */

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await rolesOf(context);
    const perms = permissionsForRoles(roles);
    if (perms.length === 0) throw new Error("Forbidden");

    const [shipments, tickets, flights, invoices, customers] = await Promise.all([
      perms.includes("shipments.read")
        ? context.supabase
            .from("shipments")
            .select(
              "id,status,created_at,tracking_number,receiver_city,receiver_country,sender_city,sender_country",
            )
            .order("created_at", { ascending: false })
            .limit(500)
        : Promise.resolve({ data: [] }),
      perms.includes("support.read")
        ? context.supabase
            .from("support_tickets")
            .select("id,status,priority,subject,reference,created_at")
            .order("created_at", { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [] }),
      perms.includes("flights.read")
        ? context.supabase
            .from("flight_bookings")
            .select("id,status,origin,destination,depart_date,reference,created_at")
            .order("created_at", { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [] }),
      perms.includes("invoices.read")
        ? context.supabase
            .from("invoices")
            .select("id,status,total,currency,invoice_number,created_at")
            .order("created_at", { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [] }),
      perms.includes("customers.read")
        ? context.supabase.from("profiles").select("id,created_at").limit(1000)
        : Promise.resolve({ data: [] }),
    ]);

    return {
      permissions: perms,
      roles,
      shipments: shipments.data ?? [],
      tickets: tickets.data ?? [],
      flights: flights.data ?? [],
      invoices: invoices.data ?? [],
      customers: customers.data ?? [],
    };
  });

/* ------------------------------- SHIPMENTS ------------------------------- */

export const getAdminShipments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "shipments.read");
    const { data } = await context.supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    return data ?? [];
  });

export const getShipmentDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { shipmentId: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "shipments.read");
    const [shipment, events] = await Promise.all([
      context.supabase.from("shipments").select("*").eq("id", data.shipmentId).maybeSingle(),
      context.supabase
        .from("tracking_events")
        .select("*")
        .eq("shipment_id", data.shipmentId)
        .order("occurred_at", { ascending: false }),
    ]);
    return { shipment: shipment.data, events: events.data ?? [] };
  });

export const updateShipmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      shipmentId: string;
      status: ShipmentStatus;
      location?: string | undefined;
      description?: string | undefined;
      estimated_delivery?: string | undefined;
      isPublic?: boolean | undefined;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await requirePermission(context, "tracking.write");

    const patch: Record<string, unknown> = { status: data.status };
    if (data.location) patch["current_location"] = data.location;
    if (data.estimated_delivery) patch["estimated_delivery"] = data.estimated_delivery;

    const { error: upErr } = await context.supabase
      .from("shipments")
      .update(patch as never)
      .eq("id", data.shipmentId);
    if (upErr) throw new Error(upErr.message);

    const { error: evErr } = await context.supabase.from("tracking_events").insert({
      shipment_id: data.shipmentId,
      status: data.status,
      location: data.location ?? null,
      description: data.description ?? null,
      is_public: data.isPublic ?? true,
      created_by: context.userId,
    });
    if (evErr) throw new Error(evErr.message);

    return { ok: true };
  });

export const createAdminShipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Record<string, unknown>) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "shipments.write");
    const { data: row, error } = await context.supabase
      .from("shipments")
      .insert(data as never)
      .select("id, tracking_number")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/* ------------------------------- CUSTOMERS ------------------------------- */

export const getAdminCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "customers.read");
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

/* --------------------------------- STAFF --------------------------------- */

export const assignStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetUserId: string; role: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "staff.manage");
    // assign_role() re-checks permission, blocks self-modification, and audits.
    const { error } = await context.supabase.rpc("assign_role", {
      _target: data.targetUserId,
      _role: data.role as Database["public"]["Enums"]["app_role"],
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetUserId: string; role: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "staff.manage");
    // revoke_role() blocks self-demotion and removal of the last super_admin.
    const { error } = await context.supabase.rpc("revoke_role", {
      _target: data.targetUserId,
      _role: data.role as Database["public"]["Enums"]["app_role"],
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------- INVOICES -------------------------------- */

export const getAdminInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "invoices.read");
    const [invoices, items] = await Promise.all([
      context.supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
      context.supabase.from("invoice_items").select("*"),
    ]);
    return { invoices: invoices.data ?? [], items: items.data ?? [] };
  });

export const saveInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string | undefined;
      user_id?: string | undefined;
      shipment_id?: string | undefined;
      status: string;
      currency: string;
      tax: number;
      notes?: string | undefined;
      due_at?: string | undefined;
      items: Array<{ description: string; quantity: number; unit_price: number }>;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await requirePermission(context, "invoices.write");

    const subtotal = data.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const total = subtotal + (data.tax || 0);

    let invoiceId = data.id;

    if (invoiceId) {
      const { error } = await context.supabase
        .from("invoices")
        .update({
          status: data.status,
          currency: data.currency,
          tax: data.tax,
          subtotal,
          total,
          notes: data.notes ?? null,
          due_at: data.due_at ?? null,
        })
        .eq("id", invoiceId);
      if (error) throw new Error(error.message);
      await context.supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    } else {
      const { data: num, error: numErr } = await context.supabase.rpc("next_invoice_number");
      if (numErr) throw new Error(numErr.message);
      const { data: row, error } = await context.supabase
        .from("invoices")
        .insert({
          invoice_number: num as unknown as string,
          user_id: data.user_id ?? null,
          shipment_id: data.shipment_id ?? null,
          status: data.status,
          currency: data.currency,
          tax: data.tax,
          subtotal,
          total,
          notes: data.notes ?? null,
          issued_at: new Date().toISOString().slice(0, 10),
          due_at: data.due_at ?? null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      invoiceId = row.id;
    }

    if (data.items.length > 0) {
      const { error } = await context.supabase.from("invoice_items").insert(
        data.items.map((i) => ({
          invoice_id: invoiceId!,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      );
      if (error) throw new Error(error.message);
    }

    return { ok: true, id: invoiceId };
  });

/* -------------------------------- SUPPORT --------------------------------- */

export const getAdminTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "support.read");
    const { data } = await context.supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    return data ?? [];
  });

export const getAdminTicketMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticketId: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "support.read");
    const { data: rows } = await context.supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true });
    return rows ?? [];
  });

export const replyToTicketAsStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticketId: string; body: string; isInternal?: boolean | undefined }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "support.write");
    const body = data.body.trim().slice(0, 5000);
    if (!body) throw new Error("Message cannot be empty");
    const { error } = await context.supabase.from("support_messages").insert({
      ticket_id: data.ticketId,
      sender_id: context.userId,
      body,
      is_internal: data.isInternal ?? false,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticketId: string; status: string; assignToMe?: boolean | undefined }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "support.write");
    const patch: Record<string, unknown> = { status: data.status };
    if (data.assignToMe) patch["assigned_to"] = context.userId;
    const { error } = await context.supabase
      .from("support_tickets")
      .update(patch as never)
      .eq("id", data.ticketId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------- FLIGHTS --------------------------------- */

export const getAdminFlights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "flights.read");
    const { data } = await context.supabase
      .from("flight_bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    return data ?? [];
  });

export const updateFlightStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      bookingId: string;
      status: string;
      quoted_amount?: number | undefined;
      staff_notes?: string | undefined;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await requirePermission(context, "flights.write");
    const patch: Record<string, unknown> = { status: data.status };
    if (data.quoted_amount != null) patch["quoted_amount"] = data.quoted_amount;
    if (data.staff_notes != null) patch["staff_notes"] = data.staff_notes;
    const { error } = await context.supabase
      .from("flight_bookings")
      .update(patch as never)
      .eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- CMS ----------------------------------- */

export const getAdminPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "cms.write");
    const { data } = await context.supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string | undefined;
      title: string;
      slug: string;
      excerpt?: string | undefined;
      body?: string | undefined;
      cover_image?: string | undefined;
      published: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await requirePermission(context, "cms.write");
    const payload = {
      title: data.title.trim().slice(0, 200),
      slug: data.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .slice(0, 120),
      excerpt: data.excerpt?.slice(0, 500) ?? null,
      body: data.body ?? null,
      cover_image: data.cover_image ?? null,
      published: data.published,
      published_at: data.published ? new Date().toISOString() : null,
      author_id: context.userId,
    };
    const { error } = data.id
      ? await context.supabase.from("blog_posts").update(payload).eq("id", data.id)
      : await context.supabase.from("blog_posts").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "cms.write");
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAdminSlides = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "cms.write");
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
      id?: string | undefined;
      title: string;
      kicker?: string | undefined;
      highlight?: string | undefined;
      copy?: string | undefined;
      image_url?: string | undefined;
      primary_label?: string | undefined;
      primary_url?: string | undefined;
      sort_order: number;
      active: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await requirePermission(context, "cms.write");
    const payload = {
      title: data.title.trim().slice(0, 160),
      kicker: data.kicker ?? null,
      highlight: data.highlight ?? null,
      copy: data.copy ?? null,
      image_url: data.image_url ?? null,
      primary_label: data.primary_label ?? null,
      primary_url: data.primary_url ?? null,
      sort_order: data.sort_order,
      active: data.active,
    };
    const { error } = data.id
      ? await context.supabase.from("hero_slides").update(payload).eq("id", data.id)
      : await context.supabase.from("hero_slides").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "cms.write");
    const { error } = await context.supabase.from("hero_slides").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------ AUDIT / SETTINGS --------------------------- */

export const getAdminAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "audit.read");
    const { data } = await context.supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    return data ?? [];
  });

export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePermission(context, "settings.write");
    const { data } = await context.supabase.from("site_settings").select("*");
    return data ?? [];
  });

export const saveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; value: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "settings.write");
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value as never, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------- PLATFORM OWNER (owner-only) -------------------------
 * Every function below re-checks authorisation server-side, and the underlying
 * SECURITY DEFINER routines re-check again in the database. Hiding the UI is a
 * convenience for the client admin, never the security boundary.
 * -------------------------------------------------------------------------- */

export type AdminAccount = {
  id: string;
  email: string | null;
  full_name: string | null;
  roles: string[];
  deactivated: boolean;
  access_revoked_at: string | null;
  created_at: string;
};

/** Owner-only: every account with a staff role, plus its security state. */
export const getAdminAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminAccount[]> => {
    await requirePermission(context, "admin.manage");

    const [profiles, roles, security] = await Promise.all([
      context.supabase.from("profiles").select("id,email,full_name,created_at").limit(1000),
      context.supabase.from("user_roles").select("user_id,role"),
      context.supabase.from("admin_security").select("user_id,deactivated,access_revoked_at"),
    ]);

    const roleMap = new Map<string, string[]>();
    for (const r of roles.data ?? []) {
      const list = roleMap.get(r.user_id) ?? [];
      list.push(r.role as string);
      roleMap.set(r.user_id, list);
    }
    const secMap = new Map((security.data ?? []).map((s) => [s.user_id, s] as const));

    return (profiles.data ?? [])
      .map((p) => {
        const userRoles = roleMap.get(p.id) ?? [];
        const sec = secMap.get(p.id);
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          roles: userRoles,
          deactivated: sec?.deactivated ?? false,
          access_revoked_at: sec?.access_revoked_at ?? null,
          created_at: p.created_at,
        };
      })
      .filter((a) => a.roles.some((r) => r !== "customer"));
  });

/** Owner-only: revoke an administrator's access (application-level). */
export const revokeAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetUserId: string; reason?: string | undefined }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "sessions.revoke");
    const { error } = await context.supabase.rpc("revoke_admin_access", {
      _target: data.targetUserId,
      _reason: data.reason ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Owner-only: restore a previously revoked administrator. */
export const restoreAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetUserId: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "sessions.revoke");
    const { error } = await context.supabase.rpc("restore_admin_access", {
      _target: data.targetUserId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * One-time ownership claim for the designated owner email. Safe to expose to any
 * authenticated user: the database rejects it unless the caller's own verified
 * auth email matches the designated owner AND no owner exists yet.
 */
export const claimPlatformOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_platform_ownership");
    if (error) throw new Error(error.message);
    return { ok: true, message: data as unknown as string };
  });

/**
 * Verifies the caller's session has not been revoked. Called by the admin shell
 * on load, so a revoked administrator loses the portal without waiting for their
 * access token to expire.
 */
export const verifyAdminSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const issuedAt =
      typeof context.claims["iat"] === "number"
        ? new Date((context.claims["iat"] as number) * 1000).toISOString()
        : null;
    const { data, error } = await context.supabase.rpc("check_admin_session", {
      _issued_at: issuedAt,
    });
    if (error) throw new Error(error.message);
    return { valid: data === true };
  });

/* ---------------------------------- PRICING ---------------------------------
 * Rates live in pricing_rules and quotes are computed by the quote_shipment
 * RPC, so no price is ever hardcoded in a component. Every mutation is audited
 * with before/after values by the pricing audit trigger.
 * -------------------------------------------------------------------------- */

export type PricingRule = {
  id: string;
  code: string;
  label: string;
  kind: string;
  service_type: string | null;
  destination_scope: string;
  base_amount: number;
  per_kg_amount: number;
  min_charge: number;
  currency: string;
  active: boolean;
  sort_order: number;
};

export const getPricingRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PricingRule[]> => {
    await requirePermission(context, "settings.write");
    const { data } = await context.supabase
      .from("pricing_rules")
      .select("*")
      .order("sort_order", { ascending: true });
    return (data ?? []) as unknown as PricingRule[];
  });

export const savePricingRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string | undefined;
      code: string;
      label: string;
      kind: string;
      service_type?: string | undefined;
      destination_scope: string;
      base_amount: number;
      per_kg_amount: number;
      min_charge: number;
      currency: string;
      active: boolean;
      sort_order: number;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await requirePermission(context, "settings.write");

    const nonNegative = [data.base_amount, data.per_kg_amount, data.min_charge];
    if (nonNegative.some((n) => !Number.isFinite(n) || n < 0)) {
      throw new Error("Amounts must be zero or greater.");
    }
    const code = data.code
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 60);
    if (!code) throw new Error("A rate code is required.");

    const payload = {
      code,
      label: data.label.trim().slice(0, 120),
      kind: data.kind,
      service_type: data.service_type?.trim() || null,
      destination_scope: data.destination_scope,
      base_amount: data.base_amount,
      per_kg_amount: data.per_kg_amount,
      min_charge: data.min_charge,
      currency: data.currency.trim().toUpperCase().slice(0, 3) || "GBP",
      active: data.active,
      sort_order: data.sort_order,
    };

    const { error } = data.id
      ? await context.supabase.from("pricing_rules").update(payload).eq("id", data.id)
      : await context.supabase.from("pricing_rules").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePricingRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePermission(context, "settings.write");
    const { error } = await context.supabase.from("pricing_rules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Live quote. Safe for any visitor: reads only active published rates. */
export const quoteShipment = createServerFn({ method: "GET" })
  .inputValidator((d: { service_type: string; weight_kg: number; international: boolean }) => ({
    service_type: String(d.service_type ?? "express").slice(0, 40),
    weight_kg: Math.min(Math.max(Number(d.weight_kg) || 0, 0), 100000),
    international: Boolean(d.international),
  }))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"];
    if (!key || !url) return null;
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: quote, error } = await client.rpc("quote_shipment", {
      _service_type: data.service_type,
      _weight_kg: data.weight_kg,
      _international: data.international,
    });
    if (error) {
      console.error("[pricing] quote failed:", error.message);
      return null;
    }
    return quote;
  });
