# CrackIt - AI-Powered Exam Prep Platform

## Overview
CrackIt is a mobile-first exam preparation platform for Bangladesh competitive exams (BCS, Medical, Engineering, University). Built with Expo React Native + Express backend.

## Architecture
- **Frontend**: Expo React Native (SDK 54) with file-based routing (expo-router)
- **Backend**: Express.js on port 5000 with OpenAI integration for AI question generation
- **State**: AsyncStorage via React Context (AppContext) for all user data persistence
- **Styling**: React Native StyleSheet with Inter font, blue primary theme (#1A73E8 light / #8AB4F8 dark)

## Key Features
- Adaptive MCQ practice across 4 exam types with 44+ curated questions
- AI-generated questions via OpenAI (gpt-5.2) on any subject/topic
- Full exam interface with countdown timer, question palette, mark-for-review
- Result analytics with animated score, per-question review with explanations
- Streak tracking, XP system, subject progress tracking
- Dark mode support

## File Structure
```
app/
  _layout.tsx          - Root layout (Stack, providers)
  index.tsx            - Onboarding screen (exam type selection)
  exam.tsx             - Full exam interface
  result.tsx           - Result analytics with review
  (tabs)/
    _layout.tsx        - Tab navigation (NativeTabs + ClassicTabs)
    index.tsx          - Dashboard (streaks, stats, quick practice)
    practice.tsx       - Subject/topic browser with accordion
    ai.tsx             - AI question generator
    profile.tsx        - Profile, stats, settings

contexts/
  AppContext.tsx        - All app state management with AsyncStorage

lib/
  questions.ts         - Question bank (44+ questions), types, utility functions
  query-client.ts      - React Query client, API utilities

constants/
  colors.ts            - Theme colors (light/dark) with useColors hook

server/
  routes.ts            - AI question generation endpoint (/api/generate-questions)
  index.ts             - Express server setup
```

## Navigation Flow
1. `app/index.tsx` - Onboarding (exam type selection) → redirects to tabs if already onboarded
2. `app/(tabs)/` - Main app with 4 tabs (Home, Practice, AI, Profile)
3. `app/exam.tsx` - Full-screen exam (no back gesture)
4. `app/result.tsx` - Results with review (no back gesture)

## API Endpoints
- `POST /api/generate-questions` - AI question generation
  - Body: `{ examType, subject, topic?, difficulty?, count? }`
  - Returns: `{ questions: Question[] }`

## Environment
- OpenAI integration via Replit AI Integrations (auto-configured)
- SESSION_SECRET available as environment secret
- Frontend on port 8081, Backend on port 5000
