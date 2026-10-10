import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site-url";

/**
 * Auto-generates /robots.txt — tells search engines what to crawl.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/checkout/pay"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
