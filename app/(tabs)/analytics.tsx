import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { getWeakTopics } from "@/lib/algorithm";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function AnimatedBar({ accuracy, barColor, index }: { accuracy: number; barColor: string; index: number }) {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withDelay(index * 100, withTiming(accuracy, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [accuracy]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return <Animated.View style={[styles.barFill, { backgroundColor: barColor }, animStyle]} />;
}

function AccuracyRow({ name, accuracy, index }: { name: string; accuracy: number; index: number }) {
  const colors = useColors();
  const barColor = accuracy >= 75 ? colors.success : accuracy >= 50 ? colors.warning : colors.error;
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={styles.accuracyRow}>
      <View style={styles.accuracyLabel}>
        <View style={[styles.accuracyDot, { backgroundColor: barColor }]} />
        <Text style={[styles.accuracyName, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.accuracyPct, { color: barColor, fontFamily: "Inter_700Bold" }]}>
          {accuracy}%
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.borderLight }]}>
        <AnimatedBar accuracy={accuracy} barColor={barColor} index={index} />
      </View>
    </Animated.View>
  );
}

function AnimatedChartBar({ score, maxScore, chartHeight, index, colors }: { score: number; maxScore: number; chartHeight: number; index: number; colors: any }) {
  const heightAnim = useSharedValue(0);
  const targetHeight = (score / maxScore) * chartHeight;
  const barColor = score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.error;

  useEffect(() => {
    heightAnim.value = withDelay(index * 60, withTiming(targetHeight, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [targetHeight]);

  const animStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
  }));

  return (
    <View style={styles.chartBarWrap}>
      <Animated.View style={[styles.chartBar, { backgroundColor: barColor }, animStyle]}>
        <Text style={[styles.chartBarLabel, { color: "#FFF", fontFamily: "Inter_600SemiBold" }]}>
          {score}
        </Text>
      </Animated.View>
    </View>
  );
}

