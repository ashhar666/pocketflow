import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://pocketflow.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
