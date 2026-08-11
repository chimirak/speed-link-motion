# Database migrations

Live schema for Supabase project `pjifbmolvrbmfmcuknaw`.

## Applied migrations

1. `01_core_identity_and_permissions` — enums, profiles, user_roles,
   `has_role()`, `has_permission()`, new-user bootstrap trigger.
2. `02_operational_tables` — shipments, tracking_events, invoices, support,
   flights, CMS, settings, notifications, audit_logs, indexes, constraints.
3. `03_rls_policies` — permission-scoped RLS on every table.
4. `04_public_tracking_audit_roles` — `track_shipment()` RPC, audit triggers,
   guarded `assign_role()` / `revoke_role()`, `next_invoice_number()`.
5. `05_storage_and_seed` — hero/blog/documents buckets, baseline settings.
6. `06_add_platform_owner_role` — adds `platform_owner` to `app_role`.
7. `07_platform_owner_authorization` — owner permissions, `is_platform_owner()`,
   hardened role assignment, triggers protecting the owner's roles and profile.
8. `08_admin_sessions_and_owner_bootstrap` — `admin_security` table,
   `check_admin_session()`, `revoke_admin_access()`, `restore_admin_access()`,
   one-time `claim_platform_ownership()`.
9. `09_tighten_user_roles_grants` — removes redundant write grants on
   `user_roles`, `admin_security` and `audit_logs` (defence in depth).

## Role hierarchy

    platform_owner  -> all business permissions + platform.manage, admin.manage,
                       sessions.revoke, security.read, owner.only
    super_admin     -> all business permissions (client administrator)
    admin           -> business permissions, no staff.manage
    operations / support / content_manager / staff -> scoped subsets
    customer        -> own records only

Owner-only permissions are never granted to super_admin or below. The designated
owner email is stored in `site_settings.platform_owner_email` (non-public), and
is used only to gate the one-time ownership claim — never as an authorisation
mechanism on its own.

To sync definitions locally:

    supabase link --project-ref pjifbmolvrbmfmcuknaw
    supabase db pull
