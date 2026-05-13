import { Header } from "@/components/layout/Header";
import { ReviewPageClient } from "./ReviewPageClient";

export default function ReviewPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>1. 入力</span>
            <span>→</span>
            <span className="font-medium text-foreground">2. 確認・編集</span>
            <span>→</span>
            <span>3. 保存</span>
          </div>
          <h1 className="text-2xl font-bold">生成結果を確認</h1>
          <p className="text-muted-foreground text-sm">
            内容を確認・編集してからデッキに保存してください。
          </p>
        </div>
        <ReviewPageClient />
      </main>
    </div>
  );
}
