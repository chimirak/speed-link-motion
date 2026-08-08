import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MapPin,
  ReceiptText,
  LifeBuoy,
  Plane,
  Settings,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/portal/portal-shell";

const items: PortalNavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/shipments", label: "Shipments", icon: Package },
  { to: "/dashboard/new-shipment", label: "Book a shipment", icon: PlusCircle },
  { to: "/dashboard/addresses", label: "Saved addresses", icon: MapPin },
  { to: "/dashboard/invoices", label: "Invoices", icon: ReceiptText },
  { to: "/dashboard/flights", label: "Flight bookings", icon: Plane },
  { to: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { to: "/dashboard/settings", label: "Account settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Client Portal — Speed Link Express Logistics" }] }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <PortalShell items={items} title="Client portal" badge="Customer">
      <Outlet />
    </PortalShell>
  );
}
