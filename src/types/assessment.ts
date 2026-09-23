export type PublicQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  difficulty: number;
  skillNames: string[];
};

export type AttemptPayload = {
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  timeTakenMs: number;
  confidence: number; // 1..5
};
