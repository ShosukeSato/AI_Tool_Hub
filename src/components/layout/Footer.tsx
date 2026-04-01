import Link from "next/link";
import { SITE_NAME, NAV_ITEMS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">{SITE_NAME}</h3>
            <p className="text-sm">
              最新AIツールを比較・検索できる日本語メディア。あなたに最適なAIツールを見つけましょう。
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">ナビゲーション</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">人気の比較</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/compare/llm-chatbots"
                  className="text-sm hover:text-white transition-colors"
                >
                  ChatGPT vs Claude vs Gemini
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/coding-assistants"
                  className="text-sm hover:text-white transition-colors"
                >
                  Cursor vs Claude Code vs Copilot
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/ai-search"
                  className="text-sm hover:text-white transition-colors"
                >
                  Perplexity vs Genspark vs Gemini
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; 2026 {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
