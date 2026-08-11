import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { claimPlatformOwnership } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/claim-ownership")({
  head: () => ({ meta: [{ title: "Claim platform ownership — Speed Link Express" }] }),
  component: ClaimOwnership,
});

/**
 * One-time owner bootstrap. This page is deliberately NOT a backdoor: it is
 * reachable by any signed-in user, and the database rejects the claim unless the
 * caller's own verified auth email matches the designated owner AND no
 * platform_owner exists yet. Authorisation is entirely server-side.
 */
function ClaimOwnership() {
  const navigate = useNavigate();
  const claim = useServerFn(claimPlatformOwnership);

  const mutation = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => {
      toast.success("Platform ownership confirmed");
      void navigate({ to: "/admin", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-lg px-5 py-24">
      <div className="rounded-[1.5rem] surface-card p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Claim platform ownership</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This grants the platform owner role to your signed-in account. It can only be used once,
          by the designated owner account, and only while no owner exists.
        </p>
        <Button
          className="mt-7 w-full justify-center"
          variant="speed"
          size="pill"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Verifying…
            </>
          ) : (
            "Claim ownership"
          )}
        </Button>
        {mutation.error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {(mutation.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}
