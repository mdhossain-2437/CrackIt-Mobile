import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  educationLevel: text("education_level").notNull().default("ssc"),
  examType: text("exam_type").notNull().default("bcs"),
  language: text("language").notNull().default("en"),
  streak: integer("streak").notNull().default(0),
  lastPracticeDate: text("last_practice_date").notNull().default(""),
  totalQuestionsSolved: integer("total_questions_solved").notNull().default(0),
  totalCorrect: integer("total_correct").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const examResults = pgTable("exam_results", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic"),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull().default(0),
  wrongAnswers: integer("wrong_answers").notNull().default(0),
  skipped: integer("skipped").notNull().default(0),
  totalTime: integer("total_time").notNull().default(0),
  examMode: text("exam_mode").notNull().default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  total: integer("total").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  lastPracticed: text("last_practiced").notNull().default(""),
  consecutiveCorrect: integer("consecutive_correct").notNull().default(0),
});

export const communityQuestions = pgTable("community_questions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  authorName: text("author_name").notNull(),
  examType: text("exam_type").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  language: text("language").notNull().default("en"),
  question: text("question").notNull(),
  options: text("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation").notNull().default(""),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  verified: integer("verified").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
  duration: integer("duration").notNull().default(0),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questionAttempts = pgTable("question_attempts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  questionId: text("question_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull().default(0),
  difficultyAtAttempt: text("difficulty_at_attempt").notNull().default("medium"),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("qa_user_id_idx").on(table.userId),
  index("qa_question_id_idx").on(table.questionId),
  index("qa_subject_idx").on(table.subject),
  index("qa_topic_idx").on(table.topic),
  index("qa_created_at_idx").on(table.createdAt),
]);

export const dailyGoals = pgTable("daily_goals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
  targetQuestions: integer("target_questions").notNull().default(20),
  completedQuestions: integer("completed_questions").notNull().default(0),
  targetStudyTime: integer("target_study_time").notNull().default(30),
  actualStudyTime: integer("actual_study_time").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("dg_user_id_idx").on(table.userId),
  index("dg_date_idx").on(table.date),
  index("dg_user_date_idx").on(table.userId, table.date),
]);

export const achievements = pgTable("achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  nameBn: text("name_bn").notNull().default(""),
  description: text("description").notNull(),
  descriptionBn: text("description_bn").notNull().default(""),
  icon: text("icon").notNull().default("🏆"),
  category: text("category").notNull().default("general"),
  condition: text("condition").notNull(),
  threshold: integer("threshold").notNull().default(1),
  xpReward: integer("xp_reward").notNull().default(50),
  rarity: text("rarity").notNull().default("common"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
}, (table) => [
  index("ua_user_id_idx").on(table.userId),
  index("ua_achievement_id_idx").on(table.achievementId),
]);

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  questionId: text("question_id").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("bm_user_id_idx").on(table.userId),
  index("bm_subject_idx").on(table.subject),
  index("bm_created_at_idx").on(table.createdAt),
]);

export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull().default("reminder"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("notif_user_id_idx").on(table.userId),
  index("notif_read_idx").on(table.read),
  index("notif_created_at_idx").on(table.createdAt),
]);

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  passwordHash: true,
  educationLevel: true,
  examType: true,
  language: true,
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  educationLevel: z.enum(["primary", "junior", "ssc", "hsc", "university", "job"]),
  examType: z.string(),
  language: z.enum(["en", "bn"]).default("en"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ExamResult = typeof examResults.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type CommunityQuestion = typeof communityQuestions.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type QuestionAttempt = typeof questionAttempts.$inferSelect;
export type DailyGoal = typeof dailyGoals.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
