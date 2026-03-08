# CrackIt - AI-Powered Exam Prep Platform

## Overview
CrackIt is a production-quality mobile-first exam preparation platform for Bangladesh competitive and board exams. Built with Expo React Native + Express backend + PostgreSQL. Features full Bangla/English bilingual UI, 2000+ question bank, AI Study Coach, analytics dashboard, real IRT-based adaptive difficulty, spaced repetition with forgetting curves, 25+ achievements system, and community question creation.

## Architecture
- **Frontend**: Expo React Native (SDK 54) with file-based routing (expo-router)
- **Backend**: Express.js on port 5000 with OpenAI integration, session-based auth
- **Database**: PostgreSQL via Drizzle ORM (users, exam_results, user_progress, community_questions, study_sessions, question_attempts, daily_goals, achievements, user_achievements, bookmarks, notifications)
- **Auth**: bcryptjs password hashing, express-session with connect-pg-simple store (30-day sessions)
- **State**: AsyncStorage via React Context (AppContext) for local data + server sync for authenticated users
- **Styling**: Premium UI with LinearGradient headers, glassmorphic cards (expo-blur), Inter font, blue primary theme (#1A73E8)
- **i18n**: Custom translation system in `lib/i18n.ts` with 500+ keys, `tr()` function from AppContext
- **Animations**: react-native-reanimated (spring scales, staggered FadeIn, animated counters, pulse effects, streak bursts)
- **Algorithms**: Production IRT 1-parameter model, Ebbinghaus forgetting curve, SM-2 spaced repetition, momentum scoring

## Key Features
- 9 exam types: BCS, Medical, Engineering, University, SSC, HSC, JSC, PSC, Madrasah
- 2000+ curated questions in English and Bangla across all exam types
- Community question creation — users can create, share, and vote on MCQs
- PostgreSQL-backed user auth with education level tracking (Primary to Job Prep)
- Full Bangla/English bilingual UI with language toggle (500+ i18n keys)
- Adaptive difficulty mode with real IRT theta estimation
- Smart Daily Mix — auto-curated question sets: 30% weak, 30% spaced review, 20% new, 10% challenge
- Spaced Repetition with Ebbinghaus forgetting curve (R = e^(-t/S))
- 25+ Achievement/Badge system with rarity tiers (common/uncommon/rare/epic/legendary)
- AI Study Coach with context-aware conversations, performance-based suggestions
- AI-generated questions via OpenAI in both languages
- Advanced analytics with animated charts, weekly heatmap, topic mastery, predicted score, AI insights
- Full exam interface with circular timer, confidence meter, skip confirmation, page transitions
- 5 practice modes: Relaxed, Timed (60s/q), Speed Round (15s/q), Marathon (50q), Adaptive
- Leaderboard system with weekly/all-time rankings by XP
- Study session tracking with daily goals and circular progress rings
- Results with animated score, grade badge, XP animation, achievement popup, practice wrong answers, share
- Profile with initials avatar, achievement grid, settings, daily reminder toggle
- Bookmarks system for saving questions
- Performance prediction model based on historical trends
- Full accessibility (accessibilityRole, accessibilityLabel, accessibilityState on all interactive elements)
- Dark mode support throughout

## File Structure
```
app/
  _layout.tsx          - Root layout (Stack, providers, font loading)
  auth.tsx             - Login/Register with gradient background, step indicator, education level cards
  index.tsx            - Onboarding (language + grouped exam type selection)
  exam.tsx             - Full exam interface with circular timer, confidence meter, page transitions
  result.tsx           - Result with animated score, grade badge, XP animation, achievement popup
  chatbot.tsx          - AI Study Coach with typing indicator, contextual suggestions
  (tabs)/
    _layout.tsx        - Tab navigation with animated tab icons, rounded tab bar
    index.tsx          - Dashboard (hero greeting, glass stats, daily goal ring, smart mix, streak calendar, leaderboard)
    practice.tsx       - Subject/topic browser with search, spaced review banner, mode selector, FAB
    ai.tsx             - AI question generator (language + exam type selector)
    analytics.tsx      - Analytics with animated bars, weekly heatmap, topic mastery, predicted score, AI insights
    profile.tsx        - Profile with initials avatar, achievement grid, settings, daily reminder

contexts/
  AppContext.tsx        - App state: auth, language, topicProgress, tr(), loginUser(), registerUser()

lib/
  i18n.ts              - Translation system (500+ keys, en/bn)
  algorithm.ts         - IRT theta estimation, Ebbinghaus forgetting curve, SM-2 spaced repetition, adaptive selection, Smart Daily Mix, performance prediction, momentum scoring
  achievements.ts      - 25+ achievements with rarity tiers, XP rewards, progress tracking
  questions.ts         - 9 exam types, 2000+ questions, type definitions, education level mapping
  query-client.ts      - React Query client, API utilities

components/
  ErrorBoundary.tsx    - Error boundary for graceful failure handling
  ErrorFallback.tsx    - Error fallback UI
  KeyboardAwareScrollViewCompat.tsx - Cross-platform keyboard avoidance

constants/
  colors.ts            - Theme colors (light/dark) with gradients, glass, hero, shadow colors

shared/
  schema.ts            - PostgreSQL schema (users, examResults, userProgress, communityQuestions, studySessions, questionAttempts, dailyGoals, achievements, userAchievements, bookmarks, notifications)

server/
  routes.ts            - Auth, chat, AI, results, leaderboard, community questions, study sessions, recommendations, achievements, bookmarks, adaptive sessions, spaced review, daily goals
  storage.ts           - PgStorage with Drizzle ORM (all CRUD operations)
  index.ts             - Express server with session middleware
  templates/landing-page.html - Branded CrackIt landing page
```

## Algorithm Engine (lib/algorithm.ts)
- **IRT 1-Parameter Model**: P(correct) = 1/(1+e^(-a*(theta-b))), theta estimation via maximum likelihood
- **Ebbinghaus Forgetting Curve**: R = e^(-t/S) where S = stability growing with successful recalls
- **SM-2 Spaced Repetition**: Optimal review intervals per question based on recall quality
- **Adaptive Question Selection**: Maximum information gain (questions where P(correct) ~ 0.5)
- **Smart Daily Mix**: 30% weak topics, 30% spaced review, 20% new content, 10% challenge
- **Performance Prediction**: Based on recent accuracy trends and momentum scoring
- **Level/XP Calculation**: 500 XP per level with diminishing returns

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
- `GET /api/questions/community` - Browse community questions
- `POST /api/questions/vote` - Vote on community question
- `POST /api/study-session` - Log study session
- `GET /api/study-sessions` - Get study sessions
- `GET /api/study-stats` - Get study statistics
- `GET /api/recommendations` - Personalized recommendations
- `POST /api/question-attempt` - Log individual question attempt
- `GET /api/adaptive-session` - Get personalized adaptive question set
- `GET /api/spaced-review` - Questions due for review
- `GET /api/daily-goal` - Get/create today's goal
- `POST /api/daily-goal/complete` - Mark daily goal progress
- `GET /api/achievements` - Get user achievements
- `POST /api/achievements/check` - Check for new achievements
- `POST /api/bookmarks` - Save/remove bookmarks
- `GET /api/bookmarks` - Get saved bookmarks

## Environment
- OpenAI integration via Replit AI Integrations (auto-configured)
- SESSION_SECRET for express-session
- DATABASE_URL for PostgreSQL
- Frontend on port 8081, Backend on port 5000
