/**
 * Returns the canonical base URL for the site.
 * Priority: explicit env var → Vercel deployment URL → localhost.
 * Automatically uses https in production and http in local dev.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local dev — assume http
  return "http://localhost:3000";
}
