import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { examType, subject, topic, difficulty, count = 5 } = req.body;

      if (!subject) {
        return res.status(400).json({ error: "Subject is required" });
      }

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
            content: "You are an expert question generator for Bangladesh competitive exams (BCS, Medical, Engineering, University). Generate high-quality MCQs. Return ONLY valid JSON arrays, no markdown or extra text.",
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
      }));

      res.json({ questions: formattedQuestions });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      res.status(500).json({
        error: "Failed to generate questions",
        details: error.message,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
