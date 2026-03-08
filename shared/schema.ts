import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
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
