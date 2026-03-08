import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc, sql, gte, asc } from "drizzle-orm";
import pg from "pg";
import {
  users,
  examResults,
  userProgress,
  communityQuestions,
  studySessions,
  questionAttempts,
  dailyGoals,
  achievements,
  userAchievements,
  bookmarks,
  type User,
  type InsertUser,
  type ExamResult,
  type UserProgress,
  type CommunityQuestion,
  type StudySession,
  type QuestionAttempt,
  type DailyGoal,
  type Achievement,
  type UserAchievement,
  type Bookmark,
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
  createCommunityQuestion(data: Omit<CommunityQuestion, "id" | "createdAt" | "upvotes" | "downvotes" | "verified">): Promise<CommunityQuestion>;
  getCommunityQuestions(examType?: string, limit?: number): Promise<CommunityQuestion[]>;
  voteCommunityQuestion(id: string, direction: "up" | "down"): Promise<void>;
  saveStudySession(data: Omit<StudySession, "id" | "createdAt">): Promise<StudySession>;
  getStudySessions(userId: string, days?: number): Promise<StudySession[]>;
  getStudyStats(userId: string): Promise<{ totalMinutes: number; totalQuestions: number; daysActive: number; avgAccuracy: number }>;
  saveQuestionAttempt(data: Omit<QuestionAttempt, "id" | "createdAt">): Promise<QuestionAttempt>;
  getQuestionAttempts(userId: string, limit?: number): Promise<QuestionAttempt[]>;
  getQuestionAttemptsBySubject(userId: string, subject: string): Promise<QuestionAttempt[]>;
  getDailyGoal(userId: string, date: string): Promise<DailyGoal | undefined>;
  createDailyGoal(data: Omit<DailyGoal, "id" | "createdAt">): Promise<DailyGoal>;
  updateDailyGoal(id: string, data: Partial<DailyGoal>): Promise<DailyGoal | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  hasAchievement(userId: string, achievementId: string): Promise<boolean>;
  createBookmark(data: Omit<Bookmark, "id" | "createdAt">): Promise<Bookmark>;
  deleteBookmark(userId: string, questionId: string): Promise<void>;
  getBookmarks(userId: string): Promise<Bookmark[]>;
  hasBookmark(userId: string, questionId: string): Promise<boolean>;
  getSubjectLeaderboard(subject: string, limit?: number): Promise<LeaderboardEntry[]>;
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

  async createCommunityQuestion(data: Omit<CommunityQuestion, "id" | "createdAt" | "upvotes" | "downvotes" | "verified">): Promise<CommunityQuestion> {
    const [q] = await db.insert(communityQuestions).values(data).returning();
    return q;
  }

  async getCommunityQuestions(examType?: string, limit: number = 50): Promise<CommunityQuestion[]> {
    if (examType) {
      return db
        .select()
        .from(communityQuestions)
        .where(eq(communityQuestions.examType, examType))
        .orderBy(desc(communityQuestions.createdAt))
        .limit(limit);
    }
    return db
      .select()
      .from(communityQuestions)
      .orderBy(desc(communityQuestions.createdAt))
      .limit(limit);
  }

  async voteCommunityQuestion(id: string, direction: "up" | "down"): Promise<void> {
    if (direction === "up") {
      await db.update(communityQuestions)
        .set({ upvotes: sql`${communityQuestions.upvotes} + 1` })
        .where(eq(communityQuestions.id, id));
    } else {
      await db.update(communityQuestions)
        .set({ downvotes: sql`${communityQuestions.downvotes} + 1` })
        .where(eq(communityQuestions.id, id));
    }
  }

  async saveStudySession(data: Omit<StudySession, "id" | "createdAt">): Promise<StudySession> {
    const [session] = await db.insert(studySessions).values(data).returning();
    return session;
  }

  async getStudySessions(userId: string, days: number = 30): Promise<StudySession[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.userId, userId), gte(studySessions.date, cutoff.toISOString().split("T")[0])))
      .orderBy(desc(studySessions.date));
  }

  async getStudyStats(userId: string): Promise<{ totalMinutes: number; totalQuestions: number; daysActive: number; avgAccuracy: number }> {
    const sessions = await this.getStudySessions(userId, 365);
    const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const uniqueDays = new Set(sessions.map(s => s.date)).size;
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    return { totalMinutes, totalQuestions, daysActive: uniqueDays, avgAccuracy };
  }
  async saveQuestionAttempt(data: Omit<QuestionAttempt, "id" | "createdAt">): Promise<QuestionAttempt> {
    const [attempt] = await db.insert(questionAttempts).values(data).returning();
    return attempt;
  }

  async getQuestionAttempts(userId: string, limit: number = 100): Promise<QuestionAttempt[]> {
    return db
      .select()
      .from(questionAttempts)
      .where(eq(questionAttempts.userId, userId))
      .orderBy(desc(questionAttempts.createdAt))
      .limit(limit);
  }

  async getQuestionAttemptsBySubject(userId: string, subject: string): Promise<QuestionAttempt[]> {
    return db
      .select()
      .from(questionAttempts)
      .where(and(eq(questionAttempts.userId, userId), eq(questionAttempts.subject, subject)))
      .orderBy(desc(questionAttempts.createdAt));
  }

  async getDailyGoal(userId: string, date: string): Promise<DailyGoal | undefined> {
    const [goal] = await db
      .select()
      .from(dailyGoals)
      .where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.date, date)))
      .limit(1);
    return goal;
  }

  async createDailyGoal(data: Omit<DailyGoal, "id" | "createdAt">): Promise<DailyGoal> {
    const [goal] = await db.insert(dailyGoals).values(data).returning();
    return goal;
  }

  async updateDailyGoal(id: string, data: Partial<DailyGoal>): Promise<DailyGoal | undefined> {
    const [goal] = await db.update(dailyGoals).set(data).where(eq(dailyGoals.id, id)).returning();
    return goal;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements).orderBy(asc(achievements.category));
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const rows = await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        earnedAt: userAchievements.earnedAt,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));

    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      achievementId: r.achievementId,
      earnedAt: r.earnedAt,
      achievement: r.achievement,
    }));
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [ua] = await db.insert(userAchievements).values({ userId, achievementId }).returning();
    return ua;
  }

  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
      .limit(1);
    return !!existing;
  }

  async createBookmark(data: Omit<Bookmark, "id" | "createdAt">): Promise<Bookmark> {
    const [bm] = await db.insert(bookmarks).values(data).returning();
    return bm;
  }

  async deleteBookmark(userId: string, questionId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));
  }

  async getBookmarks(userId: string): Promise<Bookmark[]> {
    return db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async hasBookmark(userId: string, questionId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)))
      .limit(1);
    return !!existing;
  }

  async getSubjectLeaderboard(subject: string, limit: number = 10): Promise<LeaderboardEntry[]> {
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
      .where(eq(examResults.subject, subject))
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
}

export const storage = new PgStorage();
