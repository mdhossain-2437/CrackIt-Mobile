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
