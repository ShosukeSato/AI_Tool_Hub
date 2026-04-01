import type { Metadata } from "next";
import { getAllComparisons, getAllTools } from "@/lib/data";
import { ComparisonCard } from "@/components/compare/ComparisonCard";

export const metadata: Metadata = {
  title: "AIツール比較",
  description:
    "AIツールを徹底比較。ChatGPT vs Claude、Cursor vs Copilot など人気ツールの違いがひと目でわかります。",
};

export default function ComparePage() {
  const comparisons = getAllComparisons();
  const tools = getAllTools();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AIツール比較</h1>
      <p className="text-gray-600 mb-8">
        似た機能のAIツールを比較して、あなたに最適なツールを見つけましょう。
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisons.map((comp) => (
          <ComparisonCard
            key={comp.slug}
            comparison={comp}
            tools={tools.filter((t) => comp.toolSlugs.includes(t.slug))}
          />
        ))}
      </div>
    </div>
  );
}
