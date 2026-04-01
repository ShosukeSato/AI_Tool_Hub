import type { Comparison, Tool } from "@/lib/types";

function CellValue({
  value,
  type,
}: {
  value: string | number | boolean;
  type: "text" | "rating" | "boolean";
}) {
  if (type === "boolean") {
    return (
      <span className={value ? "text-green-600" : "text-gray-300"}>
        {value ? "○" : "✕"}
      </span>
    );
  }
  if (type === "rating" && typeof value === "number") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-amber-500 text-sm">
          {"★".repeat(value)}
          {"☆".repeat(5 - value)}
        </span>
      </div>
    );
  }
  return <span className="text-sm">{String(value)}</span>;
}

export function ComparisonTable({
  comparison,
  tools,
}: {
  comparison: Comparison;
  tools: Tool[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-3 px-4 text-sm font-medium text-gray-500 bg-gray-50 rounded-tl-lg min-w-[140px]">
              比較項目
            </th>
            {tools.map((tool) => (
              <th
                key={tool.slug}
                className="py-3 px-4 text-sm font-bold text-gray-900 bg-gray-50 text-center min-w-[120px]"
              >
                {tool.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.comparisonPoints.map((point, i) => (
            <tr
              key={i}
              className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
            >
              <td className="py-3 px-4 text-sm font-medium text-gray-700">
                {point.label}
              </td>
              {tools.map((tool) => (
                <td key={tool.slug} className="py-3 px-4 text-center">
                  <CellValue
                    value={point.values[tool.slug]}
                    type={point.type}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
