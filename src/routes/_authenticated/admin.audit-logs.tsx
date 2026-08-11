import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { getAdminAuditLogs } from "@/lib/admin.functions";
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
import { formatDateTime } from "@/lib/logistics";

export const Route = createFileRoute("/_authenticated/admin/audit-logs")({
  component: AdminAuditLogs,
});

type Log = Awaited<ReturnType<typeof getAdminAuditLogs>>[number];

function toneForAction(action: string) {
  if (/delete|revoke|remove/i.test(action)) return "danger" as const;
  if (/create|insert|grant/i.test(action)) return "positive" as const;
  return "info" as const;
}

function AdminAuditLogs() {
  const fetchLogs = useServerFn(getAdminAuditLogs);
  const [query, setQuery] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => fetchLogs(),
    retry: false,
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((l) =>
      [l.action, l.entity, l.entity_id, l.actor_email].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const columns: Column<Log>[] = [
    {
      header: "Action",
      primary: true,
      cell: (l) => <Chip label={l.action} tone={toneForAction(l.action)} />,
    },
    { header: "Entity", cell: (l) => <span className="break-words">{l.entity ?? "—"}</span> },
    {
      header: "Record",
      cell: (l) => (
        <span className="numeric break-all text-muted-foreground">{l.entity_id ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      header: "Actor",
      cell: (l) => (
        <span className="break-all text-muted-foreground">{l.actor_email ?? "system"}</span>
      ),
    },
    { header: "When", cell: (l) => formatDateTime(l.created_at) },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel title="Audit logs">
      <p className="mb-5 text-sm text-muted-foreground">
        Written by database triggers and security-definer functions. Clients cannot insert or modify
        these records.
      </p>
      <Toolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search action, entity or actor"
        />
      </Toolbar>
      <DataTable
        rows={rows}
        columns={columns}
        getKey={(l) => l.id}
        loading={isLoading}
        empty={
          <AdminEmpty
            title="No audit records yet"
            body="Administrative actions will be recorded here."
          />
        }
      />
    </Panel>
  );
}
