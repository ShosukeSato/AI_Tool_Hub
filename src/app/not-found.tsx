import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        ページが見つかりません
      </h2>
      <p className="text-gray-600 mb-8">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
