"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TextInputTab } from "./TextInputTab";
import { UrlInputTab, type UrlPreview } from "./UrlInputTab";
import { PdfInputTab, type PdfPreview } from "./PdfInputTab";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateCardsResult } from "@/types/ai";

const STORAGE_KEY = "generateResult";
const CARD_COUNT_OPTIONS = [5, 10, 15, 20] as const;

type Tab = "text" | "url" | "pdf";

export function GenerateForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("text");

  // text
  const [text, setText] = useState("");

  // url
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [urlPreview, setUrlPreview] = useState<UrlPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // pdf
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [pdfPreview, setPdfPreview] = useState<PdfPreview | null>(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);

  // common
  const [cardCount, setCardCount] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  const isTextOver = text.length > 8000;

  const handleTabChange = (v: string) => {
    setTab(v as Tab);
    setUrlError("");
    setPdfError("");
  };

  const handlePdfChange = (file: File | null) => {
    setPdfFile(file);
    setPdfPreview(null);
    setPdfError("");
  };

  const handleExtractPdf = async () => {
    if (!pdfFile) return;
    setPdfPreviewLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      const res = await fetch("/api/pdf/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setPdfError(data.error ?? "PDFの解析に失敗しました");
        return;
      }
      setPdfPreview(data as PdfPreview);
    } catch {
      setPdfError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setPdfPreviewLoading(false);
    }
  };

  const handleUrlChange = (v: string) => {
    setUrl(v);
    setUrlPreview(null); // URL 変更でプレビューをリセット
    setUrlError("");
  };

  // URL テキスト取得
  const handleFetchPreview = async () => {
    if (!url.trim()) return;
    if (!/^https?:\/\//i.test(url)) {
      setUrlError("http または https で始まるURLを入力してください");
      return;
    }
    setUrlError("");
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/generate/preview-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUrlError(data.error ?? "URLからの取得に失敗しました");
        return;
      }
      setUrlPreview(data as UrlPreview);
    } catch {
      setUrlError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setPreviewLoading(false);
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (tab === "text") return isTextOver;
    if (tab === "url") return !urlPreview; // プレビュー取得済みが必須
    if (tab === "pdf") return !pdfPreview;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === "text" && !text.trim()) {
      toast.error("テキストを入力してください");
      return;
    }
    if (tab === "url" && !urlPreview) {
      toast.error("先に「取得」ボタンでURLのテキストを取得してください");
      return;
    }
    if (tab === "pdf") {
      if (!pdfFile) { setPdfError("PDFファイルを選択してください"); return; }
      if (!pdfPreview) { setPdfError("先に「抽出」ボタンでテキストを抽出してください"); return; }
      setPdfError("");
    }

    setLoading(true);
    try {
      let res: Response;

      if (tab === "pdf" && pdfPreview) {
        res = await fetch("/api/generate/from-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pdfPreview.text, cardCount }),
        });
      } else if (tab === "url" && urlPreview) {
        // プレビュー取得済みテキストを直接 from-text に送る
        res = await fetch("/api/generate/from-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: urlPreview.text, cardCount }),
        });
      } else {
        res = await fetch("/api/generate/from-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, cardCount }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "生成に失敗しました");
        return;
      }

      const result: GenerateCardsResult = data;
      const sourceContent = tab === "text" ? text : tab === "url" ? url : pdfFile?.name ?? "";
      const sourceType = tab === "pdf" ? "text" : tab;
      const withSource = {
        ...result,
        _source: { inputType: sourceType, content: sourceContent },
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(withSource));
      router.push("/generate/review");
    } catch {
      toast.error("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (loading) {
      return "AIが重要ポイントを抽出しています...";
    }
    if ((tab === "url" && urlPreview) || (tab === "pdf" && pdfPreview)) return "この内容でカードを生成する";
    return "カードを生成する";
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

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="text" className="flex-1">テキスト</TabsTrigger>
          <TabsTrigger value="url" className="flex-1">URL</TabsTrigger>
          <TabsTrigger value="pdf" className="flex-1">PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="pt-4">
          <TextInputTab value={text} onChange={setText} />
        </TabsContent>
        <TabsContent value="url" className="pt-4">
          <UrlInputTab
            value={url}
            onChange={handleUrlChange}
            error={urlError}
            preview={urlPreview}
            previewLoading={previewLoading}
            onFetch={handleFetchPreview}
          />
        </TabsContent>
        <TabsContent value="pdf" className="pt-4">
          <PdfInputTab
            file={pdfFile}
            onChange={handlePdfChange}
            error={pdfError}
            preview={pdfPreview}
            previewLoading={pdfPreviewLoading}
            onExtract={handleExtractPdf}
          />
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
        disabled={isSubmitDisabled()}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {getButtonLabel()}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {getButtonLabel()}
          </>
        )}
      </Button>
    </form>
  );
}
