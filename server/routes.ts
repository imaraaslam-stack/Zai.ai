import type { Express } from "express";
import { type Server } from "http"; // Cleaned up unused import
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Safety check for the API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: Missing GEMINI_API_KEY in Secrets!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

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
        summary: input.content.slice(0, 100) + "...", 
      });
      res.status(201).json(topic);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Added Ownership Check
  app.get(api.topics.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const topic = await storage.getTopic(Number(req.params.id));
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    if (topic.userId !== userId) return res.status(403).json({ message: "Not your topic!" });
    res.json(topic);
  });

  // === QUIZZES ===
  app.post(api.quizzes.generate.path, isAuthenticated, async (req, res) => {
    try {
      const { topicId } = api.quizzes.generate.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      
      const topic = await storage.getTopic(topicId);
      if (!topic || topic.userId !== userId) return res.status(404).json({ message: "Topic not found" });

      const prompt = `Generate 3 multiple-choice questions in JSON format based on: ${topic.originalContent.slice(0, 2000)}`;

      const result = await model.generateContent(prompt);
      let content = result.response.text() || "{}";
      content = content.replace(/```json|```/g, "").trim();
      
      // Safety net for JSON parsing
      let questions;
      try {
        const parsed = JSON.parse(content);
        questions = parsed.questions || [];
      } catch (e) {
        return res.status(500).json({ message: "AI returned messy data. Try again!" });
      }

      const quiz = await storage.createQuiz({
        topicId, userId,
        title: `Quiz: ${topic.title}`,
        questions,
        score: null,
      });

      res.status(201).json(quiz);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  // Added Ownership Check for Quizzes
  app.get(api.quizzes.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const quiz = await storage.getQuiz(Number(req.params.id));
    if (!quiz || quiz.userId !== userId) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  });

  return httpServer;
}