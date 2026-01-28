import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // 1. Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // 2. Protected Routes
  
  // === TOPICS ===
  app.get(api.topics.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const topics = await storage.getTopics(userId);
    res.json(topics);
  });

  app.post(api.topics.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.topics.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      const topic = await storage.createTopic({
        title: input.title,
        originalContent: input.content,
        userId,
        summary: input.content.slice(0, 100) + "...", // Placeholder summary
      });
      res.status(201).json(topic);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.topics.get.path, isAuthenticated, async (req, res) => {
    const topic = await storage.getTopic(Number(req.params.id));
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.json(topic);
  });

  app.delete(api.topics.delete.path, isAuthenticated, async (req, res) => {
     const topic = await storage.getTopic(Number(req.params.id));
     if (!topic) return res.status(404).json({ message: "Topic not found" });
     
     // Ensure user owns topic
     const userId = (req.user as any).claims.sub;
     if (topic.userId !== userId) return res.status(403).json({ message: "Forbidden" });

     await storage.deleteTopic(topic.id);
     res.status(204).send();
  });

  // === QUIZZES ===
  app.post(api.quizzes.generate.path, isAuthenticated, async (req, res) => {
    try {
      const { topicId } = api.quizzes.generate.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      
      const topic = await storage.getTopic(topicId);
      if (!topic) return res.status(404).json({ message: "Topic not found" });

      // Call OpenAI to generate questions
      const prompt = `
        Generate 3 multiple-choice questions based on the following text.
        Return a JSON object with a key "questions" containing an array of objects.
        Each object must have:
        - "question": string
        - "options": array of 4 strings
        - "correctAnswer": string (must be one of the options)
        - "explanation": string (brief explanation of why it is correct)

        Text:
        ${topic.originalContent.slice(0, 2000)}
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fast and cheap
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      const questions = result.questions || [];

      const quiz = await storage.createQuiz({
        topicId,
        userId,
        title: `Quiz: ${topic.title}`,
        questions: questions,
        score: null,
      });

      res.status(201).json(quiz);
    } catch (err) {
      console.error("Quiz generation error:", err);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.get(api.quizzes.get.path, isAuthenticated, async (req, res) => {
    const quiz = await storage.getQuiz(Number(req.params.id));
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  });

  app.post(api.quizzes.submit.path, isAuthenticated, async (req, res) => {
    try {
      const { score } = api.quizzes.submit.input.parse(req.body);
      const quizId = Number(req.params.id);
      const userId = (req.user as any).claims.sub;

      const quiz = await storage.updateQuizScore(quizId, score);
      
      // Update streak
      const { streak, updated } = await storage.updateStreak(userId);

      res.json({ quiz, streak, streakUpdated: updated });
    } catch (err) {
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // === STREAKS ===
  app.get(api.streaks.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const streak = await storage.getStreak(userId);
    res.json(streak || { currentStreak: 0, lastStudyDate: null });
  });

  return httpServer;
}
