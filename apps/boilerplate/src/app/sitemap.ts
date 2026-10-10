import type { MetadataRoute } from "next";
import { restaurantConfig } from "@/config";
import { getBaseUrl } from "@/lib/site-url";

/**
 * Auto-generates /sitemap.xml — helps Google discover and index the site.
 * Every public page is included with its last-modified date.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/menu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  if (restaurantConfig.features.gallery) {
    pages.push({
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  if (restaurantConfig.features.reservations) {
    pages.push({
      url: `${baseUrl}/reservations`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  if (restaurantConfig.features.onlineOrdering) {
    pages.push({
      url: `${baseUrl}/cart`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return pages;
}
