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
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import type { ExamAnswer } from "@/lib/questions";

export default function ExamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentExam, submitExam, clearCurrentExam } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

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

  useEffect(() => {
    if (!currentExam) {
      router.replace("/(tabs)");
      return;
    }
    const totalTime = currentExam.questions.length * currentExam.timePerQuestion;
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

  const question = currentExam.questions[currentIndex];
  const totalQuestions = currentExam.questions.length;
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((prev) => ({ ...prev, [question.id]: index }));
  };

  const handleNext = () => {
    recordQuestionTime();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    recordQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    recordQuestionTime();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleToggleReview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  };

  const handleGoToQuestion = (idx: number) => {
    recordQuestionTime();
    setCurrentIndex(idx);
    setShowPalette(false);
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordQuestionTime();

    const examAnswers: ExamAnswer[] = currentExam.questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? null,
      timeSpent: questionTimes[q.id] || 0,
      markedForReview: markedForReview.has(q.id),
    }));

    await submitExam(examAnswers);
    router.replace("/result");
  };

  autoSubmitRef.current = handleSubmit;

  const handleConfirmSubmit = () => {
    const unanswered = currentExam.questions.filter((q) => answers[q.id] === undefined || answers[q.id] === null).length;
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
      if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
        exitAction();
      }
    } else {
      Alert.alert("Exit Exam", "Are you sure? Your progress will be lost.", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: exitAction },
      ]);
    }
  };

  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== null).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 60;

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
          <View style={[styles.timerBadge, { backgroundColor: isTimeWarning ? colors.errorLight : colors.primaryLight }]}>
            <Ionicons name="time-outline" size={14} color={isTimeWarning ? colors.error : colors.primary} />
            <Text style={[styles.timerText, { color: isTimeWarning ? colors.error : colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </Text>
          </View>
        </View>

        <Pressable onPress={() => setShowPalette(true)} style={styles.headerBtn}>
          <Ionicons name="grid-outline" size={22} color={colors.primary} />
        </Pressable>
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
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </Text>
          </View>
          <Pressable onPress={handleToggleReview} style={styles.reviewBtn}>
            <Ionicons
              name={isMarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isMarked ? colors.warning : colors.textSecondary}
            />
          </Pressable>
        </View>

        <Text style={[styles.questionText, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {question.question}
        </Text>

        <View style={styles.options}>
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <Pressable
                key={idx}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleSelectOption(idx)}
              >
                <View style={[styles.optionLabel, {
                  backgroundColor: isSelected ? colors.primary : colors.borderLight,
                }]}>
                  <Text style={[styles.optionLabelText, {
                    color: isSelected ? "#FFFFFF" : colors.textSecondary,
                    fontFamily: "Inter_600SemiBold",
                  }]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, {
                  color: isSelected ? colors.primary : colors.text,
                  fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                }]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.navBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={[styles.navBtnText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Prev</Text>
        </Pressable>

        <Pressable
          style={[styles.skipBtn, { borderColor: colors.border }]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipBtnText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>Skip</Text>
        </Pressable>

        {currentIndex === totalQuestions - 1 ? (
          <Pressable
            style={[styles.submitBtn, { backgroundColor: colors.success }]}
            onPress={handleConfirmSubmit}
          >
            <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>Submit</Text>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable style={styles.navBtn} onPress={handleNext}>
            <Text style={[styles.navBtnText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <Modal visible={showPalette} animationType="slide" transparent>
        <View style={styles.paletteOverlay}>
          <View style={[styles.paletteContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.paletteHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.paletteTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                Question Palette
              </Text>
              <Pressable onPress={() => setShowPalette(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.paletteLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>Answered ({answeredCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>Review ({markedForReview.size})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>Unanswered</Text>
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
                Submit Exam ({answeredCount}/{totalQuestions} answered)
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirm} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: colors.background }]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
            <Text style={[styles.confirmTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              Unanswered Questions
            </Text>
            <Text style={[styles.confirmMsg, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              You have {totalQuestions - answeredCount} unanswered question{totalQuestions - answeredCount !== 1 ? "s" : ""}. Submit anyway?
            </Text>
            <View style={styles.confirmBtns}>
              <Pressable
                style={[styles.confirmBtn, { borderColor: colors.border }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={[styles.confirmBtnText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>Go Back</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, { backgroundColor: colors.success, borderColor: colors.success }]}
                onPress={() => { setShowConfirm(false); handleSubmit(); }}
              >
                <Text style={[styles.confirmBtnText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>Submit</Text>
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
