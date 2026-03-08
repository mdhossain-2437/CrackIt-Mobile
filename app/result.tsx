import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

function AnimatedScoreCircle({ score, colors, label }: { score: number; colors: any; label: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(score / 100, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 600 }),
    transform: [{ scale: withDelay(100, withTiming(1, { duration: 500 })) }],
  }));

  const scoreColor = score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.error;

  return (
    <Animated.View style={[styles.scoreCircle, { borderColor: scoreColor }, animatedStyle]}>
      <Text style={[styles.scoreValue, { color: scoreColor, fontFamily: "Inter_700Bold" }]}>
        {score}%
      </Text>
      <Text style={[styles.scoreLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

function QuestionReviewItem({
  index,
  questionId,
  colors,
  lastResult,
  isExpanded,
  onToggle,
  explanationLabel,
  timeLabel,
}: {
  index: number;
  questionId: string;
  colors: any;
  lastResult: any;
  isExpanded: boolean;
  onToggle: () => void;
  explanationLabel: string;
  timeLabel: string;
}) {
  const question = lastResult.questions[index];
  const answer = lastResult.answers[index];
  const isCorrect = answer.selectedOption === question.correctAnswer;
  const isSkipped = answer.selectedOption === null;

  return (
    <Pressable
      style={[styles.reviewItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      onPress={onToggle}
    >
      <View style={styles.reviewHeader}>
        <View style={[styles.reviewBadge, {
          backgroundColor: isSkipped ? colors.warningLight : isCorrect ? colors.successLight : colors.errorLight,
        }]}>
          <Ionicons
            name={isSkipped ? "remove-circle-outline" : isCorrect ? "checkmark-circle" : "close-circle"}
            size={18}
            color={isSkipped ? colors.warning : isCorrect ? colors.success : colors.error}
          />
        </View>
        <Text
          style={[styles.reviewQuestion, { color: colors.text, fontFamily: "Inter_500Medium" }]}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {index + 1}. {question.question}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </View>

      {isExpanded && (
        <View style={styles.reviewDetails}>
          {question.options.map((opt: string, optIdx: number) => {
            const isCorrectOpt = optIdx === question.correctAnswer;
            const isSelectedOpt = optIdx === answer.selectedOption;
            let optBg = "transparent";
            let optBorder = colors.border;
            let optColor = colors.text;

            if (isCorrectOpt) {
              optBg = colors.successLight;
              optBorder = colors.success;
              optColor = colors.success;
            } else if (isSelectedOpt && !isCorrectOpt) {
              optBg = colors.errorLight;
              optBorder = colors.error;
              optColor = colors.error;
            }

            return (
              <View
                key={optIdx}
                style={[styles.reviewOption, { backgroundColor: optBg, borderColor: optBorder }]}
              >
                <Text style={[styles.reviewOptionLetter, { color: optColor, fontFamily: "Inter_600SemiBold" }]}>
                  {String.fromCharCode(65 + optIdx)}.
                </Text>
                <Text style={[styles.reviewOptionText, { color: optColor, fontFamily: isCorrectOpt ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {opt}
                </Text>
                {isCorrectOpt && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                )}
                {isSelectedOpt && !isCorrectOpt && (
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                )}
              </View>
            );
          })}

          <View style={[styles.explanationBox, { backgroundColor: colors.primaryLight }]}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb-outline" size={16} color={colors.primary} />
              <Text style={[styles.explanationTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {explanationLabel}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
              {question.explanation}
            </Text>
          </View>

          <Text style={[styles.timeTaken, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
            {timeLabel}: {answer.timeSpent}s
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ResultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lastResult, tr } = useApp();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!lastResult) {
      router.replace("/(tabs)");
      return;
    }
    if (lastResult.score >= 70) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  if (!lastResult) return null;

  const avgTimePerQ = lastResult.totalQuestions > 0
    ? Math.round(lastResult.totalTime / lastResult.totalQuestions)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {tr("result.title")}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scoreSection}>
          <AnimatedScoreCircle score={lastResult.score} colors={colors} label={tr("result.score")} />

          <Text style={[styles.subjectTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {lastResult.subject}
            {lastResult.topic ? ` - ${lastResult.topic}` : ""}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: colors.successLight }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.statItemValue, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
              {lastResult.correctAnswers}
            </Text>
            <Text style={[styles.statItemLabel, { color: colors.success, fontFamily: "Inter_400Regular" }]}>
              {tr("result.correct")}
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.errorLight }]}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
            <Text style={[styles.statItemValue, { color: colors.error, fontFamily: "Inter_700Bold" }]}>
              {lastResult.wrongAnswers}
            </Text>
            <Text style={[styles.statItemLabel, { color: colors.error, fontFamily: "Inter_400Regular" }]}>
              {tr("result.wrong")}
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="remove-circle" size={20} color={colors.warning} />
            <Text style={[styles.statItemValue, { color: colors.warning, fontFamily: "Inter_700Bold" }]}>
              {lastResult.skipped}
            </Text>
            <Text style={[styles.statItemLabel, { color: colors.warning, fontFamily: "Inter_400Regular" }]}>
              {tr("result.skipped")}
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={[styles.statItemValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {avgTimePerQ}s
            </Text>
            <Text style={[styles.statItemLabel, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
              {tr("result.avgTime")}
            </Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {tr("result.reviewAnswers")}
          </Text>

          {lastResult.questions.map((q, idx) => (
            <QuestionReviewItem
              key={q.id}
              index={idx}
              questionId={q.id}
              colors={colors}
              lastResult={lastResult}
              isExpanded={expandedIdx === idx}
              onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              explanationLabel={tr("result.explanation")}
              timeLabel={tr("result.time")}
            />
          ))}
        </View>

        <Pressable
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={[styles.doneButtonText, { fontFamily: "Inter_600SemiBold" }]}>
            {tr("result.backHome")}
          </Text>
        </Pressable>
      </ScrollView>
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
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18 },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: { fontSize: 36 },
  scoreLabel: { fontSize: 13, marginTop: 2 },
  subjectTitle: { fontSize: 16, textAlign: "center" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  statItemValue: { fontSize: 18 },
  statItemLabel: { fontSize: 11 },
  reviewSection: {
    paddingHorizontal: 16,
  },
  reviewTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  reviewItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  reviewBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewQuestion: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  reviewDetails: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  reviewOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  reviewOptionLetter: { fontSize: 13, width: 20 },
  reviewOptionText: { flex: 1, fontSize: 13, lineHeight: 18 },
  explanationBox: {
    padding: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  explanationTitle: { fontSize: 13 },
  explanationText: { fontSize: 13, lineHeight: 20 },
  timeTaken: { fontSize: 11, marginTop: 4 },
  doneButton: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: { fontSize: 16, color: "#FFFFFF" },
});
