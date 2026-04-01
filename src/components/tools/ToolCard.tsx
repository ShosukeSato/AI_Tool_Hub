import Link from "next/link";
import type { Tool } from "@/lib/types";
import { PricingBadge } from "./PricingBadge";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0">
          {tool.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {tool.name}
            </h3>
            <PricingBadge type={tool.pricing.type} />
          </div>
          <p className="text-sm text-gray-500 mb-2">{tool.developer}</p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {tool.shortDescription}
          </p>
          {tool.rating && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-amber-500 text-sm">{"★".repeat(Math.round(tool.rating))}</span>
              <span className="text-xs text-gray-500">{tool.rating}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
