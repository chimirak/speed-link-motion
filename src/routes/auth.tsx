import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { authCallbackUrl } from "@/lib/site-url";
import { getMyAccess } from "@/lib/admin.functions";
import { z } from "zod";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/auth")({
  head: () =>
    pageHead({
      title: "Client Login",
      description:
        "Sign in to the Speed Link Express Logistics client portal to book shipments, track consignments, download invoices and manage your account.",
      path: "/auth",
    }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/**
 * Where a signed-in account belongs. Sign-in previously always sent people to
 * /dashboard, so an administrator or the owner landed in the customer portal.
 * Destination is now decided by the account's own permissions.
 */
async function destinationForSession(): Promise<string> {
  try {
    const access = await getMyAccess();
    const perms = access.permissions ?? [];
    if (perms.includes("platform.manage")) return "/control";
    if (perms.length > 0) return "/admin";
  } catch {
    // fall through to the customer portal
  }
  return "/dashboard";
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // An explicit ?redirect= wins (it is how a guard sends you back where you
  // were); otherwise the destination follows the account's role.
  const requested =
    typeof window !== "undefined"
      ? safeRedirect(new URLSearchParams(window.location.search).get("redirect"))
      : null;

  useEffect(() => {
    let done = false;
    async function route() {
      if (done) return;
      done = true;
      const to = requested ?? (await destinationForSession());
      void navigate({ to, replace: true });
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) void route();
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void route();
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, requested]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedEmail = emailSchema.safeParse(email);
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedEmail.success) {
      toast.error(parsedEmail.error.issues[0]!.message);
      return;
    }
    if (!parsedPassword.success) {
      toast.error(parsedPassword.error.issues[0]!.message);
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsedEmail.data,
          password: parsedPassword.data,
          options: {
            emailRedirectTo: authCallbackUrl("/dashboard"),
            data: { full_name: fullName.trim().slice(0, 120) },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your inbox to confirm your email address, then sign in.");
          toast.success("Account created — confirm your email to continue.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail.data,
          password: parsedPassword.data,
        });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onForgotPassword() {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      toast.error("Enter your email address first, then choose 'Forgot password'.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
        redirectTo: authCallbackUrl("/auth/update-password"),
      });
      if (error) throw error;
      setNotice("If that email is registered, a password reset link is on its way.");
      toast.success("Password reset email sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Native Supabase OAuth. This previously went through Lovable's auth service,
   * which no longer exists for this deployment, so the button always failed.
   * Supabase redirects the browser itself, so there is nothing to navigate to
   * on success - the callback route completes the session.
   */
  async function onGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: authCallbackUrl(requested ?? undefined) },
      });
      if (error) throw error;
    } catch (error) {
      setBusy(false);
      toast.error(
        error instanceof Error ? error.message : "Google sign-in is unavailable right now.",
      );
    }
  }

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-24">
      <div className="grid-lines absolute inset-0 opacity-60" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-[2rem] surface-card p-8 shadow-[var(--shadow-lift)]"
      >
        <Link to="/" className="text-xs tracking-[0.3em] text-primary uppercase">
          Speed Link Express
        </Link>
        <h1 className="mt-4 font-display text-3xl leading-tight font-extrabold">
          {mode === "signin" ? "Client portal login" : "Create your account"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Book shipments, track consignments and download invoices in one place."
            : "One account for shipping, tracking, invoices and travel bookings."}
        </p>

        <Button
          type="button"
          variant="outline"
          size="pill-lg"
          className="mt-7 w-full"
          onClick={onGoogle}
          disabled={busy}
        >
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-4 text-xs tracking-widest text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <AnimatePresence initial={false}>
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Field
                  icon={User}
                  id="full-name"
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Jane Okafor"
                  autoComplete="name"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Field
            icon={Mail}
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
            autoComplete="email"
          />
          <Field
            icon={Lock}
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />

          {mode === "signin" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void onForgotPassword()}
                disabled={busy}
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button type="submit" variant="speed" size="pill-lg" className="w-full" disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {mode === "signin" ? "Sign in" : "Create account"}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {notice && <p className="mt-4 text-sm text-primary">{notice}</p>}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to Speed Link?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </section>
  );
}

function Field({
  icon: Icon,
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  icon: typeof Mail;
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
