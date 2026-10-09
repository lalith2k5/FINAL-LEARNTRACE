import type { MetadataRoute } from "next";

const SITE_URL = "https://learntrace.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/assessment",
          "/graph",
          "/gaps",
          "/roadmap",
          "/practice",
          "/simulator",
          "/report",
          "/domains",
          "/profile",
          "/learn",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
