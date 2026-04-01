"use client";

import { useState, useMemo } from "react";
import type { Tool, Category } from "@/lib/types";
import { ToolCard } from "./ToolCard";

export function ToolListClient({
  tools,
  categories,
}: {
  tools: Tool[];
  categories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        !search ||
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.nameJa.includes(search) ||
        tool.shortDescription.includes(search);

      const matchesCategory =
        !selectedCategory ||
        tool.category === selectedCategory ||
        tool.subcategories?.includes(selectedCategory);

      const matchesPricing =
        !selectedPricing || tool.pricing.type === selectedPricing;

      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [tools, search, selectedCategory, selectedPricing]);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="ツール名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">すべてのカテゴリー</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        <select
          value={selectedPricing}
          onChange={(e) => setSelectedPricing(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">すべての料金タイプ</option>
          <option value="free">無料</option>
          <option value="freemium">フリーミアム</option>
          <option value="paid">有料</option>
        </select>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length}件のツールが見つかりました
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">該当するツールが見つかりません</p>
          <p className="text-sm">検索条件を変更してお試しください</p>
        </div>
      )}
    </div>
  );
}
