"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TextInputTab } from "./TextInputTab";
import { UrlInputTab } from "./UrlInputTab";
import { PdfInputTab } from "./PdfInputTab";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateCardsResult } from "@/types/ai";

const STORAGE_KEY = "generateResult";
const CARD_COUNT_OPTIONS = [5, 10, 15, 20] as const;

type Tab = "text" | "url" | "pdf";

export function GenerateForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [cardCount, setCardCount] = useState<number>(10);
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
    } else if (tab === "url") {
      const err = validateUrl(url);
      if (err) { setUrlError(err); return; }
      setUrlError("");
    } else {
      if (!pdfFile) { setPdfError("PDFファイルを選択してください"); return; }
      if (pdfFile.size > 10 * 1024 * 1024) { setPdfError("10MB以内のPDFを選択してください"); return; }
      setPdfError("");
    }

    setLoading(true);
    try {
      let res: Response;

      if (tab === "pdf" && pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("cardCount", String(cardCount));
        res = await fetch("/api/generate/from-pdf", { method: "POST", body: formData });
      } else {
        const endpoint = tab === "text" ? "/api/generate/from-text" : "/api/generate/from-url";
        const body = tab === "text" ? { text, cardCount } : { url, cardCount };
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "生成に失敗しました");
        return;
      }

      const result: GenerateCardsResult = data;
      const sourceContent = tab === "text" ? text : tab === "url" ? url : pdfFile!.name;
      const withSource = {
        ...result,
        _source: { inputType: tab === "pdf" ? "text" : tab, content: sourceContent },
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

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="text" className="flex-1">テキスト</TabsTrigger>
          <TabsTrigger value="url" className="flex-1">URL</TabsTrigger>
          <TabsTrigger value="pdf" className="flex-1">PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="pt-4">
          <TextInputTab value={text} onChange={setText} />
        </TabsContent>
        <TabsContent value="url" className="pt-4">
          <UrlInputTab value={url} onChange={setUrl} error={urlError} />
        </TabsContent>
        <TabsContent value="pdf" className="pt-4">
          <PdfInputTab file={pdfFile} onChange={setPdfFile} error={pdfError} />
        </TabsContent>
      </Tabs>

      {/* カード枚数 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">生成枚数</p>
        <div className="flex gap-2">
          {CARD_COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCardCount(n)}
              className={cn(
                "flex-1 py-2 rounded-md border text-sm font-medium transition-colors",
                cardCount === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary hover:text-primary"
              )}
            >
              {n}枚
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || (tab === "text" && isTextOver) || (tab === "pdf" && !pdfFile)}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {tab === "pdf" ? "PDFを解析しています..." : "AIが重要ポイントを抽出しています..."}
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
