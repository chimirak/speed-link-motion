import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminSettings, saveSetting } from "@/lib/admin.functions";
import { Panel } from "@/components/portal/portal-shell";
import { AdminError, Field, Spinner, inputClass } from "@/components/portal/admin-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

/** Keys the UI knows how to edit, with friendly labels. */
const FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  {
    key: "whatsapp_number",
    label: "WhatsApp number",
    hint: "Digits only, incl. country code — used for click-to-chat links",
  },
  { key: "office_address", label: "Office address" },
  { key: "support_hours", label: "Support hours" },
];

function AdminSettings() {
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getAdminSettings);
  const persist = useServerFn(saveSetting);

  const [values, setValues] = useState<Record<string, string>>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings(),
    retry: false,
  });

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const row of data) {
      const v = row.value as unknown;
      next[row.key] =
        typeof v === "string"
          ? v
          : v && typeof v === "object" && "value" in (v as Record<string, unknown>)
            ? String((v as Record<string, unknown>)["value"] ?? "")
            : JSON.stringify(v ?? "");
    }
    setValues(next);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (vars: { key: string; value: string }) =>
      persist({ data: { key: vars.key, value: { value: vars.value } } }),
    onSuccess: () => {
      toast.success("Setting saved");
      void qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save setting"),
  });

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel title="Site settings">
      <p className="mb-6 text-sm text-muted-foreground">
        Public-facing contact details used across the website. Restricted to roles holding
        <span className="numeric"> settings.write</span>.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.key === "office_address" ? "sm:col-span-2" : undefined}>
              <Field label={f.label} hint={f.hint}>
                <input
                  className={inputClass}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              </Field>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => mutation.mutate({ key: f.key, value: values[f.key] ?? "" })}
                disabled={mutation.isPending}
              >
                {mutation.isPending && <Spinner />} Save
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
