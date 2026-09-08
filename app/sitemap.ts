import type { MetadataRoute } from "next";

import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://tiemnguoiquang.com";

  const business = await getBusinessBySlug(BUSINESS_SLUG).catch(() => null);
  const lastmod = business?.updated_at || new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: lastmod,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/menu`,
      lastModified: lastmod,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/location`,
      lastModified: lastmod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/booking`,
      lastModified: lastmod,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: lastmod,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
