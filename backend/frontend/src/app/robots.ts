import { MetadataRoute } from "next";

const SITE_URL = "https://www.pocket-flow.app";

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
