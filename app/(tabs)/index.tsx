import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import {
  EXAM_TYPES,
  getSubjectsForExamType,
  getQuestionsForSubject,
  getQuestionsForExamType,
  shuffleArray,
} from "@/lib/questions";
import { getWeakTopics, getAdaptiveQuestions, getSmartDailyMix } from "@/lib/algorithm";
import { apiRequest } from "@/lib/query-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAILY_GOAL = 10;
const XP_PER_LEVEL = 500;

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streak: number;
  totalQuestionsSolved: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  currentUserId: string | null;
  period: string;
}

function getUserLevel(xp: number): { level: number; progress: number; xpInLevel: number; xpForNext: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  return { level, progress: xpInLevel / XP_PER_LEVEL, xpInLevel, xpForNext: XP_PER_LEVEL };
}

function getTimeGreeting(tr: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return tr("dashboard.goodMorning");
  if (hour < 17) return tr("dashboard.goodAfternoon");
  return tr("dashboard.goodEvening");
}

function ProgressRing({ progress, size, strokeWidth, color, bgColor, children }: { progress: number; size: number; strokeWidth: number; color: string; bgColor: string; children?: React.ReactNode }) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  return (
    <View
      style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress * 100) }}
    >
      <View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: bgColor }} />
      <View style={{ position: "absolute", width: size, height: size, transform: [{ rotate: "-90deg" }] }}>
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: "transparent",
          borderTopColor: clampedProgress > 0 ? color : "transparent",
          borderRightColor: clampedProgress > 0.25 ? color : "transparent",
          borderBottomColor: clampedProgress > 0.5 ? color : "transparent",
          borderLeftColor: clampedProgress > 0.75 ? color : "transparent",
        }} />
      </View>
      {children}
    </View>
  );
}

function PressableCard({ children, onPress, style, accessibilityLabel, accessibilityHint }: { children: React.ReactNode; onPress?: () => void; style?: any; accessibilityLabel?: string; accessibilityHint?: string }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
        }
        onPress?.();
      }}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function StreakFlame({ streak, colors }: { streak: number; colors: any }) {
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  return (
    <Animated.View style={flameStyle} accessibilityLabel={`${streak} day streak`}>
      <Ionicons name="flame" size={22} color={colors.streak} />
    </Animated.View>
  );
}

