export type HorseQuestion = {
  id: string;
  category: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explain?: string;
};

export type HorseQuizData = {
  meta: {
    version: string;
    title: string;
    questionCount: number;
    categories: string[];
  };
  questions: HorseQuestion[];
};

const data = require('../../assets/data/horse_quiz.json') as HorseQuizData;

export function getHorseQuizMeta() {
  return data.meta;
}

export function getAllHorseQuestions(): HorseQuestion[] {
  return data.questions;
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type SessionLength = 10 | 20 | 40 | 'full';

export function pickHorseSession(length: SessionLength): HorseQuestion[] {
  const shuffled = shuffle(data.questions);
  if (length === 'full') return shuffled;
  return shuffled.slice(0, Math.min(length, shuffled.length));
}

export const CATEGORY_LABELS: Record<string, string> = {
  disciplines: 'Disciplines',
  anatomy: 'Anatomy',
  care: 'Care',
  tack: 'Tack',
  breeds: 'Breeds',
  rules: 'Rules',
};
