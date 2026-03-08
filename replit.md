# CrackIt - AI-Powered Exam Prep Platform

## Overview
CrackIt is a premium mobile-first exam preparation platform for Bangladesh competitive and board exams. Built with Expo React Native + Express backend + PostgreSQL. Supports full Bangla/English bilingual UI with 500+ question bank, AI chatbot, analytics dashboard, and adaptive difficulty mode.

## Architecture
- **Frontend**: Expo React Native (SDK 54) with file-based routing (expo-router)
- **Backend**: Express.js on port 5000 with OpenAI integration, session-based auth
- **Database**: PostgreSQL via Drizzle ORM (users, exam_results, user_progress tables)
- **Auth**: bcryptjs password hashing, express-session with connect-pg-simple store (30-day sessions)
- **State**: AsyncStorage via React Context (AppContext) for local data + server sync for authenticated users
- **Styling**: React Native StyleSheet with Inter font, blue primary theme (#1A73E8 light / #8AB4F8 dark)
- **i18n**: Custom translation system in `lib/i18n.ts` with 280+ keys, `tr()` function from AppContext
- **Animations**: react-native-reanimated (FadeInDown, FadeInRight staggered entrance animations)

## Key Features
- 9 exam types: BCS, Medical, Engineering, University, SSC, HSC, JSC, PSC, Madrasah
- 500+ curated questions in English and Bangla across all exam types
- PostgreSQL-backed user auth with education level tracking (Primary to Job Prep)
- Full Bangla/English bilingual UI with language toggle
- Adaptive difficulty mode (real-time difficulty adjustment during exams)
- Adaptive spaced-repetition algorithm for intelligent question selection
- AI Study Chatbot with context-aware conversations
- AI-generated questions via OpenAI (gpt-5.2) in both languages
- Advanced analytics dashboard with subject accuracy, score history, weakness radar
- Full exam interface with countdown timer, question palette, mark-for-review
- Result analytics with animated score, difficulty progression summary
- Dark mode support, premium UI with staggered animations

## File Structure
```
app/
  _layout.tsx          - Root layout (Stack, providers, font loading)
  auth.tsx             - Login/Register with 2-step registration, education level picker
  index.tsx            - Onboarding (language + grouped exam type selection)
  exam.tsx             - Full exam interface (normal + adaptive mode)
  result.tsx           - Result analytics with review + adaptive progression
  chatbot.tsx          - AI Study Chatbot with suggestion chips
  (tabs)/
    _layout.tsx        - Tab navigation (5 tabs: Home, Practice, AI, Analytics, Profile)
    index.tsx          - Dashboard (streaks, stats, weak topics, adaptive practice, chatbot FAB)
    practice.tsx       - Subject/topic browser with strength indicators + adaptive mode
    ai.tsx             - AI question generator (language + exam type selector)
    analytics.tsx      - Advanced analytics (subject accuracy, score chart, weakness radar)
    profile.tsx        - Profile, auth status, stats, language/exam toggle, logout

contexts/
  AppContext.tsx        - App state: auth, language, topicProgress, tr(), loginUser(), registerUser()

lib/
  i18n.ts              - Translation system (280+ keys, en/bn)
  algorithm.ts         - Adaptive question selection + adaptive exam difficulty engine
  questions.ts         - 9 exam types, 500+ questions, type definitions
  query-client.ts      - React Query client, API utilities

constants/
  colors.ts            - Theme colors (light/dark) with semantic colors

shared/
  schema.ts            - PostgreSQL schema (users, examResults, userProgress) + Zod validation

server/
  routes.ts            - Auth, chat, AI generation, exam result sync endpoints
  storage.ts           - PgStorage with Drizzle ORM
  index.ts             - Express server with session middleware
```

## Navigation Flow
1. `app/auth.tsx` - Login/Register (skip available for guest mode)
2. `app/index.tsx` - Onboarding (language + exam type selection)
3. `app/(tabs)/` - Main app with 5 tabs (Home, Practice, AI, Analytics, Profile)
4. `app/exam.tsx` - Full-screen exam (normal or adaptive mode)
5. `app/result.tsx` - Results with review
6. `app/chatbot.tsx` - AI Study Assistant

## API Endpoints
- `POST /api/auth/register` - User registration with education level
- `POST /api/auth/login` - Session-based login
- `GET /api/auth/me` - Get authenticated user + progress
- `POST /api/auth/logout` - Destroy session
- `POST /api/auth/update` - Update user profile/stats
- `POST /api/exam-result` - Save exam result (authenticated)
- `POST /api/progress/update` - Sync topic progress
- `POST /api/chat` - AI chatbot conversation
- `POST /api/generate-questions` - AI question generation
- `POST /api/batch-generate` - Bulk AI question generation

## Education Levels
- Primary (Class 1-5), Junior (Class 6-8), SSC (Class 9-10), HSC (Class 11-12), University Admission, Job Preparation

## Adaptive Algorithm
- Weakness targeting: topics with <60% accuracy prioritized
- Spaced repetition: topics unseen for 3+ days get priority
- Difficulty progression: easy → medium (>70%) → hard (>85%)
- Smart mix: 30% weak, 30% spaced, 20% unseen, 20% random
- Adaptive exam mode: 2 consecutive correct → increase difficulty, 2 wrong → decrease
- TopicProgress key format: `"${subject}::${topic}"`

## Environment
- OpenAI integration via Replit AI Integrations (auto-configured, gpt-5.2)
- SESSION_SECRET for express-session
- DATABASE_URL for PostgreSQL
- Frontend on port 8081, Backend on port 5000
