import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategories,
  getCategoryBySlug,
  getToolsByCategory,
  getRankingsByCategory,
} from "@/lib/data";
import { DimensionTabs } from "@/components/rankings/DimensionTabs";

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const category = getCategoryBySlug(slug);
    if (!category) return { title: "カテゴリーが見つかりません" };
    return {
      title: `${category.name}ランキング`,
      description: `${category.name}のAIツールを性能・話題性・使いやすさ・コスパで徹底ランキング。`,
    };
  });
}

export default async function CategoryRankingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = getToolsByCategory(slug);
  const rankings = getRankingsByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-primary-600">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/category" className="hover:text-primary-600">
          カテゴリー
        </Link>
        <span>/</span>
        <Link
          href={`/category/${slug}`}
          className="hover:text-primary-600"
        >
          {category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">ランキング</span>
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{category.icon}</span>
        <h1 className="text-3xl font-bold text-gray-900">
          {category.name} ランキング
        </h1>
      </div>
      <p className="text-gray-600 mb-8">
        {category.name}のAIツールを複数の観点からランキング。部門を切り替えて比較できます。
      </p>

      {rankings.length > 0 ? (
        <DimensionTabs rankings={rankings} tools={tools} />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>ランキングデータはまだありません。</p>
        </div>
      )}
    </div>
  );
}
