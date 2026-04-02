import fs from "fs";
import path from "path";
import type {
  Tool,
  Category,
  Comparison,
  ToolRanking,
  TrendingItem,
  NewsItem,
} from "./types";

const dataDir = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getAllTools(): Tool[] {
  return readJson<Tool[]>("tools.json");
}

export function getToolBySlug(slug: string): Tool | undefined {
  return getAllTools().find((t) => t.slug === slug);
}

export function getToolsByCategory(categorySlug: string): Tool[] {
  return getAllTools().filter(
    (t) =>
      t.category === categorySlug || t.subcategories?.includes(categorySlug)
  );
}

export function getAllCategories(): Category[] {
  return readJson<Category[]>("categories.json").sort(
    (a, b) => a.order - b.order
  );
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getAllCategories().find((c) => c.slug === slug);
}

export function getAllComparisons(): Comparison[] {
  return readJson<Comparison[]>("comparisons.json");
}

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return getAllComparisons().find((c) => c.slug === slug);
}

export function getAllRankings(): ToolRanking[] {
  return readJson<ToolRanking[]>("rankings.json");
}

export function getRankingsByCategory(categorySlug: string): ToolRanking[] {
  const tools = getToolsByCategory(categorySlug);
  const toolSlugs = new Set(tools.map((t) => t.slug));
  return getAllRankings().filter((r) => toolSlugs.has(r.toolSlug));
}

export function getTrendingTools(): TrendingItem[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return readJson<TrendingItem[]>("trending.json")
    .filter((t) => new Date(t.lastSeen) >= thirtyDaysAgo)
    .sort((a, b) => b.buzzScore - a.buzzScore);
}

export function getAllNews(): NewsItem[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return readJson<NewsItem[]>("news.json")
    .filter((n) => new Date(n.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
