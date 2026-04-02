import Link from "next/link";
import type { ToolRanking, Tool } from "@/lib/types";
import { PricingBadge } from "@/components/tools/PricingBadge";
import { ScoreBar } from "./ScoreBar";

type DimensionKey = "overall" | "performance" | "buzz" | "easeOfUse" | "costPerformance";

export function RankingList({
  rankings,
  tools,
  dimension,
}: {
  rankings: ToolRanking[];
  tools: Tool[];
  dimension: string;
}) {
  const key = dimension as DimensionKey;
  const toolMap = new Map(tools.map((t) => [t.slug, t]));

  const sorted = [...rankings].sort((a, b) => b[key] - a[key]);

  return (
    <div className="space-y-3">
      {sorted.map((ranking, index) => {
        const tool = toolMap.get(ranking.toolSlug);
        if (!tool) return null;

        const rank = index + 1;
        const score = ranking[key];

        return (
          <Link
            key={ranking.toolSlug}
            href={`/tools/${ranking.toolSlug}`}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-primary-300 transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                rank === 1
                  ? "bg-amber-100 text-amber-700"
                  : rank === 2
                    ? "bg-gray-200 text-gray-600"
                    : rank === 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-500"
              }`}
            >
              {rank}
            </div>

            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">
              {tool.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                  {tool.name}
                </span>
                <PricingBadge type={tool.pricing.type} />
              </div>
              <p className="text-xs text-gray-500 truncate">
                {tool.shortDescription}
              </p>
            </div>

            <div className="w-32 shrink-0">
              <ScoreBar score={score} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
