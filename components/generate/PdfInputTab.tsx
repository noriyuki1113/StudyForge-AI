"use client";

import { useRef } from "react";
import { FileText, X } from "lucide-react";

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfInputTab({ file, onChange, error }: Props) {
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
    </div>
  );
}
