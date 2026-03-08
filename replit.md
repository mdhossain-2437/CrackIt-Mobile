# CrackIt - AI-Powered Exam Prep Platform

## Overview
CrackIt is a mobile-first exam preparation platform for Bangladesh competitive and board exams. Built with Expo React Native + Express backend. Supports full Bangla/English bilingual UI.

## Architecture
- **Frontend**: Expo React Native (SDK 54) with file-based routing (expo-router)
- **Backend**: Express.js on port 5000 with OpenAI integration for AI question generation
- **State**: AsyncStorage via React Context (AppContext) for all user data persistence
- **Styling**: React Native StyleSheet with Inter font, blue primary theme (#1A73E8 light / #8AB4F8 dark)
- **i18n**: Custom translation system in `lib/i18n.ts` with 200+ keys, `tr()` function from AppContext

## Key Features
- 9 exam types: BCS, Medical, Engineering, University, SSC, HSC, JSC, PSC, Madrasah
- 200+ curated questions in English and Bangla across all exam types
- Full Bangla/English bilingual UI with language toggle (persisted to AsyncStorage)
- Adaptive spaced-repetition algorithm for intelligent question selection
- AI-generated questions via OpenAI (gpt-5.2) in both languages
- Full exam interface with countdown timer, question palette, mark-for-review
- Result analytics with animated score, per-question review with explanations
- Weak topic targeting, difficulty progression, streak tracking, XP system
- Dark mode support

## File Structure
```
app/
  _layout.tsx          - Root layout (Stack, providers)
  index.tsx            - Onboarding (language + grouped exam type selection)
  exam.tsx             - Full exam interface
  result.tsx           - Result analytics with review
  (tabs)/
    _layout.tsx        - Tab navigation (NativeTabs + ClassicTabs)
    index.tsx          - Dashboard (streaks, stats, weak topics, adaptive practice)
    practice.tsx       - Subject/topic browser with strength indicators
    ai.tsx             - AI question generator (language + exam type selector)
    profile.tsx        - Profile, stats, language toggle, exam type selector

contexts/
  AppContext.tsx        - App state: language, topicProgress, tr(), setLanguage()

lib/
  i18n.ts              - Translation system (200+ keys, en/bn)
  algorithm.ts         - Adaptive question selection engine
  questions.ts         - 9 exam types, 200+ questions, type definitions
  query-client.ts      - React Query client, API utilities

constants/
  colors.ts            - Theme colors (light/dark) with useColors hook

server/
  routes.ts            - AI endpoints: /api/generate-questions, /api/batch-generate
  index.ts             - Express server setup
```

## Navigation Flow
1. `app/index.tsx` - Onboarding (language + exam type selection, grouped by competitive/board)
2. `app/(tabs)/` - Main app with 4 tabs (Home, Practice, AI, Profile)
3. `app/exam.tsx` - Full-screen exam (no back gesture)
4. `app/result.tsx` - Results with review (no back gesture)

## API Endpoints
- `POST /api/generate-questions` - AI question generation
  - Body: `{ examType, subject, topic?, difficulty?, count?, language? }`
  - Returns: `{ questions: Question[] }`
  - In-memory cache with 1-hour TTL
- `POST /api/batch-generate` - Bulk AI question generation
  - Body: `{ examType, subject, topic?, difficulty?, count?, language? }`
  - Returns: `{ questions: Question[], total: number }`

## Adaptive Algorithm
- Weakness targeting: topics with <60% accuracy prioritized
- Spaced repetition: topics unseen for 3+ days get priority
- Difficulty progression: easy → medium (>70%) → hard (>85%)
- Smart mix: 30% weak, 30% spaced, 20% unseen, 20% random
- TopicProgress key format: `"${subject}::${topic}"`

## Exam Types
- **Competitive**: BCS, Medical, Engineering, University
- **Board**: PSC, JSC, SSC, HSC, Madrasah
- Each has `category`, `nameBn`, `descriptionBn`, full subject/topic trees

## Environment
- OpenAI integration via Replit AI Integrations (auto-configured, gpt-5.2)
- SESSION_SECRET available as environment secret
- Frontend on port 8081, Backend on port 5000
