export type PublicQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  difficulty: number;
  skillNames: string[];
};
