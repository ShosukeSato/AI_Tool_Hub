const BADGE_STYLES = {
  free: "bg-green-100 text-green-800",
  freemium: "bg-blue-100 text-blue-800",
  paid: "bg-amber-100 text-amber-800",
  enterprise: "bg-purple-100 text-purple-800",
} as const;

const BADGE_LABELS = {
  free: "無料",
  freemium: "フリーミアム",
  paid: "有料",
  enterprise: "エンタープライズ",
} as const;

export function PricingBadge({
  type,
}: {
  type: keyof typeof BADGE_STYLES;
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[type]}`}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
