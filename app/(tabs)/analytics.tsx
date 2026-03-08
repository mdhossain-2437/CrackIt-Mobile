import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { getWeakTopics } from "@/lib/algorithm";

function AccuracyBar({ name, accuracy, color, index, trAcc }: { name: string; accuracy: number; color: string; index: number; trAcc: string }) {
  const colors = useColors();
  const barColor = accuracy >= 75 ? colors.success : accuracy >= 50 ? colors.warning : colors.error;
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={styles.accuracyRow}>
      <View style={styles.accuracyLabel}>
        <Text style={[styles.accuracyName, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.accuracyPct, { color: barColor, fontFamily: "Inter_700Bold" }]}>
          {accuracy}%
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.borderLight }]}>
        <Animated.View style={[styles.barFill, { width: `${accuracy}%`, backgroundColor: barColor }]} />
      </View>
    </Animated.View>
  );
}

function ScoreHistoryChart({ scores, colors, tr }: { scores: number[]; colors: any; tr: (k: string) => string }) {
  if (scores.length === 0) return null;
  const maxScore = Math.max(...scores, 100);
  const chartHeight = 120;

  return (
    <View style={styles.chartContainer}>
      <View style={[styles.chartArea, { height: chartHeight }]}>
        {scores.map((score, idx) => {
          const height = (score / maxScore) * chartHeight;
          const barColor = score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.error;
          return (
            <View key={idx} style={styles.chartBarWrap}>
              <View style={[styles.chartBar, { height, backgroundColor: barColor }]}>
                <Text style={[styles.chartBarLabel, { color: "#FFF", fontFamily: "Inter_600SemiBold" }]}>
                  {score}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.chartXAxis}>
        {scores.map((_, idx) => (
          <Text key={idx} style={[styles.chartXLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
            {idx + 1}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, tr, language } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const subjectEntries = Object.entries(userData.subjectProgress);
  const examHistory = userData.examHistory || [];
  const weakTopics = getWeakTopics(userData, userData.examType, 5);
  const totalExams = examHistory.length;
  const bestScore = totalExams > 0 ? Math.max(...examHistory.map((e) => e.score)) : 0;
  const avgScore = totalExams > 0 ? Math.round(examHistory.reduce((s, e) => s + e.score, 0) / totalExams) : 0;
  const recentScores = examHistory.slice(0, 15).map((e) => e.score).reverse();

  const avgTimePerQ = totalExams > 0
    ? Math.round(examHistory.reduce((s, e) => s + (e.totalTime / Math.max(e.totalQuestions, 1)), 0) / totalExams)
    : 0;

  const subjectTimes: Record<string, { total: number; count: number }> = {};
  examHistory.forEach((e) => {
    if (!subjectTimes[e.subject]) subjectTimes[e.subject] = { total: 0, count: 0 };
    subjectTimes[e.subject].total += e.totalTime / Math.max(e.totalQuestions, 1);
    subjectTimes[e.subject].count += 1;
  });

  const hasData = totalExams > 0 || subjectEntries.length > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
        {tr("analytics.title")}
      </Text>

      {!hasData ? (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            {tr("analytics.noData")}
          </Text>
        </View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.overviewRow}>
            <View style={[styles.overviewCard, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="documents" size={22} color={colors.primary} />
              <Text style={[styles.overviewValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{totalExams}</Text>
              <Text style={[styles.overviewLabel, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>{tr("analytics.totalExams")}</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: colors.successLight }]}>
              <Ionicons name="trophy" size={22} color={colors.success} />
              <Text style={[styles.overviewValue, { color: colors.success, fontFamily: "Inter_700Bold" }]}>{bestScore}%</Text>
              <Text style={[styles.overviewLabel, { color: colors.success, fontFamily: "Inter_400Regular" }]}>{tr("analytics.bestScore")}</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="time" size={22} color={colors.warning} />
              <Text style={[styles.overviewValue, { color: colors.warning, fontFamily: "Inter_700Bold" }]}>{avgTimePerQ}s</Text>
              <Text style={[styles.overviewLabel, { color: colors.warning, fontFamily: "Inter_400Regular" }]}>{tr("analytics.avgTimePerQ")}</Text>
            </View>
          </Animated.View>

          {subjectEntries.length > 0 && (
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {tr("analytics.subjectAccuracy")}
                </Text>
                {subjectEntries.map(([name, progress], idx) => {
                  const acc = Math.round((progress.correct / Math.max(progress.total, 1)) * 100);
                  return (
                    <AccuracyBar key={name} name={name} accuracy={acc} color={colors.primary} index={idx} trAcc={tr("dashboard.accuracy")} />
                  );
                })}
              </View>
            </Animated.View>
          )}

          {recentScores.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {tr("analytics.scoreHistory")}
                </Text>
                <ScoreHistoryChart scores={recentScores} colors={colors} tr={tr} />
              </View>
            </Animated.View>
          )}

          {weakTopics.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {tr("analytics.weakTopics")}
                </Text>
                {weakTopics.map((wt, idx) => {
                  const acc = Math.round(wt.accuracy * 100);
                  const urgency = acc < 30 ? "critical" : acc < 50 ? "needsWork" : "improving";
                  const urgencyColor = acc < 30 ? colors.error : acc < 50 ? colors.warning : colors.primary;
                  const urgencyBg = acc < 30 ? colors.errorLight : acc < 50 ? colors.warningLight : colors.primaryLight;
                  const urgencyLabel = tr(`analytics.${urgency}`);
                  return (
                    <View key={`${wt.subject}::${wt.topic}`} style={styles.weakItem}>
                      <View style={styles.weakItemInfo}>
                        <Text style={[styles.weakItemSubject, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                          {wt.subject}
                        </Text>
                        <Text style={[styles.weakItemTopic, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                          {wt.topic} - {acc}%
                        </Text>
                      </View>
                      <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                        <Text style={[styles.urgencyText, { color: urgencyColor, fontFamily: "Inter_600SemiBold" }]}>
                          {urgencyLabel}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {Object.keys(subjectTimes).length > 0 && (
            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {tr("analytics.timeAnalysis")}
                </Text>
                {Object.entries(subjectTimes).map(([subject, data]) => {
                  const avgTime = Math.round(data.total / data.count);
                  const isSlow = avgTime > 60;
                  return (
                    <View key={subject} style={styles.timeRow}>
                      <Text style={[styles.timeSubject, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                        {subject}
                      </Text>
                      <View style={[styles.timeBadge, { backgroundColor: isSlow ? colors.errorLight : colors.successLight }]}>
                        <Ionicons name="time-outline" size={14} color={isSlow ? colors.error : colors.success} />
                        <Text style={[styles.timeValue, { color: isSlow ? colors.error : colors.success, fontFamily: "Inter_600SemiBold" }]}>
                          {avgTime}s
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {weakTopics.length > 0 && (
            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <View style={[styles.sectionCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary + "30" }]}>
                <View style={styles.aiRecHeader}>
                  <Ionicons name="sparkles" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold", marginBottom: 0, marginLeft: 8 }]}>
                    {tr("analytics.aiRecommendation")}
                  </Text>
                </View>
                <Text style={[styles.aiRecText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                  {tr("analytics.studyFocus")}:
                </Text>
                {weakTopics.slice(0, 3).map((wt) => (
                  <View key={`rec-${wt.subject}-${wt.topic}`} style={styles.aiRecItem}>
                    <Ionicons name="arrow-forward-circle" size={16} color={colors.primary} />
                    <Text style={[styles.aiRecItemText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                      {wt.subject} → {wt.topic}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: 20, marginBottom: 20 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 16,
  },
  emptyText: { fontSize: 15, textAlign: "center", paddingHorizontal: 40 },
  overviewRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 6,
  },
  overviewValue: { fontSize: 20 },
  overviewLabel: { fontSize: 11 },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 16, marginBottom: 14 },
  accuracyRow: { marginBottom: 12 },
  accuracyLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  accuracyName: { fontSize: 13, flex: 1 },
  accuracyPct: { fontSize: 13 },
  barTrack: { height: 8, borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  chartContainer: { marginTop: 4 },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  chartBarWrap: {
    flex: 1,
    alignItems: "center",
  },
  chartBar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 20,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 2,
  },
  chartBarLabel: { fontSize: 9 },
  chartXAxis: {
    flexDirection: "row",
    marginTop: 6,
    gap: 4,
  },
  chartXLabel: { flex: 1, textAlign: "center", fontSize: 10 },
  weakItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weakItemInfo: { flex: 1 },
  weakItemSubject: { fontSize: 13, marginBottom: 2 },
  weakItemTopic: { fontSize: 12 },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: { fontSize: 11 },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeSubject: { fontSize: 13, flex: 1 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeValue: { fontSize: 12 },
  aiRecHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  aiRecText: { fontSize: 13, marginBottom: 8 },
  aiRecItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    paddingLeft: 4,
  },
  aiRecItemText: { fontSize: 13 },
});
