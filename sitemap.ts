import type { MetadataRoute } from "next";
import { implementedTools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pages = ["", "/tools", "/pricing", "/about", "/contact", "/privacy", "/terms", ...implementedTools.map((tool) => `/tools/${tool.slug}`)];
  return pages.map((path) => ({ url: new URL(path, origin).toString(), lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : path.startsWith("/tools/") ? 0.75 : 0.6 }));
}
