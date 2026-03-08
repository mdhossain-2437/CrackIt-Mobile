import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { registerSchema, loginSchema } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const questionCache: Map<string, { questions: any[]; timestamp: number }> = new Map();
const CACHE_TTL = 1000 * 60 * 60;

function getCacheKey(params: Record<string, any>): string {
  return JSON.stringify(params);
}

function getCachedQuestions(key: string): any[] | null {
  const cached = questionCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.questions;
  }
  if (cached) questionCache.delete(key);
  return null;
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }

      const { name, email, password, educationLevel, examType, language } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        name,
        email,
        passwordHash,
        educationLevel,
        examType,
        language,
      });

      req.session.userId = user.id;

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          educationLevel: user.educationLevel,
          examType: user.examType,
          language: user.language,
          streak: user.streak,
          xp: user.xp,
          totalQuestionsSolved: user.totalQuestionsSolved,
          totalCorrect: user.totalCorrect,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          educationLevel: user.educationLevel,
          examType: user.examType,
          language: user.language,
          streak: user.streak,
          xp: user.xp,
          totalQuestionsSolved: user.totalQuestionsSolved,
          totalCorrect: user.totalCorrect,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const progress = await storage.getProgress(user.id);
    const examHistory = await storage.getExamResults(user.id, 50);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        examType: user.examType,
        language: user.language,
        streak: user.streak,
        xp: user.xp,
        totalQuestionsSolved: user.totalQuestionsSolved,
        totalCorrect: user.totalCorrect,
        lastPracticeDate: user.lastPracticeDate,
      },
      progress,
      examHistory,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.post("/api/auth/update", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { examType, language, educationLevel, streak, xp, totalQuestionsSolved, totalCorrect, lastPracticeDate } = req.body;

      const updates: any = {};
      if (examType !== undefined) updates.examType = examType;
      if (language !== undefined) updates.language = language;
      if (educationLevel !== undefined) updates.educationLevel = educationLevel;
      if (streak !== undefined) updates.streak = streak;
      if (xp !== undefined) updates.xp = xp;
      if (totalQuestionsSolved !== undefined) updates.totalQuestionsSolved = totalQuestionsSolved;
      if (totalCorrect !== undefined) updates.totalCorrect = totalCorrect;
      if (lastPracticeDate !== undefined) updates.lastPracticeDate = lastPracticeDate;

      const user = await storage.updateUser(userId, updates);
      res.json({ user });
    } catch (error: any) {
      console.error("Update error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.post("/api/exam-result", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { subject, topic, score, totalQuestions, correctAnswers, wrongAnswers, skipped, totalTime, examMode } = req.body;

      const result = await storage.saveExamResult({
        userId,
        subject,
        topic: topic || null,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        skipped,
        totalTime,
        examMode: examMode || "normal",
      });

      res.json({ result });
    } catch (error: any) {
      console.error("Save result error:", error);
      res.status(500).json({ error: "Failed to save result" });
    }
  });

  app.post("/api/progress/update", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { updates } = req.body;

      if (Array.isArray(updates)) {
        for (const u of updates) {
          await storage.upsertProgress(userId, u.subject, u.topic, u.correct);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Progress update error:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, examType, educationLevel, language = "en", history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const langInstruction = language === "bn"
        ? "Respond in Bengali (বাংলা). Use proper Bengali script."
        : "Respond in English.";

      const systemPrompt = `You are CrackIt AI, an expert exam preparation tutor for Bangladesh students. You help with all exam types: BCS, Medical, Engineering, University Admission, SSC, HSC, JSC, PSC, Madrasah exams.

Current context:
- Student's exam type: ${examType || "general"}
- Education level: ${educationLevel || "not specified"}

Your capabilities:
- Explain any topic clearly with examples
- Generate practice questions on demand
- Provide study tips and strategies
- Help with Bangladesh curriculum content (Bangla grammar, literature, history, science, math, etc.)
- Give personalized study recommendations

${langInstruction}

Keep responses concise but thorough. Use bullet points and clear formatting. If asked for practice questions, format them as numbered MCQs with options A-D.`;

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...history.slice(-10).map((h: any) => ({ role: h.role, content: h.content })),
        { role: "user", content: message },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages,
        max_completion_tokens: 4096,
      });

      const reply = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

      res.json({ reply });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Chat failed", details: error.message });
    }
  });

  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { examType, subject, topic, difficulty, count = 5, language = "en" } = req.body;

      if (!subject) {
        return res.status(400).json({ error: "Subject is required" });
      }

      const cacheKey = getCacheKey({ examType, subject, topic, difficulty, count, language });
      const cached = getCachedQuestions(cacheKey);
      if (cached) {
        return res.json({ questions: cached, fromCache: true });
      }

      const langInstructions = language === "bn"
        ? "Generate all questions, options, and explanations in Bengali (বাংলা) language. Use proper Bengali script."
        : "Generate all questions, options, and explanations in English.";

      const prompt = `Generate ${count} multiple choice questions for ${examType || "general"} exam preparation in Bangladesh.

Subject: ${subject}
${topic ? `Topic: ${topic}` : ""}
Difficulty: ${difficulty || "mixed"}

Requirements:
- Each question must have exactly 4 options labeled as array items
- Only one option should be correct
- Include a detailed explanation for the correct answer
- Questions should be relevant to Bangladesh competitive exam standards
- Questions should test understanding, not just memorization
- Make questions creative and thought-provoking
- ${langInstructions}

Return ONLY a valid JSON array with this exact format, no other text:
[{
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation here."
}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          {
            role: "system",
            content: `You are an expert question generator for Bangladesh competitive exams. Generate high-quality MCQs. ${language === "bn" ? "Generate in Bengali (বাংলা)." : "Generate in English."} Return ONLY valid JSON arrays, no markdown or extra text.`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 8192,
      });

      const content = response.choices[0]?.message?.content || "[]";
      let jsonContent = content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      const questions = JSON.parse(jsonContent);

      const formattedQuestions = questions.map((q: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        examType: examType || "university",
        subject,
        topic: topic || "General",
        difficulty: difficulty || "medium",
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        language: language || "en",
      }));

      questionCache.set(cacheKey, { questions: formattedQuestions, timestamp: Date.now() });

      res.json({ questions: formattedQuestions });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate questions", details: error.message });
    }
  });

  app.post("/api/batch-generate", async (req, res) => {
    try {
      const { examType, subject, topic, difficulty, count = 10, language = "en" } = req.body;

      if (!subject) {
        return res.status(400).json({ error: "Subject is required" });
      }

      const cacheKey = getCacheKey({ batch: true, examType, subject, topic, difficulty, count, language });
      const cached = getCachedQuestions(cacheKey);
      if (cached) {
        return res.json({ questions: cached, fromCache: true });
      }

      const langInstructions = language === "bn"
        ? "Generate all questions, options, and explanations in Bengali (বাংলা) language using proper Bengali script."
        : "Generate all questions, options, and explanations in English.";

      const prompt = `Generate ${count} multiple choice questions for ${examType || "general"} exam preparation in Bangladesh.

