import { z } from "zod";

export const studyActions = ["summary", "quiz", "flashcards"] as const;
export type StudyAction = (typeof studyActions)[number];
export type StudyLanguage = "English" | "Hinglish";
export type SummaryStyle = "simple" | "detailed" | "exam";
export type QuestionKind = "mcq" | "short" | "long";
export type Difficulty = "easy" | "medium" | "hard";

const text = z.string().trim().min(1).max(12_000);
export const studySummarySchema = z.object({
  title: z.string().trim().min(1).max(180),
  overview: text,
  chapters: z.array(z.object({ title: z.string().trim().min(1).max(180), summary: text, keyPoints: z.array(text).max(16) })).max(40),
  definitions: z.array(z.object({ term: z.string().trim().min(1).max(180), meaning: text })).max(60),
  formulas: z.array(z.object({ formula: z.string().trim().min(1).max(500), meaning: text })).max(60),
  examples: z.array(z.object({ topic: z.string().trim().min(1).max(180), example: text })).max(40),
  examPoints: z.array(text).max(40),
  quickRevision: z.array(text).max(40),
  questions: z.array(z.object({ question: text, answer: text })).max(30),
});
export type StudySummary = z.infer<typeof studySummarySchema>;

export const studyQuizSchema = z.object({
  title: z.string().trim().min(1).max(180),
  questions: z.array(z.object({
    type: z.enum(["mcq", "short", "long"]),
    question: text,
    topic: z.string().trim().min(1).max(180),
    options: z.array(z.string().trim().min(1).max(500)).max(6),
    answer: text,
    explanation: text,
  })).min(1).max(30),
});
export type StudyQuiz = z.infer<typeof studyQuizSchema>;

export const studyFlashcardsSchema = z.object({
  title: z.string().trim().min(1).max(180),
  cards: z.array(z.object({
    front: text,
    back: text,
    topic: z.string().trim().min(1).max(180),
  })).min(1).max(30),
});
export type StudyFlashcards = z.infer<typeof studyFlashcardsSchema>;

export const studyArtifactSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(studyActions),
  title: z.string().trim().min(1).max(180),
  sourceName: z.string().trim().min(1).max(180),
  content: z.unknown(),
  createdAt: z.string().datetime(),
});
export type StudyArtifact = z.infer<typeof studyArtifactSchema>;
