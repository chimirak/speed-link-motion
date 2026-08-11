const SITE = "Speed Link Express Logistics";
// Canonical origin. Override with VITE_SITE_URL when the custom domain goes
// live so canonical/OG URLs follow without a code change.
const ORIGIN = (
  (import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "https://speed-link-motion.vercel.app"
).replace(/\/$/, "");

export function pageHead({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: string;
}) {
  const full = `${title} — ${SITE}`;
  const url = `${ORIGIN}${path}`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: full },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export { SITE, ORIGIN };
