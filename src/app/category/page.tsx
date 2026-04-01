import type { Metadata } from "next";
import { getAllCategories, getAllTools } from "@/lib/data";
import { CategoryCard } from "@/components/category/CategoryCard";

export const metadata: Metadata = {
  title: "カテゴリー一覧",
  description:
    "AIツールをカテゴリーから探す。チャットボット、画像生成、コーディング、検索など用途別に最適なツールを見つけましょう。",
};

export default function CategoryPage() {
  const categories = getAllCategories();
  const tools = getAllTools();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        カテゴリーから探す
      </h1>
      <p className="text-gray-600 mb-8">
        用途やジャンルからAIツールを探しましょう。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.slug}
            category={cat}
            toolCount={
              tools.filter(
                (t) =>
                  t.category === cat.slug ||
                  t.subcategories?.includes(cat.slug)
              ).length
            }
          />
        ))}
      </div>
    </div>
  );
}
