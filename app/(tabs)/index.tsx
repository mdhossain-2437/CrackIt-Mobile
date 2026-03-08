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
  interpolate,
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
  getRecommendedExamTypes,
} from "@/lib/questions";
import { getWeakTopics, getAdaptiveQuestions } from "@/lib/algorithm";
import { apiRequest } from "@/lib/query-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAILY_GOAL = 10;

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

function getTimeGreeting(tr: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return tr("dashboard.goodMorning");
  if (hour < 17) return tr("dashboard.goodAfternoon");
  return tr("dashboard.goodEvening");
}

function ProgressRing({ progress, size, strokeWidth, color, bgColor }: { progress: number; size: number; strokeWidth: number; color: string; bgColor: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={{ width: size, height: size }}>
      <View style={{ position: "absolute", width: size, height: size }}>
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
        }} />
      </View>
      <View style={{
        width: size,
        height: size,
        transform: [{ rotate: "-90deg" }],
      }}>
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: "transparent",
          borderTopColor: color,
          borderRightColor: progress > 0.25 ? color : "transparent",
          borderBottomColor: progress > 0.5 ? color : "transparent",
          borderLeftColor: progress > 0.75 ? color : "transparent",
        }} />
      </View>
    </View>
  );
}

function PressableCard({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
        }
        onPress?.();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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
    <Animated.View style={flameStyle}>
      <Ionicons name="flame" size={22} color={colors.streak} />
    </Animated.View>
  );
}

