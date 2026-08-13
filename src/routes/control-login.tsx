import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/control-login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Control sign-in" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ControlLogin,
});

/**
 * Operations console sign-in.
 *
 * Staff must never be routed through the customer login: it is branded "Client
 * portal login" and belongs to a different product. This page carries the
 * console's own black-and-red identity and sends the account to the surface its
 * permissions allow, never to the customer portal.
 */
function ControlLogin() {
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
      // Anyone who is not the owner is denied here; no other portal is offered.
      await supabase.auth.signOut();
      toast.error("This account does not have control access.");
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
    <div className="grid min-h-dvh place-items-center bg-[#0a1733] px-5 py-16 text-white">
      <div className="w-full max-w-sm">
        <p className="text-center font-mono text-[11px] tracking-[0.28em] text-sky-200/80 uppercase">
          SLX / CONTROL
        </p>
        <h1 className="mt-3 text-center font-display text-2xl font-extrabold text-white">
          Control sign-in
        </h1>
        <p className="mt-2 text-center text-sm text-white/50">Platform owner only.</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-[#081026] p-6"
          noValidate
        >
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] tracking-wider text-sky-100/70 uppercase">
              Email
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/25 px-3">
              <Mail className="size-4 shrink-0 text-sky-300/80" aria-hidden="true" />
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full min-w-0 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                placeholder="you@company.com"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] tracking-wider text-sky-100/70 uppercase">
              Password
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/25 px-3">
              <Lock className="size-4 shrink-0 text-sky-300/80" aria-hidden="true" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full min-w-0 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                placeholder="••••••••"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-60"
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
