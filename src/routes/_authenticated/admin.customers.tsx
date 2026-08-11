import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { getAdminCustomers } from "@/lib/admin.functions";
import { Panel } from "@/components/portal/portal-shell";
import {
  AdminEmpty,
  AdminError,
  Chip,
  DataTable,
  SearchInput,
  Toolbar,
  type Column,
} from "@/components/portal/admin-ui";
import { formatDate } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: AdminCustomers,
});

type Profile = Awaited<ReturnType<typeof getAdminCustomers>>["profiles"][number];

function AdminCustomers() {
  const fetchCustomers = useServerFn(getAdminCustomers);
  const [query, setQuery] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => fetchCustomers(),
    retry: false,
  });

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
    if (!q) return all;
    return all.filter((p) =>
      [p.full_name, p.email, p.company, p.phone].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const columns: Column<Profile>[] = [
    {
      header: "Name",
      primary: true,
      cell: (p) => <span className="font-medium">{p.full_name ?? "Unnamed"}</span>,
    },
    {
      header: "Email",
      cell: (p) => <span className="break-all text-muted-foreground">{p.email ?? "—"}</span>,
    },
    { header: "Phone", cell: (p) => p.phone ?? "—" },
    { header: "Company", cell: (p) => p.company ?? "—", hideOnMobile: true },
    {
      header: "Roles",
      cell: (p) => {
        const roles = roleMap.get(p.id) ?? ["customer"];
        return (
          <span className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <Chip
                key={r}
                label={r.replace("_", " ")}
                tone={r === "customer" ? "neutral" : "info"}
              />
            ))}
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (p) => (
        <Chip label={p.active ? "Active" : "Disabled"} tone={p.active ? "positive" : "danger"} />
      ),
    },
    { header: "Joined", cell: (p) => formatDate(p.created_at), hideOnMobile: true },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel title="Customers">
      <Toolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, email or company"
        />
        {!isLoading && <span className="text-xs text-muted-foreground">{rows.length} shown</span>}
      </Toolbar>
      <DataTable
        rows={rows}
        columns={columns}
        getKey={(p) => p.id}
        loading={isLoading}
        empty={<AdminEmpty title="No customers yet" body="Registered accounts will appear here." />}
      />
    </Panel>
  );
}
