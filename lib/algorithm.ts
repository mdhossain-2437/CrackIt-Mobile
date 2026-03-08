import type { Question, UserData, ExamType, Difficulty, TopicProgress } from "./questions";
import { QUESTIONS, getQuestionsForExamType, shuffleArray } from "./questions";
import type { Language } from "./i18n";

interface WeightedQuestion {
  question: Question;
  weight: number;
}

export function getDifficultyRecommendation(
  userData: UserData,
  subject: string,
  topic?: string
): Difficulty {
  const key = topic ? `${subject}::${topic}` : subject;
  const progress = userData.topicProgress[key];

  if (!progress || progress.total < 3) return "easy";

  const accuracy = progress.correct / progress.total;

  if (accuracy >= 0.85 && progress.consecutiveCorrect >= 3) return "hard";
  if (accuracy >= 0.70) return "medium";
  return "easy";
}

function getTopicAccuracy(userData: UserData, subject: string, topic: string): number {
  const key = `${subject}::${topic}`;
  const progress = userData.topicProgress[key];
  if (!progress || progress.total === 0) return -1;
  return progress.correct / progress.total;
}

function getDaysSinceLastPractice(userData: UserData, subject: string, topic: string): number {
  const key = `${subject}::${topic}`;
  const progress = userData.topicProgress[key];
  if (!progress || !progress.lastPracticed) return 999;
  const last = new Date(progress.lastPracticed);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function isTopicUnseen(userData: UserData, subject: string, topic: string): boolean {
  const key = `${subject}::${topic}`;
  return !userData.topicProgress[key] || userData.topicProgress[key].total === 0;
}

export function getWeakTopics(userData: UserData, examType: ExamType, limit: number = 5): { subject: string; topic: string; accuracy: number }[] {
  const weakTopics: { subject: string; topic: string; accuracy: number }[] = [];

  for (const [key, progress] of Object.entries(userData.topicProgress)) {
    if (progress.total < 2) continue;
    const accuracy = progress.correct / progress.total;
    if (accuracy < 0.6) {
      const [subject, topic] = key.split("::");
      if (subject && topic) {
        const hasQuestions = QUESTIONS.some(
          (q) => q.examType === examType && q.subject === subject && q.topic === topic
        );
        if (hasQuestions) {
          weakTopics.push({ subject, topic, accuracy });
        }
      }
    }
  }

  return weakTopics.sort((a, b) => a.accuracy - b.accuracy).slice(0, limit);
}

export function getAdaptiveQuestions(
  userData: UserData,
  examType: ExamType,
  count: number = 10,
  language?: Language
): Question[] {
  let pool = getQuestionsForExamType(examType, language);
  if (pool.length === 0) {
    pool = getQuestionsForExamType(examType);
  }
  if (pool.length <= count) return shuffleArray(pool);

  const weighted: WeightedQuestion[] = pool.map((q) => {
    let weight = 1.0;
    const accuracy = getTopicAccuracy(userData, q.subject, q.topic);
    const daysSince = getDaysSinceLastPractice(userData, q.subject, q.topic);
    const unseen = isTopicUnseen(userData, q.subject, q.topic);

    if (accuracy >= 0 && accuracy < 0.6) {
      weight += 3.0;
    } else if (accuracy >= 0.6 && accuracy < 0.75) {
      weight += 1.5;
    } else if (accuracy >= 0.85) {
      weight += 0.3;
    }

    if (daysSince >= 7) {
      weight += 2.5;
    } else if (daysSince >= 3) {
      weight += 1.5;
    } else if (daysSince >= 1) {
      weight += 0.5;
    }

    if (unseen) {
      weight += 2.0;
    }

    const recommended = getDifficultyRecommendation(userData, q.subject, q.topic);
    if (q.difficulty === recommended) {
      weight += 1.0;
    }

    return { question: q, weight };
  });

  weighted.sort((a, b) => b.weight - a.weight);

  const selected: Question[] = [];
  const usedTopics = new Set<string>();
  const weakCount = Math.ceil(count * 0.3);
  const spacedCount = Math.ceil(count * 0.3);
  const unseenCount = Math.ceil(count * 0.2);

  const weakCandidates = weighted.filter((w) => {
    const acc = getTopicAccuracy(userData, w.question.subject, w.question.topic);
    return acc >= 0 && acc < 0.6;
  });
  for (const w of shuffleArray(weakCandidates).slice(0, weakCount)) {
    selected.push(w.question);
    usedTopics.add(`${w.question.subject}::${w.question.topic}`);
  }

  const spacedCandidates = weighted.filter((w) => {
    const key = `${w.question.subject}::${w.question.topic}`;
    if (usedTopics.has(key)) return false;
    return getDaysSinceLastPractice(userData, w.question.subject, w.question.topic) >= 3;
  });
  for (const w of shuffleArray(spacedCandidates).slice(0, spacedCount)) {
    selected.push(w.question);
    usedTopics.add(`${w.question.subject}::${w.question.topic}`);
  }

  const unseenCandidates = weighted.filter((w) => {
    const key = `${w.question.subject}::${w.question.topic}`;
    if (usedTopics.has(key)) return false;
    return isTopicUnseen(userData, w.question.subject, w.question.topic);
  });
  for (const w of shuffleArray(unseenCandidates).slice(0, unseenCount)) {
    selected.push(w.question);
    usedTopics.add(`${w.question.subject}::${w.question.topic}`);
  }

  const remaining = count - selected.length;
  if (remaining > 0) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const rest = shuffleArray(
      weighted.filter((w) => !selectedIds.has(w.question.id))
    ).slice(0, remaining);
    for (const w of rest) {
      selected.push(w.question);
    }
  }

  return shuffleArray(selected).slice(0, count);
}

