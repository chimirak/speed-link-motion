import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      // Each portal has its own sign-in page. Staff and the owner must never be
      // routed through the customer login, which is branded "Client portal
      // login" and belongs to a different product.
      const path = location.pathname;
      if (path.startsWith("/control")) {
        throw redirect({ to: "/control-login" });
      }
      if (path.startsWith("/admin") || path.startsWith("/request-access")) {
        throw redirect({ to: "/admin-login" });
      }
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
