import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertTopic } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// === STREAKS ===
export function useStreak() {
  return useQuery({
    queryKey: [api.streaks.get.path],
    queryFn: async () => {
      const res = await fetch(api.streaks.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch streak");
      return api.streaks.get.responses[200].parse(await res.json());
    },
  });
}

// === TOPICS ===
export function useTopics() {
  return useQuery({
    queryKey: [api.topics.list.path],
    queryFn: async () => {
      const res = await fetch(api.topics.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch topics");
      return api.topics.list.responses[200].parse(await res.json());
    },
  });
}

export function useTopic(id: number) {
  return useQuery({
    queryKey: [api.topics.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.topics.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch topic");
      return api.topics.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const validated = api.topics.create.input.parse(data);
      const res = await fetch(api.topics.create.path, {
        method: api.topics.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.topics.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create topic");
      }
      return api.topics.create.responses[201].parse(await res.json());
    },
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: [api.topics.list.path] });
      toast({
        title: "Topic Created!",
        description: "Generating your quiz now...",
      });
      // Chain creation: immediately generate quiz
      return topic;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === QUIZZES ===
export function useGenerateQuiz() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (topicId: number) => {
      const res = await fetch(api.quizzes.generate.path, {
        method: api.quizzes.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to generate quiz");
      return api.quizzes.generate.responses[201].parse(await res.json());
    },
    onSuccess: (quiz) => {
      toast({
        title: "Quiz Ready!",
        description: "Let's start learning.",
      });
      setLocation(`/quiz/${quiz.id}`);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useQuiz(id: number) {
  return useQuery({
    queryKey: [api.quizzes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.quizzes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch quiz");
      return api.quizzes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, score }: { id: number; score: number }) => {
      const url = buildUrl(api.quizzes.submit.path, { id });
      const res = await fetch(url, {
        method: api.quizzes.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to submit quiz");
      return api.quizzes.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.streaks.get.path] });
    },
  });
}
