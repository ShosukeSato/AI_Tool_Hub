import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllComparisons,
  getComparisonBySlug,
  getToolBySlug,
} from "@/lib/data";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { PricingBadge } from "@/components/tools/PricingBadge";

export function generateStaticParams() {
  return getAllComparisons().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const comparison = getComparisonBySlug(slug);
    if (!comparison) return { title: "比較が見つかりません" };
    return {
      title: comparison.title,
      description: comparison.description,
    };
  });
}

export default async function ComparisonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  const tools = comparison.toolSlugs
    .map((s) => getToolBySlug(s))
    .filter((t) => t !== undefined);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-primary-600">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/compare" className="hover:text-primary-600">
          比較
        </Link>
        <span>/</span>
        <span className="text-gray-900">{comparison.title}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {comparison.title}
      </h1>
      <p className="text-gray-600 mb-8">{comparison.description}</p>

      {/* Tool Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 transition-all text-center group"
          >
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">
              {tool.name.charAt(0)}
            </div>
            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 mb-1">
              {tool.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2">{tool.developer}</p>
            <PricingBadge type={tool.pricing.type} />
          </Link>
        ))}
      </div>

      {/* Comparison Table */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">詳細比較</h2>
        <ComparisonTable comparison={comparison} tools={tools} />
      </section>

      {/* Conclusion */}
      <section className="bg-primary-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">まとめ</h2>
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {comparison.conclusion}
        </div>
      </section>

      <p className="text-xs text-gray-400 text-right mt-4">
        最終更新: {comparison.lastUpdated}
      </p>
    </div>
  );
}
