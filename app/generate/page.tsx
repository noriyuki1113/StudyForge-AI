import { Header } from "@/components/layout/Header";
import { GenerateForm } from "@/components/generate/GenerateForm";

export default function GeneratePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-bold">新しいデッキを作成</h1>
          <p className="text-muted-foreground text-sm">
            教材テキストを入力するか、技術記事のURLを貼り付けてください。AIが自動でフラッシュカードを生成します。
          </p>
        </div>
        <GenerateForm />
      </main>
    </div>
  );
}
