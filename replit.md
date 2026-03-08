# CrackIt - AI-Powered Exam Prep Platform

## Overview
CrackIt is a premium mobile-first exam preparation platform for Bangladesh competitive and board exams. Built with Expo React Native + Express backend + PostgreSQL. Supports full Bangla/English bilingual UI with 800+ question bank, AI Study Coach, analytics dashboard, adaptive difficulty, smart recommendations, and community question creation.

## Architecture
- **Frontend**: Expo React Native (SDK 54) with file-based routing (expo-router)
- **Backend**: Express.js on port 5000 with OpenAI integration, session-based auth
- **Database**: PostgreSQL via Drizzle ORM (users, exam_results, user_progress, community_questions, study_sessions tables)
- **Auth**: bcryptjs password hashing, express-session with connect-pg-simple store (30-day sessions)
- **State**: AsyncStorage via React Context (AppContext) for local data + server sync for authenticated users
- **Styling**: Premium UI with LinearGradient headers, glassmorphic cards (expo-blur), Inter font, blue primary theme (#1A73E8)
- **i18n**: Custom translation system in `lib/i18n.ts` with 350+ keys, `tr()` function from AppContext
- **Animations**: react-native-reanimated (spring scales, staggered FadeIn, animated counters, pulse effects, streak bursts)

## Key Features
- 9 exam types: BCS, Medical, Engineering, University, SSC, HSC, JSC, PSC, Madrasah
- 800+ curated questions in English and Bangla across all exam types
- Community question creation — users can create, share, and vote on MCQs
- PostgreSQL-backed user auth with education level tracking (Primary to Job Prep)
- Full Bangla/English bilingual UI with language toggle
- Adaptive difficulty mode (real-time difficulty adjustment during exams)
- Smart recommendation engine (forgetting curve, weak topic drills, performance trends)
- Smart Daily Mix — auto-curated question sets mixing weak, spaced, and new content
- AI Study Coach with context-aware conversations, performance-based suggestions
- AI-generated questions via OpenAI (gpt-5.2) in both languages
- Advanced analytics with animated charts, weekly heatmap, AI insights card
- Full exam interface with gradient headers, animated option selection, confetti streaks
- 4 practice modes: Relaxed (no timer), Timed (60s/q), Speed Round (15s/q), Marathon (50q)
- Leaderboard system with weekly/all-time rankings by XP
- Study session tracking with daily goals and progress rings
- Result analytics with animated score counter, performance comparison card
- Premium UI: gradient hero headers, glass stat cards, micro-interactions, haptic feedback
- Achievement badges on profile (streak, questions, score milestones)
- Custom CrackIt branded app icon (lightning bolt motif)
- Branded landing page with feature showcase, exam badges, QR code section
- Dark mode support throughout

## File Structure
```
app/
  _layout.tsx          - Root layout (Stack, providers, font loading)
  auth.tsx             - Login/Register with gradient background, step indicator, education level cards
  index.tsx            - Onboarding (language + grouped exam type selection)
  exam.tsx             - Full exam interface with gradient mode headers, animated options, streak bursts
  result.tsx           - Result with animated score counter, performance comparison, gradient score ring
  chatbot.tsx          - AI Study Coach with typing indicator, contextual suggestions, performance context
  (tabs)/
    _layout.tsx        - Tab navigation with animated tab icons, rounded tab bar
    index.tsx          - Dashboard (gradient hero, greeting, glass stats, daily goal, today's challenge, subjects)
    practice.tsx       - Subject/topic browser with gradient cards, mode selector, create question modal
    ai.tsx             - AI question generator (language + exam type selector)
    analytics.tsx      - Analytics with animated bars, weekly heatmap, AI insights, gradient overview cards
    profile.tsx        - Profile with gradient avatar header, achievement badges, animated counters, grouped settings

contexts/
  AppContext.tsx        - App state: auth, language, topicProgress, tr(), loginUser(), registerUser()

lib/
  i18n.ts              - Translation system (350+ keys, en/bn)
  algorithm.ts         - Adaptive selection + Smart Daily Mix + recommendation engine + performance trends
  questions.ts         - 9 exam types, 800+ questions, type definitions, education level mapping
  query-client.ts      - React Query client, API utilities

constants/
  colors.ts            - Theme colors (light/dark) with gradients, glass, hero, shadow colors

shared/
  schema.ts            - PostgreSQL schema (users, examResults, userProgress, communityQuestions, studySessions)

server/
  routes.ts            - Auth, chat, AI, results, leaderboard, community questions, study sessions, recommendations
  storage.ts           - PgStorage with Drizzle ORM (all CRUD operations)
  index.ts             - Express server with session middleware
  templates/landing-page.html - Branded CrackIt landing page
```

## API Endpoints
- `POST /api/auth/register` - User registration with education level
- `POST /api/auth/login` - Session-based login
- `GET /api/auth/me` - Get authenticated user + progress + exam history
- `POST /api/auth/logout` - Destroy session
- `POST /api/auth/update` - Update user profile/stats
- `POST /api/exam-result` - Save exam result (authenticated)
- `POST /api/progress/update` - Sync topic progress
- `POST /api/chat` - AI Study Coach conversation (with performance context)
- `POST /api/generate-questions` - AI question generation
- `POST /api/batch-generate` - Bulk AI question generation
- `GET /api/leaderboard` - Leaderboard rankings (query: period=weekly|alltime)
- `POST /api/questions/create` - Create community question (authenticated)
- `GET /api/questions/community` - Browse community questions (query: examType, limit)
- `POST /api/questions/vote` - Vote on community question (authenticated)
- `POST /api/study-session` - Log study session (authenticated)
- `GET /api/study-sessions` - Get study sessions (query: days)
- `GET /api/study-stats` - Get study statistics
- `GET /api/recommendations` - Get personalized recommendations (weak topics, stale topics, trends)

## Education Levels
- Primary (Class 1-5), Junior (Class 6-8), SSC (Class 9-10), HSC (Class 11-12), University Admission, Job Preparation

## Recommendation Engine (lib/algorithm.ts)
- Smart Daily Mix: 30% weak topics, 30% spaced review, 20% new content, 20% random
- Forgetting curve: topics practiced >3 days ago get exponentially increasing priority
- Weak topic drills: auto-generated sets from worst-performing topics (<50% accuracy)
- Performance trends: tracks improving vs declining topics via consecutive correct streaks
- Level-up suggestion: when accuracy >80% and 50+ questions, suggest harder exam type
- Education level progression awareness

## Environment
- OpenAI integration via Replit AI Integrations (auto-configured, gpt-5.2)
- SESSION_SECRET for express-session
- DATABASE_URL for PostgreSQL
- Frontend on port 8081, Backend on port 5000
