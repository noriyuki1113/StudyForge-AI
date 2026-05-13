"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CardReviewList } from "@/components/generate/CardReviewList";
import type { GenerateCardsResult } from "@/types/ai";

type ReviewResult = GenerateCardsResult & {
  _source?: { inputType: "text" | "url"; content: string };
};

export function ReviewPageClient() {
  const router = useRouter();
  const [result, setResult] = useState<ReviewResult | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const raw = sessionStorage.getItem("generateResult");
    if (!raw) {
      router.replace("/generate");
      return;
    }
    let parsed: ReviewResult;
    try {
      parsed = JSON.parse(raw) as ReviewResult;
    } catch {
      router.replace("/generate");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(parsed);
  }, [router]);

  if (!result) return null;

  return <CardReviewList initial={result} />;
}
