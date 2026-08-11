# Database migrations

The live schema for the Speed Link Express Supabase project
(`pjifbmolvrbmfmcuknaw`) was applied in five ordered migrations:

1. `01_core_identity_and_permissions` — app_role/shipment_status enums, profiles,
   user_roles, `has_role()`, `has_permission()`, new-user bootstrap trigger.
2. `02_operational_tables` — shipments, tracking_events, invoices, invoice_items,
   support_tickets/messages, flight_bookings/passengers, blog, hero_slides,
   site_settings, notifications, audit_logs, plus indexes and constraints.
3. `03_rls_policies` — permission-scoped RLS on every table. No `USING(true)` on
   any table holding customer data; no blanket `is_staff()` authorization.
4. `04_public_tracking_audit_roles` — `track_shipment()` RPC for safe anonymous
   tracking, SECURITY DEFINER audit triggers, guarded `assign_role()` /
   `revoke_role()`, `next_invoice_number()`.
5. `05_storage_and_seed` — hero/blog/documents buckets with scoped policies and
   baseline site settings.

To pull the authoritative definitions into this folder, run:

    supabase link --project-ref pjifbmolvrbmfmcuknaw
    supabase db pull

The database is the source of truth for the applied state.
