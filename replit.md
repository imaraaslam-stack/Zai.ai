# StudyBuddy - AI-Powered Quiz Generator

## Overview

StudyBuddy is an AI-powered learning platform that transforms study notes into interactive quizzes. Users paste their study material, and the application uses Google's Gemini AI to generate quiz questions with multiple choice answers. The app features a Duolingo-inspired UI with gamification elements like streaks and confetti celebrations.

**Core Features:**
- User authentication via Replit Auth
- Topic/study material management
- AI-powered quiz generation using Gemini
- Study streak tracking
- Interactive quiz-taking with immediate feedback

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for page transitions and UI animations
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a page-based architecture with shared components. Pages are in `client/src/pages/` and reusable components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle authentication (`use-auth.ts`) and study-related API calls (`use-study.ts`).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful API with typed routes defined in `shared/routes.ts`
- **AI Integration**: Google Gemini 1.5 Flash model for quiz generation
- **Session Management**: Express sessions with PostgreSQL store

Routes are registered in `server/routes.ts` with authentication middleware. The server uses a storage abstraction layer (`server/storage.ts`) for database operations.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Key Tables**:
  - `topics`: User study materials with title and original content
  - `quizzes`: Generated quizzes linked to topics, stores questions as JSONB
  - `streaks`: User study streak tracking
  - `sessions`: Authentication session storage (required for Replit Auth)
  - `users`: User profile data (required for Replit Auth)

### Authentication
- **Method**: Replit Auth (OpenID Connect)
- **Implementation**: Located in `server/replit_integrations/auth/`
- **Session Store**: PostgreSQL via connect-pg-simple
- All protected routes use the `isAuthenticated` middleware

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle database schema and Zod validation schemas
- `routes.ts`: API route definitions with input/output types
- `models/`: Separate model files for auth and chat entities

## External Dependencies

### AI Services
- **Google Gemini API**: Used for quiz generation from study notes
  - Configured via `GEMINI_API_KEY` environment variable
  - Model: `gemini-1.5-flash` with JSON response format

### Database
- **PostgreSQL**: Primary data store
  - Connection via `DATABASE_URL` environment variable
  - Migrations managed by Drizzle Kit in `/migrations`

### Authentication
- **Replit Auth**: OAuth/OIDC authentication
  - Requires `SESSION_SECRET` environment variable
  - Uses `ISSUER_URL` (defaults to Replit OIDC endpoint)

### Optional Integrations (Pre-configured but not actively used)
- OpenAI API via `AI_INTEGRATIONS_OPENAI_API_KEY` for chat/voice features in `server/replit_integrations/`
- Image generation capabilities in `server/replit_integrations/image/`

### UI Dependencies
- shadcn/ui components (Radix UI primitives)
- Lucide React icons
- canvas-confetti for celebration effects
- date-fns for date formatting