import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { checkAchievements, type AchievementDefinition, getRarityColor } from "@/lib/achievements";
import type { Difficulty, PracticeMode, Question } from "@/lib/questions";

function getGrade(score: number): { grade: string; color: string; icon: string } {
  if (score >= 95) return { grade: "A+", color: "#1B5E20", icon: "trophy" };
  if (score >= 85) return { grade: "A", color: "#2E7D32", icon: "medal" };
  if (score >= 75) return { grade: "B", color: "#1565C0", icon: "ribbon" };
  if (score >= 60) return { grade: "C", color: "#E65100", icon: "star-half" };
  if (score >= 40) return { grade: "D", color: "#BF360C", icon: "alert-circle" };
  return { grade: "F", color: "#B71C1C", icon: "close-circle" };
}

function getXpLevel(xp: number): { level: number; currentXp: number; xpForNext: number } {
  let level = 1;
  let remaining = xp;
  let threshold = 100;
  while (remaining >= threshold) {
    remaining -= threshold;
    level++;
    threshold = Math.floor(threshold * 1.3);
  }
  return { level, currentXp: remaining, xpForNext: threshold };
}

function AnimatedScoreCircle({ score, colors, label }: { score: number; colors: any; label: string }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }));
    let frame = 0;
    const totalFrames = 50;
    const interval = setInterval(() => {
      frame++;
      const t = frame / totalFrames;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * score));
      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplayScore(score);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const scoreColor = score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.error;
  const isHighScore = score >= 80;
  const scoreGradient = score >= 70 ? [colors.success, "#2E7D32"] : score >= 40 ? [colors.warning, "#E65100"] : [colors.error, "#C62828"];

  return (
    <View style={styles.scoreContainer}>
      {isHighScore && (
        <Animated.View entering={FadeIn.delay(1000).duration(600)} style={styles.celebrationRow}>
          <Ionicons name="star" size={18} color={colors.warning} />
          <Ionicons name="trophy" size={28} color={colors.warning} />
          <Ionicons name="star" size={18} color={colors.warning} />
        </Animated.View>
      )}
      <Animated.View style={[styles.scoreCircleOuter, animatedStyle]}>
        <LinearGradient
          colors={scoreGradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCircleGradient}
        >
          <View style={[styles.scoreCircleInner, { backgroundColor: colors.background }]}>
            <Text style={[styles.scoreValue, { color: scoreColor, fontFamily: "Inter_700Bold" }]}>
              {displayScore}%
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
      {isHighScore && (
        <Animated.Text entering={FadeIn.delay(1200).duration(500)} style={[styles.celebrationText, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
          Excellent!
        </Animated.Text>
      )}
      {score < 40 && (
        <Animated.Text entering={FadeIn.delay(1200).duration(500)} style={[styles.celebrationText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
          Keep practicing!
        </Animated.Text>
      )}
    </View>
  );
}

function GradeBadge({ score, colors, tr }: { score: number; colors: any; tr: (key: string) => string }) {
  const { grade, color, icon } = getGrade(score);

  return (
    <Animated.View entering={ZoomIn.delay(800).duration(500)} style={[styles.gradeBadge, { backgroundColor: color + "18", borderColor: color + "40" }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.gradeText, { color, fontFamily: "Inter_700Bold" }]}>{grade}</Text>
      <Text style={[styles.gradeLabel, { color: color + "BB", fontFamily: "Inter_400Regular" }]}>{tr("result.grade")}</Text>
    </Animated.View>
  );
}

function AnimatedStatCard({
  icon,
  value,
  label,
  color,
  bgColor,
  delay,
}: {
  icon: string;
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
  delay: number;
}) {
  const [displayVal, setDisplayVal] = useState(0);
  const numValue = typeof value === "string" ? parseInt(value) || 0 : value;

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const startDelay = delay + 300;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        frame++;
        const t = frame / totalFrames;
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayVal(Math.round(eased * numValue));
        if (frame >= totalFrames) {
          clearInterval(interval);
          setDisplayVal(numValue);
        }
      }, 20);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [numValue, delay]);

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)} style={[styles.statItem, { backgroundColor: bgColor }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statItemValue, { color, fontFamily: "Inter_700Bold" }]}>
        {typeof value === "string" ? value : displayVal}
      </Text>
      <Text style={[styles.statItemLabel, { color, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

function XpEarnedCard({ xpEarned, totalXp, colors, tr }: { xpEarned: number; totalXp: number; colors: any; tr: (key: string) => string }) {
  const [displayXp, setDisplayXp] = useState(0);
  const prevLevel = getXpLevel(totalXp - xpEarned);
  const currentLevel = getXpLevel(totalXp);
  const didLevelUp = currentLevel.level > prevLevel.level;

  useEffect(() => {
    let frame = 0;
    const totalFrames = 40;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        frame++;
        const t = frame / totalFrames;
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayXp(Math.round(eased * xpEarned));
        if (frame >= totalFrames) {
          clearInterval(interval);
          setDisplayXp(xpEarned);
        }
      }, 25);
    }, 600);
    return () => clearTimeout(timeout);
  }, [xpEarned]);

  return (
    <Animated.View entering={FadeInDown.delay(500).duration(400)} style={[styles.xpCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <LinearGradient
        colors={[colors.warning + "15", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.xpCardContent}>
        <View style={styles.xpIconWrap}>
          <Ionicons name="flash" size={22} color={colors.warning} />
        </View>
        <View style={styles.xpTextWrap}>
          <Text style={[styles.xpTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            +{displayXp} {tr("result.xpEarned")}
          </Text>
          <Text style={[styles.xpSubtitle, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
            Level {currentLevel.level} • {currentLevel.currentXp}/{currentLevel.xpForNext} XP
          </Text>
        </View>
        {didLevelUp && (
          <Animated.View entering={ZoomIn.delay(1500).duration(400)} style={[styles.levelUpBadge, { backgroundColor: colors.warning + "20" }]}>
            <Ionicons name="arrow-up-circle" size={16} color={colors.warning} />
            <Text style={[styles.levelUpText, { color: colors.warning, fontFamily: "Inter_700Bold" }]}>
              {tr("result.levelUp")}
            </Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

function AccuracyTrendChart({ examHistory, currentScore, colors, tr }: { examHistory: any[]; currentScore: number; colors: any; tr: (key: string) => string }) {
  const recentScores = useMemo(() => {
    const hist = examHistory.slice(0, 4).map((e: any) => e.score).reverse();
    return [...hist, currentScore];
  }, [examHistory, currentScore]);

  if (recentScores.length < 2) {
    return (
      <Animated.View entering={FadeInDown.delay(650).duration(400)} style={[styles.trendCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Text style={[styles.trendTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {tr("result.recentTrend")}
        </Text>
        <Text style={[styles.trendEmpty, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
          {tr("result.noHistory")}
        </Text>
      </Animated.View>
    );
  }

  const maxScore = Math.max(...recentScores, 100);
  const chartHeight = 60;

  return (
    <Animated.View entering={FadeInDown.delay(650).duration(400)} style={[styles.trendCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <Text style={[styles.trendTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("result.recentTrend")}
      </Text>
      <View style={styles.trendChart}>
        {recentScores.map((score, idx) => {
          const height = Math.max(8, (score / maxScore) * chartHeight);
          const isLast = idx === recentScores.length - 1;
          const barColor = isLast ? colors.primary : colors.primary + "60";

          return (
            <View key={idx} style={styles.trendBarWrap}>
              <Text style={[styles.trendBarValue, { color: isLast ? colors.primary : colors.textTertiary, fontFamily: isLast ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                {score}%
              </Text>
              <View style={[styles.trendBar, { height, backgroundColor: barColor, borderRadius: 4 }]} />
              <Text style={[styles.trendBarLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                {isLast ? "Now" : `#${idx + 1}`}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

function AchievementPopup({ achievements, colors, tr, lang }: { achievements: AchievementDefinition[]; colors: any; tr: (key: string) => string; lang: string }) {
  if (achievements.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(1800).duration(500)} style={[styles.achievementSection, { marginHorizontal: 16, marginBottom: 16 }]}>
      <Text style={[styles.achievementSectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        🏆 {tr("result.achievementUnlocked")}
      </Text>
      {achievements.map((achievement, idx) => (
        <Animated.View
          key={achievement.key}
          entering={ZoomIn.delay(2000 + idx * 200).duration(400)}
          style={[styles.achievementCard, { backgroundColor: getRarityColor(achievement.rarity) + "15", borderColor: getRarityColor(achievement.rarity) + "40" }]}
        >
          <View style={[styles.achievementIconWrap, { backgroundColor: getRarityColor(achievement.rarity) + "25" }]}>
            <Ionicons name={achievement.icon as any} size={22} color={getRarityColor(achievement.rarity)} />
          </View>
          <View style={styles.achievementTextWrap}>
            <Text style={[styles.achievementName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {lang === "bn" ? achievement.nameBn : achievement.name}
            </Text>
            <Text style={[styles.achievementDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {lang === "bn" ? achievement.descriptionBn : achievement.description}
            </Text>
          </View>
          <View style={styles.achievementXpWrap}>
            <Text style={[styles.achievementXp, { color: getRarityColor(achievement.rarity), fontFamily: "Inter_700Bold" }]}>
              +{achievement.xpReward}
            </Text>
            <Text style={[styles.achievementXpLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>XP</Text>
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

function PerformanceComparisonCard({ score, colors, tr, lang }: { score: number; colors: any; tr: (key: string) => string; lang: string }) {
  const percentile = Math.min(99, Math.max(5, Math.round(score * 0.85 + (score > 70 ? 15 : 0))));

  return (
    <Animated.View entering={FadeInDown.delay(600).duration(400)} style={[styles.comparisonCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <LinearGradient
        colors={[colors.primary + "10", "transparent"]}
        style={styles.comparisonGradient}
      />
      <View style={styles.comparisonContent}>
        <Ionicons name="people" size={22} color={colors.primary} />
        <View style={styles.comparisonTextWrap}>
          <Text style={[styles.comparisonTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {lang === "bn" ? `আপনি ${percentile}% শিক্ষার্থীদের চেয়ে ভালো করেছেন` : `You beat ${percentile}% of students`}
          </Text>
          <View style={[styles.comparisonBar, { backgroundColor: colors.borderLight }]}>
            <LinearGradient
              colors={[colors.primary, colors.primary + "AA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.comparisonBarFill, { width: `${percentile}%` }]}
            />
          </View>
        </View>
      </View>
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
      accessibilityRole="button"
      accessibilityLabel={`Question ${index + 1}: ${isSkipped ? "Skipped" : isCorrect ? "Correct" : "Wrong"}`}
      accessibilityState={{ expanded: isExpanded }}
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
        <Animated.View entering={FadeIn.duration(200)} style={styles.reviewDetails}>
          {question.options.map((opt: string, optIdx: number) => {
            const isCorrectOpt = optIdx === question.correctAnswer;
            const isSelectedOpt = optIdx === answer.selectedOption;
            let optBg = "transparent";
            let optBorder = colors.borderLight;
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

          <View style={[styles.explanationBox, { backgroundColor: colors.primaryLight, borderColor: colors.primary + "20" }]}>
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
        </Animated.View>
      )}
    </Pressable>
  );
}

function difficultyColor(diff: Difficulty, colors: any): string {
  return diff === "easy" ? colors.success : diff === "medium" ? colors.warning : colors.error;
}

function difficultyBgColor(diff: Difficulty, colors: any): string {
  return diff === "easy" ? colors.successLight : diff === "medium" ? colors.warningLight : colors.errorLight;
}

function countDifficultyChanges(progression: Difficulty[]): number {
  let changes = 0;
  for (let i = 1; i < progression.length; i++) {
    if (progression[i] !== progression[i - 1]) changes++;
  }
  return changes;
}

export default function ResultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lastResult, tr, language: appLanguage, userData, startExam } = useApp();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const xpEarned = useMemo(() => {
    if (!lastResult) return 0;
    const correct = lastResult.correctAnswers;
    const score = lastResult.score;
    return correct * 10 + (score >= 80 ? 50 : score >= 60 ? 25 : 0);
  }, [lastResult]);

  const newAchievements = useMemo(() => {
    if (!lastResult) return [];
    const earnedKeys = new Set<string>();
    const result = checkAchievements(userData, earnedKeys, {
      sessionQuestions: lastResult.totalQuestions,
      sessionAccuracy: lastResult.score,
      practiceMode: lastResult.practiceMode,
      perfectScore: lastResult.score === 100,
      totalQuestionsInSession: lastResult.totalQuestions,
    });
    return result.newlyEarned;
  }, [lastResult, userData]);

  const wrongQuestions = useMemo(() => {
    if (!lastResult) return [];
    return lastResult.questions.filter((q: Question, idx: number) => {
      const answer = lastResult.answers[idx];
      return answer && answer.selectedOption !== null && answer.selectedOption !== q.correctAnswer;
    });
  }, [lastResult]);

  useEffect(() => {
    if (!lastResult) {
      router.replace("/(tabs)");
      return;
    }
    if (lastResult.score >= 70) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handlePracticeWrong = useCallback(() => {
    if (wrongQuestions.length === 0) return;
    startExam({
      subject: lastResult!.subject,
      topic: lastResult!.topic,
      count: wrongQuestions.length,
      timePerQuestion: 60,
      questions: wrongQuestions,
      practiceMode: "relaxed",
    });
    router.replace("/exam");
  }, [wrongQuestions, lastResult, startExam]);

  const handleShare = useCallback(async () => {
    if (!lastResult) return;
    const message = appLanguage === "bn"
      ? `🎯 আমি CrackIt-এ ${lastResult.subject} পরীক্ষায় ${lastResult.score}% স্কোর করেছি! ${lastResult.correctAnswers}/${lastResult.totalQuestions} সঠিক। #CrackIt #ExamPrep`
      : `🎯 I scored ${lastResult.score}% on ${lastResult.subject} quiz on CrackIt! ${lastResult.correctAnswers}/${lastResult.totalQuestions} correct. #CrackIt #ExamPrep`;
    try {
      await Share.share({ message });
    } catch (e) {}
  }, [lastResult, appLanguage]);

  if (!lastResult) return null;

  const avgTimePerQ = lastResult.totalQuestions > 0
    ? Math.round(lastResult.totalTime / lastResult.totalQuestions)
    : 0;

  const scoreGradient = lastResult.score >= 70 ? [colors.success, "#2E7D32"]
    : lastResult.score >= 40 ? [colors.warning, "#E65100"]
    : [colors.error, "#C62828"];

  const modeColor = lastResult.practiceMode === "relaxed" ? "#4CAF50"
    : lastResult.practiceMode === "speed" ? "#FF6B35"
    : lastResult.practiceMode === "marathon" ? "#9C27B0"
    : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[scoreGradient[0] + "15", "transparent"]}
        style={[styles.headerGradient, { paddingTop: topInset + 12 }]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.replace("/(tabs)")} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close results">
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {tr("result.title")}
          </Text>
          <Pressable onPress={handleShare} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={tr("result.shareResult")}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scoreSection}>
          <View style={styles.scoreAndGradeRow}>
            <AnimatedScoreCircle score={lastResult.score} colors={colors} label={tr("result.score")} />
            <GradeBadge score={lastResult.score} colors={colors} tr={tr} />
          </View>

          {lastResult.practiceMode && (
            <Animated.View entering={FadeIn.delay(400).duration(300)} style={[styles.modeBadge, {
              backgroundColor: modeColor + "15",
              borderColor: modeColor + "30",
            }]}>
              <Ionicons
                name={(lastResult.practiceMode === "relaxed" ? "leaf-outline"
                  : lastResult.practiceMode === "speed" ? "flash-outline"
                  : lastResult.practiceMode === "marathon" ? "fitness-outline"
                  : "time-outline") as any}
                size={14}
                color={modeColor}
              />
              <Text style={[styles.modeBadgeText, {
                color: modeColor,
                fontFamily: "Inter_600SemiBold",
              }]}>
                {tr(`mode.badge.${lastResult.practiceMode}`)}
              </Text>
            </Animated.View>
          )}

          <Animated.Text entering={FadeIn.delay(500).duration(300)} style={[styles.subjectTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {lastResult.subject}
            {lastResult.topic ? ` \u2022 ${lastResult.topic}` : ""}
          </Animated.Text>
        </View>

        <View style={styles.statsRow}>
          <AnimatedStatCard
            icon="checkmark-circle"
            value={lastResult.correctAnswers}
            label={tr("result.correct")}
            color={colors.success}
            bgColor={colors.successLight}
            delay={200}
          />
          <AnimatedStatCard
            icon="close-circle"
            value={lastResult.wrongAnswers}
            label={tr("result.wrong")}
            color={colors.error}
            bgColor={colors.errorLight}
            delay={300}
          />
          <AnimatedStatCard
            icon="remove-circle"
            value={lastResult.skipped}
            label={tr("result.skipped")}
            color={colors.warning}
            bgColor={colors.warningLight}
            delay={400}
          />
          <AnimatedStatCard
            icon="time"
            value={`${avgTimePerQ}s`}
            label={tr("result.avgTime")}
            color={colors.primary}
            bgColor={colors.primaryLight}
            delay={500}
          />
        </View>

        <XpEarnedCard xpEarned={xpEarned} totalXp={userData.xp} colors={colors} tr={tr} />

        <PerformanceComparisonCard score={lastResult.score} colors={colors} tr={tr} lang={appLanguage} />

        <AccuracyTrendChart
          examHistory={userData.examHistory.filter((e: any) => e.id !== lastResult.id)}
          currentScore={lastResult.score}
          colors={colors}
          tr={tr}
        />

        <AchievementPopup achievements={newAchievements} colors={colors} tr={tr} lang={appLanguage} />

        {lastResult.adaptive && lastResult.difficultyProgression && lastResult.difficultyProgression.length > 1 && (
          <Animated.View entering={FadeInDown.delay(700).duration(400)} style={[styles.progressionSection, { marginHorizontal: 16, marginBottom: 24 }]}>
            <Text style={[styles.reviewTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {tr("adaptive.progression")}
            </Text>

            <View style={[styles.progressionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.progressionRow}>
                <View style={styles.progressionEndpoint}>
                  <Text style={[styles.progressionEndLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                    {tr("adaptive.started")}
                  </Text>
                  <View style={[styles.progressionEndBadge, {
                    backgroundColor: difficultyBgColor(lastResult.difficultyProgression[0], colors),
                  }]}>
                    <Text style={[styles.progressionEndText, {
                      color: difficultyColor(lastResult.difficultyProgression[0], colors),
                      fontFamily: "Inter_600SemiBold",
                    }]}>
                      {tr(`difficulty.${lastResult.difficultyProgression[0]}`)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressionArrow}>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                </View>

                <View style={styles.progressionEndpoint}>
                  <Text style={[styles.progressionEndLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                    {tr("adaptive.ended")}
                  </Text>
                  <View style={[styles.progressionEndBadge, {
                    backgroundColor: difficultyBgColor(lastResult.difficultyProgression[lastResult.difficultyProgression.length - 1], colors),
                  }]}>
                    <Text style={[styles.progressionEndText, {
                      color: difficultyColor(lastResult.difficultyProgression[lastResult.difficultyProgression.length - 1], colors),
                      fontFamily: "Inter_600SemiBold",
                    }]}>
                      {tr(`difficulty.${lastResult.difficultyProgression[lastResult.difficultyProgression.length - 1]}`)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressionTimeline}>
                {lastResult.difficultyProgression.map((diff: Difficulty, idx: number) => (
                  <View key={idx} style={styles.progressionDotWrap}>
                    <View style={[styles.progressionDot, { backgroundColor: difficultyColor(diff, colors) }]} />
                    {idx < lastResult.difficultyProgression!.length - 1 && (
                      <View style={[styles.progressionLine, { backgroundColor: colors.borderLight }]} />
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.progressionLegend}>
                <Text style={[styles.progressionLegendText, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                  {tr("adaptive.levelChanges")}: {countDifficultyChanges(lastResult.difficultyProgression)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {tr("result.reviewAnswers")}
          </Text>

          {lastResult.questions.map((q: any, idx: number) => (
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

        <Animated.View entering={FadeInUp.delay(800).duration(400)} style={styles.actionButtons}>
          {wrongQuestions.length > 0 && (
            <Pressable
              style={styles.wrongAnswerBtnWrap}
              onPress={handlePracticeWrong}
              accessibilityRole="button"
              accessibilityLabel={tr("result.practiceWrong")}
            >
              <LinearGradient
                colors={[colors.error, colors.error + "CC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.wrongAnswerBtn}
              >
                <Ionicons name="reload" size={18} color="#FFFFFF" />
                <Text style={[styles.wrongAnswerBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                  {tr("result.practiceWrong")} ({wrongQuestions.length})
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          <Pressable
            style={styles.retryButtonWrap}
            onPress={() => router.replace("/(tabs)/practice")}
            accessibilityRole="button"
          >
            <View style={[styles.retryButton, { borderColor: colors.primary, borderWidth: 1.5 }]}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={[styles.retryButtonText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {appLanguage === "bn" ? "আবার অনুশীলন" : "Practice Again"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.shareButtonWrap}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel={tr("result.shareResult")}
          >
            <View style={[styles.shareButton, { borderColor: colors.accent, borderWidth: 1.5 }]}>
              <Ionicons name="share-social" size={18} color={colors.accent} />
              <Text style={[styles.shareButtonText, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                {tr("result.shareResult")}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.doneButtonWrap}
            onPress={() => router.replace("/(tabs)")}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[colors.primary, colors.primary + "DD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.doneButton}
            >
              <Ionicons name="home" size={18} color="#FFFFFF" />
              <Text style={[styles.doneButtonText, { fontFamily: "Inter_600SemiBold" }]}>
                {tr("result.backHome")}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18 },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  scoreAndGradeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  scoreContainer: {
    alignItems: "center",
  },
  celebrationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  celebrationText: {
    fontSize: 18,
    marginTop: 12,
  },
  scoreCircleOuter: {
    marginBottom: 16,
  },
  scoreCircleGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreCircleInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: { fontSize: 38 },
  scoreLabel: { fontSize: 13, marginTop: 2 },
  gradeBadge: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    gap: 2,
  },
  gradeText: { fontSize: 24 },
  gradeLabel: { fontSize: 10 },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  modeBadgeText: { fontSize: 12 },
  subjectTitle: { fontSize: 16, textAlign: "center" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 4,
  },
  statItemValue: { fontSize: 18 },
  statItemLabel: { fontSize: 10 },
  xpCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  xpCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  xpIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  xpTextWrap: {
    flex: 1,
  },
  xpTitle: { fontSize: 15 },
  xpSubtitle: { fontSize: 12, marginTop: 2 },
  levelUpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelUpText: { fontSize: 11 },
  trendCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  trendTitle: { fontSize: 15, marginBottom: 12 },
  trendEmpty: { fontSize: 13, textAlign: "center", paddingVertical: 8 },
  trendChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 100,
    paddingTop: 10,
  },
  trendBarWrap: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  trendBarValue: { fontSize: 11 },
  trendBar: {
    width: 28,
    minHeight: 8,
  },
  trendBarLabel: { fontSize: 10 },
  achievementSection: {},
  achievementSectionTitle: { fontSize: 16, marginBottom: 10 },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  achievementIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementTextWrap: { flex: 1 },
  achievementName: { fontSize: 14 },
  achievementDesc: { fontSize: 12, marginTop: 2 },
  achievementXpWrap: { alignItems: "center" },
  achievementXp: { fontSize: 14 },
  achievementXpLabel: { fontSize: 10 },
  comparisonCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  comparisonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  comparisonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  comparisonTextWrap: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  comparisonBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  comparisonBarFill: {
    height: 6,
    borderRadius: 3,
  },
  reviewSection: {
    paddingHorizontal: 16,
  },
  reviewTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  reviewItem: {
    borderRadius: 14,
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
    width: 34,
    height: 34,
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  reviewOptionLetter: { fontSize: 13, width: 20 },
  reviewOptionText: { flex: 1, fontSize: 13, lineHeight: 18 },
  explanationBox: {
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
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
  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  wrongAnswerBtnWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  wrongAnswerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  wrongAnswerBtnText: { fontSize: 15, color: "#FFFFFF" },
  retryButtonWrap: {},
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  retryButtonText: { fontSize: 16 },
  shareButtonWrap: {},
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  shareButtonText: { fontSize: 16 },
  doneButtonWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  doneButtonText: { fontSize: 16, color: "#FFFFFF" },
  progressionSection: {},
  progressionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  progressionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressionEndpoint: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  progressionEndLabel: { fontSize: 11 },
  progressionEndBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  progressionEndText: { fontSize: 13 },
  progressionArrow: {
    paddingHorizontal: 8,
  },
  progressionTimeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  progressionDotWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressionLine: {
    width: 16,
    height: 2,
  },
  progressionLegend: {
    alignItems: "center",
  },
  progressionLegendText: { fontSize: 12 },
});
