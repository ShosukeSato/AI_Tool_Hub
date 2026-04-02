import Link from "next/link";
import {
  getAllTools,
  getAllCategories,
  getAllComparisons,
  getTrendingTools,
  getAllNews,
} from "@/lib/data";
import { ToolCard } from "@/components/tools/ToolCard";
import { CategoryCard } from "@/components/category/CategoryCard";
import { ComparisonCard } from "@/components/compare/ComparisonCard";
import { TrendingSection } from "@/components/news/TrendingSection";
import { NewsCard } from "@/components/news/NewsCard";

export default function Home() {
  const tools = getAllTools();
  const categories = getAllCategories();
  const comparisons = getAllComparisons();
  const trending = getTrendingTools().slice(0, 6);
  const news = getAllNews().slice(0, 3);

  const featuredTools = tools.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AIツールを見つけよう、比べよう
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            ChatGPT、Claude、Gemini をはじめ、話題のAIツールの特徴・料金・強み・弱みを徹底比較。あなたに最適なツールが見つかります。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/tools"
              className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              ツール一覧を見る
            </Link>
            <Link
              href="/compare"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              比較を見る
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">注目のAIツール</h2>
          <Link
            href="/tools"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                🔥 今話題のAIツール
              </h2>
              <Link
                href="/news"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                すべて見る →
              </Link>
            </div>
            <TrendingSection items={trending} />
          </div>
        </section>
      )}

      {/* Latest News */}
      {news.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              📰 最新ニュース
            </h2>
            <Link
              href="/news"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              カテゴリーから探す
            </h2>
            <Link
              href="/category"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              すべて見る →
            </Link>
          </div>
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
      </section>

      {/* Comparisons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">人気の比較</h2>
          <Link
            href="/compare"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((comp) => (
            <ComparisonCard
              key={comp.slug}
              comparison={comp}
              tools={tools.filter((t) => comp.toolSlugs.includes(t.slug))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
