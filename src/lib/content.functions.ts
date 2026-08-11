import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Anonymous client for public CMS content.
 *
 * RLS exposes only `blog_posts` where published = true and `hero_slides` where
 * active = true, so unpublished drafts can never leak through this path.
 */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type PublicPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
};

export type PublicSlide = {
  id: string;
  title: string;
  highlight: string | null;
  kicker: string | null;
  copy: string | null;
  image_url: string | null;
  primary_label: string | null;
  primary_url: string | null;
  secondary_label: string | null;
  secondary_url: string | null;
};

/** Published posts, newest first. Returns [] when the CMS is empty. */
export const getPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((data?: { limit?: number }) => ({
    limit: Math.min(Math.max(data?.limit ?? 12, 1), 50),
  }))
  .handler(async ({ data }): Promise<PublicPost[]> => {
    const { data: rows, error } = await publicClient()
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_image,published_at,created_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(data.limit);

    if (error) {
      console.error("[content] posts failed:", error.message);
      return [];
    }
    return (rows ?? []) as PublicPost[];
  });

/** A single published post by slug, or null. */
export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({
    slug: String(data.slug ?? "")
      .trim()
      .slice(0, 120),
  }))
  .handler(async ({ data }) => {
    if (!data.slug) return null;
    const { data: row, error } = await publicClient()
      .from("blog_posts")
      .select("id,slug,title,excerpt,body,cover_image,published_at,seo_description")
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) {
      console.error("[content] post failed:", error.message);
      return null;
    }
    return row;
  });

/** Active hero slides in display order. Returns [] so callers can fall back. */
export const getActiveSlides = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSlide[]> => {
    const { data: rows, error } = await publicClient()
      .from("hero_slides")
      .select(
        "id,title,highlight,kicker,copy,image_url,primary_label,primary_url,secondary_label,secondary_url",
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[content] slides failed:", error.message);
      return [];
    }
    return (rows ?? []) as PublicSlide[];
  },
);
