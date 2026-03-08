import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExamType, ExamConfig, ExamAnswer, ExamResult, UserData, SubjectProgress } from "@/lib/questions";

const STORAGE_KEY = "@crackit_user_data";

const defaultUserData: UserData = {
  examType: "bcs",
  streak: 0,
  lastPracticeDate: "",
  totalQuestionsSolved: 0,
  totalCorrect: 0,
  subjectProgress: {},
  examHistory: [],
  onboarded: false,
  xp: 0,
};

interface AppContextType {
  userData: UserData;
  isLoading: boolean;
  currentExam: ExamConfig | null;
  lastResult: ExamResult | null;
  completeOnboarding: (examType: ExamType) => Promise<void>;
  setExamType: (examType: ExamType) => Promise<void>;
  startExam: (config: ExamConfig) => void;
  submitExam: (answers: ExamAnswer[]) => Promise<ExamResult>;
  clearCurrentExam: () => void;
  resetProgress: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExam, setCurrentExam] = useState<ExamConfig | null>(null);
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserData({ ...defaultUserData, ...parsed });
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data: UserData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  };

  const updateStreak = (data: UserData): UserData => {
    const today = new Date().toISOString().split("T")[0];
    const lastDate = data.lastPracticeDate;

    if (lastDate === today) return { ...data, lastPracticeDate: today };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDate === yesterdayStr) {
      return { ...data, streak: data.streak + 1, lastPracticeDate: today };
    }

    return { ...data, streak: 1, lastPracticeDate: today };
  };

  const completeOnboarding = useCallback(async (examType: ExamType) => {
    const updated = { ...defaultUserData, examType, onboarded: true, streak: 1, lastPracticeDate: new Date().toISOString().split("T")[0] };
    setUserData(updated);
    await saveData(updated);
  }, []);

  const setExamType = useCallback(async (examType: ExamType) => {
    const updated = { ...userData, examType };
    setUserData(updated);
    await saveData(updated);
  }, [userData]);

  const startExam = useCallback((config: ExamConfig) => {
    setCurrentExam(config);
    setLastResult(null);
  }, []);

  const submitExam = useCallback(async (answers: ExamAnswer[]): Promise<ExamResult> => {
    if (!currentExam) throw new Error("No exam in progress");

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let totalTime = 0;

    answers.forEach((answer) => {
      totalTime += answer.timeSpent;
      const question = currentExam.questions.find((q) => q.id === answer.questionId);
      if (!question) return;
      if (answer.selectedOption === null) {
        skipped++;
      } else if (answer.selectedOption === question.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = currentExam.questions.length > 0 ? Math.round((correct / currentExam.questions.length) * 100) : 0;
    const xpEarned = correct * 10 + (score >= 80 ? 50 : score >= 60 ? 25 : 0);

    const result: ExamResult = {
      id: `exam-${Date.now()}`,
      date: new Date().toISOString(),
      subject: currentExam.subject,
      topic: currentExam.topic,
      totalQuestions: currentExam.questions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skipped,
      totalTime,
      answers,
      questions: currentExam.questions,
      score,
    };

    const subjectProgress: SubjectProgress = userData.subjectProgress[currentExam.subject] || { total: 0, correct: 0 };
    subjectProgress.total += currentExam.questions.length;
    subjectProgress.correct += correct;

    let updated = {
      ...userData,
      totalQuestionsSolved: userData.totalQuestionsSolved + currentExam.questions.length,
      totalCorrect: userData.totalCorrect + correct,
      subjectProgress: { ...userData.subjectProgress, [currentExam.subject]: subjectProgress },
      examHistory: [result, ...userData.examHistory].slice(0, 50),
      xp: userData.xp + xpEarned,
    };
    updated = updateStreak(updated);

    setUserData(updated);
    setLastResult(result);
    setCurrentExam(null);
    await saveData(updated);

    return result;
  }, [currentExam, userData]);

  const clearCurrentExam = useCallback(() => {
    setCurrentExam(null);
  }, []);

  const resetProgress = useCallback(async () => {
    const reset = { ...defaultUserData, examType: userData.examType, onboarded: true };
    setUserData(reset);
    await saveData(reset);
  }, [userData.examType]);

  const value = useMemo(() => ({
    userData,
    isLoading,
    currentExam,
    lastResult,
    completeOnboarding,
    setExamType,
    startExam,
    submitExam,
    clearCurrentExam,
    resetProgress,
  }), [userData, isLoading, currentExam, lastResult, completeOnboarding, setExamType, startExam, submitExam, clearCurrentExam, resetProgress]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