function AnimatedStatCard({ icon, value, label, iconColor, colors, delay }: { icon: string; value: string | number; label: string; iconColor: string; colors: any; delay: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={[animStyle, styles.glassStatCard]}>
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

function SubjectCardItem({ subject, progress, language, colors, onPress, idx }: any) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pct = progress ? Math.round((progress.correct / Math.max(progress.total, 1)) * 100) : 0;
  const total = progress?.total || 0;
  const subjectName = language === "bn" ? subject.nameBn : subject.name;

  return (
    <Animated.View entering={FadeInDown.delay(500 + idx * 50).duration(300)}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        onPress={() => {
          if (Platform.OS !== "web") {
            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
          }
          onPress();
        }}
      >
        <Animated.View style={[animStyle, styles.subjectCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
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
                  Tap to start
                </Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Animated.View>
      </Pressable>
    </Animated.View>
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

  const todayExams = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return userData.examHistory.filter((e) => e.date.startsWith(today));
  }, [userData.examHistory]);

  const questionsToday = useMemo(() => {
    return todayExams.reduce((sum, e) => sum + e.totalQuestions, 0);
  }, [todayExams]);

  const dailyProgress = Math.min(questionsToday / DAILY_GOAL, 1);

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

  const handleAdaptivePractice = () => {
    if (Platform.OS !== "web") {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    }
    const questions = getAdaptiveQuestions(userData, userData.examType, 10, language);
    if (questions.length === 0) return;
    startExam({
      subject: tr("dashboard.adaptivePractice"),
      count: questions.length,
      timePerQuestion: 60,
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

  const handleTodayChallenge = () => {
    if (Platform.OS !== "web") {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
    }
    const questions = getAdaptiveQuestions(userData, userData.examType, 15, language);
    if (questions.length === 0) return;
    startExam({
      subject: tr("dashboard.todaysChallenge"),
      count: questions.length,
      timePerQuestion: 45,
      questions,
    });
    router.push("/exam");
  };

  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"alltime" | "weekly">("alltime");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (period: "alltime" | "weekly") => {
    setLeaderboardLoading(true);
    try {
      const res = await apiRequest("GET", `/api/leaderboard?period=${period}&limit=10`);
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
              <Text style={[styles.heroGreeting, { fontFamily: "Inter_400Regular" }]}>
                {timeGreeting}{greeting ? `, ${greeting}` : ""}
              </Text>
              <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>
                {examName} {tr("dashboard.prep")}
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <View style={styles.streakInner}>
                <StreakFlame streak={userData.streak} colors={colors} />
                <Text style={[styles.heroStreakText, { fontFamily: "Inter_700Bold" }]}>
                  {userData.streak}
                </Text>
              </View>
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

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.dailyGoalRow}>
            <View style={styles.dailyGoalInfo}>
              <Text style={[styles.dailyGoalLabel, { fontFamily: "Inter_500Medium" }]}>
                {tr("dashboard.dailyGoal")}
              </Text>
              <Text style={[styles.dailyGoalProgress, { fontFamily: "Inter_400Regular" }]}>
                {questionsToday}/{DAILY_GOAL} {tr("dashboard.questionsToday")}
              </Text>
            </View>
            <View style={styles.dailyGoalBarContainer}>
              <View style={styles.dailyGoalBarBg}>
                <View style={[styles.dailyGoalBarFill, { width: `${Math.min(dailyProgress * 100, 100)}%` }]} />
              </View>
            </View>
            {dailyProgress >= 1 && (
              <Text style={[styles.dailyGoalComplete, { fontFamily: "Inter_700Bold" }]}>
                {tr("dashboard.completed")}
              </Text>
            )}
          </Animated.View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {lastIncompleteSubject && (
            <Animated.View entering={FadeInDown.delay(320).duration(400)}>
              <PressableCard onPress={handleContinuePractice} style={[styles.continueCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
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

          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <PressableCard onPress={handleTodayChallenge}>
              <LinearGradient
                colors={[colors.challengeGradientStart, colors.challengeGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.challengeCard}
              >
                <View style={styles.challengeContent}>
                  <View style={styles.challengeIconWrap}>
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.challengeInfo}>
                    <Text style={[styles.challengeTitle, { fontFamily: "Inter_700Bold" }]}>
                      {tr("dashboard.todaysChallenge")}
                    </Text>
                    <Text style={[styles.challengeDesc, { fontFamily: "Inter_400Regular" }]}>
                      15 {tr("practice.questions")} + 50 {tr("dashboard.bonusXP")}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </PressableCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(380).duration(400)}>
            <PressableCard onPress={handleAdaptivePractice} style={[styles.adaptiveBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="flash" size={20} color="#FFFFFF" />
              <View style={styles.adaptiveBtnInfo}>
                <Text style={[styles.adaptiveBtnTitle, { fontFamily: "Inter_600SemiBold" }]}>
                  {tr("dashboard.adaptivePractice")}
                </Text>
                <Text style={[styles.adaptiveBtnDesc, { fontFamily: "Inter_400Regular" }]}>
                  {tr("practice.adaptiveDesc")}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </PressableCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={styles.leaderboardHeader}>
              <View style={styles.leaderboardTitleRow}>
                <Ionicons name="trophy" size={20} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold", marginBottom: 0, paddingHorizontal: 0 }]}>
                  {tr("leaderboard.title")}
                </Text>
              </View>
              <View style={[styles.periodToggle, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Pressable
                  style={[
                    styles.periodBtn,
                    leaderboardPeriod === "alltime" && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setLeaderboardPeriod("alltime")}
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
              <View style={styles.leaderboardLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : leaderboardData && leaderboardData.entries.length > 0 ? (
              <View style={[styles.leaderboardContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                {leaderboardData.entries.slice(0, 10).map((entry, idx) => {
                  const isCurrentUser = leaderboardData.currentUserId === entry.userId;
                  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                  const hasMedal = idx < 3;
                  return (
                    <View
                      key={entry.userId}
                      style={[
                        styles.leaderboardRow,
                        isCurrentUser && { backgroundColor: colors.primaryLight },
                        idx < leaderboardData.entries.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                      ]}
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

                {isAuthenticated && leaderboardData.currentUserRank && leaderboardData.currentUserRank > 10 && (
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
              >
                <Ionicons name="log-in-outline" size={16} color={colors.primary} />
                <Text style={[styles.loginPromptText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  {tr("leaderboard.loginToSee")}
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {weakTopics.length > 0 && (
            <Animated.View entering={FadeInDown.delay(420).duration(400)}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {tr("dashboard.weakTopics")}
              </Text>
              {weakTopics.map((wt, idx) => (
                <Animated.View key={`${wt.subject}::${wt.topic}`} entering={FadeInRight.delay(450 + idx * 80).duration(300)}>
                  <PressableCard
                    onPress={() => handleWeakTopicPractice(wt.subject, wt.topic)}
                    style={[styles.weakCard, { backgroundColor: colors.errorLight, borderColor: colors.error + "20" }]}
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

          {isAuthenticated && authUser?.educationLevel && (
            <Animated.View entering={FadeInDown.delay(480).duration(400)}>
              <View style={[styles.recommendCard, {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary + "20",
              }]}>
                <View style={styles.recommendHeader}>
                  <View style={[styles.recommendIconWrap, { backgroundColor: colors.primary + "15" }]}>
                    <Ionicons name="bulb" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.recommendTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {tr("recommendation.title")}
                  </Text>
                </View>
                <Text style={[styles.recommendText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                  {tr(`recommendation.${authUser.educationLevel}`)}
                </Text>
                {weakTopics.length > 0 && (
                  <View style={styles.recommendWeak}>
                    <Ionicons name="alert-circle" size={14} color={colors.warning} />
                    <Text style={[styles.recommendWeakText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                      {tr("recommendation.weakArea")}: {weakTopics[0].subject} - {weakTopics[0].topic}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {tr("dashboard.quickPractice")}
            </Text>
          </Animated.View>

          {subjects.map((subject, idx) => {
            const progress = userData.subjectProgress[subject.name];
            return (
              <SubjectCardItem
                key={subject.id}
                subject={subject}
                progress={progress}
                language={language}
                colors={colors}
                onPress={() => handleQuickPractice(subject.name)}
                idx={idx}
              />
            );
          })}

          {userData.examHistory.length > 0 && (
            <Animated.View entering={FadeInDown.delay(700).duration(400)}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold", marginTop: 24 }]}>
                {tr("dashboard.recentActivity")}
              </Text>
              {userData.examHistory.slice(0, 5).map((exam) => (
                <View
                  key={exam.id}
                  style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
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
              ))}
            </Animated.View>
          )}

          {userData.examHistory.length === 0 && (
            <Animated.View entering={FadeInDown.delay(700).duration(400)} style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="book-outline" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
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
    marginBottom: 20,
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
  dailyGoalRow: {
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  dailyGoalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dailyGoalLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  dailyGoalProgress: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  dailyGoalBarContainer: {
    height: 6,
  },
  dailyGoalBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  dailyGoalBarFill: {
    height: 6,
    backgroundColor: "#6EE7B7",
    borderRadius: 3,
  },
  dailyGoalComplete: {
    fontSize: 12,
    color: "#6EE7B7",
    marginTop: 4,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 20,
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 14,
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
  challengeCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    overflow: "hidden",
  },
  challengeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  challengeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  challengeInfo: { flex: 1 },
  challengeTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  challengeDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  adaptiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  adaptiveBtnInfo: { flex: 1 },
  adaptiveBtnTitle: { fontSize: 15, color: "#FFFFFF", marginBottom: 2 },
  adaptiveBtnDesc: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  sectionTitle: {
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
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
  recommendCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  recommendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  recommendIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendTitle: { fontSize: 15 },
  recommendText: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  recommendWeak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  recommendWeakText: { fontSize: 12 },
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
