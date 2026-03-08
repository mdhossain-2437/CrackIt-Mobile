import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

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

export async function registerRoutes(app: Express): Promise<Server> {
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
            content: `You are an expert question generator for Bangladesh competitive exams (BCS, Medical, Engineering, University, SSC, HSC, JSC, PSC, Madrasah). Generate high-quality MCQs. ${language === "bn" ? "Generate in Bengali (বাংলা)." : "Generate in English."} Return ONLY valid JSON arrays, no markdown or extra text.`,
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
      res.status(500).json({
        error: "Failed to generate questions",
        details: error.message,
      });
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
      res.status(500).json({
        error: "Failed to batch generate questions",
        details: error.message,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
