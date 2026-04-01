import fs from "fs";
import path from "path";
import type { Tool, Category, Comparison } from "./types";

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
