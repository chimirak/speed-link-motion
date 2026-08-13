import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import {
  BarChart3,
  FileText,
  Image,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Newspaper,
  Package,
  Plane,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { ConsoleShell, type ConsoleNavItem } from "@/components/portal/console-shell";
import { getMyAccess, verifyAdminSession, type Permission } from "@/lib/admin.functions";
import { AdminError, Spinner } from "@/components/portal/admin-ui";

/**
 * Every admin nav entry declares the permission it needs. The list is filtered
 * against the caller's real permissions (resolved server-side from user_roles),
 * so an operations user simply never sees Blog or Staff. This is presentation
 * only — the server functions and RLS are the actual enforcement boundary.
 */
type AdminNavItem = ConsoleNavItem & { permission: Permission };

const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "shipments.read" },
  { to: "/admin/shipments", label: "Shipments", icon: Package, permission: "shipments.read" },
  { to: "/admin/tracking", label: "Tracking desk", icon: MapPin, permission: "tracking.write" },
  { to: "/admin/customers", label: "Customers", icon: Users, permission: "customers.read" },
  { to: "/admin/invoices", label: "Invoices", icon: ReceiptText, permission: "invoices.read" },
  { to: "/admin/flights", label: "Flight bookings", icon: Plane, permission: "flights.read" },
  { to: "/admin/support", label: "Support", icon: LifeBuoy, permission: "support.read" },
  { to: "/admin/blog", label: "Blog CMS", icon: Newspaper, permission: "cms.write" },
  { to: "/admin/hero", label: "Hero slider", icon: Image, permission: "cms.write" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "analytics.read" },
  { to: "/admin/reports", label: "Reports", icon: FileText, permission: "analytics.read" },
  { to: "/admin/staff", label: "Staff & roles", icon: ShieldCheck, permission: "staff.manage" },
  { to: "/admin/audit-logs", label: "Audit logs", icon: ScrollText, permission: "audit.read" },
  { to: "/admin/pricing", label: "Pricing", icon: Tags, permission: "settings.write" },
  { to: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.write" },
];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Operations Portal — Speed Link Express" }] }),
  component: AdminLayout,
});

/** Roles ordered most- to least-privileged, for the sidebar badge. */
const ROLE_LABELS: Record<string, string> = {
  platform_owner: "Platform owner",
  super_admin: "Super admin",
  admin: "Admin",
  operations: "Operations",
  support: "Support",
  content_manager: "Content",
  staff: "Staff",
};

function AdminLayout() {
  const navigate = useNavigate();
  const fetchAccess = useServerFn(getMyAccess);
  const checkSession = useServerFn(verifyAdminSession);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => fetchAccess(),
    retry: false,
    staleTime: 60_000,
  });

  // A revoked administrator loses the portal on their next request, without
  // waiting for the access token to expire. Enforced server-side.
  const session = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => checkSession(),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
  const revoked = session.data?.valid === false;

  const pathname = useRouterState({ select: (st) => st.location.pathname });
  // Owner territory gets its own visual authority signal.

  const permissions = data?.permissions ?? [];
  const isStaff = permissions.length > 0;

  // Portals never redirect into one another. A non-staff visitor is denied
  // here, inside the console, with no route out to the customer portal.

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Spinner /> Verifying access…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24">
        <AdminError error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (revoked) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="max-w-sm">
          <p className="font-display text-xl font-bold">Access revoked</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your administrator access has been revoked. Contact your system contact if you believe
            this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="font-display text-xl font-bold">Staff access only</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting you to your client portal…
          </p>
        </div>
      </div>
    );
  }

  const items = ADMIN_NAV.filter((item) => permissions.includes(item.permission));
  const topRole = (data?.roles ?? []).find((r) => r in ROLE_LABELS);

  return (
    <ConsoleShell items={items} title="Operations" badge={topRole ? ROLE_LABELS[topRole] : "Staff"}>
      <Outlet />
    </ConsoleShell>
  );
}
