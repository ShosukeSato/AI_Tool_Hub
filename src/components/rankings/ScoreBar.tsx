export function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const percentage = (score / max) * 100;
  const color =
    score >= 8
      ? "bg-green-500"
      : score >= 6
        ? "bg-blue-500"
        : score >= 4
          ? "bg-amber-500"
          : "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">
        {score}
      </span>
    </div>
  );
}
