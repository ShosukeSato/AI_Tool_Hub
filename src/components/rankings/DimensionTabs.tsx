"use client";

import { useState } from "react";
import { RANKING_DIMENSIONS } from "@/lib/constants";
import type { ToolRanking, Tool } from "@/lib/types";
import { RankingList } from "./RankingList";

export function DimensionTabs({
  rankings,
  tools,
}: {
  rankings: ToolRanking[];
  tools: Tool[];
}) {
  const [activeDimension, setActiveDimension] = useState<string>("overall");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {RANKING_DIMENSIONS.map((dim) => (
          <button
            key={dim.key}
            onClick={() => setActiveDimension(dim.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDimension === dim.key
                ? "bg-primary-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            {dim.icon} {dim.label}
          </button>
        ))}
      </div>
      <RankingList
        rankings={rankings}
        tools={tools}
        dimension={activeDimension}
      />
    </div>
  );
}