export function getTopicStrength(userData: UserData, subject: string, topic: string): "weak" | "moderate" | "strong" | "unseen" {
  const accuracy = getTopicAccuracy(userData, subject, topic);
  if (accuracy < 0) return "unseen";
  if (accuracy < 0.5) return "weak";
  if (accuracy < 0.75) return "moderate";
  return "strong";
}

export interface AdaptiveState {
  currentDifficulty: Difficulty;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  difficultyProgression: Difficulty[];
  usedQuestionIds: Set<string>;
}

export function createAdaptiveState(): AdaptiveState {
  return {
    currentDifficulty: "medium",
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    difficultyProgression: ["medium"],
    usedQuestionIds: new Set(),
  };
}

export function updateAdaptiveState(state: AdaptiveState, isCorrect: boolean): AdaptiveState {
  const newState = { ...state, difficultyProgression: [...state.difficultyProgression], usedQuestionIds: new Set(state.usedQuestionIds) };

  if (isCorrect) {
    newState.consecutiveCorrect = state.consecutiveCorrect + 1;
    newState.consecutiveWrong = 0;
  } else {
    newState.consecutiveWrong = state.consecutiveWrong + 1;
    newState.consecutiveCorrect = 0;
  }

  let newDifficulty = state.currentDifficulty;

  if (newState.consecutiveCorrect >= 2) {
    if (state.currentDifficulty === "easy") newDifficulty = "medium";
    else if (state.currentDifficulty === "medium") newDifficulty = "hard";
    if (newDifficulty !== state.currentDifficulty) {
      newState.consecutiveCorrect = 0;
    }
  }

  if (newState.consecutiveWrong >= 2) {
    if (state.currentDifficulty === "hard") newDifficulty = "medium";
    else if (state.currentDifficulty === "medium") newDifficulty = "easy";
    if (newDifficulty !== state.currentDifficulty) {
      newState.consecutiveWrong = 0;
    }
  }

  newState.currentDifficulty = newDifficulty;
  newState.difficultyProgression.push(newDifficulty);

  return newState;
}

