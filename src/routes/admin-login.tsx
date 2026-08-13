import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin-login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Operations sign-in" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLogin,
});

/**
 * Operations console sign-in.
 *
 * Staff must never be routed through the customer login: it is branded "Client
 * portal login" and belongs to a different product. This page carries the
 * console's own black-and-red identity and sends the account to the surface its
 * permissions allow, never to the customer portal.
 */
function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function routeByRole() {
    try {
      const perms = (await getMyAccess()).permissions ?? [];
      if (perms.includes("platform.manage")) {
        void navigate({ to: "/control", replace: true });
        return;
      }
      if (perms.length > 0) {
        void navigate({ to: "/admin", replace: true });
        return;
      }
      // A customer signed in here: deny in place rather than bounce them to
      // another portal.
      await supabase.auth.signOut();
      toast.error("This account does not have operations access.");
    } catch {
      toast.error("Could not verify access. Try again.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void routeByRole();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    await routeByRole();
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[#0a0000] px-5 py-16 text-red-50">
      <div className="w-full max-w-sm">
        <p className="text-center font-mono text-[11px] tracking-[0.28em] text-red-500/70 uppercase">
          SLX / OPS
        </p>
        <h1 className="mt-3 text-center font-display text-2xl font-extrabold text-white">
          Operations sign-in
        </h1>
        <p className="mt-2 text-center text-sm text-red-100/50">Authorised personnel only.</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-red-900/40 bg-[#140202] p-6"
          noValidate
        >
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] tracking-wider text-red-200/60 uppercase">
              Email
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-black/40 px-3">
              <Mail className="size-4 shrink-0 text-red-500/70" aria-hidden="true" />
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full min-w-0 bg-transparent text-sm text-red-50 placeholder:text-red-200/25 focus:outline-none"
                placeholder="you@company.com"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] tracking-wider text-red-200/60 uppercase">
              Password
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-black/40 px-3">
              <Lock className="size-4 shrink-0 text-red-500/70" aria-hidden="true" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full min-w-0 bg-transparent text-sm text-red-50 placeholder:text-red-200/25 focus:outline-none"
                placeholder="••••••••"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Verifying…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
