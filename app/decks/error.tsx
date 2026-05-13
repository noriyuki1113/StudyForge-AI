"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DecksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-bold">デッキの読み込みに失敗しました</h2>
      <p className="text-muted-foreground text-sm">
        データの取得中にエラーが発生しました。
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>再試行</Button>
        <Button asChild>
          <Link href="/">ホームへ</Link>
        </Button>
      </div>
    </div>
  );
}
