export type Deck = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Quiz = {
  id: string;
  deck_id: string;
  card_id: string | null;
  question: string;
  choices: string[];
  answer_index: number;
  created_at: string;
};

export type ReviewLog = {
  id: string;
  user_id: string;
  card_id: string;
  result: "correct" | "incorrect";
  study_mode: "flashcard" | "quiz";
  reviewed_at: string;
};

export type SourceInput = {
  id: string;
  deck_id: string;
  input_type: "text" | "url";
  content: string;
  created_at: string;
};
