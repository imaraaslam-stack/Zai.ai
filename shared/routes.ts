import { z } from 'zod';
import { insertTopicSchema, topics, quizzes, streaks } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  topics: {
    list: {
      method: 'GET' as const,
      path: '/api/topics',
      responses: {
        200: z.array(z.custom<typeof topics.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/topics',
      input: z.object({
        title: z.string().min(1),
        content: z.string().min(10), // The text content to process
      }),
      responses: {
        201: z.custom<typeof topics.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/topics/:id',
      responses: {
        200: z.custom<typeof topics.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/topics/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  quizzes: {
    generate: {
      method: 'POST' as const,
      path: '/api/quizzes/generate',
      input: z.object({
        topicId: z.number(),
      }),
      responses: {
        201: z.custom<typeof quizzes.$inferSelect>(), // Returns the generated quiz
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/quizzes/:id',
      responses: {
        200: z.custom<typeof quizzes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/quizzes/:id/submit',
      input: z.object({
        score: z.number(),
      }),
      responses: {
        200: z.object({
          quiz: z.custom<typeof quizzes.$inferSelect>(),
          streak: z.custom<typeof streaks.$inferSelect>().optional(),
          streakUpdated: z.boolean(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  streaks: {
    get: {
      method: 'GET' as const,
      path: '/api/streak',
      responses: {
        200: z.custom<typeof streaks.$inferSelect>(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type TopicResponse = z.infer<typeof api.topics.create.responses[201]>;
export type QuizResponse = z.infer<typeof api.quizzes.generate.responses[201]>;
export type StreakResponse = z.infer<typeof api.streaks.get.responses[200]>;
