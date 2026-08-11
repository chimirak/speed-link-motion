import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PortalNavItem = { to: string; label: string; icon: React.ElementType };

export function PortalShell({
  items,
  title,
  subtitle,
  children,
  badge,
}: {
  items: PortalNavItem[];
  title: string;
  subtitle?: string | undefined;
  badge?: string | undefined;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-[100rem] gap-0 lg:gap-8 lg:px-6">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-border bg-background p-6 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 lg:border-r-0 lg:bg-transparent",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Link to="/" className="text-xs tracking-[0.3em] text-primary uppercase">
            Speed Link Express
          </Link>
          <p className="mt-3 font-display text-xl font-extrabold">{title}</p>
          {badge && (
            <span className="mt-2 inline-block rounded-full bg-primary/12 px-3 py-1 text-[11px] font-medium tracking-widest text-primary uppercase">
              {badge}
            </span>
          )}

          <nav className="mt-8 space-y-1">
            {items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Button
            variant="outline"
            size="pill"
            className="mt-8 w-full justify-center"
            onClick={signOut}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </aside>

        <div className="min-w-0 flex-1 px-4 pt-24 pb-20 sm:px-6 lg:px-0 lg:pt-10">
          <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:hidden">
            <p className="truncate font-display text-lg font-bold">{title}</p>
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setOpen((v) => !v)}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border"
            >
              <Menu className="size-4" />
            </button>
          </div>
          {subtitle && <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-[1.5rem] surface-card p-6">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <p className="numeric mt-3 text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] surface-card p-6">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h2 className="truncate font-display text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-block shrink-0 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
      {label}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
