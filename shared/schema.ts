import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export Auth Models
export * from "./models/auth";
export * from "./models/chat";

// === TOPICS (Study Material) ===
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to Replit Auth user.id
  title: text("title").notNull(),
  originalContent: text("original_content").notNull(),
  summary: text("summary"), // AI generated summary
  createdAt: timestamp("created_at").defaultNow(),
});

// === QUIZZES ===
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  questions: jsonb("questions").notNull(), // Array of { question, options[], answer, explanation }
  score: integer("score"), // Null if not taken yet
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === STREAKS ===
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  currentStreak: integer("current_streak").default(0),
  lastStudyDate: timestamp("last_study_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === RELATIONS ===
export const topicsRelations = relations(topics, ({ many }) => ({
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one }) => ({
  topic: one(topics, {
    fields: [quizzes.topicId],
    references: [topics.id],
  }),
}));

// === SCHEMAS ===
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true, createdAt: true, summary: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true, completedAt: true });

// === TYPES ===
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export type Streak = typeof streaks.$inferSelect;

// Helper type for Quiz Questions JSON structure
export type QuestionItem = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};