function AnimatedStatCard({ icon, value, label, iconColor, colors, delay }: { icon: string; value: string | number; label: string; iconColor: string; colors: any; delay: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      style={styles.glassStatCard}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder }]} />
      <Ionicons name={icon as any} size={20} color={iconColor} />
      <Text style={[styles.glassStatValue, { color: colors.heroText, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.glassStatLabel, { color: colors.heroSubtext, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

function StudyStreakCalendar({ userData, colors, tr }: { userData: any; colors: any; tr: (key: string) => string }) {
  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const questionsOnDay = userData.examHistory.filter(
        (e: any) => e.date.startsWith(dateStr)
      ).reduce((sum: number, e: any) => sum + e.totalQuestions, 0);
      days.push({
        date: d,
        dateStr,
        count: questionsOnDay,
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
        isToday: i === 0,
      });
    }
    return days;
  }, [userData.examHistory]);

  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <View
      style={[styles.streakCalendar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      accessibilityRole="summary"
      accessibilityLabel={tr("dashboard.studyStreak")}
    >
      <View style={styles.streakCalendarHeader}>
        <Ionicons name="calendar" size={16} color={colors.primary} />
        <Text style={[styles.streakCalendarTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          {tr("dashboard.studyStreak")}
        </Text>
      </View>
      <View style={styles.streakCalendarRow}>
        {last7Days.map((day) => {
          const intensity = day.count > 0 ? Math.max(0.2, day.count / maxCount) : 0;
          const bgColor = day.count > 0
            ? `rgba(37, 99, 235, ${intensity})`
            : colors.borderLight;
          return (
            <View
              key={day.dateStr}
              style={styles.streakDayCol}
              accessibilityLabel={`${day.dayLabel}: ${day.count} questions`}
            >
              <View style={[
                styles.streakDayCell,
                {
                  backgroundColor: bgColor,
                  borderWidth: day.isToday ? 2 : 0,
                  borderColor: day.isToday ? colors.primary : "transparent",
                },
              ]}>
                {day.count > 0 && (
                  <Text style={[styles.streakDayCount, { color: intensity > 0.5 ? "#FFFFFF" : colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {day.count}
                  </Text>
                )}
              </View>
              <Text style={[styles.streakDayLabel, { color: day.isToday ? colors.primary : colors.textTertiary, fontFamily: day.isToday ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                {day.dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function QuickActionButton({ icon, label, color, bgColor, onPress, accessibilityHint }: { icon: string; label: string; color: string; bgColor: string; onPress: () => void; accessibilityHint: string }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
        }
        onPress();
      }}
      onPressIn={() => { scale.value = withSpring(0.93, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={{ flex: 1, minHeight: 44 }}
    >
      <Animated.View style={[animStyle, styles.quickActionBtn, { backgroundColor: bgColor }]}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={[styles.quickActionLabel, { color, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, startExam, tr, language, authUser, isAuthenticated } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const examTypeInfo = EXAM_TYPES.find((e) => e.id === userData.examType);
  const subjects = getSubjectsForExamType(userData.examType);
  const accuracy =
    userData.totalQuestionsSolved > 0
      ? Math.round((userData.totalCorrect / userData.totalQuestionsSolved) * 100)
      : 0;
  const weakTopics = getWeakTopics(userData, userData.examType, 3);
  const levelInfo = getUserLevel(userData.xp);

  const todayExams = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return userData.examHistory.filter((e) => e.date.startsWith(today));
  }, [userData.examHistory]);

  const questionsToday = useMemo(() => {
    return todayExams.reduce((sum, e) => sum + e.totalQuestions, 0);
  }, [todayExams]);

  const dailyProgress = Math.min(questionsToday / DAILY_GOAL, 1);
  const estimatedTimeRemaining = Math.max(0, (DAILY_GOAL - questionsToday) * 1.5);

  const smartMixCount = useMemo(() => {
    const pool = getQuestionsForExamType(userData.examType, language);
    return Math.min(15, pool.length);
  }, [userData.examType, language]);

  const lastIncompleteSubject = useMemo(() => {
    if (userData.examHistory.length === 0) return null;
    const last = userData.examHistory[0];
    if (last.score < 70) {
      return { subject: last.subject, topic: last.topic, score: last.score };
    }
    return null;
  }, [userData.examHistory]);

  const handleQuickPractice = (subjectName: string) => {
    const questions = shuffleArray(getQuestionsForSubject(subjectName)).slice(0, 10);
    if (questions.length === 0) return;
    startExam({
      subject: subjectName,
      count: questions.length,
      timePerQuestion: 60,
      questions,
    });
    router.push("/exam");
  };

  const handleSmartDailyMix = () => {
    if (Platform.OS !== "web") {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    }
    const questions = getSmartDailyMix(userData, userData.examType, 15, language);
    if (questions.length === 0) return;
    startExam({
      subject: tr("dashboard.smartDailyMix"),
      count: questions.length,
      timePerQuestion: 60,
      questions,
    });
    router.push("/exam");
  };

  const handleSpeedRound = () => {
    if (Platform.OS !== "web") {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    }
    const questions = shuffleArray(getQuestionsForExamType(userData.examType, language)).slice(0, 10);
    if (questions.length === 0) return;
    startExam({
      subject: tr("dashboard.speedRound"),
      count: questions.length,
      timePerQuestion: 30,
      questions,
      practiceMode: "speed",
    });
    router.push("/exam");
  };

  const handleWeakTopicsDrill = () => {
    if (Platform.OS !== "web") {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    }
    if (weakTopics.length > 0) {
      const wt = weakTopics[0];
      const questions = shuffleArray(getQuestionsForSubject(wt.subject, wt.topic)).slice(0, 10);
      if (questions.length === 0) return;
      startExam({
        subject: wt.subject,
        topic: wt.topic,
        count: questions.length,
        timePerQuestion: 60,
        questions,
      });
    } else {
      const questions = getAdaptiveQuestions(userData, userData.examType, 10, language);
      if (questions.length === 0) return;
      startExam({
        subject: tr("dashboard.weakTopicsDrill"),
        count: questions.length,
        timePerQuestion: 60,
        questions,
      });
    }
    router.push("/exam");
  };

  const handleRandomChallenge = () => {
    if (Platform.OS !== "web") {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
    }
    const allQuestions = getQuestionsForExamType(userData.examType, language);
    const questions = shuffleArray(allQuestions).slice(0, 10);
    if (questions.length === 0) return;
    startExam({
      subject: tr("dashboard.randomChallenge"),
      count: questions.length,
      timePerQuestion: 45,
      questions,
    });
    router.push("/exam");
  };

  const handleWeakTopicPractice = (subject: string, topic: string) => {
    const questions = shuffleArray(getQuestionsForSubject(subject, topic)).slice(0, 10);
    if (questions.length === 0) return;
    startExam({
      subject,
      topic,
      count: questions.length,
      timePerQuestion: 60,
      questions,
    });
    router.push("/exam");
  };

  const handleContinuePractice = () => {
    if (!lastIncompleteSubject) return;
    const questions = shuffleArray(
      getQuestionsForSubject(lastIncompleteSubject.subject, lastIncompleteSubject.topic)
    ).slice(0, 10);
    if (questions.length === 0) return;
    startExam({
      subject: lastIncompleteSubject.subject,
      topic: lastIncompleteSubject.topic,
      count: questions.length,
      timePerQuestion: 60,
      questions,
    });
    router.push("/exam");
  };

  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"alltime" | "weekly">("alltime");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (period: "alltime" | "weekly") => {
    setLeaderboardLoading(true);
    try {
      const res = await apiRequest("GET", `/api/leaderboard?period=${period}&limit=5`);
      const data = await res.json();
      setLeaderboardData(data);
    } catch (e) {
      console.error("Failed to fetch leaderboard:", e);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(leaderboardPeriod);
  }, [leaderboardPeriod]);

  const examName = language === "bn" ? examTypeInfo?.nameBn : examTypeInfo?.name;
  const greeting = isAuthenticated && authUser ? authUser.name.split(" ")[0] : "";
  const timeGreeting = getTimeGreeting(tr);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLeaderboard(leaderboardPeriod).finally(() => setRefreshing(false));
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroContainer, { paddingTop: topInset + 20 }]}
        >
          <View style={styles.heroPattern}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.heroCircle,
                  {
                    width: 60 + i * 40,
                    height: 60 + i * 40,
                    borderRadius: (60 + i * 40) / 2,
                    top: -20 + i * 10,
                    right: -30 + i * 15,
                    opacity: 0.04 + i * 0.01,
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.heroGreeting, { fontFamily: "Inter_400Regular" }]}
                accessibilityRole="text"
              >
                {timeGreeting}{greeting ? `, ${greeting}` : ""}
              </Text>
              <Text
                style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}
                accessibilityRole="header"
              >
                {examName} {tr("dashboard.prep")}
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <View style={styles.streakInner}>
                <StreakFlame streak={userData.streak} colors={colors} />
                <Text style={[styles.heroStreakText, { fontFamily: "Inter_700Bold" }]}
                  accessibilityLabel={`${userData.streak} ${tr("profile.dayStreak")}`}
                >
                  {userData.streak}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.xpBarSection}>
            <View style={styles.xpBarHeader}>
              <View style={styles.levelBadge}>
                <Ionicons name="shield" size={14} color="#FCD34D" />
                <Text style={[styles.levelText, { fontFamily: "Inter_700Bold" }]}>
                  Lv.{levelInfo.level}
                </Text>
              </View>
              <Text style={[styles.xpBarLabel, { fontFamily: "Inter_400Regular" }]}>
                {levelInfo.xpInLevel}/{levelInfo.xpForNext} XP
              </Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${Math.min(levelInfo.progress * 100, 100)}%` }]} />
            </View>
          </Animated.View>

          <View style={styles.glassStatsRow}>
            <AnimatedStatCard
              icon="checkmark-circle"
              value={userData.totalQuestionsSolved}
              label={tr("dashboard.solved")}
              iconColor="#6EE7B7"
              colors={colors}
              delay={150}
            />
            <AnimatedStatCard
              icon="analytics"
              value={`${accuracy}%`}
              label={tr("dashboard.accuracy")}
              iconColor="#93C5FD"
              colors={colors}
              delay={200}
            />
            <AnimatedStatCard
              icon="star"
              value={userData.xp}
              label={tr("dashboard.xp")}
              iconColor="#FCD34D"
              colors={colors}
              delay={250}
            />
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <Animated.View entering={FadeInDown.delay(280).duration(400)}>
            <View
              style={[styles.dailyGoalCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              accessibilityRole="summary"
              accessibilityLabel={`${tr("dashboard.dailyGoal")}: ${questionsToday} of ${DAILY_GOAL} questions completed`}
            >
              <ProgressRing
                progress={dailyProgress}
                size={72}
                strokeWidth={6}
                color={dailyProgress >= 1 ? colors.success : colors.primary}
                bgColor={colors.borderLight}
              >
                <Text style={[styles.dailyGoalRingText, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  {questionsToday}
                </Text>
                <Text style={[styles.dailyGoalRingLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                  /{DAILY_GOAL}
                </Text>
              </ProgressRing>
              <View style={styles.dailyGoalInfo}>
                <Text style={[styles.dailyGoalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  {tr("dashboard.dailyGoal")}
                </Text>
                <Text style={[styles.dailyGoalSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {questionsToday}/{DAILY_GOAL} {tr("dashboard.questionsToday")}
                </Text>
                {dailyProgress < 1 ? (
                  <Text style={[styles.dailyGoalTime, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                    ~{Math.ceil(estimatedTimeRemaining)} {tr("dashboard.minRemaining")}
                  </Text>
                ) : (
                  <View style={styles.dailyGoalCompletedRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.dailyGoalCompletedText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>
                      {tr("dashboard.completed")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400)}>
            <PressableCard
              onPress={handleSmartDailyMix}
              accessibilityLabel={tr("dashboard.smartDailyMix")}
              accessibilityHint={tr("dashboard.smartDailyMixHint")}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.smartMixCard}
              >
                <View style={styles.smartMixContent}>
                  <View style={styles.smartMixIconWrap}>
                    <MaterialCommunityIcons name="brain" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.smartMixInfo}>
                    <Text style={[styles.smartMixTitle, { fontFamily: "Inter_700Bold" }]}>
                      {tr("dashboard.smartDailyMix")}
                    </Text>
                    <Text style={[styles.smartMixDesc, { fontFamily: "Inter_400Regular" }]}>
                      {smartMixCount} {tr("practice.questions")} · {tr("dashboard.personalizedForYou")}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </PressableCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(360).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {tr("dashboard.quickActions")}
            </Text>
            <View style={styles.quickActionsRow}>
              <QuickActionButton
                icon="flash"
                label={tr("dashboard.speedRound")}
                color="#EF4444"
                bgColor={colors.surface}
                onPress={handleSpeedRound}
                accessibilityHint={tr("dashboard.speedRoundHint")}
              />
              <QuickActionButton
                icon="fitness"
                label={tr("dashboard.weakTopicsDrill")}
                color="#F59E0B"
                bgColor={colors.surface}
                onPress={handleWeakTopicsDrill}
                accessibilityHint={tr("dashboard.weakTopicsDrillHint")}
              />
              <QuickActionButton
                icon="dice"
                label={tr("dashboard.randomChallenge")}
                color="#8B5CF6"
                bgColor={colors.surface}
                onPress={handleRandomChallenge}
                accessibilityHint={tr("dashboard.randomChallengeHint")}
              />
            </View>
          </Animated.View>

          {lastIncompleteSubject && (
            <Animated.View entering={FadeInDown.delay(380).duration(400)}>
              <PressableCard
                onPress={handleContinuePractice}
                style={[styles.continueCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                accessibilityLabel={`${tr("dashboard.continueWhere")}: ${lastIncompleteSubject.subject}`}
                accessibilityHint="Tap to continue practicing"
              >
                <View style={[styles.continueIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="play" size={18} color={colors.primary} />
                </View>
                <View style={styles.continueInfo}>
                  <Text style={[styles.continueLabel, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                    {tr("dashboard.continueWhere")}
                  </Text>
                  <Text style={[styles.continueSubject, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {lastIncompleteSubject.subject}{lastIncompleteSubject.topic ? ` - ${lastIncompleteSubject.topic}` : ""}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </PressableCard>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <StudyStreakCalendar userData={userData} colors={colors} tr={tr} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(420).duration(400)}>
            <View style={styles.leaderboardHeader}>
              <View style={styles.leaderboardTitleRow}>
                <Ionicons name="trophy" size={20} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold", marginBottom: 0, paddingHorizontal: 0 }]}>
                  {tr("leaderboard.title")}
                </Text>
              </View>
              <View
                style={[styles.periodToggle, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                accessibilityRole="radiogroup"
              >
                <Pressable
                  style={[
                    styles.periodBtn,
                    leaderboardPeriod === "alltime" && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setLeaderboardPeriod("alltime")}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: leaderboardPeriod === "alltime" }}
                  accessibilityLabel={tr("leaderboard.allTime")}
                >
                  <Text style={[
                    styles.periodBtnText,
                    { color: leaderboardPeriod === "alltime" ? "#FFFFFF" : colors.textSecondary, fontFamily: "Inter_500Medium" },
                  ]}>
                    {tr("leaderboard.allTime")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.periodBtn,
                    leaderboardPeriod === "weekly" && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setLeaderboardPeriod("weekly")}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: leaderboardPeriod === "weekly" }}
                  accessibilityLabel={tr("leaderboard.weekly")}
                >
                  <Text style={[
                    styles.periodBtnText,
                    { color: leaderboardPeriod === "weekly" ? "#FFFFFF" : colors.textSecondary, fontFamily: "Inter_500Medium" },
                  ]}>
                    {tr("leaderboard.weekly")}
                  </Text>
                </Pressable>
              </View>
            </View>

            {leaderboardLoading ? (
              <View style={styles.leaderboardLoading} accessibilityRole="progressbar" accessibilityLabel="Loading leaderboard">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : leaderboardData && leaderboardData.entries.length > 0 ? (
              <View style={[styles.leaderboardContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                {leaderboardData.entries.slice(0, 5).map((entry, idx) => {
                  const isCurrentUser = leaderboardData.currentUserId === entry.userId;
                  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                  const hasMedal = idx < 3;
                  return (
                    <View
                      key={entry.userId}
                      style={[
                        styles.leaderboardRow,
                        isCurrentUser && { backgroundColor: colors.primaryLight },
                        idx < Math.min(leaderboardData.entries.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                      ]}
                      accessibilityRole="text"
                      accessibilityLabel={`Rank ${entry.rank}: ${entry.name}, ${entry.xp} XP${isCurrentUser ? " (You)" : ""}`}
                    >
                      <View style={styles.rankContainer}>
                        {hasMedal ? (
                          <View style={[styles.medalBadge, { backgroundColor: medalColors[idx] + "20" }]}>
                            <Ionicons name="medal" size={16} color={medalColors[idx]} />
                          </View>
                        ) : (
                          <Text style={[styles.rankNumber, { color: colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
                            {entry.rank}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.avatarCircle, { backgroundColor: isCurrentUser ? colors.primary : colors.primary + "30" }]}>
                        <Text style={[styles.avatarText, { color: isCurrentUser ? "#FFFFFF" : colors.primary, fontFamily: "Inter_700Bold" }]}>
                          {entry.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.leaderboardInfo}>
                        <Text style={[styles.leaderboardName, { color: colors.text, fontFamily: isCurrentUser ? "Inter_700Bold" : "Inter_500Medium" }]} numberOfLines={1}>
                          {entry.name}{isCurrentUser ? ` (${tr("leaderboard.you")})` : ""}
                        </Text>
                        <View style={styles.leaderboardMeta}>
                          <Ionicons name="flame" size={12} color={colors.streak} />
                          <Text style={[styles.leaderboardMetaText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                            {entry.streak}
                          </Text>
                          <Ionicons name="checkmark-circle" size={12} color={colors.success} style={{ marginLeft: 8 }} />
                          <Text style={[styles.leaderboardMetaText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                            {entry.totalQuestionsSolved}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.xpContainer}>
                        <Text style={[styles.xpValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                          {entry.xp}
                        </Text>
                        <Text style={[styles.xpLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                          XP
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {isAuthenticated && leaderboardData.currentUserRank && leaderboardData.currentUserRank > 5 && (
                  <View style={[styles.currentUserRankBar, { backgroundColor: colors.primaryLight, borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
                    <Ionicons name="person" size={14} color={colors.primary} />
                    <Text style={[styles.currentUserRankText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      {tr("leaderboard.yourRank")}: #{leaderboardData.currentUserRank}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.leaderboardEmpty, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Ionicons name="trophy-outline" size={28} color={colors.textTertiary} />
                <Text style={[styles.leaderboardEmptyText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {tr("leaderboard.noData")}
                </Text>
              </View>
            )}

            {!isAuthenticated && (
              <Pressable
                style={[styles.loginPrompt, { borderColor: colors.primary + "40" }]}
                onPress={() => router.push("/auth")}
                accessibilityRole="button"
                accessibilityLabel={tr("leaderboard.loginToSee")}
              >
                <Ionicons name="log-in-outline" size={16} color={colors.primary} />
                <Text style={[styles.loginPromptText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  {tr("leaderboard.loginToSee")}
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {weakTopics.length > 0 && (
            <Animated.View entering={FadeInDown.delay(440).duration(400)}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {tr("dashboard.weakTopics")}
              </Text>
              {weakTopics.map((wt, idx) => (
                <Animated.View key={`${wt.subject}::${wt.topic}`} entering={FadeInRight.delay(460 + idx * 80).duration(300)}>
                  <PressableCard
                    onPress={() => handleWeakTopicPractice(wt.subject, wt.topic)}
                    style={[styles.weakCard, { backgroundColor: colors.errorLight, borderColor: colors.error + "20" }]}
                    accessibilityLabel={`${wt.subject} - ${wt.topic}: ${Math.round(wt.accuracy * 100)}% accuracy`}
                    accessibilityHint="Tap to practice this weak topic"
                  >
                    <View style={[styles.weakIconWrap, { backgroundColor: colors.error + "15" }]}>
                      <Ionicons name="alert-circle" size={18} color={colors.error} />
                    </View>
                    <View style={styles.weakInfo}>
                      <Text style={[styles.weakSubject, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                        {wt.subject}
                      </Text>
                      <Text style={[styles.weakTopic, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                        {wt.topic} - {Math.round(wt.accuracy * 100)}%
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={colors.error} />
                  </PressableCard>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {tr("dashboard.quickPractice")}
            </Text>
          </Animated.View>

          {subjects.map((subject, idx) => {
            const progress = userData.subjectProgress[subject.name];
            const pct = progress ? Math.round((progress.correct / Math.max(progress.total, 1)) * 100) : 0;
            const total = progress?.total || 0;
            const subjectName = language === "bn" ? subject.nameBn : subject.name;
            return (
              <Animated.View key={subject.id} entering={FadeInDown.delay(520 + idx * 50).duration(300)}>
                <PressableCard
                  onPress={() => handleQuickPractice(subject.name)}
                  style={[styles.subjectCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                  accessibilityLabel={`${subjectName}: ${total > 0 ? `${pct}% accuracy` : "Not started"}`}
                  accessibilityHint="Tap to practice this subject"
                >
                  <View style={[styles.subjectIcon, { backgroundColor: subject.color + "15" }]}>
                    <Ionicons name={subject.icon as any} size={20} color={subject.color} />
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={[styles.subjectName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                      {subjectName}
                    </Text>
                    <View style={styles.subjectProgressRow}>
                      {total > 0 ? (
                        <>
                          <View style={[styles.subjectProgressBar, { backgroundColor: colors.borderLight }]}>
                            <View style={[styles.subjectProgressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: subject.color }]} />
                          </View>
                          <Text style={[styles.subjectPct, { color: colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
                            {pct}%
                          </Text>
                        </>
                      ) : (
                        <Text style={[styles.subjectStats, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                          {tr("dashboard.tapToStart")}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </PressableCard>
              </Animated.View>
            );
          })}

          {userData.examHistory.length > 0 && (
            <Animated.View entering={FadeInDown.delay(700).duration(400)}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold", marginTop: 24 }]}>
                {tr("dashboard.recentActivity")}
              </Text>
              {userData.examHistory.slice(0, 5).map((exam) => (
                <Animated.View key={exam.id} entering={FadeInRight.delay(100).duration(300)}>
                  <View
                    style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                    accessibilityRole="text"
                    accessibilityLabel={`${exam.subject}: ${exam.score}% score, ${exam.correctAnswers} of ${exam.totalQuestions} correct`}
                  >
                    <View style={[styles.scoreBadge, { backgroundColor: exam.score >= 70 ? colors.successLight : colors.errorLight }]}>
                      <Text
                        style={[
                          styles.scoreText,
                          { color: exam.score >= 70 ? colors.success : colors.error, fontFamily: "Inter_700Bold" },
                        ]}
                      >
                        {exam.score}%
                      </Text>
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historySubject, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                        {exam.subject}
                      </Text>
                      <Text style={[styles.historyMeta, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                        {exam.correctAnswers}/{exam.totalQuestions} {tr("dashboard.correct")}
                        {exam.topic ? ` - ${exam.topic}` : ""}
                      </Text>
                    </View>
                    <Text style={[styles.historyDate, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                      {new Date(exam.date).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {userData.examHistory.length === 0 && (
            <Animated.View entering={FadeInDown.delay(700).duration(400)} style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="book-outline" size={28} color={colors.primary} />
              </View>
              <Text
                style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}
                accessibilityRole="text"
              >
                {tr("dashboard.startPracticing")}
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomInset + 80 }]}
        onPress={() => {
          if (Platform.OS !== "web") {
            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
          }
          router.push("/chatbot");
        }}
        accessibilityRole="button"
        accessibilityLabel={tr("chatbot.title")}
        accessibilityHint="Open AI Study Coach"
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    paddingBottom: 24,
    overflow: "hidden",
  },
  heroPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  heroCircle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  heroGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  streakContainer: {
    alignItems: "center",
  },
  streakInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroStreakText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  xpBarSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  xpBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    color: "#FCD34D",
  },
  xpBarLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  xpBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: 6,
    backgroundColor: "#FCD34D",
    borderRadius: 3,
  },
  glassStatsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  glassStatCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 4,
    overflow: "hidden",
  },
  glassStatValue: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  glassStatLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  contentContainer: {
    paddingTop: 20,
  },
  dailyGoalCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  dailyGoalRingText: {
    fontSize: 18,
    position: "absolute",
    top: 20,
  },
  dailyGoalRingLabel: {
    fontSize: 10,
    position: "absolute",
    top: 38,
  },
  dailyGoalInfo: {
    flex: 1,
  },
  dailyGoalTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  dailyGoalSub: {
    fontSize: 13,
    marginBottom: 2,
  },
  dailyGoalTime: {
    fontSize: 11,
  },
  dailyGoalCompletedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  dailyGoalCompletedText: {
    fontSize: 12,
  },
  smartMixCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  smartMixContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  smartMixIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  smartMixInfo: { flex: 1 },
  smartMixTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  smartMixDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  sectionTitle: {
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  continueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  continueInfo: { flex: 1 },
  continueLabel: { fontSize: 11, marginBottom: 2 },
  continueSubject: { fontSize: 14 },
  streakCalendar: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  streakCalendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  streakCalendarTitle: {
    fontSize: 15,
  },
  streakCalendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  streakDayCol: {
    alignItems: "center",
    gap: 6,
  },
  streakDayCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  streakDayCount: {
    fontSize: 12,
  },
  streakDayLabel: {
    fontSize: 10,
  },
  weakCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  weakIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  weakInfo: { flex: 1 },
  weakSubject: { fontSize: 14, marginBottom: 2 },
  weakTopic: { fontSize: 12 },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  subjectIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, marginBottom: 6 },
  subjectProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subjectProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  subjectProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  subjectPct: { fontSize: 12, width: 36, textAlign: "right" },
  subjectStats: { fontSize: 12 },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: { fontSize: 14 },
  historyInfo: { flex: 1 },
  historySubject: { fontSize: 14, marginBottom: 2 },
  historyMeta: { fontSize: 12 },
  historyDate: { fontSize: 12 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  leaderboardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodToggle: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  periodBtnText: {
    fontSize: 11,
  },
  leaderboardLoading: {
    paddingVertical: 40,
    alignItems: "center",
  },
  leaderboardContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  rankContainer: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  medalBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 14,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 13,
    marginBottom: 2,
  },
  leaderboardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  leaderboardMetaText: {
    fontSize: 11,
  },
  xpContainer: {
    alignItems: "flex-end",
  },
  xpValue: {
    fontSize: 15,
  },
  xpLabel: {
    fontSize: 10,
  },
  currentUserRankBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  currentUserRankText: {
    fontSize: 13,
  },
  leaderboardEmpty: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 30,
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  leaderboardEmptyText: {
    fontSize: 13,
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  loginPromptText: {
    fontSize: 13,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    overflow: "hidden",
    boxShadow: "0px 4px 12px rgba(26, 115, 232, 0.4)",
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
