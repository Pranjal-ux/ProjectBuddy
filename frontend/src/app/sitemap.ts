import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://projectbuddyapp.vercel.app";
  const currentDate = new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?tab=discover`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/?tab=projects`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=messages`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/?tab=activity`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/?tab=bookmarks`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.75,
    },
  ];
}
