export type GeneratedCard = {
  front: string;
  back: string;
};

export type GenerateCardsResult = {
  deckName: string;
  cards: GeneratedCard[];
};

export type GeneratedQuiz = {
  question: string;
  choices: [string, string, string, string];
  answer_index: 0 | 1 | 2 | 3;
};

export type GenerateQuizResult = {
  quizzes: GeneratedQuiz[];
};
