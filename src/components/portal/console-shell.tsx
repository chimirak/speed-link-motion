import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
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
  tone = "ops",
  children,
}: {
  items: ConsoleNavItem[];
  title: string;
  badge?: string | undefined;
  tone?: "ops" | "owner";
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

  const accent =
    tone === "owner"
      ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
      : "bg-primary/15 text-primary ring-1 ring-primary/30";

  return (
    <div className="dark min-h-dvh bg-[#07090d] text-slate-100">
      {/* System bar — monospace, always visible, unmistakably not the website */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0e14]/95 backdrop-blur">
        <div className="flex h-12 items-center gap-3 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <span className="font-mono text-[11px] tracking-[0.2em] text-slate-500 uppercase">
            SLX&nbsp;/&nbsp;{tone === "owner" ? "PLATFORM" : "OPS"}
          </span>

          <span className={`hidden rounded px-2 py-0.5 font-mono text-[11px] sm:inline ${accent}`}>
            {badge ?? "STAFF"}
          </span>

          <span className="ml-auto hidden font-mono text-[11px] text-slate-600 md:inline">
            support {WHATSAPP_DISPLAY}
          </span>

          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 sm:flex"
          >
            Public site <ExternalLink className="size-3" />
          </Link>

          <button
            type="button"
            onClick={() => void signOut()}
            className="grid size-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
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
          } max-h-[70dvh] overflow-y-auto border-b border-white/10 bg-[#0b0e14] lg:sticky lg:top-12 lg:block lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:border-r lg:border-b-0`}
        >
          <nav className="p-2.5">
            {tone === "owner" && (
              <div className="mb-2 flex items-center gap-2 rounded-md bg-amber-500/10 px-2.5 py-2 ring-1 ring-amber-500/25">
                <ShieldCheck className="size-3.5 shrink-0 text-amber-300" />
                <span className="font-mono text-[10px] leading-tight tracking-wide text-amber-200/90 uppercase">
                  Owner authority
                </span>
              </div>
            )}
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
                          ? "bg-white/10 font-medium text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
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
