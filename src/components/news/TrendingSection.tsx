import Link from "next/link";
import type { TrendingItem } from "@/lib/types";

export function TrendingSection({ items }: { items: TrendingItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Link
          key={item.toolSlug}
          href={`/tools/${item.toolSlug}`}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">
              {item.toolName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {item.toolName}
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-orange-500 text-sm font-semibold">
                  🔥 {item.buzzScore}
                </span>
                <span className="text-xs text-gray-400">/ 10</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            {item.mentions.slice(0, 2).map((mention, i) => (
              <p key={i} className="text-xs text-gray-500 truncate">
                <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium mr-1">
                  {mention.source}
                </span>
                {mention.title}
              </p>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            初回検出: {item.firstSeen} / 最終: {item.lastSeen}
          </p>
        </Link>
      ))}
    </div>
  );
}
