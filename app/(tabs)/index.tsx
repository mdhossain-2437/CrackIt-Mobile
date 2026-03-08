import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {tr("dashboard.welcomeBack")}{greeting ? `, ${greeting}` : ""}
            </Text>
            <Text style={[styles.examBadge, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {examName} {tr("dashboard.prep")}
            </Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: colors.streak + "20" }]}>
            <Ionicons name="flame" size={18} color={colors.streak} />
            <Text style={[styles.streakText, { color: colors.streak, fontFamily: "Inter_700Bold" }]}>
              {userData.streak}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {userData.totalQuestionsSolved}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {tr("dashboard.solved")}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Ionicons name="analytics-outline" size={22} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {accuracy}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {tr("dashboard.accuracy")}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Ionicons name="star-outline" size={22} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {userData.xp}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {tr("dashboard.xp")}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Pressable
            style={[styles.adaptiveBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdaptivePractice}
          >
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
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.leaderboardHeader}>
            <View style={styles.leaderboardTitleRow}>
              <Ionicons name="trophy" size={20} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold", marginBottom: 0, paddingHorizontal: 0 }]}>
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
          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {tr("dashboard.weakTopics")}
            </Text>
            {weakTopics.map((wt, idx) => (
              <Animated.View key={`${wt.subject}::${wt.topic}`} entering={FadeInRight.delay(400 + idx * 80).duration(300)}>
                <Pressable
                  style={[styles.weakCard, { backgroundColor: colors.errorLight, borderColor: colors.error + "30" }]}
                  onPress={() => handleWeakTopicPractice(wt.subject, wt.topic)}
                >
                  <View style={styles.weakInfo}>
                    <Text style={[styles.weakSubject, { color: colors.error, fontFamily: "Inter_600SemiBold" }]}>
                      {wt.subject}
                    </Text>
                    <Text style={[styles.weakTopic, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                      {wt.topic} - {Math.round(wt.accuracy * 100)}% {tr("dashboard.accuracy").toLowerCase()}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color={colors.error} />
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {isAuthenticated && authUser?.educationLevel && (
          <Animated.View entering={FadeInDown.delay(420).duration(400)}>
            <View style={[styles.recommendCard, {
              backgroundColor: colors.primaryLight,
              borderColor: colors.primary + "30",
              boxShadow: `0px 2px 8px ${colors.primary}1A`,
              elevation: 3,
            }]}>
              <View style={styles.recommendHeader}>
                <Ionicons name="bulb" size={20} color={colors.primary} />
                <Text style={[styles.recommendTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
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

        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {tr("dashboard.quickPractice")}
          </Text>
        </Animated.View>

        {subjects.map((subject, idx) => {
          const progress = userData.subjectProgress[subject.name];
          const pct = progress ? Math.round((progress.correct / Math.max(progress.total, 1)) * 100) : 0;
          const total = progress?.total || 0;
          const subjectName = language === "bn" ? subject.nameBn : subject.name;
          return (
            <Animated.View key={subject.id} entering={FadeInDown.delay(500 + idx * 60).duration(300)}>
              <Pressable
                style={[styles.subjectCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                onPress={() => handleQuickPractice(subject.name)}
              >
                <View style={[styles.subjectIcon, { backgroundColor: subject.color + "20" }]}>
                  <Ionicons name={subject.icon as any} size={20} color={subject.color} />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {subjectName}
                  </Text>
                  <Text style={[styles.subjectStats, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                    {total > 0 ? `${total} ${tr("common.solved")} - ${pct}% ${tr("dashboard.accuracy").toLowerCase()}` : tr("dashboard.startPracticing")}
                  </Text>
                </View>
                <Ionicons name="play-circle-outline" size={28} color={colors.primary} />
              </Pressable>
            </Animated.View>
          );
        })}

        {userData.examHistory.length > 0 && (
          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold", marginTop: 24 }]}>
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
          <Animated.View entering={FadeInDown.delay(700).duration(400)} style={[styles.emptyState, { borderColor: colors.border }]}>
            <Ionicons name="book-outline" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
              {tr("dashboard.startPracticing")}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomInset + 80 }]}
        onPress={() => router.push("/chatbot")}
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: { fontSize: 14, marginBottom: 4 },
  examBadge: { fontSize: 24 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: { fontSize: 16 },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
    elevation: 2,
  },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 12 },
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
  weakCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  weakInfo: { flex: 1 },
  weakSubject: { fontSize: 13, marginBottom: 2 },
  weakTopic: { fontSize: 12 },
  sectionTitle: {
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recommendCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  recommendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
    elevation: 1,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, marginBottom: 2 },
  subjectStats: { fontSize: 12 },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 12,
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
    borderRadius: 14,
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
    borderRadius: 14,
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
    borderRadius: 10,
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
    elevation: 5,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
  },
});
