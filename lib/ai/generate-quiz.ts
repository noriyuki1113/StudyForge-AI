import { z } from "zod";
import { getAnthropicClient, MODEL } from "./anthropic";
import { buildQuizSystemPrompt } from "./prompts";
import type { GeneratedCard, GenerateQuizResult } from "@/types/ai";

const GenerateQuizSchema = z.object({
  quizzes: z
    .array(
      z.object({
        question: z.string().min(1),
        choices: z.array(z.string().min(1)).length(4),
        answer_index: z.number().int().min(0).max(3),
      })
    )
    .min(1),
});

async function callAPI(
  cards: GeneratedCard[],
  quizCount: number
): Promise<GenerateQuizResult> {
  const client = getAnthropicClient();
  const cardsText = cards
    .map((c, i) => `カード${i + 1}\n表面: ${c.front}\n裏面: ${c.back}`)
    .join("\n\n");

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: buildQuizSystemPrompt(quizCount),
    messages: [{ role: "user", content: cardsText }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  const raw = content.text.trim();
  const parsed = JSON.parse(raw);
  const validated = GenerateQuizSchema.parse(parsed);

  return {
    quizzes: validated.quizzes.map((q) => ({
      question: q.question,
      choices: q.choices as [string, string, string, string],
      answer_index: q.answer_index as 0 | 1 | 2 | 3,
    })),
  };
}

export async function generateQuiz(
  cards: GeneratedCard[],
  quizCount: number = 5
): Promise<GenerateQuizResult> {
  try {
    return await callAPI(cards, quizCount);
  } catch {
    return await callAPI(cards, quizCount);
  }
}
