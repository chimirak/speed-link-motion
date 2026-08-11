import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

/**
 * Landing point for every Supabase email link (confirmation, magic link,
 * password recovery) and OAuth return.
 *
 * This route exists because the confirmation link used to point straight at
 * /dashboard, which sits behind the auth guard: the guard bounced the user back
 * to /auth before the session in the URL had been processed. Here the session is
 * established first, then the user is routed on.
 *
 * Handles both flows:
 *   - PKCE:     ?code=...      -> exchangeCodeForSession
 *   - Implicit: #access_token= -> picked up by detectSessionInUrl
 */
export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AuthCallback,
});

type State = { kind: "working" } | { kind: "error"; message: string } | { kind: "recovery" };

function AuthCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "working" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

      // Supabase reports link failures (expired, already used) on the URL.
      const errDescription =
        url.searchParams.get("error_description") ?? hash.get("error_description");
      if (errDescription) {
        if (!cancelled) setState({ kind: "error", message: errDescription });
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) setState({ kind: "error", message: error.message });
          return;
        }
      }

      // Password recovery links must land on the update-password screen, not
      // the dashboard, or the user can never actually set a new password.
      const type = url.searchParams.get("type") ?? hash.get("type");
      if (type === "recovery") {
        if (!cancelled) setState({ kind: "recovery" });
        void navigate({ to: "/auth/update-password", replace: true });
        return;
      }

      // Implicit flow: give detectSessionInUrl a moment, then confirm.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session) {
        setState({
          kind: "error",
          message:
            "This sign-in link is no longer valid. It may have expired or already been used.",
        });
        return;
      }

      const next = url.searchParams.get("next");
      void navigate({ to: next && next.startsWith("/") ? next : "/dashboard", replace: true });
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <section className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm rounded-[1.5rem] surface-card p-8 text-center">
        {state.kind === "error" ? (
          <>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-xl font-bold">Sign-in link problem</h1>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
            <Button
              className="mt-6 w-full justify-center"
              variant="speed"
              size="pill"
              onClick={() => void navigate({ to: "/auth", replace: true })}
            >
              Back to sign in
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-4 text-sm text-muted-foreground">Confirming your account…</p>
          </>
        )}
      </div>
    </section>
  );
}
