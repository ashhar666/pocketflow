import { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://www.pocket-flow.app";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  DEFAULT_SITE_URL;

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
