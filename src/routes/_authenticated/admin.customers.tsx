import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { getCustomerDirectory } from "@/lib/admin.functions";
import {
  AdminEmpty,
  AdminError,
  DataTable,
  SearchInput,
  TableSkeleton,
  Toolbar,
  type Column,
} from "@/components/portal/admin-ui";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/logistics";
import { BUSINESS_NAME } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminCustomers,
});

type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

/**
 * Customer directory.
 *
 * Reads the admin_customer_directory RPC, which returns name and email only.
 * Phone, company and address are never exposed to staff, and other staff
 * accounts are excluded entirely.
 */
function AdminCustomers() {
  const fetchDirectory = useServerFn(getCustomerDirectory);
  const [q, setQ] = useState("");

  const query = useQuery({
    queryKey: ["customer-directory"],
    queryFn: () => fetchDirectory(),
    retry: false,
  });

  const rows = useMemo(() => {
    const list = (query.data ?? []) as Customer[];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (c) =>
        (c.full_name ?? "").toLowerCase().includes(needle) ||
        (c.email ?? "").toLowerCase().includes(needle),
    );
  }, [query.data, q]);

  const columns: Column<Customer>[] = [
    {
      header: "Customer",
      primary: true,
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{c.full_name ?? "Unnamed"}</p>
          <p className="truncate text-xs break-all text-muted-foreground">{c.email}</p>
        </div>
      ),
    },
    { header: "Registered", hideOnMobile: true, cell: (c) => formatDate(c.created_at) },
    {
      header: "",
      cell: (c) =>
        c.email ? (
          <Button asChild size="sm" variant="outline">
            <a
              href={`mailto:${c.email}?subject=${encodeURIComponent(
                `${BUSINESS_NAME} — your shipment`,
              )}&body=${encodeURIComponent(`Hello ${c.full_name ?? ""},\n\n`)}`}
            >
              <Mail className="size-3.5" /> Email
            </a>
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Name and email only. Contact a customer directly using the email action.
        </p>
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search name or email" />
        <span className="text-sm text-muted-foreground">{rows.length} customers</span>
      </Toolbar>

      {query.isLoading && <TableSkeleton />}
      {query.error && <AdminError error={query.error} onRetry={() => void query.refetch()} />}
      {query.data && (
        <DataTable
          rows={rows}
          columns={columns}
          getKey={(c) => c.id}
          empty={
            <AdminEmpty title="No customers yet" body="Registered customers will appear here." />
          }
        />
      )}
    </div>
  );
}
