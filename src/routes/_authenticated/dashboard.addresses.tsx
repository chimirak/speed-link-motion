import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteAddress, getMyAddresses, saveAddress } from "@/lib/portal.functions";
import { EmptyState, Panel } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/addresses")({
  component: AddressesPage,
});

function AddressesPage() {
  const queryClient = useQueryClient();
  const list = useServerFn(getMyAddresses);
  const save = useServerFn(saveAddress);
  const remove = useServerFn(deleteAddress);
  const [form, setForm] = useState<Record<string, string>>({ country: "United Kingdom" });

  const { data, isLoading } = useQuery({ queryKey: ["addresses"], queryFn: () => list() });

  const saveMutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          label: form["label"],
          contact_name: form["contact_name"] ?? "",
          phone: form["phone"],
          line1: form["line1"] ?? "",
          city: form["city"] ?? "",
          postal_code: form["postal_code"],
          country: form["country"] ?? "United Kingdom",
        },
      }),
    onSuccess: () => {
      toast.success("Address saved.");
      setForm({ country: "United Kingdom" });
      void queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Could not save that address."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Saved addresses">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-secondary" />
        ) : (data ?? []).length === 0 ? (
          <EmptyState title="No saved addresses" body="Add one to speed up future bookings." />
        ) : (
          <ul className="divide-y divide-border">
            {(data ?? []).map((a) => (
              <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.label ?? a.contact_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {a.line1}, {a.city}, {a.country}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete address"
                  onClick={() => deleteMutation.mutate(a.id)}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Add an address">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form["contact_name"] || !form["line1"] || !form["city"]) {
              toast.error("Contact name, address line and city are required.");
              return;
            }
            saveMutation.mutate();
          }}
        >
          {[
            ["label", "Label"],
            ["contact_name", "Contact name"],
            ["phone", "Phone"],
            ["line1", "Address line"],
            ["city", "City"],
            ["postal_code", "Postcode"],
            ["country", "Country"],
          ].map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className="text-xs tracking-widest text-muted-foreground uppercase">
                {label}
              </label>
              <input
                id={key}
                value={form[key!] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key!]: e.target.value }))}
                className="mt-2 h-12 w-full rounded-2xl border border-border bg-secondary px-4 text-sm focus:outline-none"
              />
            </div>
          ))}
          <Button type="submit" variant="speed" size="pill" disabled={saveMutation.isPending}>
            Save address
          </Button>
        </form>
      </Panel>
    </div>
  );
}
