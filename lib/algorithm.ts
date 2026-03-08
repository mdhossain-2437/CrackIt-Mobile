import type { Question, UserData, ExamType, Difficulty, TopicProgress } from "./questions";
import { QUESTIONS, getQuestionsForExamType, shuffleArray } from "./questions";
import type { Language } from "./i18n";

interface WeightedQuestion {
  question: Question;
  weight: number;
}

export interface SpacedRepetitionItem {
  questionId: string;
  subject: string;
  topic: string;
  stability: number;
  difficulty: number;
  lastReview: string;
  nextReview: string;
  repetitions: number;
  lapses: number;
}

export interface UserAbilityEstimate {
  theta: number;
  confidence: number;
  history: { timestamp: string; theta: number }[];
}

export interface PerformancePrediction {
  predictedAccuracy: number;
  confidence: number;
  subjectPredictions: Record<string, number>;
  trend: "improving" | "declining" | "stable";
  momentum: number;
}

export function computeForgettingCurve(
  stability: number,
  elapsedDays: number
): number {
  return Math.exp(-elapsedDays / Math.max(stability, 0.1));
}

export function updateStability(
  prevStability: number,
  isCorrect: boolean,
  difficulty: number,
  elapsedDays: number
): number {
  const retrievability = computeForgettingCurve(prevStability, elapsedDays);

  if (isCorrect) {
    const difficultyFactor = 1.0 + (1.0 - difficulty) * 0.5;
    const retrievabilityBonus = 1.0 + (1.0 - retrievability) * 2.0;
    return prevStability * difficultyFactor * retrievabilityBonus;
  }

  const lapseMultiplier = 0.3 + 0.2 * (1.0 - difficulty);
  return Math.max(0.5, prevStability * lapseMultiplier);
}

export function computeOptimalInterval(stability: number, desiredRetention: number = 0.85): number {
  return Math.max(1, Math.round(-stability * Math.log(desiredRetention)));
}

export function getItemsForReview(
  items: SpacedRepetitionItem[],
  now: Date = new Date()
): SpacedRepetitionItem[] {
  return items
    .filter((item) => {
      const nextReview = new Date(item.nextReview);
      return nextReview <= now;
    })
    .sort((a, b) => {
      const aElapsed = (now.getTime() - new Date(a.nextReview).getTime()) / (1000 * 60 * 60 * 24);
      const bElapsed = (now.getTime() - new Date(b.nextReview).getTime()) / (1000 * 60 * 60 * 24);
      return bElapsed - aElapsed;
    });
}

export function updateSpacedRepetitionItem(
  item: SpacedRepetitionItem,
  isCorrect: boolean,
  now: Date = new Date()
): SpacedRepetitionItem {
  const lastReviewDate = new Date(item.lastReview);
  const elapsedDays = Math.max(0.1, (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24));

  const newStability = updateStability(item.stability, isCorrect, item.difficulty, elapsedDays);
  const interval = computeOptimalInterval(newStability);
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  let newDifficulty = item.difficulty;
  if (isCorrect) {
    newDifficulty = Math.max(0.1, item.difficulty - 0.05);
  } else {
    newDifficulty = Math.min(1.0, item.difficulty + 0.1);
  }

  return {
    ...item,
    stability: newStability,
    difficulty: newDifficulty,
    lastReview: now.toISOString(),
    nextReview: nextReview.toISOString(),
    repetitions: item.repetitions + 1,
    lapses: isCorrect ? item.lapses : item.lapses + 1,
  };
}

export function createNewSpacedItem(
  questionId: string,
  subject: string,
  topic: string,
  isCorrect: boolean,
  now: Date = new Date()
): SpacedRepetitionItem {
  const initialStability = isCorrect ? 2.0 : 0.5;
  const initialDifficulty = 0.5;
  const interval = computeOptimalInterval(initialStability);
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    questionId,
    subject,
    topic,
    stability: initialStability,
    difficulty: initialDifficulty,
    lastReview: now.toISOString(),
    nextReview: nextReview.toISOString(),
    repetitions: 1,
    lapses: isCorrect ? 0 : 1,
  };
}

export function irtProbability(theta: number, difficulty: number, discrimination: number = 1.0): number {
  return 1.0 / (1.0 + Math.exp(-discrimination * (theta - difficulty)));
}

