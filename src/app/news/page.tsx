import type { Metadata } from "next";
import { getTrendingTools, getAllNews } from "@/lib/data";
import { TrendingSection } from "@/components/news/TrendingSection";
import { NewsCard } from "@/components/news/NewsCard";

export const metadata: Metadata = {
  title: "AIニュース & トレンド",
  description:
    "最近話題のAIツールや最新アップデート情報をお届け。今注目すべきAIツールが一目でわかります。",
};

export default function NewsPage() {
  const trending = getTrendingTools();
  const news = getAllNews();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        AIニュース & トレンド
      </h1>
      <p className="text-gray-600 mb-10">
        最近話題のAIツールや最新アップデート情報。30日以内の情報を自動で表示しています。
      </p>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            🔥 今話題のAIツール
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            SNS・テックメディアでの言及数をもとに独自のバズスコアで算出
          </p>
          <TrendingSection items={trending} />
        </section>
      )}

      {/* News Section */}
      {news.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            📰 最新ニュース
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {trending.length === 0 && news.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>現在表示できるニュースはありません。</p>
        </div>
      )}
    </div>
  );
}
