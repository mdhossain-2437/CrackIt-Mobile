import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { EXAM_TYPES } from "@/lib/questions";
import type { Language } from "@/lib/i18n";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function AnimatedCounter({ value, suffix = "", delay = 0, color }: { value: number; suffix?: string; delay?: number; color: string }) {
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withDelay(delay, withTiming(value, { duration: 1200, easing: Easing.out(Easing.cubic) }));
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animValue.value, [0, value * 0.1, value], [0.3, 0.8, 1]),
  }));

  return (
    <Animated.Text style={[styles.statValue, { color, fontFamily: "Inter_700Bold" }, animStyle]}>
      {value}{suffix}
    </Animated.Text>
  );
}

function AchievementBadge({ icon, label, unlocked, color, index }: { icon: string; label: string; unlocked: boolean; color: string; index: number }) {
  const colors = useColors();
  return (
    <Animated.View
      entering={FadeInRight.delay(200 + index * 100).duration(400)}
      style={[styles.achievementBadge, { backgroundColor: unlocked ? color + "18" : colors.surface, borderColor: unlocked ? color + "40" : colors.borderLight }]}
    >
      <View style={[styles.achievementIcon, { backgroundColor: unlocked ? color + "25" : colors.borderLight }]}>
        <Ionicons name={icon as any} size={20} color={unlocked ? color : colors.textTertiary} />
      </View>
      <Text style={[styles.achievementLabel, { color: unlocked ? colors.text : colors.textTertiary, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

function SettingsGroup({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.settingsGroup}>
      <Text style={[styles.settingsGroupTitle, { color: colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
        {title}
      </Text>
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({ icon, iconColor, label, value, onPress, isLast, colors }: { icon: string; iconColor: string; label: string; value?: string; onPress?: () => void; isLast?: boolean; colors: any }) {
  return (
    <Pressable
      style={[styles.settingsRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
      onPress={onPress}
    >
      <View style={[styles.settingsIconWrap, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.settingsLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.settingsValue, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
          {value}
        </Text>
      )}
      {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, setExamType, setLanguage, resetProgress, tr, language, authUser, isAuthenticated, logoutUser } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const examTypeInfo = EXAM_TYPES.find((e) => e.id === userData.examType);
  const accuracy =
    userData.totalQuestionsSolved > 0
      ? Math.round((userData.totalCorrect / userData.totalQuestionsSolved) * 100)
      : 0;
  const totalExams = userData.examHistory.length;
  const avgScore =
    totalExams > 0
      ? Math.round(userData.examHistory.reduce((sum, e) => sum + e.score, 0) / totalExams)
      : 0;

  const examName = language === "bn" ? examTypeInfo?.nameBn : examTypeInfo?.name;

  const level = Math.floor(userData.xp / 100) + 1;
  const xpInLevel = userData.xp % 100;

  const achievements = [
    { icon: "flame", label: language === "bn" ? "৭ দিনের ধারা" : "7-Day Streak", unlocked: userData.streak >= 7, color: colors.streak },
    { icon: "trophy", label: language === "bn" ? "১০০ প্রশ্ন" : "100 Questions", unlocked: userData.totalQuestionsSolved >= 100, color: colors.warning },
    { icon: "star", label: language === "bn" ? "৮০%+ স্কোর" : "80%+ Score", unlocked: avgScore >= 80, color: colors.primary },
    { icon: "ribbon", label: language === "bn" ? "১০ পরীক্ষা" : "10 Exams", unlocked: totalExams >= 10, color: colors.success },
  ];

  const handleReset = () => {
    if (Platform.OS === "web") {
      if (confirm(tr("profile.resetConfirm"))) {
        resetProgress();
      }
    } else {
      Alert.alert(
        tr("profile.resetAll"),
        tr("profile.resetConfirm"),
        [
          { text: tr("exam.cancel"), style: "cancel" },
          { text: tr("profile.reset"), style: "destructive", onPress: () => resetProgress() },
        ]
      );
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleLogin = () => {
    router.push("/auth");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark, colors.primary + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: topInset + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#FFFFFF40", "#FFFFFF15"]}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                <Ionicons name="person" size={36} color={colors.primary} />
              </View>
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelBadgeText, { fontFamily: "Inter_700Bold" }]}>
                {level}
              </Text>
            </View>
          </View>

          <Text style={[styles.headerName, { fontFamily: "Inter_700Bold" }]}>
            {isAuthenticated && authUser ? authUser.name : tr("profile.student")}
          </Text>
          {isAuthenticated && authUser && (
            <Text style={[styles.headerEmail, { fontFamily: "Inter_400Regular" }]}>
              {authUser.email}
            </Text>
          )}

          <View style={styles.headerTags}>
            <View style={styles.headerTag}>
              <Ionicons name={examTypeInfo?.icon as any} size={12} color="#FFFFFF" />
              <Text style={[styles.headerTagText, { fontFamily: "Inter_600SemiBold" }]}>
                {examName}
              </Text>
            </View>
            {isAuthenticated && authUser?.educationLevel && (
              <View style={styles.headerTag}>
                <Ionicons name="school-outline" size={12} color="#FFFFFF" />
                <Text style={[styles.headerTagText, { fontFamily: "Inter_600SemiBold" }]}>
                  {tr(`education.${authUser.educationLevel}`)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${xpInLevel}%` }]} />
            </View>
            <Text style={[styles.xpBarLabel, { fontFamily: "Inter_500Medium" }]}>
              {xpInLevel}/100 XP
            </Text>
          </View>
        </View>
      </LinearGradient>

      {!isAuthenticated && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginTop: -20, marginHorizontal: 20 }}>
          <Pressable
            style={[styles.loginCard, { backgroundColor: colors.surface, borderColor: colors.primary + "30" }]}
            onPress={handleLogin}
          >
            <LinearGradient
              colors={[colors.primary + "15", colors.primary + "05"]}
              style={styles.loginCardGradient}
            >
              <View style={[styles.loginIconWrap, { backgroundColor: colors.primary + "20" }]}>
                <Ionicons name="log-in-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.loginCardTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {tr("auth.login")} / {tr("auth.register")}
                </Text>
                <Text style={[styles.loginCardDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {language === "bn" ? "আপনার অগ্রগতি সংরক্ষণ করুন" : "Save your progress across devices"}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      <View style={[styles.statsRow, { marginTop: isAuthenticated ? -20 : 16 }]}>
        {[
          { icon: "flame", color: colors.streak, val: userData.streak, label: tr("profile.dayStreak"), delay: 0 },
          { icon: "checkmark-done", color: colors.success, val: userData.totalQuestionsSolved, label: tr("profile.questions"), delay: 100 },
          { icon: "analytics", color: colors.primary, val: accuracy, label: tr("dashboard.accuracy"), suffix: "%", delay: 200 },
          { icon: "trophy", color: colors.warning, val: avgScore, label: tr("profile.avgScore"), suffix: "%", delay: 300 },
        ].map((stat, i) => (
          <Animated.View
            key={stat.label}
            entering={FadeInDown.delay(200 + i * 80).duration(400)}
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          >
            <View style={[styles.statIconWrap, { backgroundColor: stat.color + "18" }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <AnimatedCounter value={stat.val} suffix={stat.suffix || ""} delay={stat.delay} color={colors.text} />
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {stat.label}
            </Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginHorizontal: 20, marginBottom: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {language === "bn" ? "অর্জন" : "Achievements"}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsRow}>
          {achievements.map((ach, idx) => (
            <AchievementBadge key={ach.label} {...ach} index={idx} />
          ))}
        </ScrollView>
      </Animated.View>

      {Object.keys(userData.subjectProgress).length > 0 && (
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {tr("profile.subjectProgress")}
          </Text>
          <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            {Object.entries(userData.subjectProgress).map(([name, progress], idx) => {
              const pct = Math.round((progress.correct / Math.max(progress.total, 1)) * 100);
              const barColor = pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.error;
              return (
                <View key={name} style={[styles.progressItem, idx < Object.keys(userData.subjectProgress).length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                  <View style={styles.progressHeader}>
                    <View style={[styles.progressDot, { backgroundColor: barColor }]} />
                    <Text style={[styles.progressName, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                      {name}
                    </Text>
                    <Text style={[styles.progressPct, { color: barColor, fontFamily: "Inter_700Bold" }]}>
                      {pct}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
                    <View
                      style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]}
                    />
                  </View>
                  <Text style={[styles.progressMeta, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                    {progress.correct}/{progress.total} {tr("dashboard.correct")}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <SettingsGroup title={tr("profile.language").toUpperCase()} colors={colors}>
          {(["en", "bn"] as Language[]).map((lang, idx) => {
            const isSelected = language === lang;
            return (
              <Pressable
                key={lang}
                style={[styles.settingsRow, idx === 0 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
                onPress={() => setLanguage(lang)}
              >
                <View style={[styles.settingsIconWrap, { backgroundColor: isSelected ? colors.primary + "18" : colors.borderLight }]}>
                  <Ionicons name="language" size={18} color={isSelected ? colors.primary : colors.textSecondary} />
                </View>
                <Text style={[styles.settingsLabel, { color: isSelected ? colors.primary : colors.text, fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_500Medium" }]}>
                  {lang === "en" ? "English" : "বাংলা"}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </SettingsGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).duration(400)}>
        <SettingsGroup title={tr("profile.examType").toUpperCase()} colors={colors}>
          {EXAM_TYPES.map((exam, idx) => {
            const isSelected = userData.examType === exam.id;
            const name = language === "bn" ? exam.nameBn : exam.name;
            return (
              <Pressable
                key={exam.id}
                style={[styles.settingsRow, idx < EXAM_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
                onPress={() => setExamType(exam.id)}
              >
                <View style={[styles.settingsIconWrap, { backgroundColor: isSelected ? colors.primary + "18" : colors.borderLight }]}>
                  <Ionicons
                    name={exam.icon as any}
                    size={18}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text
                  style={[styles.settingsLabel, {
                    color: isSelected ? colors.primary : colors.text,
                    fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_500Medium",
                  }]}
                >
                  {name}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </SettingsGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).duration(400)}>
        <SettingsGroup title={(language === "bn" ? "অন্যান্য" : "MORE").toUpperCase()} colors={colors}>
          {isAuthenticated && (
            <SettingsRow
              icon="log-out-outline"
              iconColor={colors.primary}
              label={tr("auth.logout")}
              onPress={handleLogout}
              colors={colors}
            />
          )}
          <SettingsRow
            icon="trash-outline"
            iconColor={colors.error}
            label={tr("profile.resetAll")}
            onPress={handleReset}
            isLast
            colors={colors}
          />
        </SettingsGroup>
      </Animated.View>

      <Text style={[styles.version, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
        {tr("profile.version")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  avatarContainer: {
    marginBottom: 14,
    position: "relative",
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6D00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  levelBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  headerName: {
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 13,
    color: "#FFFFFFBB",
    marginBottom: 10,
  },
  headerTags: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  headerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  headerTagText: {
    fontSize: 11,
    color: "#FFFFFF",
  },
  xpBarContainer: {
    width: "80%",
    alignItems: "center",
    gap: 4,
  },
  xpBarTrack: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    backgroundColor: "#FFFFFF30",
    overflow: "hidden",
  },
  xpBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFD700",
  },
  xpBarLabel: {
    fontSize: 11,
    color: "#FFFFFFAA",
  },
  loginCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  loginCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  loginIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  loginCardTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  loginCardDesc: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  achievementsRow: {
    gap: 10,
    paddingRight: 20,
  },
  achievementBadge: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    minWidth: 90,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  progressItem: {
    paddingVertical: 10,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressName: {
    fontSize: 13,
    flex: 1,
  },
  progressPct: {
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressMeta: {
    fontSize: 11,
  },
  settingsGroup: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  settingsGroupTitle: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsGroupCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  settingsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLabel: {
    flex: 1,
    fontSize: 14,
  },
  settingsValue: {
    fontSize: 13,
    marginRight: 4,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 20,
  },
});
