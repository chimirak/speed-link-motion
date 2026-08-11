import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePost, getAdminPosts, savePost } from "@/lib/admin.functions";
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
  textareaClass,
  type Column,
} from "@/components/portal/admin-ui";
import { formatDate } from "@/lib/logistics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/blog")({ component: AdminBlog });

type Post = Awaited<ReturnType<typeof getAdminPosts>>[number];

function slugify(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function AdminBlog() {
  const qc = useQueryClient();
  const fetchPosts = useServerFn(getAdminPosts);
  const persist = useServerFn(savePost);
  const remove = useServerFn(deletePost);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    cover_image: "",
    published: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => fetchPosts(),
    retry: false,
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) =>
      [p.title, p.slug].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query]);

  const mutation = useMutation({
    mutationFn: () =>
      persist({
        data: {
          ...(editing ? { id: editing.id } : {}),
          title: form.title,
          slug: form.slug || slugify(form.title),
          excerpt: form.excerpt || undefined,
          body: form.body || undefined,
          cover_image: form.cover_image || undefined,
          published: form.published,
        },
      }),
    onSuccess: () => {
      toast.success(editing ? "Post updated" : "Post created");
      setEditing(null);
      setCreating(false);
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save post"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Post deleted");
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not delete post"),
  });

  function openCreate() {
    setForm({ title: "", slug: "", excerpt: "", body: "", cover_image: "", published: false });
    setErrors({});
    setCreating(true);
  }
  function openEdit(p: Post) {
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      body: p.body ?? "",
      cover_image: p.cover_image ?? "",
      published: p.published,
    });
    setErrors({});
    setEditing(p);
  }
  function submit() {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next["title"] = "Title is required";
    if (!(form.slug || slugify(form.title))) next["slug"] = "Slug is required";
    setErrors(next);
    if (Object.keys(next).length === 0) mutation.mutate();
  }

  const columns: Column<Post>[] = [
    { header: "Title", primary: true, cell: (p) => <span className="font-medium">{p.title}</span> },
    {
      header: "Slug",
      cell: (p) => <span className="break-all text-muted-foreground">/{p.slug}</span>,
    },
    {
      header: "State",
      cell: (p) => (
        <Chip
          label={p.published ? "Published" : "Draft"}
          tone={p.published ? "positive" : "warning"}
        />
      ),
    },
    { header: "Updated", cell: (p) => formatDate(p.updated_at), hideOnMobile: true },
    {
      header: "",
      cell: (p) => (
        <button
          type="button"
          aria-label={`Delete ${p.title}`}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id);
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
      title="Blog CMS"
      action={
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> New post
        </Button>
      }
    >
      <Toolbar>
        <SearchInput value={query} onChange={setQuery} placeholder="Search posts" />
      </Toolbar>
      <DataTable
        rows={rows}
        columns={columns}
        getKey={(p) => p.id}
        loading={isLoading}
        onRowClick={openEdit}
        empty={
          <AdminEmpty title="No posts yet" body="Publish your first article to the public blog." />
        }
      />

      <Drawer
        open={creating || Boolean(editing)}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? "Edit post" : "New post"}
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
              {mutation.isPending && <Spinner />} Save post
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" full error={errors["title"]}>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                  slug: f.slug || slugify(e.target.value),
                }))
              }
            />
          </Field>
          <Field label="Slug" error={errors["slug"]} hint="Used in the public URL">
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            />
          </Field>
          <Field label="Visibility">
            <select
              className={inputClass}
              value={form.published ? "published" : "draft"}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.value === "published" }))
              }
            >
              <option value="draft">Draft — hidden from the public site</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Cover image URL" full>
            <input
              className={inputClass}
              value={form.cover_image}
              onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
            />
          </Field>
          <Field label="Excerpt" full>
            <textarea
              className={textareaClass}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </Field>
          <Field label="Body" full>
            <textarea
              className={`${textareaClass} min-h-56`}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
          </Field>
        </div>
      </Drawer>
    </Panel>
  );
}
