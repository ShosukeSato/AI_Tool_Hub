import Link from "next/link";
import type { Comparison, Tool } from "@/lib/types";

export function ComparisonCard({
  comparison,
  tools,
}: {
  comparison: Comparison;
  tools: Tool[];
}) {
  return (
    <Link
      href={`/compare/${comparison.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all group"
    >
      <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
        {comparison.title}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{comparison.description}</p>
      <div className="flex gap-2 flex-wrap">
        {tools.map((tool) => (
          <span
            key={tool.slug}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
          >
            {tool.name}
          </span>
        ))}
      </div>
    </Link>
  );
}
