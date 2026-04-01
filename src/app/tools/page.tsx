import type { Metadata } from "next";
import { getAllTools, getAllCategories } from "@/lib/data";
import { ToolListClient } from "@/components/tools/ToolListClient";

export const metadata: Metadata = {
  title: "AIツール一覧",
  description:
    "話題のAIツールを一覧で比較。カテゴリーや料金で絞り込み、あなたに最適なAIツールを見つけましょう。",
};

export default function ToolsPage() {
  const tools = getAllTools();
  const categories = getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AIツール一覧</h1>
      <p className="text-gray-600 mb-8">
        {tools.length}
        件のAIツールを掲載中。カテゴリーや料金で絞り込んで、最適なツールを見つけましょう。
      </p>
      <ToolListClient tools={tools} categories={categories} />
    </div>
  );
}
