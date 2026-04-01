import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllTools,
  getToolBySlug,
  getCategoryBySlug,
} from "@/lib/data";
import { PricingBadge } from "@/components/tools/PricingBadge";
import { ProsCons } from "@/components/common/ProsCons";
import { SITE_NAME } from "@/lib/constants";

export function generateStaticParams() {
  return getAllTools().map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const tool = getToolBySlug(slug);
    if (!tool) return { title: "ツールが見つかりません" };
    return {
      title: `${tool.name}の特徴・料金・レビュー`,
      description: `${tool.shortDescription}。${tool.name}の料金プラン、メリット・デメリット、おすすめユーザーを詳しく解説。`,
    };
  });
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const category = getCategoryBySlug(tool.category);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-primary-600">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-primary-600">
          ツール一覧
        </Link>
        <span>/</span>
        <span className="text-gray-900">{tool.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl shrink-0">
            {tool.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
              <PricingBadge type={tool.pricing.type} />
            </div>
            <p className="text-gray-500 mb-1">
              {tool.developer} | {category?.name}
              {tool.releaseYear && ` | ${tool.releaseYear}年〜`}
            </p>
            {tool.rating && (
              <div className="flex items-center gap-1 mb-3">
                <span className="text-amber-500">
                  {"★".repeat(Math.round(tool.rating))}
                  {"☆".repeat(5 - Math.round(tool.rating))}
                </span>
                <span className="text-sm text-gray-500">{tool.rating}/5</span>
              </div>
            )}
            <p className="text-gray-700 leading-relaxed">{tool.description}</p>
            <a
              href={tool.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
            >
              公式サイトへ →
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">主な機能</h2>
        <div className="flex flex-wrap gap-2">
          {tool.features.map((feature, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      </section>

      {/* Pros & Cons */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          メリット・デメリット
        </h2>
        <ProsCons pros={tool.pros} cons={tool.cons} />
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">料金プラン</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tool.pricing.plans.map((plan, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors"
            >
              <h3 className="font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-lg font-semibold text-primary-600 mb-3">
                {plan.price}
              </p>
              <ul className="space-y-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-primary-500 shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended For */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          こんな人におすすめ
        </h2>
        <ul className="space-y-2">
          {tool.recommendedFor.map((rec, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-gray-700"
            >
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </section>

      {/* Last updated */}
      <p className="text-xs text-gray-400 text-right">
        最終更新: {tool.lastUpdated}
      </p>
    </div>
  );
}