export function estimateUserAbility(
  attempts: { isCorrect: boolean; difficulty: number }[],
  priorTheta: number = 0.0
): number {
  if (attempts.length === 0) return priorTheta;

  let theta = priorTheta;
  const learningRate = 0.3;
  const iterations = 20;

  for (let iter = 0; iter < iterations; iter++) {
    let gradient = 0;
    for (const attempt of attempts) {
      const p = irtProbability(theta, attempt.difficulty);
      const response = attempt.isCorrect ? 1 : 0;
      gradient += (response - p);
    }
    gradient -= 0.1 * theta;
    theta += learningRate * gradient / attempts.length;
    theta = Math.max(-3, Math.min(3, theta));
  }

  return theta;
}

export function questionDifficultyToIRT(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy": return -1.0;
    case "medium": return 0.0;
    case "hard": return 1.0;
  }
}

export function selectMaxInfoQuestion(
  pool: Question[],
  theta: number,
  usedIds: Set<string>
): Question | null {
  const available = pool.filter((q) => !usedIds.has(q.id));
  if (available.length === 0) return null;

  let bestQuestion: Question | null = null;
  let bestInfo = -1;

  for (const q of available) {
    const b = questionDifficultyToIRT(q.difficulty);
    const p = irtProbability(theta, b);
    const info = p * (1 - p);

    const jitter = Math.random() * 0.05;
    if (info + jitter > bestInfo) {
      bestInfo = info + jitter;
      bestQuestion = q;
    }
  }

  return bestQuestion;
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

  const attempts: { isCorrect: boolean; difficulty: number }[] = [];
  for (const [, progress] of Object.entries(userData.topicProgress)) {
    if (progress.total > 0) {
      const acc = progress.correct / progress.total;
      attempts.push({ isCorrect: acc >= 0.5, difficulty: 0.0 });
    }
  }
  const theta = estimateUserAbility(attempts);

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

    const forgettingBoost = daysSince >= 1
      ? Math.min(1.0 - computeForgettingCurve(3.0, daysSince), 1.0) * 3.0
      : 0;
    weight += forgettingBoost;

    if (unseen) {
      weight += 2.0;
    }

    const b = questionDifficultyToIRT(q.difficulty);
    const p = irtProbability(theta, b);
    const infoGain = p * (1 - p);
    weight += infoGain * 2.0;

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
  const challengeCount = Math.max(1, Math.ceil(count * 0.1));

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

  const challengeCandidates = weighted.filter((w) => {
    const selectedIds = new Set(selected.map((q) => q.id));
    return !selectedIds.has(w.question.id) && w.question.difficulty === "hard";
  });
  for (const w of shuffleArray(challengeCandidates).slice(0, challengeCount)) {
    selected.push(w.question);
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
  theta: number;
  totalCorrect: number;
  totalAttempted: number;
}

export function createAdaptiveState(initialTheta: number = 0.0): AdaptiveState {
  return {
    currentDifficulty: "medium",
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    difficultyProgression: ["medium"],
    usedQuestionIds: new Set(),
    theta: initialTheta,
    totalCorrect: 0,
    totalAttempted: 0,
  };
}

export function updateAdaptiveState(state: AdaptiveState, isCorrect: boolean, questionDifficulty?: Difficulty): AdaptiveState {
  const newState = {
    ...state,
    difficultyProgression: [...state.difficultyProgression],
    usedQuestionIds: new Set(state.usedQuestionIds),
    totalAttempted: state.totalAttempted + 1,
    totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
  };

  if (questionDifficulty) {
    const b = questionDifficultyToIRT(questionDifficulty);
    const p = irtProbability(state.theta, b);
    const response = isCorrect ? 1 : 0;
    const update = 0.4 * (response - p);
    newState.theta = Math.max(-3, Math.min(3, state.theta + update));
  }

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
  theta?: number,
): Question | null {
  let pool = getQuestionsForExamType(examType, language);
  if (pool.length === 0) {
    pool = getQuestionsForExamType(examType);
  }

  if (theta !== undefined) {
    const selected = selectMaxInfoQuestion(pool, theta, usedIds);
    if (selected) return selected;
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
  type: "weak_drill" | "spaced_review" | "new_content" | "level_up" | "daily_mix" | "challenge";
  subject: string;
  topic: string;
  accuracy: number;
  daysSince: number;
  priority: number;
  reason: string;
  questionCount?: number;
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

    if (days > 0) {
      const retention = computeForgettingCurve(3.0, days);
      const forgettingUrgency = (1.0 - retention) * 4.0;
      score += forgettingUrgency;
    }

    if (unseen) score += 1.5;

    const rec = getDifficultyRecommendation(userData, q.subject, q.topic);
    if (q.difficulty === rec) score += 0.8;

    return { question: q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected: Question[] = [];
  const usedTopicKeys = new Set<string>();

  const weakSlots = Math.ceil(count * 0.30);
  const spacedSlots = Math.ceil(count * 0.30);
  const newSlots = Math.ceil(count * 0.20);
  const challengeSlots = Math.max(1, Math.ceil(count * 0.10));

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

  const selectedIds = new Set(selected.map(q => q.id));
  const challengePool = scored.filter(s =>
    !selectedIds.has(s.question.id) && s.question.difficulty === "hard"
  );
  for (const s of shuffleArray(challengePool).slice(0, challengeSlots)) {
    selected.push(s.question);
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
      const qCount = QUESTIONS.filter(q => q.examType === examType && q.subject === subject && q.topic === topic).length;
      recommendations.push({
        type: "weak_drill",
        subject,
        topic,
        accuracy: Math.round(accuracy * 100),
        daysSince: days,
        priority: (1 - accuracy) * 10 + Math.min(days, 7),
        reason: accuracy < 0.3 ? "critical" : "needs_work",
        questionCount: qCount,
      });
    } else if (days >= 3 && progress.total >= 3) {
      const retention = computeForgettingCurve(3.0, days);
      const urgency = (1.0 - retention) * 10;
      recommendations.push({
        type: "spaced_review",
        subject,
        topic,
        accuracy: Math.round(accuracy * 100),
        daysSince: days,
        priority: urgency + (1 - accuracy) * 3,
        reason: retention < 0.5 ? "overdue" : retention < 0.7 ? "due_soon" : "upcoming",
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
        const qCount = examQuestions.filter(q => q.subject === subject && q.topic === topic).length;
        recommendations.push({
          type: "new_content",
          subject,
          topic,
          accuracy: -1,
          daysSince: 999,
          priority: 3,
          reason: "unexplored",
          questionCount: qCount,
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

  if (totalAccuracy >= 0.6 && userData.totalQuestionsSolved >= 20) {
    recommendations.push({
      type: "challenge",
      subject: "General",
      topic: "Mixed",
      accuracy: Math.round(totalAccuracy * 100),
      daysSince: 0,
      priority: 1.5,
      reason: "push_limits",
      questionCount: 10,
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
  _examType: ExamType
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

export function predictPerformance(userData: UserData, examType: ExamType): PerformancePrediction {
  const totalAccuracy = userData.totalQuestionsSolved > 0
    ? userData.totalCorrect / userData.totalQuestionsSolved
    : 0;

  const subjectPredictions: Record<string, number> = {};
  let subjectCount = 0;
  let weightedSum = 0;

  for (const [key, progress] of Object.entries(userData.topicProgress)) {
    if (progress.total < 3) continue;
    const [subject] = key.split("::");
    if (!subject) continue;

    const acc = progress.correct / progress.total;
    const days = getDaysSinceLastPractice(userData, subject, key.split("::")[1] || "");
    const retention = computeForgettingCurve(3.0, days);
    const predicted = acc * retention;

    if (!subjectPredictions[subject]) {
      subjectPredictions[subject] = 0;
      subjectCount++;
    }
    subjectPredictions[subject] = Math.max(subjectPredictions[subject], Math.round(predicted * 100));
    weightedSum += predicted;
  }

  const trend = getPerformanceTrend(userData, examType);
  let trendLabel: "improving" | "declining" | "stable" = "stable";
  if (trend.improving.length > trend.declining.length * 2) trendLabel = "improving";
  else if (trend.declining.length > trend.improving.length * 2) trendLabel = "declining";

  const momentum = computeMomentum(userData);

  const predictedAccuracy = subjectCount > 0
    ? Math.round((weightedSum / subjectCount) * 100)
    : Math.round(totalAccuracy * 100);

  const confidence = Math.min(95, Math.round(50 + (userData.totalQuestionsSolved / 200) * 45));

  return {
    predictedAccuracy,
    confidence,
    subjectPredictions,
    trend: trendLabel,
    momentum,
  };
}

export function computeMomentum(userData: UserData): number {
  if (!userData.lastPracticeDate) return 0;

  const daysSince = Math.floor(
    (Date.now() - new Date(userData.lastPracticeDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const streakBonus = Math.min(userData.streak / 30, 1.0);
  const recencyBonus = Math.max(0, 1.0 - daysSince / 7);
  const volumeBonus = Math.min(userData.totalQuestionsSolved / 500, 1.0);
  const accuracyBonus = userData.totalQuestionsSolved > 0
    ? userData.totalCorrect / userData.totalQuestionsSolved
    : 0;

  return Math.round(
    (streakBonus * 0.3 + recencyBonus * 0.3 + volumeBonus * 0.2 + accuracyBonus * 0.2) * 100
  );
}

export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  let level = 1;
  let xpRequired = 100;
  let totalXpForLevel = 0;

  while (xp >= totalXpForLevel + xpRequired) {
    totalXpForLevel += xpRequired;
    level++;
    xpRequired = Math.floor(100 * Math.pow(1.5, level - 1));
  }

  const currentXp = xp - totalXpForLevel;
  const progress = currentXp / xpRequired;

  return { level, currentXp, nextLevelXp: xpRequired, progress };
}

export function calculateXpReward(
  correctAnswers: number,
  totalQuestions: number,
  streak: number,
  mode: string,
  timeBonus: boolean = false
): number {
  let baseXp = correctAnswers * 10;

  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  if (accuracy >= 0.9) baseXp *= 1.5;
  else if (accuracy >= 0.7) baseXp *= 1.2;

  const streakMultiplier = 1.0 + Math.min(streak, 30) * 0.02;
  baseXp *= streakMultiplier;

  switch (mode) {
    case "speed": baseXp *= 1.3; break;
    case "marathon": baseXp *= 1.2; break;
    case "adaptive": baseXp *= 1.4; break;
  }

  if (timeBonus) baseXp *= 1.1;
  if (accuracy === 1.0 && totalQuestions >= 5) baseXp += 50;

  return Math.round(baseXp);
}

export function getDailyGoalTarget(userData: UserData): { questions: number; studyMinutes: number } {
  const totalSolved = userData.totalQuestionsSolved;
  const streak = userData.streak;

  let questions: number;
  if (totalSolved < 50) questions = 10;
  else if (totalSolved < 200) questions = 15;
  else if (totalSolved < 500) questions = 20;
  else questions = 25;

  if (streak >= 7) questions = Math.min(questions + 5, 50);

  const studyMinutes = Math.round(questions * 1.5);

  return { questions, studyMinutes };
}

export function getStudyStreakStatus(userData: UserData): {
  current: number;
  isActive: boolean;
  willExpireToday: boolean;
  hoursRemaining: number;
} {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const lastDate = userData.lastPracticeDate;

  if (!lastDate) {
    return { current: 0, isActive: false, willExpireToday: false, hoursRemaining: 0 };
  }

  const isActive = lastDate === today;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const willExpireToday = lastDate === yesterdayStr;
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursRemaining = Math.max(0, (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));

  return {
    current: userData.streak,
    isActive,
    willExpireToday,
    hoursRemaining: Math.round(hoursRemaining),
  };
}

export function getTimeOfDayGreeting(): { greeting: string; greetingBn: string; icon: string } {
  const hour = new Date().getHours();

  if (hour < 6) return { greeting: "Burning the midnight oil", greetingBn: "রাত জেগে পড়ছো", icon: "moon" };
  if (hour < 12) return { greeting: "Good morning", greetingBn: "সুপ্রভাত", icon: "sunny" };
  if (hour < 17) return { greeting: "Good afternoon", greetingBn: "শুভ অপরাহ্ন", icon: "partly-sunny" };
  if (hour < 21) return { greeting: "Good evening", greetingBn: "শুভ সন্ধ্যা", icon: "cloudy-night" };
  return { greeting: "Night study session", greetingBn: "রাতের পড়াশোনা", icon: "moon" };
}
