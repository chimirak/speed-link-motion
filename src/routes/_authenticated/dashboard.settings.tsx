import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getMyProfile, updateMyProfile } from "@/lib/portal.functions";
import { Panel } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const load = useServerFn(getMyProfile);
  const save = useServerFn(updateMyProfile);
  const { data } = useQuery({ queryKey: ["profile"], queryFn: () => load() });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (!data) return;
    setFullName(data.full_name ?? "");
    setPhone(data.phone ?? "");
    setCompany(data.company ?? "");
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => save({ data: { full_name: fullName, phone, company } }),
    onSuccess: () => toast.success("Profile updated."),
    onError: () => toast.error("Could not update your profile."),
  });

  return (
    <Panel title="Account settings">
      <form
        className="max-w-lg space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Row label="Email" value={data?.email ?? ""} readOnly />
        <Row label="Full name" value={fullName} onChange={setFullName} />
        <Row label="Phone" value={phone} onChange={setPhone} />
        <Row label="Company" value={company} onChange={setCompany} />
        <Button type="submit" variant="speed" size="pill" disabled={mutation.isPending}>
          Save changes
        </Button>
      </form>
    </Panel>
  );
}

function Row({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </label>
      <input
        id={id}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-border bg-secondary px-4 text-sm focus:outline-none disabled:opacity-60"
      />
    </div>
  );
}
