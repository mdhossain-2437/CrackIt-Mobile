import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc } from "drizzle-orm";
import pg from "pg";
import {
  users,
  examResults,
  userProgress,
  type User,
  type InsertUser,
  type ExamResult,
  type UserProgress,
} from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  saveExamResult(result: Omit<ExamResult, "id" | "createdAt">): Promise<ExamResult>;
  getExamResults(userId: string, limit?: number): Promise<ExamResult[]>;
  getProgress(userId: string): Promise<UserProgress[]>;
  upsertProgress(userId: string, subject: string, topic: string, correct: boolean): Promise<void>;
}

class PgStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async saveExamResult(result: Omit<ExamResult, "id" | "createdAt">): Promise<ExamResult> {
    const [saved] = await db.insert(examResults).values(result).returning();
    return saved;
  }

  async getExamResults(userId: string, limit: number = 50): Promise<ExamResult[]> {
    return db
      .select()
      .from(examResults)
      .where(eq(examResults.userId, userId))
      .orderBy(desc(examResults.createdAt))
      .limit(limit);
  }

  async getProgress(userId: string): Promise<UserProgress[]> {
    return db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async upsertProgress(userId: string, subject: string, topic: string, correct: boolean): Promise<void> {
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.subject, subject),
          eq(userProgress.topic, topic)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(userProgress)
        .set({
          total: existing.total + 1,
          correct: existing.correct + (correct ? 1 : 0),
          consecutiveCorrect: correct ? existing.consecutiveCorrect + 1 : 0,
          lastPracticed: new Date().toISOString(),
        })
        .where(eq(userProgress.id, existing.id));
    } else {
      await db.insert(userProgress).values({
        userId,
        subject,
        topic,
        total: 1,
        correct: correct ? 1 : 0,
        consecutiveCorrect: correct ? 1 : 0,
        lastPracticed: new Date().toISOString(),
      });
    }
  }
}

export const storage = new PgStorage();
