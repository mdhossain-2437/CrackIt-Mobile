import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import type { ExamAnswer, Question, Difficulty } from "@/lib/questions";
import {
  createAdaptiveState,
  updateAdaptiveState,
  getNextAdaptiveQuestion,
  type AdaptiveState,
} from "@/lib/algorithm";

function AdaptiveDifficultyIndicator({ difficulty, colors, tr }: { difficulty: Difficulty; colors: any; tr: (key: string) => string }) {
  const animatedScale = useSharedValue(1);
  const animatedBg = useSharedValue(0);
  const prevDiffRef = useRef(difficulty);

  useEffect(() => {
    if (prevDiffRef.current !== difficulty) {
      animatedScale.value = withSpring(1.15, { damping: 8, stiffness: 200 }, () => {
        animatedScale.value = withSpring(1, { damping: 12 });
      });
      prevDiffRef.current = difficulty;
    }
  }, [difficulty]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
  }));

  const diffColor = difficulty === "easy" ? colors.success : difficulty === "medium" ? colors.warning : colors.error;
  const diffBg = difficulty === "easy" ? colors.successLight : difficulty === "medium" ? colors.warningLight : colors.errorLight;
  const diffIcon = difficulty === "easy" ? "speedometer-outline" : difficulty === "medium" ? "speedometer-outline" : "speedometer";

  return (
    <Animated.View style={[styles.adaptiveIndicator, { backgroundColor: diffBg, borderColor: diffColor + "40" }, animStyle]}>
      <Ionicons name={diffIcon as any} size={14} color={diffColor} />
      <Text style={[styles.adaptiveIndicatorText, { color: diffColor, fontFamily: "Inter_600SemiBold" }]}>
        {tr(`difficulty.${difficulty}`)}
      </Text>
      <View style={[styles.adaptiveDot, { backgroundColor: diffColor }]} />
    </Animated.View>
  );
}

