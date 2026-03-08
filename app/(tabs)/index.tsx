import React from "react";
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
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
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
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
