import type { GenerateCardsResult, GenerateQuizResult, GeneratedCard } from "@/types/ai";

export interface AIProvider {
  generateCards(text: string, cardCount: number): Promise<GenerateCardsResult>;
  generateQuiz(
    cards: GeneratedCard[],
    quizCount: number
  ): Promise<GenerateQuizResult>;
}
