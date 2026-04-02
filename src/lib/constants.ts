export const SITE_NAME = "AIツールハブ";
export const SITE_DESCRIPTION =
  "最新AIツールを比較・検索できる日本語メディア。ChatGPT、Claude、Gemini、Midjourney など話題のAIツールの特徴・料金・強み・弱みを徹底比較。";
export const SITE_URL = "https://ai-tool-hub.example.com";

export const NAV_ITEMS = [
  { label: "ホーム", href: "/" },
  { label: "ツール一覧", href: "/tools" },
  { label: "比較", href: "/compare" },
  { label: "カテゴリー", href: "/category" },
  { label: "ニュース", href: "/news" },
] as const;

export const RANKING_DIMENSIONS = [
  { key: "overall", label: "総合スコア", icon: "🏆" },
  { key: "performance", label: "性能・品質", icon: "⚡" },
  { key: "buzz", label: "話題性", icon: "🔥" },
  { key: "easeOfUse", label: "使いやすさ", icon: "👍" },
  { key: "costPerformance", label: "コストパフォーマンス", icon: "💰" },
] as const;
