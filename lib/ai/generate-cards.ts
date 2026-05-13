import { z } from "zod";
import { getAnthropicClient, MODEL } from "./anthropic";
import { buildCardSystemPrompt } from "./prompts";
import type { GenerateCardsResult } from "@/types/ai";

const GenerateCardsSchema = z.object({
  deckName: z.string().min(1),
  cards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1).max(400),
      })
    )
    .min(1),
});

async function callAPI(text: string, cardCount: number): Promise<GenerateCardsResult> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: buildCardSystemPrompt(cardCount),
    messages: [{ role: "user", content: text }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  const raw = content.text.trim();
  const parsed = JSON.parse(raw);
  const validated = GenerateCardsSchema.parse(parsed);
  return validated;
}

export async function generateCards(
  text: string,
  cardCount: number = 10
): Promise<GenerateCardsResult> {
  try {
    return await callAPI(text, cardCount);
  } catch {
    // 1回リトライ
    return await callAPI(text, cardCount);
  }
}
