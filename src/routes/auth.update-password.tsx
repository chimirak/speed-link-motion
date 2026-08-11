import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/portal/admin-ui";

export const Route = createFileRoute("/auth/update-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Speed Link Express" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UpdatePassword,
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);

  // A recovery session must already exist, otherwise updateUser cannot work.
  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setReady(Boolean(data.session));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data });
      if (error) throw error;
      toast.success("Password updated.");
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid min-h-dvh place-items-center px-5 py-20">
      <div className="w-full max-w-md rounded-[2rem] surface-card p-8">
        <span className="grid size-12 place-items-center rounded-full bg-primary/12 text-primary">
          <KeyRound className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Set a new password</h1>

        {ready === false ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              This password reset link is no longer valid. Request a new one from the sign-in page.
            </p>
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
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              variant="speed"
              size="pill"
              className="w-full justify-center"
              disabled={busy || ready === null}
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
