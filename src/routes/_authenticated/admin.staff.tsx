import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import {
  assignStaffRole,
  getAdminCustomers,
  getMyAccess,
  revokeStaffRole,
} from "@/lib/admin.functions";
import { Panel } from "@/components/portal/portal-shell";
import {
  AdminEmpty,
  AdminError,
  Chip,
  DataTable,
  Drawer,
  Field,
  SearchInput,
  Spinner,
  Toolbar,
  inputClass,
  type Column,
} from "@/components/portal/admin-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: AdminStaff,
});

type Profile = Awaited<ReturnType<typeof getAdminCustomers>>["profiles"][number];

const ASSIGNABLE = [
  "support",
  "operations",
  "content_manager",
  "staff",
  "admin",
  "super_admin",
] as const;

function AdminStaff() {
  const qc = useQueryClient();
  const fetchCustomers = useServerFn(getAdminCustomers);
  const fetchAccess = useServerFn(getMyAccess);
  const assign = useServerFn(assignStaffRole);
  const revoke = useServerFn(revokeStaffRole);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [role, setRole] = useState<string>("support");

  const access = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => fetchAccess(),
    retry: false,
    staleTime: 60_000,
  });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => fetchCustomers(),
    retry: false,
  });

  const myId = null; // resolved server-side; self-modification is blocked in the DB

  const roleMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const r of data?.roles ?? []) {
      map.set(r.user_id, [...(map.get(r.user_id) ?? []), r.role as string]);
    }
    return map;
  }, [data]);

  const rows = useMemo(() => {
    const all = data?.profiles ?? [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? all.filter((p) =>
          [p.full_name, p.email].some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(q),
          ),
        )
      : all;
    // Staff first, then everyone else — this page is about privilege, not volume.
    return [...filtered].sort((a, b) => {
      const aStaff = (roleMap.get(a.id) ?? []).some((r) => r !== "customer") ? 0 : 1;
      const bStaff = (roleMap.get(b.id) ?? []).some((r) => r !== "customer") ? 0 : 1;
      return aStaff - bStaff;
    });
  }, [data, query, roleMap]);

  const assignMutation = useMutation({
    mutationFn: (vars: { targetUserId: string; role: string }) => assign({ data: vars }),
    onSuccess: () => {
      toast.success("Role granted");
      void qc.invalidateQueries({ queryKey: ["admin-customers"] });
      setSelected(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not grant role"),
  });

  const revokeMutation = useMutation({
    mutationFn: (vars: { targetUserId: string; role: string }) => revoke({ data: vars }),
    onSuccess: () => {
      toast.success("Role revoked");
      void qc.invalidateQueries({ queryKey: ["admin-customers"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not revoke role"),
  });

  const columns: Column<Profile>[] = [
    {
      header: "Person",
      primary: true,
      cell: (p) => <span className="font-medium">{p.full_name ?? p.email ?? "Unnamed"}</span>,
    },
    {
      header: "Email",
      cell: (p) => <span className="break-all text-muted-foreground">{p.email ?? "—"}</span>,
    },
    {
      header: "Roles",
      cell: (p) => {
        const roles = (roleMap.get(p.id) ?? []).filter((r) => r !== "customer");
        if (roles.length === 0) return <span className="text-muted-foreground">Customer</span>;
        return (
          <span className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                title="Click to revoke"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Revoke "${r.replace("_", " ")}" from ${p.full_name ?? p.email}?`)) {
                    revokeMutation.mutate({ targetUserId: p.id, role: r });
                  }
                }}
                className="cursor-pointer"
              >
                <Chip label={r.replace("_", " ")} tone={r === "super_admin" ? "danger" : "info"} />
              </button>
            ))}
          </span>
        );
      },
    },
  ];

  if (!access.isLoading && !(access.data?.permissions ?? []).includes("staff.manage")) {
    return (
      <Panel title="Staff & roles">
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <ShieldAlert className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 font-medium">Super admin only</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Role management is restricted to super admins.
          </p>
        </div>
      </Panel>
    );
  }

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel title="Staff & roles">
      <p className="mb-5 text-sm text-muted-foreground">
        Grant a role by selecting a person. Revoke by tapping a role chip. The database blocks
        changing your own role and removing the last super admin.
      </p>

      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder="Search staff or customers" />
      </Toolbar>

      <DataTable
        rows={rows}
        columns={columns}
        getKey={(p) => p.id}
        loading={isLoading}
        onRowClick={(p) => {
          setSelected(p);
          setRole("support");
        }}
        empty={<AdminEmpty title="No accounts yet" body="Registered users will appear here." />}
      />

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Grant role — ${selected.full_name ?? selected.email}` : ""}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => assignMutation.mutate({ targetUserId: selected!.id, role })}
              disabled={assignMutation.isPending || selected?.id === myId}
            >
              {assignMutation.isPending && <Spinner />} Grant role
            </Button>
          </div>
        }
      >
        <Field label="Role" hint="super_admin can manage staff and critical settings">
          <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
            {ASSIGNABLE.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
        </Field>
      </Drawer>
    </Panel>
  );
}