function HeatmapCell({ active, intensity, dayLabel, colors }: { active: boolean; intensity: number; dayLabel: string; colors: any }) {
  const bgColor = !active
    ? colors.borderLight
    : intensity >= 0.75
    ? colors.success
    : intensity >= 0.5
    ? colors.success + "AA"
    : intensity >= 0.25
    ? colors.success + "55"
    : colors.success + "25";

  return (
    <View style={styles.heatmapCellWrap}>
      <View style={[styles.heatmapCell, { backgroundColor: bgColor }]} />
      <Text style={[styles.heatmapLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
        {dayLabel}
      </Text>
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
  const recentScores = examHistory.slice(0, 10).map((e) => e.score).reverse();

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

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayExams = examHistory.filter((e) => e.date.startsWith(dateStr));
    const dayNames = language === "bn"
      ? ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
      label: dayNames[d.getDay()],
      active: dayExams.length > 0,
      intensity: Math.min(dayExams.length / 3, 1),
    };
  });

  const chartHeight = 110;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.primary + "15", colors.background]}
        style={[styles.headerArea, { paddingTop: topInset + 16 }]}
      >
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          {tr("analytics.title")}
        </Text>
      </LinearGradient>

      {!hasData ? (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="bar-chart-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            {tr("analytics.noData")}
          </Text>
        </View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.overviewRow}>
            {[
              { icon: "documents", value: `${totalExams}`, label: tr("analytics.totalExams"), gradient: [colors.primary, colors.primaryDark] },
              { icon: "trophy", value: `${bestScore}%`, label: tr("analytics.bestScore"), gradient: [colors.success, "#2E8B57"] },
              { icon: "time", value: `${avgTimePerQ}s`, label: tr("analytics.avgTimePerQ"), gradient: [colors.warning, "#E5A100"] },
            ].map((item, idx) => (
              <Animated.View key={item.label} entering={FadeInRight.delay(idx * 100).duration(400)} style={styles.overviewCardWrap}>
                <LinearGradient
                  colors={item.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.overviewCard}
                >
                  <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
                  <Text style={[styles.overviewValue, { fontFamily: "Inter_700Bold" }]}>
                    {item.value}
                  </Text>
                  <Text style={[styles.overviewLabel, { fontFamily: "Inter_400Regular" }]}>
                    {item.label}
                  </Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {language === "bn" ? "সাপ্তাহিক কার্যকলাপ" : "Weekly Activity"}
                </Text>
              </View>
              <View style={styles.heatmapRow}>
                {last7Days.map((day, idx) => (
                  <HeatmapCell key={idx} {...day} colors={colors} />
                ))}
              </View>
            </View>
          </Animated.View>

          {subjectEntries.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="stats-chart" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {tr("analytics.subjectAccuracy")}
                  </Text>
                </View>
                {subjectEntries.map(([name, progress], idx) => {
                  const acc = Math.round((progress.correct / Math.max(progress.total, 1)) * 100);
                  return <AccuracyRow key={name} name={name} accuracy={acc} index={idx} />;
                })}
              </View>
            </Animated.View>
          )}

          {recentScores.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trending-up" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {tr("analytics.scoreHistory")}
                  </Text>
                  <View style={[styles.avgBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.avgBadgeText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      {language === "bn" ? "গড়" : "Avg"}: {avgScore}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.chartArea, { height: chartHeight }]}>
                  {recentScores.map((score, idx) => (
                    <AnimatedChartBar key={idx} score={score} maxScore={100} chartHeight={chartHeight} index={idx} colors={colors} />
                  ))}
                </View>
                <View style={styles.chartXAxis}>
                  {recentScores.map((_, idx) => (
                    <Text key={idx} style={[styles.chartXLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                      {idx + 1}
                    </Text>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {weakTopics.length > 0 && (
            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning" size={18} color={colors.error} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {tr("analytics.weakTopics")}
                  </Text>
                </View>
                {weakTopics.map((wt, idx) => {
                  const acc = Math.round(wt.accuracy * 100);
                  const urgencyColor = acc < 30 ? colors.error : acc < 50 ? colors.warning : colors.primary;
                  const urgencyBg = acc < 30 ? colors.errorLight : acc < 50 ? colors.warningLight : colors.primaryLight;
                  const urgencyLabel = acc < 30 ? tr("analytics.critical") : acc < 50 ? tr("analytics.needsWork") : tr("analytics.improving");
                  return (
                    <View key={`${wt.subject}::${wt.topic}`} style={[styles.weakItem, idx < weakTopics.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                      <View style={styles.weakItemInfo}>
                        <Text style={[styles.weakItemSubject, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                          {wt.subject}
                        </Text>
                        <Text style={[styles.weakItemTopic, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                          {wt.topic} - {acc}%
                        </Text>
                      </View>
                      <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                        <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
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
            <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="speedometer" size={18} color={colors.warning} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {tr("analytics.timeAnalysis")}
                  </Text>
                </View>
                {Object.entries(subjectTimes).map(([subject, data], idx) => {
                  const avgTime = Math.round(data.total / data.count);
                  const isSlow = avgTime > 60;
                  return (
                    <View key={subject} style={[styles.timeRow, idx < Object.keys(subjectTimes).length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
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
            <Animated.View entering={FadeInDown.delay(700).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <LinearGradient
                colors={[colors.primary + "18", colors.primary + "08"]}
                style={[styles.aiCard, { borderColor: colors.primary + "30" }]}
              >
                <View style={styles.sectionHeader}>
                  <View style={[styles.aiIconWrap, { backgroundColor: colors.primary + "20" }]}>
                    <Ionicons name="sparkles" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {language === "bn" ? "AI ইনসাইটস" : "AI Insights"}
                  </Text>
                </View>
                <Text style={[styles.aiRecText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                  {tr("analytics.studyFocus")}:
                </Text>
                {weakTopics.slice(0, 3).map((wt) => (
                  <View key={`rec-${wt.subject}-${wt.topic}`} style={styles.aiRecItem}>
                    <View style={[styles.aiRecDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.aiRecItemText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                      {wt.subject} → {wt.topic}
                    </Text>
                  </View>
                ))}
                <View style={[styles.aiTipCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="bulb" size={16} color={colors.warning} />
                  <Text style={[styles.aiTipText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                    {language === "bn"
                      ? "প্রতিদিন ২০ মিনিট দুর্বল বিষয়ে অনুশীলন করুন"
                      : "Practice weak topics for 20 minutes daily for best results"}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 16,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  overviewRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  overviewCardWrap: {
    flex: 1,
  },
  overviewCard: {
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 6,
  },
  overviewValue: {
    fontSize: 22,
    color: "#FFFFFF",
  },
  overviewLabel: {
    fontSize: 10,
    color: "#FFFFFFCC",
    textAlign: "center",
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    flex: 1,
  },
  avgBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  avgBadgeText: {
    fontSize: 11,
  },
  heatmapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  heatmapCellWrap: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  heatmapCell: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  heatmapLabel: {
    fontSize: 9,
  },
  accuracyRow: {
    marginBottom: 14,
  },
  accuracyLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accuracyName: {
    fontSize: 13,
    flex: 1,
  },
  accuracyPct: {
    fontSize: 13,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
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
    borderRadius: 6,
    minHeight: 20,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 2,
  },
  chartBarLabel: {
    fontSize: 9,
  },
  chartXAxis: {
    flexDirection: "row",
    marginTop: 6,
    gap: 4,
  },
  chartXLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  weakItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  weakItemInfo: {
    flex: 1,
  },
  weakItemSubject: {
    fontSize: 13,
    marginBottom: 2,
  },
  weakItemTopic: {
    fontSize: 12,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 11,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  timeSubject: {
    fontSize: 13,
    flex: 1,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  timeValue: {
    fontSize: 12,
  },
  aiCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  aiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  aiRecText: {
    fontSize: 13,
    marginBottom: 10,
  },
  aiRecItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    paddingLeft: 4,
  },
  aiRecDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aiRecItemText: {
    fontSize: 13,
  },
  aiTipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  aiTipText: {
    fontSize: 12,
    flex: 1,
  },
});
