import Link from "next/link";
import type { NewsItem } from "@/lib/types";

const TYPE_STYLES = {
  "new-tool": { label: "新登場", className: "bg-green-100 text-green-800" },
  update: { label: "アップデート", className: "bg-blue-100 text-blue-800" },
  trending: { label: "話題", className: "bg-orange-100 text-orange-800" },
} as const;

export function NewsCard({ item }: { item: NewsItem }) {
  const typeInfo = TYPE_STYLES[item.type];
  const formattedDate = new Date(item.date).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
  });

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.className}`}
        >
          {typeInfo.label}
        </span>
        <span className="text-xs text-gray-400">{formattedDate}</span>
        {item.source && (
          <span className="text-xs text-gray-400">/ {item.source}</span>
        )}
      </div>
      <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
    </div>
  );

  if (item.toolSlug) {
    return <Link href={`/tools/${item.toolSlug}`}>{content}</Link>;
  }

  return content;
}
