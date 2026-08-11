/**
 * Resolves the origin to use for authentication redirects.
 *
 * Order of preference:
 *   1. The live browser origin. This is always correct in production and moves
 *      with the site automatically, so switching from the Vercel URL to
 *      speedlinkexpress.com needs no code change.
 *   2. VITE_SITE_URL, for server-side rendering where no window exists.
 *   3. The known production origin.
 *
 * localhost is deliberately NOT a fallback: a misconfigured build should send
 * users to production rather than to a machine they do not own.
 */
const PRODUCTION_ORIGIN = "https://speed-link-motion.vercel.app";

export function siteOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  const configured = import.meta.env["VITE_SITE_URL"] as string | undefined;
  if (configured && !/localhost|127\.0\.0\.1/.test(configured)) {
    return configured.replace(/\/$/, "");
  }
  return PRODUCTION_ORIGIN;
}

/** Absolute URL for an in-app path, safe to hand to Supabase as a redirect. */
export function siteUrl(path: string): string {
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Where Supabase should return the user after an email link is followed.
 * Always the callback route, which establishes the session before routing on.
 */
export function authCallbackUrl(next?: string): string {
  const base = siteUrl("/auth/callback");
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}