Subject: ${subject}
${topic ? `Topic: ${topic}` : ""}
Difficulty: ${difficulty || "mixed"}

Requirements:
- Each question must have exactly 4 options
- Only one option should be correct
- Include a detailed explanation for the correct answer
- Questions should be relevant to Bangladesh curriculum standards
- Cover different aspects and difficulty levels within the topic
- ${langInstructions}

Return ONLY a valid JSON array with this exact format, no other text:
[{
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation here."
}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          {
            role: "system",
            content: `You are an expert question generator for Bangladesh exams. Generate high-quality, curriculum-aligned MCQs in bulk. ${language === "bn" ? "Generate in Bengali." : "Generate in English."} Return ONLY valid JSON arrays.`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 16384,
      });

      const content = response.choices[0]?.message?.content || "[]";
      let jsonContent = content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      const questions = JSON.parse(jsonContent);

      const formattedQuestions = questions.map((q: any, index: number) => ({
        id: `batch-${Date.now()}-${index}`,
        examType: examType || "university",
        subject,
        topic: topic || "General",
        difficulty: difficulty || "medium",
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        language: language || "en",
      }));

      questionCache.set(cacheKey, { questions: formattedQuestions, timestamp: Date.now() });

      res.json({ questions: formattedQuestions, total: formattedQuestions.length });
    } catch (error: any) {
      console.error("Error batch generating questions:", error);
      res.status(500).json({ error: "Failed to batch generate questions", details: error.message });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const period = (req.query.period as string) === "weekly" ? "weekly" : "alltime";
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const entries = await storage.getLeaderboard(period as "alltime" | "weekly", limit);

      let currentUserRank: number | null = null;
      if (req.session?.userId) {
        currentUserRank = await storage.getUserRank(req.session.userId, period as "alltime" | "weekly");
      }

      res.json({
        entries,
        currentUserRank,
        currentUserId: req.session?.userId || null,
        period,
      });
    } catch (error: any) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
