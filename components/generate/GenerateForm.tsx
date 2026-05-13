"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TextInputTab } from "./TextInputTab";
import { UrlInputTab } from "./UrlInputTab";
import { Sparkles, Loader2 } from "lucide-react";
import type { GenerateCardsResult } from "@/types/ai";

const STORAGE_KEY = "generateResult";

export function GenerateForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState(false);

  const isTextOver = text.length > 8000;

  const validateUrl = (v: string) => {
    if (!v) return "URLを入力してください";
    if (!/^https?:\/\//i.test(v)) return "http または https で始まるURLを入力してください";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === "text") {
      if (!text.trim()) { toast.error("テキストを入力してください"); return; }
      if (isTextOver) { toast.error("テキストが長すぎます。8,000文字以内に収めてください。"); return; }
    } else {
      const err = validateUrl(url);
      if (err) { setUrlError(err); return; }
      setUrlError("");
    }

    setLoading(true);
    try {
      const endpoint = tab === "text" ? "/api/generate/from-text" : "/api/generate/from-url";
      const body = tab === "text" ? { text, cardCount: 10 } : { url, cardCount: 10 };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "生成に失敗しました");
        return;
      }

      const result: GenerateCardsResult = data;
      // 生成元情報を付加して sessionStorage に保存
      const withSource = {
        ...result,
        _source: { inputType: tab, content: tab === "text" ? text : url },
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(withSource));
      router.push("/generate/review");
    } catch {
      toast.error("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ステップ表示 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">1. 入力</span>
        <span>→</span>
        <span>2. 確認・編集</span>
        <span>→</span>
        <span>3. 保存</span>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "text" | "url")}>
        <TabsList className="w-full">
          <TabsTrigger value="text" className="flex-1">テキスト入力</TabsTrigger>
          <TabsTrigger value="url" className="flex-1">URL入力</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="pt-4">
          <TextInputTab value={text} onChange={setText} />
        </TabsContent>
        <TabsContent value="url" className="pt-4">
          <UrlInputTab value={url} onChange={setUrl} error={urlError} />
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || (tab === "text" && isTextOver)}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AIが重要ポイントを抽出しています...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            カードを生成する
          </>
        )}
      </Button>
    </form>
  );
}
