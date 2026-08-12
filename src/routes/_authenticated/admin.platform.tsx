import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ShieldAlert, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminAllowlist,
  setAdminAllowlist,
  getAdminAccounts,
  getMyAccess,
  revokeAdminAccess,
  restoreAdminAccess,
  type AdminAccount,
} from "@/lib/admin.functions";
import {
  AdminEmpty,
  AdminError,
  Chip,
  DataTable,
  TableSkeleton,
  Toolbar,
  inputClass,
  type Column,
} from "@/components/portal/admin-ui";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/admin/platform")({
  component: PlatformControl,
});

const ROLE_TONE: Record<string, "positive" | "info" | "warning"> = {
  platform_owner: "positive",
  super_admin: "warning",
};

function PlatformControl() {
  const fetchAccess = useServerFn(getMyAccess);
  const fetchAccounts = useServerFn(getAdminAccounts);
  const revoke = useServerFn(revokeAdminAccess);
  const restore = useServerFn(restoreAdminAccess);
  const qc = useQueryClient();
  const [target, setTarget] = useState<AdminAccount | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);

  const fetchAllowlist = useServerFn(getAdminAllowlist);
  const saveAllowlist = useServerFn(setAdminAllowlist);

  const allowlist = useQuery({
    queryKey: ["admin-allowlist"],
    queryFn: () => fetchAllowlist(),
    enabled: true,
    retry: false,
  });

  const allowMut = useMutation({
    mutationFn: (emails: string[]) => saveAllowlist({ data: { emails } }),
    onSuccess: () => {
      toast.success("Administrator allowlist updated");
      void qc.invalidateQueries({ queryKey: ["admin-allowlist"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentSlots = slots ?? [...(allowlist.data ?? []), "", "", "", ""].slice(0, 4);

  const access = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => fetchAccess(),
    staleTime: 60_000,
  });
  const isOwner = (access.data?.permissions ?? []).includes("platform.manage");

  const accounts = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => fetchAccounts(),
    enabled: isOwner,
    retry: false,
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => revoke({ data: { targetUserId: id } }),
    onSuccess: () => {
      toast.success("Administrator access revoked");
      setTarget(null);
      void qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restoreMut = useMutation({
    mutationFn: (id: string) => restore({ data: { targetUserId: id } }),
    onSuccess: () => {
      toast.success("Administrator access restored");
      void qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Server and database both reject unauthorised calls; this is presentation only.
  if (access.isLoading) return <TableSkeleton />;
  if (!isOwner) {
    return (
      <AdminEmpty
        title="Platform controls are restricted"
        body="These controls are available to the platform owner only."
      />
    );
  }

  const columns: Column<AdminAccount>[] = [
    {
      header: "Administrator",
      primary: true,
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{a.full_name ?? a.email ?? "Unnamed"}</p>
          <p className="truncate text-xs text-muted-foreground">{a.email}</p>
        </div>
      ),
    },
    {
      header: "Roles",
      cell: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.roles
            .filter((r) => r !== "customer")
            .map((r) => (
              <Chip key={r} label={r.replace("_", " ")} tone={ROLE_TONE[r] ?? "info"} />
            ))}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (a) =>
        a.deactivated ? (
          <Chip label="Revoked" tone="danger" />
        ) : (
          <Chip label="Active" tone="positive" />
        ),
    },
    { header: "Added", hideOnMobile: true, cell: (a) => formatDate(a.created_at) },
    {
      header: "",
      cell: (a) => {
        const owner = a.roles.includes("platform_owner");
        if (owner) {
          return <span className="text-xs text-muted-foreground">Protected</span>;
        }
        return a.deactivated ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => restoreMut.mutate(a.id)}
            disabled={restoreMut.isPending}
          >
            <ShieldCheck className="size-3.5" /> Restore
          </Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={() => setTarget(a)}>
            <ShieldAlert className="size-3.5" /> Revoke
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Platform control</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Owner-only administration. Revoking access deactivates the administrator and invalidates
          their portal authorisation server-side.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
        <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-muted-foreground">
          Revocation blocks the portal immediately on their next request. It does not delete their
          Supabase refresh token, so also reset the account password in Supabase if you are removing
          a compromised administrator.
        </p>
      </div>

      <section className="rounded-2xl border border-border p-4">
        <h2 className="font-display text-sm font-bold tracking-wide uppercase">
          Administrator allowlist
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Only these addresses can hold an administrator role. Maximum four. Enforced in the
          database — a role cannot be granted to an address that is not listed here.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {currentSlots.map((email, i) => (
            <input
              key={i}
              className={inputClass}
              value={email}
              placeholder={`admin ${i + 1} email`}
              inputMode="email"
              onChange={(e) => {
                const next = [...currentSlots];
                next[i] = e.target.value;
                setSlots(next);
              }}
            />
          ))}
        </div>
        <Button
          variant="speed"
          size="sm"
          className="mt-3"
          disabled={allowMut.isPending}
          onClick={() => allowMut.mutate(currentSlots.filter((e) => e.trim() !== ""))}
        >
          {allowMut.isPending ? "Saving…" : "Save allowlist"}
        </Button>
      </section>

      <Toolbar>
        <span className="text-sm text-muted-foreground">
          {accounts.data?.length ?? 0} administrator accounts
        </span>
      </Toolbar>

      {accounts.isLoading && <TableSkeleton />}
      {accounts.error && (
        <AdminError error={accounts.error} onRetry={() => void accounts.refetch()} />
      )}
      {accounts.data && (
        <DataTable
          rows={accounts.data}
          columns={columns}
          getKey={(a) => a.id}
          empty={
            <AdminEmpty
              title="No administrators yet"
              body="Staff accounts will appear here once roles are assigned."
            />
          }
        />
      )}

      <AlertDialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke administrator access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately deactivate{" "}
              <strong className="text-foreground">{target?.email}</strong> and block their access to
              the admin portal. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => target && revokeMut.mutate(target.id)}
              disabled={revokeMut.isPending}
            >
              Revoke access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
