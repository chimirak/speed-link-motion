import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_DISPLAY } from "@/lib/brand";

export type ConsoleNavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * Operations console shell.
 *
 * Deliberately NOT the PortalShell used by the public site and the customer
 * dashboard. This is a separate product surface: a permanently dark, dense
 * control-room chrome with a monospace system bar, so a staff member can never
 * mistake which application they are operating in. The colour tokens are scoped
 * to this subtree via `.dark`, so nothing here leaks into the marketing site.
 *
 * `tone` distinguishes ordinary operations from platform-owner territory, which
 * carries elevated authority and should look like it.
 */
export function ConsoleShell({
  items,
  title,
  badge,
  children,
}: {
  items: ConsoleNavItem[];
  title: string;
  badge?: string | undefined;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    void navigate({ to: "/auth", replace: true });
  }

  const accent = "bg-red-600/20 text-red-300 ring-1 ring-red-600/40";

  return (
    <div className="dark min-h-dvh bg-[#0a0000] text-red-50">
      {/* System bar — monospace, always visible, unmistakably not the website */}
      <div className="sticky top-0 z-40 border-b border-red-900/40 bg-[#140202]/95 backdrop-blur">
        <div className="flex h-12 items-center gap-3 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-8 shrink-0 place-items-center rounded-md text-red-200/60 transition-colors hover:bg-red-500/10 hover:text-red-50 lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <span className="font-mono text-[11px] tracking-[0.2em] text-red-500/70 uppercase">
            SLX&nbsp;/&nbsp;OPS
          </span>

          <span className={`hidden rounded px-2 py-0.5 font-mono text-[11px] sm:inline ${accent}`}>
            {badge ?? "STAFF"}
          </span>

          <span className="ml-auto hidden font-mono text-[11px] text-red-200/30 md:inline">
            support {WHATSAPP_DISPLAY}
          </span>

          <button
            type="button"
            onClick={() => void signOut()}
            className="grid size-8 place-items-center rounded-md text-red-200/60 transition-colors hover:bg-red-500/10 hover:text-red-50"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
        {/* Rail */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } max-h-[70dvh] overflow-y-auto border-b border-red-900/40 bg-[#140202] lg:sticky lg:top-12 lg:block lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:border-r lg:border-r-red-900/40 lg:border-b-0`}
        >
          <nav className="p-2.5">
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  pathname === item.to ||
                  (item.to !== "/admin" && pathname.startsWith(`${item.to}/`));
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                        active
                          ? "bg-red-600/20 font-medium text-white ring-1 ring-red-600/40"
                          : "text-red-100/55 hover:bg-red-500/10 hover:text-red-50"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Work area */}
        <main className="min-w-0 overflow-x-hidden px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <h1 className="sr-only">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
