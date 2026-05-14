"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, FileText } from "lucide-react";

export interface UrlPreview {
  title: string | null;
  text: string;
  charCount: number;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  error: string;
  preview: UrlPreview | null;
  previewLoading: boolean;
  onFetch: () => void;
}

export function UrlInputTab({ value, onChange, error, preview, previewLoading, onFetch }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <div className="flex gap-2">
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/article"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            inputMode="url"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onFetch}
            disabled={previewLoading || !value.trim()}
            className="shrink-0"
          >
            {previewLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : preview ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              "取得"
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          技術記事・GitHub README・ドキュメントのURLを入力してください
        </p>
      </div>

      {preview && (
        <div className="border rounded-lg p-4 space-y-2 bg-secondary/20">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              {preview.title && (
                <p className="text-sm font-medium leading-snug line-clamp-2">{preview.title}</p>
              )}
              <p className="text-xs text-muted-foreground">{preview.charCount.toLocaleString()} 文字を取得</p>
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
