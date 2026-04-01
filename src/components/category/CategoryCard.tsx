import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryCard({
  category,
  toolCount,
}: {
  category: Category;
  toolCount: number;
}) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all group"
    >
      <div className="text-3xl mb-3">{category.icon}</div>
      <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
        {category.name}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
        {category.description}
      </p>
      <p className="text-xs text-primary-600 font-medium">
        {toolCount}件のツール →
      </p>
    </Link>
  );
}
