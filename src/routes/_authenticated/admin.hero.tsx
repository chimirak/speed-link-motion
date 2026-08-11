import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSlide, getAdminSlides, saveSlide } from "@/lib/admin.functions";
import { Panel } from "@/components/portal/portal-shell";
import {
  AdminEmpty,
  AdminError,
  Chip,
  DataTable,
  Drawer,
  Field,
  Spinner,
  inputClass,
  textareaClass,
  type Column,
} from "@/components/portal/admin-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/hero")({ component: AdminHero });

type Slide = Awaited<ReturnType<typeof getAdminSlides>>[number];

const EMPTY = {
  title: "",
  kicker: "",
  highlight: "",
  copy: "",
  image_url: "",
  primary_label: "",
  primary_url: "",
  sort_order: "0",
  active: true,
};

function AdminHero() {
  const qc = useQueryClient();
  const fetchSlides = useServerFn(getAdminSlides);
  const persist = useServerFn(saveSlide);
  const remove = useServerFn(deleteSlide);

  const [editing, setEditing] = useState<Slide | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [error_, setError] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-slides"],
    queryFn: () => fetchSlides(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: () =>
      persist({
        data: {
          ...(editing ? { id: editing.id } : {}),
          title: form.title,
          kicker: form.kicker || undefined,
          highlight: form.highlight || undefined,
          copy: form.copy || undefined,
          image_url: form.image_url || undefined,
          primary_label: form.primary_label || undefined,
          primary_url: form.primary_url || undefined,
          sort_order: Number(form.sort_order) || 0,
          active: form.active,
        },
      }),
    onSuccess: () => {
      toast.success(editing ? "Slide updated" : "Slide created");
      setEditing(null);
      setCreating(false);
      void qc.invalidateQueries({ queryKey: ["admin-slides"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save slide"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Slide deleted");
      void qc.invalidateQueries({ queryKey: ["admin-slides"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not delete slide"),
  });

  function openCreate() {
    setForm({ ...EMPTY });
    setError("");
    setCreating(true);
  }
  function openEdit(s: Slide) {
    setForm({
      title: s.title,
      kicker: s.kicker ?? "",
      highlight: s.highlight ?? "",
      copy: s.copy ?? "",
      image_url: s.image_url ?? "",
      primary_label: s.primary_label ?? "",
      primary_url: s.primary_url ?? "",
      sort_order: String(s.sort_order),
      active: s.active,
    });
    setError("");
    setEditing(s);
  }
  function submit() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    mutation.mutate();
  }

  const columns: Column<Slide>[] = [
    { header: "Title", primary: true, cell: (s) => <span className="font-medium">{s.title}</span> },
    { header: "Order", cell: (s) => <span className="numeric">{s.sort_order}</span> },
    { header: "CTA", cell: (s) => s.primary_label ?? "—", hideOnMobile: true },
    {
      header: "State",
      cell: (s) => (
        <Chip label={s.active ? "Active" : "Hidden"} tone={s.active ? "positive" : "neutral"} />
      ),
    },
    {
      header: "",
      cell: (s) => (
        <button
          type="button"
          aria-label={`Delete ${s.title}`}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete slide "${s.title}"?`)) deleteMutation.mutate(s.id);
          }}
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      ),
    },
  ];

  if (error) return <AdminError error={error} onRetry={() => void refetch()} />;

  return (
    <Panel
      title="Hero slider"
      action={
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> New slide
        </Button>
      }
    >
      <p className="mb-5 text-sm text-muted-foreground">
        Active slides render on the homepage in ascending order. If none are active the site falls
        back to its built-in slides.
      </p>
      <DataTable
        rows={data ?? []}
        columns={columns}
        getKey={(s) => s.id}
        loading={isLoading}
        onRowClick={openEdit}
        empty={
          <AdminEmpty title="No slides yet" body="Add a slide to control the homepage hero." />
        }
      />

      <Drawer
        open={creating || Boolean(editing)}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? "Edit slide" : "New slide"}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />} Save slide
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" full error={error_}>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="Kicker">
            <input
              className={inputClass}
              value={form.kicker}
              onChange={(e) => setForm((f) => ({ ...f, kicker: e.target.value }))}
            />
          </Field>
          <Field label="Highlight">
            <input
              className={inputClass}
              value={form.highlight}
              onChange={(e) => setForm((f) => ({ ...f, highlight: e.target.value }))}
            />
          </Field>
          <Field label="Image URL" full>
            <input
              className={inputClass}
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            />
          </Field>
          <Field label="CTA label">
            <input
              className={inputClass}
              value={form.primary_label}
              onChange={(e) => setForm((f) => ({ ...f, primary_label: e.target.value }))}
            />
          </Field>
          <Field label="CTA link">
            <input
              className={inputClass}
              value={form.primary_url}
              onChange={(e) => setForm((f) => ({ ...f, primary_url: e.target.value }))}
              placeholder="/services"
            />
          </Field>
          <Field label="Sort order">
            <input
              className={inputClass}
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              inputMode="numeric"
            />
          </Field>
          <Field label="Visibility">
            <select
              className={inputClass}
              value={form.active ? "active" : "hidden"}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "active" }))}
            >
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </Field>
          <Field label="Body copy" full>
            <textarea
              className={textareaClass}
              value={form.copy}
              onChange={(e) => setForm((f) => ({ ...f, copy: e.target.value }))}
            />
          </Field>
        </div>
      </Drawer>
    </Panel>
  );
}