export default function ExamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentExam, submitExam, clearCurrentExam, tr, userData, language } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const isAdaptive = currentExam?.adaptive === true;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitRef = useRef<() => void>(() => {});

  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>(() => createAdaptiveState());
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<Question[]>([]);
  const [adaptiveAnswerLocked, setAdaptiveAnswerLocked] = useState(false);
  const adaptiveMaxQuestions = currentExam?.count || 10;

  useEffect(() => {
    if (!currentExam) {
      router.replace("/(tabs)");
      return;
    }

    if (isAdaptive && currentExam.questions.length > 0) {
      const firstQ = currentExam.questions[0];
      setAdaptiveQuestions([firstQ]);
      const initialState = createAdaptiveState();
      initialState.usedQuestionIds.add(firstQ.id);
      setAdaptiveState(initialState);
    }

    const totalTime = (isAdaptive ? adaptiveMaxQuestions : currentExam.questions.length) * currentExam.timePerQuestion;
    setTimeLeft(totalTime);
    questionStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => autoSubmitRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!currentExam) return null;

  const questionsToShow = isAdaptive ? adaptiveQuestions : currentExam.questions;
  const totalQuestions = isAdaptive ? adaptiveMaxQuestions : currentExam.questions.length;
  const question = questionsToShow[currentIndex];
  if (!question) return null;

  const selectedOption = answers[question.id] ?? null;
  const isMarked = markedForReview.has(question.id);

  const recordQuestionTime = () => {
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    setQuestionTimes((prev) => ({
      ...prev,
      [question.id]: (prev[question.id] || 0) + elapsed,
    }));
    questionStartRef.current = Date.now();
  };

  const handleSelectOption = (index: number) => {
    if (isAdaptive && adaptiveAnswerLocked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((prev) => ({ ...prev, [question.id]: index }));

    if (isAdaptive) {
      setAdaptiveAnswerLocked(true);
      const isCorrect = index === question.correctAnswer;
      const newState = updateAdaptiveState(adaptiveState, isCorrect);
      newState.usedQuestionIds.add(question.id);
      setAdaptiveState(newState);

      if (currentIndex < adaptiveMaxQuestions - 1) {
        const nextQ = getNextAdaptiveQuestion(
          userData.examType,
          newState.currentDifficulty,
          newState.usedQuestionIds,
          language,
        );
        if (nextQ) {
          newState.usedQuestionIds.add(nextQ.id);
          setAdaptiveQuestions((prev) => [...prev, nextQ]);
        }
      }
    }
  };

  const handleNext = () => {
    recordQuestionTime();
    if (isAdaptive) {
      setAdaptiveAnswerLocked(false);
    }
    if (currentIndex < (isAdaptive ? adaptiveQuestions.length - 1 : totalQuestions - 1)) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (isAdaptive) return;
    recordQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    recordQuestionTime();
    if (isAdaptive) {
      if (!adaptiveAnswerLocked) {
        const newState = updateAdaptiveState(adaptiveState, false);
        newState.usedQuestionIds.add(question.id);
        setAdaptiveState(newState);

        if (currentIndex < adaptiveMaxQuestions - 1) {
          const nextQ = getNextAdaptiveQuestion(
            userData.examType,
            newState.currentDifficulty,
            newState.usedQuestionIds,
            language,
          );
          if (nextQ) {
            newState.usedQuestionIds.add(nextQ.id);
            setAdaptiveQuestions((prev) => [...prev, nextQ]);
          }
        }
      }
      setAdaptiveAnswerLocked(false);
      if (currentIndex < adaptiveQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (adaptiveQuestions.length < adaptiveMaxQuestions) {
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleToggleReview = () => {
    if (isAdaptive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  };

  const handleGoToQuestion = (idx: number) => {
    if (isAdaptive) return;
    recordQuestionTime();
    setCurrentIndex(idx);
    setShowPalette(false);
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordQuestionTime();

    const qList = isAdaptive ? adaptiveQuestions : currentExam.questions;

    const examAnswers: ExamAnswer[] = qList.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? null,
      timeSpent: questionTimes[q.id] || 0,
      markedForReview: markedForReview.has(q.id),
    }));

    if (isAdaptive) {
      await submitExam(examAnswers, adaptiveState.difficultyProgression, adaptiveQuestions);
    } else {
      await submitExam(examAnswers);
    }
    router.replace("/result");
  };

  autoSubmitRef.current = handleSubmit;

  const handleConfirmSubmit = () => {
    const qList = isAdaptive ? adaptiveQuestions : currentExam.questions;
    const unanswered = qList.filter((q) => answers[q.id] === undefined || answers[q.id] === null).length;
    if (unanswered > 0) {
      setShowConfirm(true);
    } else {
      handleSubmit();
    }
  };

  const handleExit = () => {
    const exitAction = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearCurrentExam();
      router.back();
    };
    if (Platform.OS === "web") {
      if (confirm(tr("exam.exitConfirm"))) {
        exitAction();
      }
    } else {
      Alert.alert(tr("exam.exit"), tr("exam.exitConfirm"), [
        { text: tr("exam.cancel"), style: "cancel" },
        { text: tr("common.exit"), style: "destructive", onPress: exitAction },
      ]);
    }
  };

  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== null).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 60;

  const difficultyLabel = tr(`difficulty.${question.difficulty}`);

  const isLastQuestion = isAdaptive
    ? (currentIndex >= adaptiveMaxQuestions - 1 || currentIndex >= adaptiveQuestions.length - 1)
    : currentIndex === totalQuestions - 1;

  const canGoNext = isAdaptive
    ? (adaptiveAnswerLocked && currentIndex < adaptiveQuestions.length - 1)
    : currentIndex < totalQuestions - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      <View style={[styles.header, { paddingTop: topInset + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={handleExit} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            {currentIndex + 1} / {totalQuestions}
          </Text>
          {isAdaptive ? (
            <AdaptiveDifficultyIndicator difficulty={adaptiveState.currentDifficulty} colors={colors} tr={tr} />
          ) : (
            <View style={[styles.timerBadge, { backgroundColor: isTimeWarning ? colors.errorLight : colors.primaryLight }]}>
              <Ionicons name="time-outline" size={14} color={isTimeWarning ? colors.error : colors.primary} />
              <Text style={[styles.timerText, { color: isTimeWarning ? colors.error : colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {minutes}:{seconds.toString().padStart(2, "0")}
              </Text>
            </View>
          )}
        </View>

        {isAdaptive ? (
          <View style={[styles.timerBadge, { backgroundColor: isTimeWarning ? colors.errorLight : colors.primaryLight }]}>
            <Ionicons name="time-outline" size={14} color={isTimeWarning ? colors.error : colors.primary} />
            <Text style={[styles.timerText, { color: isTimeWarning ? colors.error : colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </Text>
          </View>
        ) : (
          <Pressable onPress={() => setShowPalette(true)} style={styles.headerBtn}>
            <Ionicons name="grid-outline" size={22} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / totalQuestions) * 100}%`, backgroundColor: colors.primary }]} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionMeta}>
          <View style={[styles.difficultyBadge, {
            backgroundColor: question.difficulty === "easy" ? colors.successLight : question.difficulty === "medium" ? colors.warningLight : colors.errorLight,
          }]}>
            <Text style={[styles.difficultyText, {
              color: question.difficulty === "easy" ? colors.success : question.difficulty === "medium" ? colors.warning : colors.error,
              fontFamily: "Inter_600SemiBold",
            }]}>
              {difficultyLabel}
            </Text>
          </View>
          {!isAdaptive && (
            <Pressable onPress={handleToggleReview} style={styles.reviewBtn}>
              <Ionicons
                name={isMarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isMarked ? colors.warning : colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        <Text style={[styles.questionText, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {question.question}
        </Text>

        <View style={styles.options}>
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const showResult = isAdaptive && adaptiveAnswerLocked;
            const isCorrectOption = idx === question.correctAnswer;
            let optBg = isSelected ? colors.primaryLight : colors.surface;
            let optBorder = isSelected ? colors.primary : colors.border;
            let optBorderWidth = isSelected ? 2 : 1;

            if (showResult) {
              if (isCorrectOption) {
                optBg = colors.successLight;
                optBorder = colors.success;
                optBorderWidth = 2;
              } else if (isSelected && !isCorrectOption) {
                optBg = colors.errorLight;
                optBorder = colors.error;
                optBorderWidth = 2;
              }
            }

            return (
              <Pressable
                key={idx}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: optBg,
                    borderColor: optBorder,
                    borderWidth: optBorderWidth,
                  },
                ]}
                onPress={() => handleSelectOption(idx)}
                disabled={isAdaptive && adaptiveAnswerLocked}
              >
                <View style={[styles.optionLabel, {
                  backgroundColor: showResult
                    ? (isCorrectOption ? colors.success : isSelected ? colors.error : colors.borderLight)
                    : (isSelected ? colors.primary : colors.borderLight),
                }]}>
                  <Text style={[styles.optionLabelText, {
                    color: (showResult && (isCorrectOption || isSelected)) || isSelected ? "#FFFFFF" : colors.textSecondary,
                    fontFamily: "Inter_600SemiBold",
                  }]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, {
                  color: showResult
                    ? (isCorrectOption ? colors.success : isSelected ? colors.error : colors.text)
                    : (isSelected ? colors.primary : colors.text),
                  fontFamily: (isSelected || (showResult && isCorrectOption)) ? "Inter_600SemiBold" : "Inter_400Regular",
                }]}>
                  {option}
                </Text>
                {showResult && isCorrectOption && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                )}
              </Pressable>
            );
          })}
        </View>

        {isAdaptive && adaptiveAnswerLocked && (
          <View style={[styles.adaptiveExplanation, { backgroundColor: colors.primaryLight }]}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb-outline" size={16} color={colors.primary} />
              <Text style={[styles.explanationTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {tr("result.explanation")}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
              {question.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {isAdaptive ? (
          <>
            <View style={styles.navBtn}>
              <Text style={[styles.navBtnText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                {answeredCount}/{totalQuestions}
              </Text>
            </View>

            <Pressable
              style={[styles.skipBtn, { borderColor: colors.border, opacity: adaptiveAnswerLocked ? 0.3 : 1 }]}
              onPress={handleSkip}
              disabled={adaptiveAnswerLocked}
            >
              <Text style={[styles.skipBtnText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>{tr("exam.skip")}</Text>
            </Pressable>

            {isLastQuestion && adaptiveAnswerLocked ? (
              <Pressable
                style={[styles.submitBtn, { backgroundColor: colors.success }]}
                onPress={handleConfirmSubmit}
              >
                <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>{tr("exam.submit")}</Text>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable
                style={[styles.navBtn, { opacity: canGoNext ? 1 : 0.3 }]}
                onPress={handleNext}
                disabled={!canGoNext}
              >
                <Text style={[styles.navBtnText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{tr("exam.next")}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            )}
          </>
        ) : (
          <>
            <Pressable
              style={[styles.navBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
              <Text style={[styles.navBtnText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{tr("exam.prev")}</Text>
            </Pressable>

            <Pressable
              style={[styles.skipBtn, { borderColor: colors.border }]}
              onPress={handleSkip}
            >
              <Text style={[styles.skipBtnText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>{tr("exam.skip")}</Text>
            </Pressable>

            {currentIndex === totalQuestions - 1 ? (
              <Pressable
                style={[styles.submitBtn, { backgroundColor: colors.success }]}
                onPress={handleConfirmSubmit}
              >
                <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>{tr("exam.submit")}</Text>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable style={styles.navBtn} onPress={handleNext}>
                <Text style={[styles.navBtnText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{tr("exam.next")}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            )}
          </>
        )}
      </View>

      {!isAdaptive && (
        <Modal visible={showPalette} animationType="slide" transparent>
          <View style={styles.paletteOverlay}>
            <View style={[styles.paletteContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.paletteHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.paletteTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {tr("exam.palette")}
                </Text>
                <Pressable onPress={() => setShowPalette(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.paletteLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>{tr("exam.answered")} ({answeredCount})</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>{tr("exam.review")} ({markedForReview.size})</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>{tr("exam.unanswered")}</Text>
                </View>
              </View>

              <View style={styles.paletteGrid}>
                {currentExam.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                  const isReview = markedForReview.has(q.id);
                  const isCurrent = idx === currentIndex;
                  let bgColor = colors.surface;
                  if (isAnswered) bgColor = colors.successLight;
                  if (isReview) bgColor = colors.warningLight;
                  if (isCurrent) bgColor = colors.primaryLight;

                  return (
                    <Pressable
                      key={q.id}
                      style={[styles.paletteItem, {
                        backgroundColor: bgColor,
                        borderColor: isCurrent ? colors.primary : colors.border,
                        borderWidth: isCurrent ? 2 : 1,
                      }]}
                      onPress={() => handleGoToQuestion(idx)}
                    >
                      <Text style={[styles.paletteItemText, {
                        color: isCurrent ? colors.primary : colors.text,
                        fontFamily: "Inter_600SemiBold",
                      }]}>
                        {idx + 1}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={[styles.paletteSubmit, { backgroundColor: colors.success }]}
                onPress={() => { setShowPalette(false); handleConfirmSubmit(); }}
              >
                <Text style={[styles.paletteSubmitText, { fontFamily: "Inter_600SemiBold" }]}>
                  {tr("exam.submit")} ({answeredCount}/{totalQuestions} {tr("exam.answered").toLowerCase()})
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <Modal visible={showConfirm} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: colors.background }]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
            <Text style={[styles.confirmTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {tr("exam.unansweredTitle")}
            </Text>
            <Text style={[styles.confirmMsg, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {totalQuestions - answeredCount} {tr("exam.unansweredMsg")}. {tr("exam.submitAnyway")}
            </Text>
            <View style={styles.confirmBtns}>
              <Pressable
                style={[styles.confirmBtn, { borderColor: colors.border }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={[styles.confirmBtnText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{tr("exam.goBack")}</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, { backgroundColor: colors.success, borderColor: colors.success }]}
                onPress={() => { setShowConfirm(false); handleSubmit(); }}
              >
                <Text style={[styles.confirmBtnText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>{tr("exam.submit")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 4 },
  headerCenter: { alignItems: "center", gap: 4 },
  headerTitle: { fontSize: 13 },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: { fontSize: 14 },
  progressBar: { height: 3 },
  progressFill: { height: 3 },
  content: { flex: 1, paddingHorizontal: 20 },
  questionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: { fontSize: 12 },
  reviewBtn: { padding: 4 },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
  },
  options: { gap: 12 },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabelText: { fontSize: 14 },
  optionText: { flex: 1, fontSize: 15, lineHeight: 22 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  navBtnText: { fontSize: 15 },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  skipBtnText: { fontSize: 14 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  submitBtnText: { fontSize: 15, color: "#FFFFFF" },
  adaptiveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  adaptiveIndicatorText: { fontSize: 12 },
  adaptiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  adaptiveExplanation: {
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  explanationTitle: { fontSize: 13 },
  explanationText: { fontSize: 13, lineHeight: 20 },
  paletteOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  paletteContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  paletteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  paletteTitle: { fontSize: 18 },
  paletteLegend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  paletteItem: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  paletteItemText: { fontSize: 14 },
  paletteSubmit: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  paletteSubmitText: { fontSize: 15, color: "#FFFFFF" },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  confirmCard: {
    width: "100%",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    gap: 12,
  },
  confirmTitle: { fontSize: 18 },
  confirmMsg: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  confirmBtns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  confirmBtnText: { fontSize: 15 },
});
