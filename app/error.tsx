"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
      <h2 className="text-xl font-bold">エラーが発生しました</h2>
      <p className="text-muted-foreground text-sm">
        予期しないエラーが発生しました。もう一度お試しください。
      </p>
      <Button onClick={reset}>再試行</Button>
    </div>
  );
}
