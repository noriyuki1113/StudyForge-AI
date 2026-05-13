"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  value: string;
  onChange: (v: string) => void;
  error: string;
}

export function UrlInputTab({ value, onChange, error }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="url">URL</Label>
      <Input
        id="url"
        type="url"
        placeholder="https://example.com/article"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="url"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        技術記事・GitHub README・ドキュメントのURLを入力してください
      </p>
    </div>
  );
}
