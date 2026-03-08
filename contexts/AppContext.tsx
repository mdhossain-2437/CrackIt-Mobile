import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExamType, ExamConfig, ExamAnswer, ExamResult, UserData, SubjectProgress, TopicProgress, Difficulty, Question } from "@/lib/questions";
import { t, type Language } from "@/lib/i18n";
import { apiRequest, getApiUrl } from "@/lib/query-client";

const STORAGE_KEY = "@crackit_user_data";
const AUTH_KEY = "@crackit_auth";

const defaultUserData: UserData = {
  examType: "bcs",
  streak: 0,
  lastPracticeDate: "",
  totalQuestionsSolved: 0,
  totalCorrect: 0,
  subjectProgress: {},
  topicProgress: {},
  examHistory: [],
  onboarded: false,
  xp: 0,
  language: "en",
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  educationLevel: string;
  examType: string;
  language: string;
}

interface AppContextType {
  userData: UserData;
  isLoading: boolean;
  currentExam: ExamConfig | null;
  lastResult: ExamResult | null;
  language: Language;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  tr: (key: string) => string;
  completeOnboarding: (examType: ExamType, language?: Language) => Promise<void>;
  setExamType: (examType: ExamType) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  startExam: (config: ExamConfig) => void;
  submitExam: (answers: ExamAnswer[], difficultyProgression?: Difficulty[], adaptiveQuestions?: Question[]) => Promise<ExamResult>;
  clearCurrentExam: () => void;
  resetProgress: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string, educationLevel: string, examType: string, language: Language) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExam, setCurrentExam] = useState<ExamConfig | null>(null);
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

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
      const authStored = await AsyncStorage.getItem(AUTH_KEY);
      if (authStored) {
        const parsedAuth = JSON.parse(authStored);
        setAuthUser(parsedAuth);
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

  const language = userData.language || "en";
  const isAuthenticated = authUser !== null;

  const tr = useCallback((key: string) => {
    return t(key, language);
  }, [language]);

  const loginUser = useCallback(async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setAuthUser(data.user);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
    const updated = {
      ...userData,
      examType: data.user.examType as ExamType,
      language: (data.user.language || "en") as Language,
      onboarded: true,
      streak: data.user.streak || userData.streak,
      xp: data.user.xp || userData.xp,
      totalQuestionsSolved: data.user.totalQuestionsSolved || userData.totalQuestionsSolved,
      totalCorrect: data.user.totalCorrect || userData.totalCorrect,
    };
    setUserData(updated);
    await saveData(updated);
  }, [userData]);

  const registerUser = useCallback(async (name: string, email: string, password: string, educationLevel: string, examType: string, lang: Language) => {
    const res = await apiRequest("POST", "/api/auth/register", {
      name, email, password, educationLevel, examType, language: lang,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setAuthUser(data.user);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
    const updated = {
      ...defaultUserData,
      examType: examType as ExamType,
      language: lang,
      onboarded: true,
      streak: 1,
      lastPracticeDate: new Date().toISOString().split("T")[0],
    };
    setUserData(updated);
    await saveData(updated);
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
    } catch (e) {}
    setAuthUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  const completeOnboarding = useCallback(async (examType: ExamType, lang?: Language) => {
    const updated = {
      ...defaultUserData,
      examType,
      onboarded: true,
      streak: 1,
      lastPracticeDate: new Date().toISOString().split("T")[0],
      language: lang || "en",
    };
    setUserData(updated);
    await saveData(updated);
  }, []);

  const setExamType = useCallback(async (examType: ExamType) => {
    const updated = { ...userData, examType };
    setUserData(updated);
    await saveData(updated);
    if (authUser) {
      try { await apiRequest("POST", "/api/auth/update", { examType }); } catch (e) {}
    }
  }, [userData, authUser]);

  const setLanguage = useCallback(async (lang: Language) => {
    const updated = { ...userData, language: lang };
    setUserData(updated);
    await saveData(updated);
    if (authUser) {
      try { await apiRequest("POST", "/api/auth/update", { language: lang }); } catch (e) {}
    }
  }, [userData, authUser]);

  const startExam = useCallback((config: ExamConfig) => {
    setCurrentExam(config);
    setLastResult(null);
  }, []);

  const submitExam = useCallback(async (answers: ExamAnswer[], difficultyProgression?: Difficulty[], adaptiveQuestions?: Question[]): Promise<ExamResult> => {
    if (!currentExam) throw new Error("No exam in progress");

    const questionsUsed = adaptiveQuestions && adaptiveQuestions.length > 0 ? adaptiveQuestions : currentExam.questions;

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let totalTime = 0;

    answers.forEach((answer) => {
      totalTime += answer.timeSpent;
      const question = questionsUsed.find((q) => q.id === answer.questionId);
      if (!question) return;
      if (answer.selectedOption === null) {
        skipped++;
      } else if (answer.selectedOption === question.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const totalQ = questionsUsed.length;
    const score = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
    const xpEarned = correct * 10 + (score >= 80 ? 50 : score >= 60 ? 25 : 0);

    const result: ExamResult = {
      id: `exam-${Date.now()}`,
      date: new Date().toISOString(),
      subject: currentExam.subject,
      topic: currentExam.topic,
      totalQuestions: totalQ,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skipped,
      totalTime,
      answers,
      questions: questionsUsed,
      score,
      adaptive: currentExam.adaptive,
      difficultyProgression,
    };

    const subjectProgress: SubjectProgress = userData.subjectProgress[currentExam.subject] || { total: 0, correct: 0 };
    subjectProgress.total += totalQ;
    subjectProgress.correct += correct;

    const updatedTopicProgress = { ...userData.topicProgress };
    questionsUsed.forEach((q, idx) => {
      const key = `${q.subject}::${q.topic}`;
      const existing: TopicProgress = updatedTopicProgress[key] || {
        total: 0,
        correct: 0,
        lastPracticed: "",
        consecutiveCorrect: 0,
      };
      existing.total += 1;
      const answer = answers[idx];
      if (answer && answer.selectedOption === q.correctAnswer) {
        existing.correct += 1;
        existing.consecutiveCorrect += 1;
      } else {
        existing.consecutiveCorrect = 0;
      }
      existing.lastPracticed = new Date().toISOString();
      updatedTopicProgress[key] = existing;
    });

    let updated = {
      ...userData,
      totalQuestionsSolved: userData.totalQuestionsSolved + totalQ,
      totalCorrect: userData.totalCorrect + correct,
      subjectProgress: { ...userData.subjectProgress, [currentExam.subject]: subjectProgress },
      topicProgress: updatedTopicProgress,
      examHistory: [result, ...userData.examHistory].slice(0, 50),
      xp: userData.xp + xpEarned,
    };
    updated = updateStreak(updated);

    setUserData(updated);
    setLastResult(result);
    setCurrentExam(null);
    await saveData(updated);

    if (authUser) {
      try {
        await apiRequest("POST", "/api/exam-result", {
          subject: currentExam.subject,
          topic: currentExam.topic,
          score,
          totalQuestions: totalQ,
          correctAnswers: correct,
          wrongAnswers: wrong,
          skipped,
          totalTime,
          examMode: currentExam.adaptive ? "adaptive" : "normal",
        });
        await apiRequest("POST", "/api/auth/update", {
          streak: updated.streak,
          xp: updated.xp,
          totalQuestionsSolved: updated.totalQuestionsSolved,
          totalCorrect: updated.totalCorrect,
          lastPracticeDate: updated.lastPracticeDate,
        });
      } catch (e) {
        console.error("Failed to sync to server:", e);
      }
    }

    return result;
  }, [currentExam, userData, authUser]);

  const clearCurrentExam = useCallback(() => {
    setCurrentExam(null);
  }, []);

  const resetProgress = useCallback(async () => {
    const reset = { ...defaultUserData, examType: userData.examType, onboarded: true, language: userData.language };
    setUserData(reset);
    await saveData(reset);
  }, [userData.examType, userData.language]);

  const value = useMemo(() => ({
    userData,
    isLoading,
    currentExam,
    lastResult,
    language,
    authUser,
    isAuthenticated,
    tr,
    completeOnboarding,
    setExamType,
    setLanguage,
    startExam,
    submitExam,
    clearCurrentExam,
    resetProgress,
    loginUser,
    registerUser,
    logoutUser,
  }), [userData, isLoading, currentExam, lastResult, language, authUser, isAuthenticated, tr, completeOnboarding, setExamType, setLanguage, startExam, submitExam, clearCurrentExam, resetProgress, loginUser, registerUser, logoutUser]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
