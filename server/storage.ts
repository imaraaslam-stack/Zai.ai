import { 
  topics, quizzes, streaks,
  type Topic, type InsertTopic,
  type Quiz, type InsertQuiz,
  type Streak
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Topics
  createTopic(topic: InsertTopic): Promise<Topic>;
  getTopics(userId: string): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  deleteTopic(id: number): Promise<void>;

  // Quizzes
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  updateQuizScore(id: number, score: number): Promise<Quiz>;

  // Streaks
  getStreak(userId: string): Promise<Streak | undefined>;
  updateStreak(userId: string): Promise<{ streak: Streak, updated: boolean }>;
}

export class DatabaseStorage implements IStorage {
  // === TOPICS ===
  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const [topic] = await db.insert(topics).values(insertTopic).returning();
    return topic;
  }

  async getTopics(userId: string): Promise<Topic[]> {
    return db.select()
      .from(topics)
      .where(eq(topics.userId, userId))
      .orderBy(desc(topics.createdAt));
  }

  async getTopic(id: number): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic;
  }

  async deleteTopic(id: number): Promise<void> {
    await db.delete(topics).where(eq(topics.id, id));
  }

  // === QUIZZES ===
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values(insertQuiz).returning();
    return quiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async updateQuizScore(id: number, score: number): Promise<Quiz> {
    const [quiz] = await db
      .update(quizzes)
      .set({ score, completedAt: new Date() })
      .where(eq(quizzes.id, id))
      .returning();
    return quiz;
  }

  // === STREAKS ===
  async getStreak(userId: string): Promise<Streak | undefined> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    return streak;
  }

  async updateStreak(userId: string): Promise<{ streak: Streak, updated: boolean }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight today
    
    let [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    
    if (!streak) {
      // First time user
      [streak] = await db.insert(streaks).values({
        userId,
        currentStreak: 1,
        lastStudyDate: now
      }).returning();
      return { streak, updated: true };
    }

    // Check last study date
    const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : new Date(0);
    const lastDateMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

    const diffTime = Math.abs(today.getTime() - lastDateMidnight.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let updated = false;
    let newCount = streak.currentStreak ?? 0;

    if (diffDays === 1) {
      // Studied yesterday, increment streak
      newCount++;
      updated = true;
    } else if (diffDays > 1) {
      // Missed a day (or more), reset to 1
      newCount = 1;
      updated = true;
    } else {
      // Already studied today (diffDays === 0), don't increment
      updated = false;
    }

    if (updated || diffDays === 0) {
      // Always update lastStudyDate to now so we know they were active
      [streak] = await db
        .update(streaks)
        .set({
          currentStreak: newCount,
          lastStudyDate: now,
          updatedAt: now
        })
        .where(eq(streaks.userId, userId))
        .returning();
    }

    return { streak, updated };
  }
}

export const storage = new DatabaseStorage();
