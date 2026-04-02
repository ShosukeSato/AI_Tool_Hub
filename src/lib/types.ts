export interface Tool {
  slug: string;
  name: string;
  nameJa: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategories?: string[];
  pricing: PricingInfo;
  features: string[];
  pros: string[];
  cons: string[];
  officialUrl: string;
  logoPath: string;
  rating?: number;
  recommendedFor: string[];
  releaseYear?: number;
  developer: string;
  lastUpdated: string;
}

export interface PricingInfo {
  type: "free" | "freemium" | "paid" | "enterprise";
  plans: PricingPlan[];
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface Comparison {
  slug: string;
  title: string;
  description: string;
  toolSlugs: string[];
  comparisonPoints: ComparisonPoint[];
  conclusion: string;
  lastUpdated: string;
}

export interface ComparisonPoint {
  label: string;
  type: "text" | "rating" | "boolean";
  values: Record<string, string | number | boolean>;
}

export interface ToolRanking {
  toolSlug: string;
  overall: number;
  performance: number;
  buzz: number;
  easeOfUse: number;
  costPerformance: number;
  lastCalculated: string;
}

export interface TrendingMention {
  source: string;
  title: string;
  url?: string;
  score?: number;
  date: string;
}

export interface TrendingItem {
  toolSlug: string;
  toolName: string;
  buzzScore: number;
  mentions: TrendingMention[];
  firstSeen: string;
  lastSeen: string;
}

export interface NewsItem {
  id: string;
  type: "new-tool" | "update" | "trending";
  toolSlug?: string;
  title: string;
  summary: string;
  date: string;
  source?: string;
  url?: string;
}
