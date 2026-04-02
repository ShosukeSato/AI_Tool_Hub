/**
 * AI Tool Hub - 自動更新スクリプト v3.0（ウェブ検索対応版）
 *
 * ===== v2からの根本的な改善 =====
 * 旧: Claude APIの知識ベース（学習データ時点の情報）のみに依存
 *   → 最新のバズツールを見逃す致命的な弱点
 *
 * 新: 複数のリアルタイム情報源から実際にウェブデータを取得し、
 *     それをClaudeに渡して日本語コンテンツを生成
 *   → トレンドを見逃さない
 *
 * 情報源:
 * 1. Hacker News API（無料・リアルタイム）
 * 2. Product Hunt（ウェブフェッチ）
 * 3. Reddit（ウェブフェッチ）
 * 4. Google News RSS（AIツール関連ニュース）
 * 5. 主要テックブログのRSSフィード
 * 6. ウォッチリスト（手動で追加候補を指定）
 *
 * 使い方:
 *   npx tsx scripts/update-tools.ts              # 全機能実行
 *   npx tsx scripts/update-tools.ts --discover    # 新ツール発見のみ
 *   npx tsx scripts/update-tools.ts --update      # 既存ツール更新のみ
 *   npx tsx scripts/update-tools.ts --dry-run     # プレビュー（保存しない）
 *   npx tsx scripts/update-tools.ts --add "Name"  # 特定ツールを即座に調査・追加
 *   npx tsx scripts/update-tools.ts --add "Name" --url "https://..."  # URLから情報を読み取って追加
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY - Claude APIキー（必須、.env.localから自動読込）
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

// --- 型定義 ---

interface Tool {
  slug: string;
  name: string;
  nameJa: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategories?: string[];
  pricing: {
    type: "free" | "freemium" | "paid" | "enterprise";
    plans: { name: string; price: string; features: string[] }[];
  };
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

interface Category {
  slug: string;
  name: string;
}

interface WebSource {
  name: string;
  data: string;
}

// --- 設定 ---

interface TrendingMention {
  source: string;
  title: string;
  url?: string;
  score?: number;
  date: string;
}

interface TrendingItem {
  toolSlug: string;
  toolName: string;
  buzzScore: number;
  mentions: TrendingMention[];
  firstSeen: string;
  lastSeen: string;
}

interface ToolRanking {
  toolSlug: string;
  overall: number;
  performance: number;
  buzz: number;
  easeOfUse: number;
  costPerformance: number;
  lastCalculated: string;
}

interface NewsItem {
  id: string;
  type: "new-tool" | "update" | "trending";
  toolSlug?: string;
  title: string;
  summary: string;
  date: string;
  source?: string;
  url?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const TOOLS_FILE = path.join(DATA_DIR, "tools.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const WATCHLIST_FILE = path.join(DATA_DIR, "watchlist.json");
const TRENDING_FILE = path.join(DATA_DIR, "trending.json");
const RANKINGS_FILE = path.join(DATA_DIR, "rankings.json");
const NEWS_FILE = path.join(DATA_DIR, "news.json");

// ウェブ情報源
const SOURCES = {
  hackerNews: "https://hacker-news.firebaseio.com/v0",
  redditAI: "https://www.reddit.com/r/artificial/top.json?t=week&limit=30",
  redditChatGPT: "https://www.reddit.com/r/ChatGPT/top.json?t=week&limit=20",
  redditLocalLLaMA:
    "https://www.reddit.com/r/LocalLLaMA/top.json?t=week&limit=20",
  redditSingularity:
    "https://www.reddit.com/r/singularity/top.json?t=week&limit=20",
  productHunt:
    "https://www.producthunt.com/feed?category=artificial-intelligence",
  googleNewsAI:
    "https://news.google.com/rss/search?q=new+AI+tool+launch+2026&hl=en-US&gl=US&ceid=US:en",
  googleNewsAIJa:
    "https://news.google.com/rss/search?q=AIツール+新しい+リリース+2026&hl=ja&gl=JP&ceid=JP:ja",
  techCrunchAI:
    "https://techcrunch.com/category/artificial-intelligence/feed/",
  theVergeAI:
    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
};

// --- ユーティリティ ---

function loadTools(): Tool[] {
  return JSON.parse(fs.readFileSync(TOOLS_FILE, "utf-8"));
}

function loadCategories(): Category[] {
  return JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf-8"));
}

function loadWatchlist(): string[] {
  if (!fs.existsSync(WATCHLIST_FILE)) return [];
  return JSON.parse(fs.readFileSync(WATCHLIST_FILE, "utf-8"));
}

function saveWatchlist(list: string[]): void {
  fs.writeFileSync(
    WATCHLIST_FILE,
    JSON.stringify(list, null, 2) + "\n",
    "utf-8"
  );
}

function saveTools(tools: Tool[]): void {
  fs.writeFileSync(TOOLS_FILE, JSON.stringify(tools, null, 2) + "\n", "utf-8");
}

function loadTrending(): TrendingItem[] {
  if (!fs.existsSync(TRENDING_FILE)) return [];
  return JSON.parse(fs.readFileSync(TRENDING_FILE, "utf-8"));
}

function saveTrending(items: TrendingItem[]): void {
  fs.writeFileSync(TRENDING_FILE, JSON.stringify(items, null, 2) + "\n", "utf-8");
}

function loadRankings(): ToolRanking[] {
  if (!fs.existsSync(RANKINGS_FILE)) return [];
  return JSON.parse(fs.readFileSync(RANKINGS_FILE, "utf-8"));
}

function saveRankings(rankings: ToolRanking[]): void {
  fs.writeFileSync(RANKINGS_FILE, JSON.stringify(rankings, null, 2) + "\n", "utf-8");
}

function loadNews(): NewsItem[] {
  if (!fs.existsSync(NEWS_FILE)) return [];
  return JSON.parse(fs.readFileSync(NEWS_FILE, "utf-8"));
}

function saveNews(items: NewsItem[]): void {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(items, null, 2) + "\n", "utf-8");
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExistingNames(tools: Tool[]): Set<string> {
  return new Set(tools.map((t) => t.name.toLowerCase()));
}

function getCategoryPrompt(): string {
  const categories = loadCategories();
  return categories.map((c) => `${c.slug}: ${c.name}`).join(", ");
}

function getToolJsonSchema(): string {
  return `{
    "slug": "tool-name-kebab",
    "name": "Tool Name",
    "nameJa": "ツール名（カタカナ）",
    "description": "150-250文字の日本語詳細説明。何ができるか、特徴、他との違いを具体的に",
    "shortDescription": "20-35文字の日本語一行説明",
    "category": "カテゴリslug",
    "subcategories": [],
    "pricing": {
      "type": "free|freemium|paid|enterprise",
      "plans": [{"name": "プラン名", "price": "料金（日本円換算も）", "features": ["機能1", "機能2"]}]
    },
    "features": ["主要機能1（日本語）", "機能2", "機能3", "機能4", "機能5"],
    "pros": ["メリット1（具体的に日本語）", "メリット2", "メリット3", "メリット4"],
    "cons": ["デメリット1（具体的に日本語）", "デメリット2", "デメリット3"],
    "officialUrl": "https://...",
    "logoPath": "/logos/slug.svg",
    "rating": 4.0,
    "recommendedFor": ["おすすめの人1（日本語）", "おすすめの人2", "おすすめの人3"],
    "releaseYear": 2024,
    "developer": "開発元",
    "lastUpdated": "${today()}"
  }`;
}

// --- ウェブデータ取得 ---

async function fetchWithTimeout(
  url: string,
  timeoutMs = 10000
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "AIToolHub/1.0 (AI tool catalog; contact@ai-tool-hub.example.com)",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchHackerNewsTopAI(): Promise<string> {
  console.log("  📡 Hacker News を取得中...");
  try {
    const topRes = await fetchWithTimeout(
      `${SOURCES.hackerNews}/topstories.json`
    );
    if (!topRes) return "";

    const topIds: number[] = JSON.parse(topRes).slice(0, 100);
    const stories: string[] = [];

    // 上位100件からAI関連をフィルタ
    const batchSize = 20;
    for (let i = 0; i < topIds.length; i += batchSize) {
      const batch = topIds.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (id) => {
          const data = await fetchWithTimeout(
            `${SOURCES.hackerNews}/item/${id}.json`
          );
          if (!data) return null;
          return JSON.parse(data);
        })
      );

      for (const item of results) {
        if (!item || !item.title) continue;
        const title = item.title.toLowerCase();
        if (
          title.includes("ai") ||
          title.includes("llm") ||
          title.includes("gpt") ||
          title.includes("claude") ||
          title.includes("machine learning") ||
          title.includes("generative") ||
          title.includes("chatbot") ||
          title.includes("diffusion") ||
          title.includes("copilot") ||
          title.includes("agent")
        ) {
          stories.push(
            `[HN ${item.score}pts] ${item.title} (${item.url || ""})`
          );
        }
      }
    }

    console.log(`    → ${stories.length}件のAI関連記事を発見`);
    return stories.join("\n");
  } catch (e) {
    console.log(`    ⚠️ HN取得エラー: ${e}`);
    return "";
  }
}

async function fetchRedditAI(): Promise<string> {
  console.log("  📡 Reddit を取得中...");
  const subreddits = [
    { url: SOURCES.redditAI, name: "r/artificial" },
    { url: SOURCES.redditChatGPT, name: "r/ChatGPT" },
    { url: SOURCES.redditLocalLLaMA, name: "r/LocalLLaMA" },
    { url: SOURCES.redditSingularity, name: "r/singularity" },
  ];

  const allPosts: string[] = [];

  for (const sub of subreddits) {
    try {
      const data = await fetchWithTimeout(sub.url);
      if (!data) continue;
      const json = JSON.parse(data);
      const posts = json?.data?.children || [];
      for (const post of posts) {
        const d = post.data;
        if (!d || !d.title) continue;
        allPosts.push(
          `[${sub.name} ${d.score}pts] ${d.title}`
        );
      }
    } catch {
      // skip
    }
  }

  console.log(`    → ${allPosts.length}件のReddit投稿を取得`);
  return allPosts.join("\n");
}

async function fetchRSSFeeds(): Promise<string> {
  console.log("  📡 RSSフィード (Google News, TechCrunch) を取得中...");
  const feeds = [
    { url: SOURCES.googleNewsAI, name: "Google News (EN)" },
    { url: SOURCES.googleNewsAIJa, name: "Google News (JP)" },
    { url: SOURCES.techCrunchAI, name: "TechCrunch AI" },
  ];

  const allItems: string[] = [];

  for (const feed of feeds) {
    try {
      const data = await fetchWithTimeout(feed.url, 15000);
      if (!data) continue;

      // 簡易XMLパース（<title>タグを抽出）
      const titleMatches = data.match(/<title[^>]*>([^<]+)<\/title>/g) || [];
      for (const match of titleMatches.slice(1, 20)) {
        // skip feed title
        const title = match
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"');
        allItems.push(`[${feed.name}] ${title}`);
      }
    } catch {
      // skip
    }
  }

  console.log(`    → ${allItems.length}件のニュース記事を取得`);
  return allItems.join("\n");
}

async function gatherWebData(): Promise<WebSource[]> {
  console.log("\n🌐 リアルタイム情報を収集中...\n");

  const [hn, reddit, rss] = await Promise.all([
    fetchHackerNewsTopAI(),
    fetchRedditAI(),
    fetchRSSFeeds(),
  ]);

  const sources: WebSource[] = [];
  if (hn) sources.push({ name: "Hacker News", data: hn });
  if (reddit) sources.push({ name: "Reddit", data: reddit });
  if (rss) sources.push({ name: "RSS/News", data: rss });

  return sources;
}

// --- Claude API クライアント ---

async function createClient(): Promise<Anthropic> {
  const envFile = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY が設定されていません。\n" +
        ".env.local ファイルに ANTHROPIC_API_KEY=your-key を設定してください。"
    );
  }
  return new Anthropic({ apiKey });
}

// --- 新ツール発見（ウェブデータ + Claude分析） ---

async function discoverFromWebData(
  client: Anthropic,
  webSources: WebSource[]
): Promise<Tool[]> {
  const existingTools = loadTools();
  const existingNames = getExistingNames(existingTools);

  if (webSources.length === 0) {
    console.log("  ⚠️ ウェブデータがありません。Claude知識ベースのみで検索します。");
    return discoverFromKnowledge(client);
  }

  console.log(
    "\n🔍 収集したウェブデータからAIツールを抽出中...\n"
  );

  const sourceText = webSources
    .map((s) => `### ${s.name}のデータ:\n${s.data}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `あなたはAIツールの専門家です。以下は今現在のリアルタイムウェブデータ（Hacker News、Reddit、ニュースRSS）です。

${sourceText}

上記のデータを分析して、**新しいAIツールやサービス**を特定してください。

以下のツールは既に登録済みなので**除外**してください:
${Array.from(existingNames).join(", ")}

条件:
- 上記のウェブデータに実際に登場している、または言及されているツールを優先
- 実際にサービスとして利用可能なもの（または間もなくリリースされるもの）
- ウェブデータに登場していなくても、あなたの知識で最近話題だと確信できるツールも含めてOK
- 特に日本のユーザーに有用なものを優先
- 「なぜこのツールが話題か」の文脈も反映した説明にすること

利用可能なカテゴリ: ${getCategoryPrompt()}

**5〜10件**のツールをJSON配列で返してください。余計な説明は不要です。JSON配列だけを返してください。
各ツールの形式:
${getToolJsonSchema()}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return parseToolsResponse(text, existingNames);
}

// --- Claude知識ベースのみの発見（フォールバック） ---

async function discoverFromKnowledge(client: Anthropic): Promise<Tool[]> {
  const existingTools = loadTools();
  const existingNames = getExistingNames(existingTools);

  console.log("\n🔍 Claude知識ベースから新ツールを検索中...");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `あなたはAIツールの専門家です。現在話題になっている新しいAIツールを提案してください。

以下は既に登録済みなので除外:
${Array.from(existingNames).join(", ")}

カテゴリ: ${getCategoryPrompt()}

**5件**をJSON配列で返してください。JSON配列だけ返してください。
形式: ${getToolJsonSchema()}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseToolsResponse(text, existingNames);
}

// --- URLからページ内容を取得 ---

async function fetchPageContent(url: string): Promise<string> {
  console.log(`  📄 URL取得中: ${url}`);
  try {
    const html = await fetchWithTimeout(url, 15000);
    if (!html) return "";
    // HTMLタグを除去して本文テキストを抽出
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    // 最大8000文字に制限（API制限対策）
    return text.slice(0, 8000);
  } catch (e) {
    console.log(`  ⚠️ URL取得エラー: ${e}`);
    return "";
  }
}

// --- 特定ツールの調査・追加（ウェブ検索情報付き） ---

async function investigateTool(
  client: Anthropic,
  toolName: string,
  webContext?: string
): Promise<Tool | null> {
  const existingTools = loadTools();
  const existingNames = getExistingNames(existingTools);

  if (existingNames.has(toolName.toLowerCase())) {
    console.log(`  ⚠️  "${toolName}" は既に登録済みです`);
    return null;
  }

  console.log(`  🔎 "${toolName}" を調査中...`);

  const contextSection = webContext
    ? `\n以下はウェブから取得した「${toolName}」に関する最新情報です:\n${webContext}\n\nこの情報を参考にしてください。`
    : "";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `「${toolName}」というAIツール/サービスについて詳しく調査してください。${contextSection}

実在するツールであれば以下のJSON形式で返してください。
存在しない/情報不十分なら: {"exists": false, "reason": "理由"}

カテゴリ: ${getCategoryPrompt()}

JSON形式（余計な説明不要、JSONだけ返す）:
{"exists": true, "tool": ${getToolJsonSchema()}}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const result = JSON.parse(jsonMatch[0]);

    if (!result.exists) {
      console.log(
        `  ⚠️  "${toolName}": ${result.reason || "情報が見つかりません"}`
      );
      return null;
    }

    if (result.tool) {
      const tool = result.tool as Tool;
      tool.slug = slugify(tool.name);
      tool.logoPath = `/logos/${tool.slug}.svg`;
      tool.lastUpdated = today();
      return tool;
    }
    return null;
  } catch {
    console.log(`  ⚠️  "${toolName}": 解析エラー`);
    return null;
  }
}

// --- ウォッチリスト処理 ---

async function processWatchlist(client: Anthropic): Promise<Tool[]> {
  const watchlist = loadWatchlist();
  if (watchlist.length === 0) {
    console.log("\n📋 ウォッチリストは空です");
    return [];
  }

  console.log(`\n📋 ウォッチリスト処理中... (${watchlist.length}件)`);
  const newTools: Tool[] = [];
  const remaining: string[] = [];

  for (const toolName of watchlist) {
    const tool = await investigateTool(client, toolName);
    if (tool) {
      newTools.push(tool);
      console.log(`  ✅ "${toolName}" を追加`);
    } else {
      remaining.push(toolName);
    }
  }

  saveWatchlist(remaining);
  return newTools;
}

// --- 既存ツールの更新チェック ---

async function checkToolUpdates(
  client: Anthropic,
  tool: Tool
): Promise<{ updated: boolean; changes: string; updatedTool: Tool }> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `以下のAIツール（${today()}時点）の更新をチェック:

名前: ${tool.name} (${tool.developer})
説明: ${tool.description}
料金: ${JSON.stringify(tool.pricing)}
機能: ${JSON.stringify(tool.features)}
最終更新: ${tool.lastUpdated}

チェック: 新機能リリース、料金変更、大型アップデート、サービス終了/統合

JSON形式で回答（JSONだけ返す）:
{
  "hasUpdates": true/false,
  "changesSummary": "変更の要約（日本語）",
  "updatedFields": {
    "description": null,
    "shortDescription": null,
    "pricing": null,
    "features": null,
    "pros": null,
    "cons": null,
    "rating": null
  }
}

確実な情報のみ。不確かなら hasUpdates: false。`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { updated: false, changes: "", updatedTool: tool };

    const result = JSON.parse(jsonMatch[0]);
    if (!result.hasUpdates)
      return { updated: false, changes: "", updatedTool: tool };

    const updatedTool = { ...tool, lastUpdated: today() };
    if (result.updatedFields) {
      const f = result.updatedFields;
      if (f.description) updatedTool.description = f.description;
      if (f.shortDescription) updatedTool.shortDescription = f.shortDescription;
      if (f.pricing) updatedTool.pricing = f.pricing;
      if (f.features) updatedTool.features = f.features;
      if (f.pros) updatedTool.pros = f.pros;
      if (f.cons) updatedTool.cons = f.cons;
      if (f.rating !== null && f.rating !== undefined)
        updatedTool.rating = f.rating;
    }

    return {
      updated: true,
      changes: result.changesSummary || "情報を更新",
      updatedTool,
    };
  } catch {
    return { updated: false, changes: "", updatedTool: tool };
  }
}

// --- ヘルパー ---

function parseToolsResponse(text: string, existingNames: Set<string>): Tool[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log("  ⚠️  レスポンスを解析できませんでした");
      return [];
    }
    const tools: Tool[] = JSON.parse(jsonMatch[0]);
    return tools.filter((t) => {
      if (!t.name || !t.description) return false;
      if (existingNames.has(t.name.toLowerCase())) return false;
      t.slug = slugify(t.name);
      t.logoPath = `/logos/${t.slug}.svg`;
      t.lastUpdated = today();
      return true;
    });
  } catch (e) {
    console.log("  ⚠️  JSONパースエラー:", e);
    return [];
  }
}

function writeChangelog(changelog: string[]): void {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `update-${today()}.log`);

  const content = [
    `# AIツールハブ 更新ログ - ${today()}`,
    `更新時刻: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
    "",
    ...changelog,
    "",
  ].join("\n");

  if (fs.existsSync(logFile)) {
    fs.appendFileSync(logFile, "\n---\n" + content, "utf-8");
  } else {
    fs.writeFileSync(logFile, content, "utf-8");
  }
  console.log(`📄 ログ: ${logFile}`);
}

// --- バズスコア計算 ---

const SOURCE_WEIGHTS: Record<string, number> = {
  hackernews: 1.0,
  reddit: 0.7,
  producthunt: 1.2,
  googlenews: 0.8,
  techcrunch: 1.5,
  rss: 0.8,
};

function getRecencyDecay(dateStr: string): number {
  const days =
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 3) return 1.0;
  if (days < 7) return 0.7;
  if (days < 14) return 0.4;
  if (days < 30) return 0.2;
  return 0;
}

function matchToolInText(
  text: string,
  tools: Tool[]
): { tool: Tool; score: number } | null {
  const lower = text.toLowerCase();
  for (const tool of tools) {
    const name = tool.name.toLowerCase();
    // Require word-boundary-like match for short names
    if (name.length <= 3) {
      const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
      if (regex.test(text)) return { tool, score: 1 };
    } else if (lower.includes(name)) {
      return { tool, score: 1 };
    }
  }
  return null;
}

interface RawMention {
  source: string;
  title: string;
  url?: string;
  score: number;
  date: string;
}

function extractMentionsFromWebData(
  webSources: WebSource[]
): RawMention[] {
  const mentions: RawMention[] = [];
  const todayStr = today();

  for (const source of webSources) {
    const lines = source.data.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      // Parse [Source Xpts] Title (URL) format
      const hnMatch = line.match(
        /\[(?:HN|r\/\w+)\s+(\d+)pts\]\s+(.+?)(?:\s+\((.+)\))?$/
      );
      const rssMatch = line.match(/\[([^\]]+)\]\s+(.+)/);

      if (hnMatch) {
        const sourceName = source.name.toLowerCase().includes("reddit")
          ? "reddit"
          : "hackernews";
        mentions.push({
          source: sourceName,
          title: hnMatch[2].trim(),
          url: hnMatch[3] || undefined,
          score: parseInt(hnMatch[1]) || 0,
          date: todayStr,
        });
      } else if (rssMatch) {
        const sourceName = rssMatch[1].toLowerCase().includes("techcrunch")
          ? "techcrunch"
          : "googlenews";
        mentions.push({
          source: sourceName,
          title: rssMatch[2].trim(),
          score: 1,
          date: todayStr,
        });
      }
    }
  }

  return mentions;
}

function calculateBuzzScores(
  webSources: WebSource[],
  tools: Tool[]
): TrendingItem[] {
  console.log("\n📊 バズスコアを計算中...");

  const rawMentions = extractMentionsFromWebData(webSources);
  const existing = loadTrending();
  const existingMap = new Map(existing.map((t) => [t.toolSlug, t]));

  // Match mentions to tools
  const toolMentions = new Map<string, { tool: Tool; mentions: RawMention[] }>();

  for (const mention of rawMentions) {
    const match = matchToolInText(mention.title, tools);
    if (match) {
      const slug = match.tool.slug;
      if (!toolMentions.has(slug)) {
        toolMentions.set(slug, { tool: match.tool, mentions: [] });
      }
      toolMentions.get(slug)!.mentions.push(mention);
    }
  }

  // Calculate scores
  const scores: { slug: string; raw: number }[] = [];
  for (const [slug, data] of toolMentions) {
    let rawScore = 0;
    for (const m of data.mentions) {
      const sourceWeight = SOURCE_WEIGHTS[m.source] || 0.5;
      const mentionWeight = Math.min(m.score / 100, 10); // cap at 10
      const decay = getRecencyDecay(m.date);
      rawScore += mentionWeight * sourceWeight * decay;
    }
    scores.push({ slug, raw: rawScore });
  }

  // Normalize to 1-10 scale
  const maxRaw = Math.max(...scores.map((s) => s.raw), 1);

  const trending: TrendingItem[] = [];
  const todayStr = today();

  for (const { slug, raw } of scores) {
    const data = toolMentions.get(slug)!;
    const buzzScore =
      Math.round((1 + (raw / maxRaw) * 9) * 10) / 10;

    const prev = existingMap.get(slug);
    trending.push({
      toolSlug: slug,
      toolName: data.tool.name,
      buzzScore,
      mentions: data.mentions.map((m) => ({
        source: m.source,
        title: m.title,
        url: m.url,
        score: m.score,
        date: m.date,
      })),
      firstSeen: prev?.firstSeen || todayStr,
      lastSeen: todayStr,
    });
  }

  // Keep existing trending items not in new data (if within 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newSlugs = new Set(trending.map((t) => t.toolSlug));

  for (const prev of existing) {
    if (
      !newSlugs.has(prev.toolSlug) &&
      new Date(prev.lastSeen) >= thirtyDaysAgo
    ) {
      // Decay the score by 10% each run
      prev.buzzScore = Math.round(prev.buzzScore * 0.9 * 10) / 10;
      if (prev.buzzScore > 0.5) {
        trending.push(prev);
      }
    }
  }

  trending.sort((a, b) => b.buzzScore - a.buzzScore);
  console.log(`  → ${trending.length}件のトレンドツールを検出`);
  return trending;
}

// --- ランキング更新 ---

async function updateRankings(
  client: Anthropic,
  tools: Tool[],
  trendingItems: TrendingItem[]
): Promise<ToolRanking[]> {
  console.log("\n🏆 ランキングスコアを更新中...");

  const existing = loadRankings();
  const existingMap = new Map(existing.map((r) => [r.toolSlug, r]));

  // Build buzz lookup
  const buzzMap = new Map(trendingItems.map((t) => [t.toolSlug, t.buzzScore]));

  // Group tools by category for batch API calls
  const categories = loadCategories();
  const todayStr = today();
  const allRankings: ToolRanking[] = [];

  // Pick one category to update via API (rotate based on day of year)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const categoryToUpdate = categories[dayOfYear % categories.length];

  for (const cat of categories) {
    const catTools = tools.filter(
      (t) =>
        t.category === cat.slug || t.subcategories?.includes(cat.slug)
    );

    if (cat.slug === categoryToUpdate.slug) {
      // Full API-based evaluation for this category
      try {
        const toolList = catTools
          .map(
            (t) =>
              `- ${t.name}: ${t.shortDescription} (${t.pricing.type}, rating: ${t.rating || "N/A"})`
          )
          .join("\n");

        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `以下の${cat.name}カテゴリのAIツールを3つの観点で1-10のスコアで評価してください。

ツール一覧:
${toolList}

評価観点:
1. performance（性能・品質）: ツールとしての実力、出力品質、機能の充実度
2. easeOfUse（使いやすさ）: UI/UX、学習コスト、ドキュメント充実度
3. costPerformance（コストパフォーマンス）: 無料なら高め、価格に対する価値

JSON配列で返してください（JSONだけ返す）:
[{"slug": "tool-slug", "performance": 8, "easeOfUse": 7, "costPerformance": 6}]`,
            },
          ],
        });

        const text =
          response.content[0].type === "text" ? response.content[0].text : "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const scores: {
            slug: string;
            performance: number;
            easeOfUse: number;
            costPerformance: number;
          }[] = JSON.parse(jsonMatch[0]);

          for (const s of scores) {
            const buzz = buzzMap.get(s.slug) || existingMap.get(s.slug)?.buzz || 3;
            const overall =
              Math.round(
                (0.3 * s.performance +
                  0.15 * buzz +
                  0.25 * s.easeOfUse +
                  0.3 * s.costPerformance) *
                  10
              ) / 10;

            allRankings.push({
              toolSlug: s.slug,
              overall,
              performance: s.performance,
              buzz,
              easeOfUse: s.easeOfUse,
              costPerformance: s.costPerformance,
              lastCalculated: todayStr,
            });
          }
          console.log(
            `  ✅ ${cat.name}: ${scores.length}件をAPI評価`
          );
        }
      } catch (e) {
        console.log(`  ⚠️ ${cat.name}: API評価エラー ${e}`);
      }
    }

    // For non-API categories, reuse existing or generate from tool data
    for (const tool of catTools) {
      if (allRankings.some((r) => r.toolSlug === tool.slug)) continue;

      const prev = existingMap.get(tool.slug);
      if (prev) {
        // Update buzz score only
        const buzz = buzzMap.get(tool.slug) || prev.buzz;
        const overall =
          Math.round(
            (0.3 * prev.performance +
              0.15 * buzz +
              0.25 * prev.easeOfUse +
              0.3 * prev.costPerformance) *
              10
          ) / 10;
        allRankings.push({ ...prev, buzz, overall, lastCalculated: todayStr });
      } else {
        // Generate basic scores from tool metadata
        const rating = tool.rating || 3.5;
        const performance = Math.round(((rating - 1) / 4) * 9 + 1);
        const easeMap: Record<string, number> = { free: 8, freemium: 7, paid: 6, enterprise: 5 };
        const easeOfUse = Math.min(
          10,
          Math.max(1, (easeMap[tool.pricing.type] || 6) + Math.round((rating - 3.5) * 1.5))
        );
        const costMap: Record<string, number> = { free: 9, freemium: 7, paid: 5, enterprise: 3 };
        const costPerformance = Math.min(
          10,
          Math.max(1, (costMap[tool.pricing.type] || 5) + Math.round((rating - 3.5) * 1))
        );
        const buzz = buzzMap.get(tool.slug) || 3;
        const overall =
          Math.round(
            (0.3 * performance + 0.15 * buzz + 0.25 * easeOfUse + 0.3 * costPerformance) * 10
          ) / 10;

        allRankings.push({
          toolSlug: tool.slug,
          overall,
          performance,
          buzz,
          easeOfUse,
          costPerformance,
          lastCalculated: todayStr,
        });
      }
    }
  }

  // Deduplicate (a tool might appear in multiple categories)
  const deduped = new Map<string, ToolRanking>();
  for (const r of allRankings) {
    if (!deduped.has(r.toolSlug) || r.lastCalculated > deduped.get(r.toolSlug)!.lastCalculated) {
      deduped.set(r.toolSlug, r);
    }
  }

  const result = Array.from(deduped.values());
  console.log(`  → ${result.length}件のランキングを更新`);
  return result;
}

// --- ニュース生成 ---

function generateNewsItems(
  changelog: string[],
  trendingItems: TrendingItem[],
  tools: Tool[]
): NewsItem[] {
  console.log("\n📰 ニュースを生成中...");

  const existing = loadNews();
  const existingIds = new Set(existing.map((n) => n.id));
  const newItems: NewsItem[] = [];
  const todayStr = today();
  const toolMap = new Map(tools.map((t) => [t.name.toLowerCase(), t]));

  // From changelog
  for (const entry of changelog) {
    const newMatch = entry.match(/\[NEW\]\s+(.+?):\s+(.+)/);
    const addMatch = entry.match(/\[ADD\]\s+(.+?)\s+\((.+?)\):\s+(.+)/);
    const updateMatch = entry.match(/\[UPDATE\]\s+(.+?):\s+(.+)/);
    const watchMatch = entry.match(/\[WATCHLIST\]\s+(.+?):\s+(.+)/);

    if (newMatch || addMatch || watchMatch) {
      const name = newMatch
        ? newMatch[1]
        : addMatch
          ? addMatch[1]
          : watchMatch![1];
      const summary = newMatch
        ? newMatch[2]
        : addMatch
          ? addMatch[3]
          : watchMatch![2];
      const tool = toolMap.get(name.toLowerCase());
      const id = `new-${slugify(name)}-${todayStr}`;

      if (!existingIds.has(id)) {
        newItems.push({
          id,
          type: "new-tool",
          toolSlug: tool?.slug,
          title: `${name} が新しく追加されました`,
          summary,
          date: todayStr,
        });
      }
    } else if (updateMatch) {
      const name = updateMatch[1];
      const tool = toolMap.get(name.toLowerCase());
      const id = `update-${slugify(name)}-${todayStr}`;

      if (!existingIds.has(id)) {
        newItems.push({
          id,
          type: "update",
          toolSlug: tool?.slug,
          title: `${name} がアップデート`,
          summary: updateMatch[2],
          date: todayStr,
        });
      }
    }
  }

  // From trending spikes (buzz >= 7)
  for (const item of trendingItems) {
    if (item.buzzScore >= 7) {
      const id = `trending-${item.toolSlug}-${todayStr}`;
      if (!existingIds.has(id)) {
        const topMention = item.mentions[0];
        newItems.push({
          id,
          type: "trending",
          toolSlug: item.toolSlug,
          title: `${item.toolName} が話題沸騰中（バズスコア: ${item.buzzScore}）`,
          summary: topMention
            ? `${topMention.source}で注目: ${topMention.title}`
            : `バズスコア${item.buzzScore}を記録`,
          date: todayStr,
          source: topMention?.source,
        });
      }
    }
  }

  // Merge with existing, remove items older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filtered = existing.filter(
    (n) => new Date(n.date) >= thirtyDaysAgo
  );

  const allNews = [...filtered, ...newItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  console.log(`  → ${newItems.length}件の新規ニュースを追加（合計 ${allNews.length}件）`);
  return allNews;
}

// --- メイン ---

async function main() {
  const args = process.argv.slice(2);
  const discoverOnly = args.includes("--discover");
  const updateOnly = args.includes("--update");
  const dryRun = args.includes("--dry-run");
  const addIndex = args.indexOf("--add");
  const addToolName = addIndex >= 0 ? args[addIndex + 1] : null;
  const urlIndex = args.indexOf("--url");
  const addUrls: string[] = [];
  if (urlIndex >= 0) {
    // --url以降の引数でhttpから始まるものを全てURLとして収集
    for (let i = urlIndex + 1; i < args.length; i++) {
      if (args[i].startsWith("http")) addUrls.push(args[i]);
      else break;
    }
  }
  const runAll = !discoverOnly && !updateOnly && !addToolName;

  console.log("╔════════════════════════════════════════════════╗");
  console.log("║  AIツールハブ 自動更新スクリプト v4.0          ║");
  console.log("║  ウェブ検索 + バズスコア + ランキング + ニュース  ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log(`📅 ${today()}`);
  if (dryRun) console.log("📋 ドライランモード");
  console.log("");

  const client = await createClient();
  const tools = loadTools();
  let updatedTools = [...tools];
  const changelog: string[] = [];
  let webSources: WebSource[] = [];

  // 0. --add: 特定ツールを即座に追加（--url でウェブ情報も取得可能）
  if (addToolName) {
    let webContext = "";
    if (addUrls.length > 0) {
      console.log(`\n📄 ${addUrls.length}件のURLから情報を収集中...`);
      const pageContents = await Promise.all(
        addUrls.map(async (url) => {
          const content = await fetchPageContent(url);
          return content ? `[${url}の内容]:\n${content}` : "";
        })
      );
      webContext = pageContents.filter(Boolean).join("\n\n---\n\n");
    }
    const tool = await investigateTool(client, addToolName, webContext || undefined);
    if (tool) {
      updatedTools.push(tool);
      changelog.push(
        `[ADD] ${tool.name} (${tool.nameJa}): ${tool.shortDescription}`
      );
      console.log(`  ✅ ${tool.name} を追加`);
    }
  }

  // 1. ウェブからリアルタイムデータ収集 + 新ツール発見
  if (runAll || discoverOnly) {
    // Step 1: ウェブデータ収集
    webSources = await gatherWebData();

    // Step 2: ウェブデータからAIツールを抽出
    try {
      const newTools = await discoverFromWebData(client, webSources);
      // 重複排除
      const currentNames = getExistingNames(updatedTools);
      const unique = newTools.filter(
        (t) => !currentNames.has(t.name.toLowerCase())
      );

      if (unique.length > 0) {
        console.log(`\n🔥 ${unique.length}件の新ツールを発見:`);
        for (const tool of unique) {
          console.log(
            `  - ${tool.name} (${tool.nameJa}): ${tool.shortDescription}`
          );
          changelog.push(`[NEW] ${tool.name}: ${tool.shortDescription}`);
        }
        updatedTools = [...updatedTools, ...unique];
      } else {
        console.log("\nℹ️  新しいツールは見つかりませんでした");
      }
    } catch (e) {
      console.error("❌ ツール発見エラー:", e);
    }

    // Step 3: ウォッチリスト処理
    try {
      const watchTools = await processWatchlist(client);
      for (const tool of watchTools) {
        if (!getExistingNames(updatedTools).has(tool.name.toLowerCase())) {
          updatedTools.push(tool);
          changelog.push(
            `[WATCHLIST] ${tool.name}: ${tool.shortDescription}`
          );
        }
      }
    } catch (e) {
      console.error("❌ ウォッチリストエラー:", e);
    }
  }

  // 2. 既存ツールの更新チェック
  if (runAll || updateOnly) {
    console.log(`\n🔄 既存ツールの更新チェック... (古い順に10件)`);

    const sortedTools = [...tools].sort(
      (a, b) =>
        new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
    );
    const toolsToCheck = sortedTools.slice(0, 10);

    for (const tool of toolsToCheck) {
      process.stdout.write(`  ${tool.name}...`);
      try {
        const result = await checkToolUpdates(client, tool);
        if (result.updated) {
          console.log(` ✅ ${result.changes}`);
          changelog.push(`[UPDATE] ${tool.name}: ${result.changes}`);
          const idx = updatedTools.findIndex((t) => t.slug === tool.slug);
          if (idx >= 0) updatedTools[idx] = result.updatedTool;
        } else {
          console.log(" 変更なし");
        }
      } catch (e) {
        console.log(` ⚠️ ${e}`);
      }
    }
  }

  // 3. バズスコア・ランキング・ニュース更新
  let trendingItems: TrendingItem[] = [];
  let rankings: ToolRanking[] = [];

  if (runAll || discoverOnly) {
    // バズスコア計算
    trendingItems = calculateBuzzScores(webSources, updatedTools);

    // ランキング更新
    try {
      rankings = await updateRankings(client, updatedTools, trendingItems);
    } catch (e) {
      console.error("⚠️ ランキング更新エラー:", e);
      rankings = loadRankings(); // fallback
    }
  }

  // ニュース生成
  const newsItems = generateNewsItems(
    changelog,
    trendingItems.length > 0 ? trendingItems : loadTrending(),
    updatedTools
  );

  // 4. 保存
  console.log("\n" + "═".repeat(50));

  if (changelog.length > 0) {
    console.log(`📝 変更 (${changelog.length}件):`);
    changelog.forEach((c) => console.log(`  ${c}`));
  }

  if (!dryRun) {
    if (changelog.length > 0) {
      saveTools(updatedTools);
      console.log(`\n💾 ツール保存完了: ${updatedTools.length}件`);
      writeChangelog(changelog);
    }

    if (trendingItems.length > 0) {
      saveTrending(trendingItems);
      console.log(`💾 トレンド保存完了: ${trendingItems.length}件`);
    }

    if (rankings.length > 0) {
      saveRankings(rankings);
      console.log(`💾 ランキング保存完了: ${rankings.length}件`);
    }

    saveNews(newsItems);
    console.log(`💾 ニュース保存完了: ${newsItems.length}件`);
  } else {
    console.log("\n📋 ドライラン: 変更は保存されませんでした");
  }

  console.log("\n📊 統計:");
  console.log(`  ツール数: ${updatedTools.length}`);
  console.log(`  カテゴリ数: ${loadCategories().length}`);
  console.log(`  トレンド: ${trendingItems.length}件`);
  console.log(`  ランキング: ${rankings.length}件`);
  console.log(`  ニュース: ${newsItems.length}件`);
  console.log(`  今回の変更: ${changelog.length}件`);
  console.log(`  情報源: Hacker News, Reddit(4), Google News(2), TechCrunch`);
  console.log("\n✅ 完了");
}

main().catch((e) => {
  console.error("❌ 致命的エラー:", e);
  process.exit(1);
});
