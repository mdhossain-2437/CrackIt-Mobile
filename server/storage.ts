import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc, sql, gte } from "drizzle-orm";
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

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streak: number;
  totalQuestionsSolved: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  saveExamResult(result: Omit<ExamResult, "id" | "createdAt">): Promise<ExamResult>;
  getExamResults(userId: string, limit?: number): Promise<ExamResult[]>;
  getProgress(userId: string): Promise<UserProgress[]>;
  upsertProgress(userId: string, subject: string, topic: string, correct: boolean): Promise<void>;
  getLeaderboard(period: "alltime" | "weekly", limit?: number): Promise<LeaderboardEntry[]>;
  getUserRank(userId: string, period: "alltime" | "weekly"): Promise<number | null>;
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
  async getLeaderboard(period: "alltime" | "weekly", limit: number = 10): Promise<LeaderboardEntry[]> {
    if (period === "alltime") {
      const rows = await db
        .select({
          userId: users.id,
          name: users.name,
          xp: users.xp,
          streak: users.streak,
          totalQuestionsSolved: users.totalQuestionsSolved,
        })
        .from(users)
        .orderBy(desc(users.xp))
        .limit(limit);

      return rows.map((r, idx) => ({ ...r, rank: idx + 1 }));
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const rows = await db
      .select({
        userId: examResults.userId,
        name: users.name,
        xp: sql<number>`COALESCE(SUM(${examResults.correctAnswers} * 10 + CASE WHEN ${examResults.score} >= 80 THEN 50 WHEN ${examResults.score} >= 60 THEN 25 ELSE 0 END), 0)`.as("xp"),
        streak: users.streak,
        totalQuestionsSolved: sql<number>`COALESCE(SUM(${examResults.totalQuestions}), 0)`.as("totalQuestionsSolved"),
      })
      .from(examResults)
      .innerJoin(users, eq(examResults.userId, users.id))
      .where(gte(examResults.createdAt, oneWeekAgo))
      .groupBy(examResults.userId, users.name, users.streak)
      .orderBy(sql`xp DESC`)
      .limit(limit);

    return rows.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      name: r.name,
      xp: Number(r.xp),
      streak: r.streak,
      totalQuestionsSolved: Number(r.totalQuestionsSolved),
    }));
  }

  async getUserRank(userId: string, period: "alltime" | "weekly"): Promise<number | null> {
    if (period === "alltime") {
      const user = await this.getUser(userId);
      if (!user) return null;

      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(sql`${users.xp} > ${user.xp}`);

      return Number(result[0]?.count ?? 0) + 1;
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const userWeeklyXp = await db
      .select({
        xp: sql<number>`COALESCE(SUM(${examResults.correctAnswers} * 10 + CASE WHEN ${examResults.score} >= 80 THEN 50 WHEN ${examResults.score} >= 60 THEN 25 ELSE 0 END), 0)`,
      })
      .from(examResults)
      .where(and(eq(examResults.userId, userId), gte(examResults.createdAt, oneWeekAgo)));

    const myXp = Number(userWeeklyXp[0]?.xp ?? 0);
    if (myXp === 0) return null;

    const higherCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(
        db
          .select({
            uid: examResults.userId,
            xp: sql<number>`SUM(${examResults.correctAnswers} * 10 + CASE WHEN ${examResults.score} >= 80 THEN 50 WHEN ${examResults.score} >= 60 THEN 25 ELSE 0 END)`.as("xp"),
          })
          .from(examResults)
          .where(gte(examResults.createdAt, oneWeekAgo))
          .groupBy(examResults.userId)
          .as("weekly_scores")
      )
      .where(sql`xp > ${myXp}`);

    return Number(higherCount[0]?.count ?? 0) + 1;
  }
}

export const storage = new PgStorage();