export function getNextAdaptiveQuestion(
  examType: ExamType,
  difficulty: Difficulty,
  usedIds: Set<string>,
  language?: Language,
): Question | null {
  let pool = getQuestionsForExamType(examType, language);
  if (pool.length === 0) {
    pool = getQuestionsForExamType(examType);
  }

  const available = pool.filter((q) => !usedIds.has(q.id));
  if (available.length === 0) return null;

  const exactMatch = available.filter((q) => q.difficulty === difficulty);
  if (exactMatch.length > 0) {
    return exactMatch[Math.floor(Math.random() * exactMatch.length)];
  }

  const adjacent: Difficulty[] = difficulty === "medium" ? ["easy", "hard"] : difficulty === "easy" ? ["medium"] : ["medium"];
  const adjacentMatch = available.filter((q) => adjacent.includes(q.difficulty));
  if (adjacentMatch.length > 0) {
    return adjacentMatch[Math.floor(Math.random() * adjacentMatch.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function getAdaptiveInitialQuestion(
  examType: ExamType,
  language?: Language,
): Question | null {
  return getNextAdaptiveQuestion(examType, "medium", new Set(), language);
}

export interface SmartRecommendation {
  type: "weak_drill" | "spaced_review" | "new_content" | "level_up" | "daily_mix";
  subject: string;
  topic: string;
  accuracy: number;
  daysSince: number;
  priority: number;
  reason: string;
}

export function getSmartDailyMix(
  userData: UserData,
  examType: ExamType,
  count: number = 10,
  language?: Language
): Question[] {
  let pool = getQuestionsForExamType(examType, language);
  if (pool.length === 0) pool = getQuestionsForExamType(examType);
  if (pool.length <= count) return shuffleArray(pool);

  const scored = pool.map((q) => {
    let score = 1.0;
    const acc = getTopicAccuracy(userData, q.subject, q.topic);
    const days = getDaysSinceLastPractice(userData, q.subject, q.topic);
    const unseen = isTopicUnseen(userData, q.subject, q.topic);

    if (acc >= 0 && acc < 0.5) score += 4.0;
    else if (acc >= 0.5 && acc < 0.65) score += 2.5;
    else if (acc >= 0.65 && acc < 0.8) score += 1.0;
    else if (acc >= 0.8) score += 0.2;

    const forgettingBoost = Math.min(days / 3, 3.0);
    score += forgettingBoost;

    if (unseen) score += 1.5;

    const rec = getDifficultyRecommendation(userData, q.subject, q.topic);
    if (q.difficulty === rec) score += 0.8;

    return { question: q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected: Question[] = [];
  const usedTopicKeys = new Set<string>();

  const weakSlots = Math.ceil(count * 0.3);
  const spacedSlots = Math.ceil(count * 0.3);
  const newSlots = Math.ceil(count * 0.2);

  const weakPool = scored.filter(s => {
    const acc = getTopicAccuracy(userData, s.question.subject, s.question.topic);
    return acc >= 0 && acc < 0.6;
  });
  for (const s of shuffleArray(weakPool).slice(0, weakSlots)) {
    const key = `${s.question.subject}::${s.question.topic}`;
    if (!usedTopicKeys.has(key)) {
      selected.push(s.question);
      usedTopicKeys.add(key);
    }
  }

  const spacedPool = scored.filter(s => {
    const key = `${s.question.subject}::${s.question.topic}`;
    if (usedTopicKeys.has(key)) return false;
    return getDaysSinceLastPractice(userData, s.question.subject, s.question.topic) >= 3;
  });
  for (const s of shuffleArray(spacedPool).slice(0, spacedSlots)) {
    const key = `${s.question.subject}::${s.question.topic}`;
    selected.push(s.question);
    usedTopicKeys.add(key);
  }

  const newPool = scored.filter(s => {
    const key = `${s.question.subject}::${s.question.topic}`;
    if (usedTopicKeys.has(key)) return false;
    return isTopicUnseen(userData, s.question.subject, s.question.topic);
  });
  for (const s of shuffleArray(newPool).slice(0, newSlots)) {
    selected.push(s.question);
    usedTopicKeys.add(`${s.question.subject}::${s.question.topic}`);
  }

  const remaining = count - selected.length;
  if (remaining > 0) {
    const ids = new Set(selected.map(q => q.id));
    const rest = shuffleArray(scored.filter(s => !ids.has(s.question.id))).slice(0, remaining);
    for (const s of rest) selected.push(s.question);
  }

  return shuffleArray(selected).slice(0, count);
}

export function getSmartRecommendations(
  userData: UserData,
  examType: ExamType,
  limit: number = 6
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  for (const [key, progress] of Object.entries(userData.topicProgress)) {
    if (progress.total < 2) continue;
    const [subject, topic] = key.split("::");
    if (!subject || !topic) continue;

    const hasQ = QUESTIONS.some(q => q.examType === examType && q.subject === subject && q.topic === topic);
    if (!hasQ) continue;

    const accuracy = progress.correct / progress.total;
    const days = getDaysSinceLastPractice(userData, subject, topic);

    if (accuracy < 0.5) {
      recommendations.push({
        type: "weak_drill",
        subject,
        topic,
        accuracy: Math.round(accuracy * 100),
        daysSince: days,
        priority: (1 - accuracy) * 10 + Math.min(days, 7),
        reason: accuracy < 0.3 ? "critical" : "needs_work",
      });
    } else if (days >= 5 && progress.total >= 3) {
      recommendations.push({
        type: "spaced_review",
        subject,
        topic,
        accuracy: Math.round(accuracy * 100),
        daysSince: days,
        priority: Math.min(days / 2, 5) + (1 - accuracy) * 3,
        reason: days >= 7 ? "overdue" : "due_soon",
      });
    }
  }

  const practicedTopics = new Set(Object.keys(userData.topicProgress));
  const examQuestions = QUESTIONS.filter(q => q.examType === examType);
  const allTopics = new Set(examQuestions.map(q => `${q.subject}::${q.topic}`));

  for (const topicKey of allTopics) {
    if (!practicedTopics.has(topicKey)) {
      const [subject, topic] = topicKey.split("::");
      if (subject && topic) {
        recommendations.push({
          type: "new_content",
          subject,
          topic,
          accuracy: -1,
          daysSince: 999,
          priority: 3,
          reason: "unexplored",
        });
      }
    }
  }

  const totalAccuracy = userData.totalQuestionsSolved > 0
    ? userData.totalCorrect / userData.totalQuestionsSolved
    : 0;
  if (totalAccuracy >= 0.8 && userData.totalQuestionsSolved >= 50) {
    recommendations.push({
      type: "level_up",
      subject: "General",
      topic: "All",
      accuracy: Math.round(totalAccuracy * 100),
      daysSince: 0,
      priority: 2,
      reason: "ready_for_harder",
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

export function getWeakTopicsDrill(
  userData: UserData,
  examType: ExamType,
  count: number = 10,
  language?: Language
): Question[] {
  const weakTopics = getWeakTopics(userData, examType, 10);
  if (weakTopics.length === 0) return [];

  let pool = getQuestionsForExamType(examType, language);
  if (pool.length === 0) pool = getQuestionsForExamType(examType);

  const weakKeys = new Set(weakTopics.map(w => `${w.subject}::${w.topic}`));
  const weakQuestions = pool.filter(q => weakKeys.has(`${q.subject}::${q.topic}`));

  if (weakQuestions.length <= count) return shuffleArray(weakQuestions);
  return shuffleArray(weakQuestions).slice(0, count);
}

export function getPerformanceTrend(
  userData: UserData,
  examType: ExamType
): { improving: string[]; declining: string[]; stable: string[] } {
  const improving: string[] = [];
  const declining: string[] = [];
  const stable: string[] = [];

  for (const [key, progress] of Object.entries(userData.topicProgress)) {
    if (progress.total < 5) continue;
    const [subject, topic] = key.split("::");
    if (!subject || !topic) continue;

    const accuracy = progress.correct / progress.total;
    const recentCorrect = progress.consecutiveCorrect;

    if (recentCorrect >= 3 && accuracy >= 0.7) {
      improving.push(`${subject} - ${topic}`);
    } else if (accuracy < 0.4 && recentCorrect === 0) {
      declining.push(`${subject} - ${topic}`);
    } else {
      stable.push(`${subject} - ${topic}`);
    }
  }

  return { improving, declining, stable };
}
