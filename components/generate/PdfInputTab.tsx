"use client";

import { useRef } from "react";
import { FileText, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PdfPreview {
  title: string | null;
  text: string;
  charCount: number;
}

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  preview: PdfPreview | null;
  previewLoading: boolean;
  onExtract: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfInputTab({ file, onChange, error, preview, previewLoading, onExtract }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_SIZE) {
      onChange(null);
      return;
    }
    onChange(f);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isOverSize = file && file.size > MAX_SIZE;

  return (
    <div className="space-y-3">
      {file ? (
        <div className={`border-2 rounded-lg p-4 flex items-center gap-3 ${isOverSize ? "border-destructive bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
          <FileText className={`h-8 w-8 shrink-0 ${isOverSize ? "text-destructive" : "text-primary"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className={`text-xs ${isOverSize ? "text-destructive" : "text-muted-foreground"}`}>
              {formatSize(file.size)}{isOverSize ? " — 10MB を超えています" : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExtract}
            disabled={previewLoading || !!isOverSize}
            className="shrink-0"
          >
            {previewLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : preview ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              "抽出"
            )}
          </Button>
          <button
            type="button"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="ファイルを削除"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border hover:border-primary rounded-lg p-10 text-center transition-colors space-y-2"
        >
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium">クリックしてPDFを選択</p>
          <p className="text-xs text-muted-foreground">最大10MB・テキスト埋め込みPDFのみ対応</p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}

      {preview && (
        <div className="border rounded-lg p-4 space-y-2 bg-secondary/20">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              {preview.title && (
                <p className="text-sm font-medium leading-snug line-clamp-2">{preview.title}</p>
              )}
              <p className="text-xs text-muted-foreground">{preview.charCount.toLocaleString()} 文字を抽出</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pl-6">
            {preview.text.slice(0, 200)}…
          </p>
        </div>
      )}
    </div>
  );
}
