import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  RefreshControl,
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
import { getWeakTopics, predictPerformance, getPerformanceTrend } from "@/lib/algorithm";

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
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={styles.accuracyRow} accessibilityLabel={`${name}: ${accuracy}% accuracy`} accessibilityRole="text">
      <View style={styles.accuracyLabel}>
        <View style={[styles.accuracyDot, { backgroundColor: barColor }]} />
        <Text style={[styles.accuracyName, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.accuracyPct, { color: barColor, fontFamily: "Inter_700Bold" }]}>
          {accuracy}%
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.borderLight }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: accuracy }}>
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

function AnimatedCountUp({ target, suffix, style }: { target: number; suffix?: string; style: any }) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(target, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [target]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <Animated.View style={animStyle}>
      <Text style={style}>{target}{suffix || ""}</Text>
    </Animated.View>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, tr, language } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const subjectEntries = Object.entries(userData.subjectProgress);
  const examHistory = userData.examHistory || [];
  const weakTopics = getWeakTopics(userData, userData.examType, 5);
  const totalExams = examHistory.length;
  const totalQuestions = userData.totalQuestionsSolved;
  const overallAccuracy = totalQuestions > 0 ? Math.round((userData.totalCorrect / totalQuestions) * 100) : 0;
  const avgScore = totalExams > 0 ? Math.round(examHistory.reduce((s, e) => s + e.score, 0) / totalExams) : 0;
  const recentScores = examHistory.slice(0, 20).map((e) => e.score).reverse();

  const totalStudyTimeSec = examHistory.reduce((s, e) => s + e.totalTime, 0);
  const totalStudyMinutes = Math.round(totalStudyTimeSec / 60);
  const studyTimeDisplay = totalStudyMinutes >= 60
    ? `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`
    : `${totalStudyMinutes}m`;

  const prediction = useMemo(() => predictPerformance(userData, userData.examType), [userData]);
  const trends = useMemo(() => getPerformanceTrend(userData, userData.examType), [userData]);

  const topicEntries = Object.entries(userData.topicProgress);

  const timeDistribution = useMemo(() => {
    const buckets = { morning: 0, afternoon: 0, evening: 0 };
    examHistory.forEach((e) => {
      const hour = new Date(e.date).getHours();
      if (hour >= 5 && hour < 12) buckets.morning++;
      else if (hour >= 12 && hour < 17) buckets.afternoon++;
      else buckets.evening++;
    });
    const total = buckets.morning + buckets.afternoon + buckets.evening;
    return {
      morning: total > 0 ? Math.round((buckets.morning / total) * 100) : 0,
      afternoon: total > 0 ? Math.round((buckets.afternoon / total) * 100) : 0,
      evening: total > 0 ? Math.round((buckets.evening / total) * 100) : 0,
      peak: buckets.morning >= buckets.afternoon && buckets.morning >= buckets.evening
        ? "morning"
        : buckets.afternoon >= buckets.evening
        ? "afternoon"
        : "evening",
    };
  }, [examHistory]);

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

  const examTypeLabel = language === "bn"
    ? tr(`exam_type.${userData.examType}`)
    : tr(`exam_type.${userData.examType}`);

  const trendIcon = prediction.trend === "improving" ? "trending-up" : prediction.trend === "declining" ? "trending-down" : "remove-outline";
  const trendColor = prediction.trend === "improving" ? colors.success : prediction.trend === "declining" ? colors.error : colors.warning;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
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
        <View style={[styles.emptyState, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="bar-chart-outline" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {language === "bn" ? "এখনো কোনো ডেটা নেই" : "No Data Yet"}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {tr("analytics.noData")}
          </Text>
        </View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.overviewGrid}>
            {[
              { icon: "help-circle", value: `${totalQuestions}`, label: language === "bn" ? "মোট প্রশ্ন" : "Total Questions", gradient: [colors.primary, colors.primaryDark] },
              { icon: "checkmark-circle", value: `${overallAccuracy}%`, label: tr("dashboard.accuracy"), gradient: [colors.success, "#2E8B57"] },
              { icon: "time", value: studyTimeDisplay, label: language === "bn" ? "পড়ার সময়" : "Study Time", gradient: [colors.warning, "#E5A100"] },
              { icon: "flame", value: `${userData.streak}`, label: language === "bn" ? "ধারাবাহিকতা" : "Streak", gradient: [colors.streak, "#C2410C"] },
            ].map((item, idx) => (
              <Animated.View key={item.label} entering={FadeInRight.delay(idx * 80).duration(400)} style={styles.overviewCardWrap}>
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

          {topicEntries.length > 0 && (
            <Animated.View entering={FadeInDown.delay(450).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="grid" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {language === "bn" ? "বিষয় দক্ষতা" : "Topic Mastery"}
                  </Text>
                </View>
                <View style={styles.masteryGrid}>
                  {topicEntries.map(([key, progress]) => {
                    const acc = progress.total > 0 ? progress.correct / progress.total : 0;
                    const parts = key.split("::");
                    const topicName = parts[1] || parts[0];
                    const cellColor = progress.total === 0
                      ? colors.borderLight
                      : acc >= 0.8
                      ? colors.success
                      : acc >= 0.6
                      ? colors.success + "88"
                      : acc >= 0.4
                      ? colors.warning
                      : colors.error;
                    return (
                      <View
                        key={key}
                        style={[styles.masteryCell, { backgroundColor: cellColor + "30", borderColor: cellColor }]}
                      >
                        <Text style={[styles.masteryCellText, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                          {topicName}
                        </Text>
                        <Text style={[styles.masteryCellPct, { color: cellColor, fontFamily: "Inter_700Bold" }]}>
                          {Math.round(acc * 100)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.masteryLegend}>
                  {[
                    { label: language === "bn" ? "দুর্বল" : "Weak", color: colors.error },
                    { label: language === "bn" ? "মাঝারি" : "Fair", color: colors.warning },
                    { label: language === "bn" ? "ভালো" : "Good", color: colors.success + "88" },
                    { label: language === "bn" ? "দক্ষ" : "Mastered", color: colors.success },
                  ].map((item) => (
                    <View key={item.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.legendText, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {totalQuestions >= 5 && (
            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <LinearGradient
                colors={[colors.primary + "12", colors.primary + "06"]}
                style={[styles.predictionCard, { borderColor: colors.primary + "25" }]}
              >
                <View style={styles.sectionHeader}>
                  <View style={[styles.predictionIconWrap, { backgroundColor: colors.primary + "20" }]}>
                    <Ionicons name="analytics" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {language === "bn" ? "ভবিষ্যদ্বাণী" : "Predicted Performance"}
                  </Text>
                </View>
                <View style={styles.predictionBody}>
                  <View style={styles.predictionScoreWrap}>
                    <Text style={[styles.predictionScore, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                      {prediction.predictedAccuracy}%
                    </Text>
                    <View style={[styles.trendBadge, { backgroundColor: trendColor + "20" }]}>
                      <Ionicons name={trendIcon as any} size={14} color={trendColor} />
                      <Text style={[styles.trendText, { color: trendColor, fontFamily: "Inter_600SemiBold" }]}>
                        {prediction.trend === "improving"
                          ? (language === "bn" ? "উন্নতি" : "Improving")
                          : prediction.trend === "declining"
                          ? (language === "bn" ? "অবনতি" : "Declining")
                          : (language === "bn" ? "স্থিতিশীল" : "Stable")}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.predictionDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                    {language === "bn"
                      ? `আপনি সম্ভবত ${examTypeLabel} পরীক্ষায় ${prediction.predictedAccuracy}% স্কোর করবেন`
                      : `You're likely to score ${prediction.predictedAccuracy}% on ${examTypeLabel}`}
                  </Text>
                  <View style={[styles.confidenceMeter, { backgroundColor: colors.borderLight }]}>
                    <View style={[styles.confidenceFill, { width: `${prediction.confidence}%`, backgroundColor: colors.primary + "60" }]} />
                  </View>
                  <Text style={[styles.confidenceLabel, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                    {language === "bn" ? `আত্মবিশ্বাস: ${prediction.confidence}%` : `Confidence: ${prediction.confidence}%`}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {weakTopics.length > 0 && (
            <Animated.View entering={FadeInDown.delay(550).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
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

          {totalExams > 0 && (
            <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="sunny" size={18} color={colors.warning} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {language === "bn" ? "সময় বিতরণ" : "Time Distribution"}
                  </Text>
                </View>
                {[
                  { label: language === "bn" ? "সকাল (৫-১২)" : "Morning (5-12)", pct: timeDistribution.morning, icon: "sunny-outline" as const, color: colors.warning },
                  { label: language === "bn" ? "দুপুর (১২-৫)" : "Afternoon (12-5)", pct: timeDistribution.afternoon, icon: "partly-sunny-outline" as const, color: colors.streak },
                  { label: language === "bn" ? "সন্ধ্যা/রাত" : "Evening/Night", pct: timeDistribution.evening, icon: "moon-outline" as const, color: colors.primary },
                ].map((slot, idx) => (
                  <View key={slot.label} style={[styles.timeDistRow, idx < 2 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                    <View style={styles.timeDistLeft}>
                      <Ionicons name={slot.icon} size={16} color={slot.color} />
                      <Text style={[styles.timeDistLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                        {slot.label}
                      </Text>
                    </View>
                    <View style={styles.timeDistRight}>
                      <View style={[styles.timeDistBar, { backgroundColor: colors.borderLight }]}>
                        <View style={[styles.timeDistFill, { width: `${slot.pct}%`, backgroundColor: slot.color + "80" }]} />
                      </View>
                      <Text style={[styles.timeDistPct, { color: slot.color, fontFamily: "Inter_600SemiBold" }]}>
                        {slot.pct}%
                      </Text>
                    </View>
                  </View>
                ))}
                {timeDistribution.peak && (
                  <View style={[styles.peakBadge, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="star" size={12} color={colors.primary} />
                    <Text style={[styles.peakText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                      {language === "bn"
                        ? `আপনি ${timeDistribution.peak === "morning" ? "সকালে" : timeDistribution.peak === "afternoon" ? "দুপুরে" : "সন্ধ্যায়"} বেশি পড়েন`
                        : `You study most in the ${timeDistribution.peak}`}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {Object.keys(subjectTimes).length > 0 && (
            <Animated.View entering={FadeInDown.delay(650).duration(400)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
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

          {(weakTopics.length > 0 || trends.improving.length > 0) && (
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

                {trends.improving.length > 0 && (
                  <View style={styles.insightBlock}>
                    <View style={styles.insightHeader}>
                      <Ionicons name="arrow-up-circle" size={14} color={colors.success} />
                      <Text style={[styles.insightLabel, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>
                        {language === "bn" ? "উন্নতি হচ্ছে" : "Improving"}
                      </Text>
                    </View>
                    {trends.improving.slice(0, 2).map((item) => (
                      <View key={`imp-${item}`} style={styles.aiRecItem}>
                        <View style={[styles.aiRecDot, { backgroundColor: colors.success }]} />
                        <Text style={[styles.aiRecItemText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {weakTopics.length > 0 && (
                  <View style={styles.insightBlock}>
                    <View style={styles.insightHeader}>
                      <Ionicons name="alert-circle" size={14} color={colors.error} />
                      <Text style={[styles.insightLabel, { color: colors.error, fontFamily: "Inter_600SemiBold" }]}>
                        {tr("analytics.studyFocus")}
                      </Text>
                    </View>
                    {weakTopics.slice(0, 3).map((wt) => (
                      <View key={`rec-${wt.subject}-${wt.topic}`} style={styles.aiRecItem}>
                        <View style={[styles.aiRecDot, { backgroundColor: colors.error }]} />
                        <Text style={[styles.aiRecItemText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                          {wt.subject} → {wt.topic}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

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
  emptyTitle: {
    fontSize: 18,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  overviewCardWrap: {
    width: (SCREEN_WIDTH - 50) / 2,
    minWidth: 140,
    flexGrow: 1,
    flexBasis: "40%",
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
  masteryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  masteryCell: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  masteryCellText: {
    fontSize: 11,
    marginBottom: 2,
  },
  masteryCellPct: {
    fontSize: 13,
  },
  masteryLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
  },
  predictionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  predictionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionBody: {
    alignItems: "center",
    gap: 8,
  },
  predictionScoreWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  predictionScore: {
    fontSize: 40,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 12,
  },
  predictionDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  confidenceMeter: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    overflow: "hidden",
    marginTop: 4,
  },
  confidenceFill: {
    height: 6,
    borderRadius: 3,
  },
  confidenceLabel: {
    fontSize: 10,
    textAlign: "center",
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
  timeDistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  timeDistLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  timeDistLabel: {
    fontSize: 13,
  },
  timeDistRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  timeDistBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  timeDistFill: {
    height: 6,
    borderRadius: 3,
  },
  timeDistPct: {
    fontSize: 12,
    minWidth: 32,
    textAlign: "right",
  },
  peakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  peakText: {
    fontSize: 12,
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
  insightBlock: {
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  insightLabel: {
    fontSize: 12,
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
