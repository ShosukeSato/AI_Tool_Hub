import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategories,
  getCategoryBySlug,
  getToolsByCategory,
} from "@/lib/data";
import { ToolCard } from "@/components/tools/ToolCard";

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
      title: `${category.name}のAIツール一覧`,
      description: `${category.description}おすすめの${category.name}ツールを比較・解説します。`,
    };
  });
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = getToolsByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-primary-600">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/category" className="hover:text-primary-600">
          カテゴリー
        </Link>
        <span>/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{category.icon}</span>
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
      </div>
      <p className="text-gray-600 mb-8">{category.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {tools.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>このカテゴリーにはまだツールが登録されていません。</p>
        </div>
      )}
    </div>
  );
}
