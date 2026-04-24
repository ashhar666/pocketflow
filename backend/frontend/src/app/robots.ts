import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'https://pocketflow-chi.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/login", "/register", "/forgot-password", "/reset-password", "/footer-demo"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
