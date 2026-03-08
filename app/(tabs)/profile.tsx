import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Dimensions,
  RefreshControl,
  Modal,
  Switch,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeIn,
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
import { ACHIEVEMENTS, getAchievementProgress, getRarityColor, type AchievementDefinition } from "@/lib/achievements";
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

function AchievementBadge({
  achievement,
  unlocked,
  progress,
  index,
  onPress,
}: {
  achievement: AchievementDefinition;
  unlocked: boolean;
  progress: number;
  index: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const rarityColor = getRarityColor(achievement.rarity);
  const displayColor = unlocked ? rarityColor : colors.textTertiary;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${achievement.name} achievement${unlocked ? ", earned" : ", locked"}`}>
      <Animated.View
        entering={FadeInDown.delay(200 + index * 60).duration(300)}
        style={[
          styles.achievementBadge,
          {
            backgroundColor: unlocked ? rarityColor + "12" : colors.surface,
            borderColor: unlocked ? rarityColor + "35" : colors.borderLight,
          },
        ]}
      >
        <View style={[styles.achievementIcon, { backgroundColor: unlocked ? rarityColor + "20" : colors.borderLight }]}>
          <Ionicons name={achievement.icon as any} size={20} color={displayColor} />
        </View>
        <Text
          style={[styles.achievementLabel, { color: unlocked ? colors.text : colors.textTertiary, fontFamily: "Inter_500Medium" }]}
          numberOfLines={2}
        >
          {achievement.name}
        </Text>
        {!unlocked && progress > 0 && (
          <View style={[styles.achievementProgressTrack, { backgroundColor: colors.borderLight }]}>
            <View style={[styles.achievementProgressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: rarityColor }]} />
          </View>
        )}
        {unlocked && (
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "20" }]}>
            <Text style={[styles.rarityText, { color: rarityColor, fontFamily: "Inter_600SemiBold" }]}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function AchievementDetailModal({
  visible,
  achievement,
  unlocked,
  progress,
  onClose,
  language,
}: {
  visible: boolean;
  achievement: AchievementDefinition | null;
  unlocked: boolean;
  progress: number;
  onClose: () => void;
  language: Language;
}) {
  const colors = useColors();
  if (!achievement) return null;

  const rarityColor = getRarityColor(achievement.rarity);
  const name = language === "bn" ? achievement.nameBn : achievement.name;
  const desc = language === "bn" ? achievement.descriptionBn : achievement.description;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalIconWrap, { backgroundColor: unlocked ? rarityColor + "20" : colors.borderLight }]}>
            <Ionicons name={achievement.icon as any} size={40} color={unlocked ? rarityColor : colors.textTertiary} />
          </View>

          <Text style={[styles.modalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{name}</Text>
          <Text style={[styles.modalDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>{desc}</Text>

          <View style={[styles.modalRarityRow, { backgroundColor: rarityColor + "12" }]}>
            <Ionicons name="diamond-outline" size={14} color={rarityColor} />
            <Text style={[styles.modalRarityText, { color: rarityColor, fontFamily: "Inter_600SemiBold" }]}>
              {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
            </Text>
            <Text style={[styles.modalXpText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
              +{achievement.xpReward} XP
            </Text>
          </View>

          {unlocked ? (
            <View style={[styles.modalStatusBadge, { backgroundColor: colors.success + "15" }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.modalStatusText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>
                {language === "bn" ? "অর্জিত!" : "Earned!"}
              </Text>
            </View>
          ) : (
            <View style={{ width: "100%", marginTop: 12 }}>
              <View style={[styles.modalProgressTrack, { backgroundColor: colors.borderLight }]}>
                <View style={[styles.modalProgressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: rarityColor }]} />
              </View>
              <Text style={[styles.modalProgressText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                {Math.round(progress * 100)}% {language === "bn" ? "সম্পন্ন" : "complete"}
              </Text>
            </View>
          )}

          <Pressable style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
            <Text style={[styles.modalCloseBtnText, { fontFamily: "Inter_600SemiBold" }]}>
              {language === "bn" ? "বন্ধ করুন" : "Close"}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
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

function SettingsRow({ icon, iconColor, label, value, onPress, isLast, colors, right }: { icon: string; iconColor: string; label: string; value?: string; onPress?: () => void; isLast?: boolean; colors: any; right?: React.ReactNode }) {
  return (
    <Pressable
      style={[styles.settingsRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={label}
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
      {right}
      {onPress && !right && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
    </Pressable>
  );
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, setExamType, setLanguage, resetProgress, tr, language, authUser, isAuthenticated, logoutUser } = useApp();

  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDefinition | null>(null);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(false);

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

  const bestStreak = userData.streak;
  const totalStudySeconds = userData.examHistory.reduce((sum, e) => sum + (e.totalTime || 0), 0);
  const studyHours = Math.round((totalStudySeconds / 3600) * 10) / 10;

  const examName = language === "bn" ? examTypeInfo?.nameBn : examTypeInfo?.name;

  const level = Math.floor(userData.xp / 100) + 1;
  const xpInLevel = userData.xp % 100;
  const totalXp = userData.xp;

  const earnedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const ach of ACHIEVEMENTS) {
      let earned = false;
      switch (ach.condition) {
        case "total_questions":
          earned = userData.totalQuestionsSolved >= ach.threshold;
          break;
        case "streak":
          earned = userData.streak >= ach.threshold;
          break;
        case "overall_accuracy":
          if (userData.totalQuestionsSolved >= (ach.threshold >= 90 ? 100 : 50)) {
            const acc = (userData.totalCorrect / userData.totalQuestionsSolved) * 100;
            earned = acc >= ach.threshold;
          }
          break;
        case "xp":
          earned = userData.xp >= ach.threshold;
          break;
        case "subjects_practiced": {
          const subjects = new Set<string>();
          for (const key of Object.keys(userData.topicProgress)) {
            const [subject] = key.split("::");
            if (subject) subjects.add(subject);
          }
          earned = subjects.size >= ach.threshold;
          break;
        }
      }
      if (earned) keys.add(ach.key);
    }
    return keys;
  }, [userData]);

  const achievementStats = useMemo(() => {
    const earned = ACHIEVEMENTS.filter((a) => earnedKeys.has(a.key));
    const locked = ACHIEVEMENTS.filter((a) => !earnedKeys.has(a.key));
    return { earned, locked, total: ACHIEVEMENTS.length, earnedCount: earned.length };
  }, [earnedKeys]);

  const handleAchievementPress = useCallback((achievement: AchievementDefinition) => {
    setSelectedAchievement(achievement);
    setAchievementModalVisible(true);
  }, []);

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

  const handleLogout = () => {
    const doLogout = async () => {
      await logoutUser();
    };

    if (Platform.OS === "web") {
      if (confirm(language === "bn" ? "আপনি কি লগ আউট করতে চান?" : "Are you sure you want to log out?")) {
        doLogout();
      }
    } else {
      Alert.alert(
        tr("auth.logout"),
        language === "bn" ? "আপনি কি লগ আউট করতে চান?" : "Are you sure you want to log out?",
        [
          { text: tr("exam.cancel"), style: "cancel" },
          { text: tr("auth.logout"), style: "destructive", onPress: doLogout },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    const doDelete = async () => {
      await resetProgress();
      await logoutUser();
    };

    if (Platform.OS === "web") {
      if (confirm(language === "bn" ? "আপনি কি আপনার অ্যাকাউন্ট মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।" : "Are you sure you want to delete your account? This cannot be undone.")) {
        doDelete();
      }
    } else {
      Alert.alert(
        language === "bn" ? "অ্যাকাউন্ট মুছুন" : "Delete Account",
        language === "bn" ? "আপনি কি আপনার অ্যাকাউন্ট মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।" : "Are you sure you want to delete your account? This cannot be undone.",
        [
          { text: tr("exam.cancel"), style: "cancel" },
          { text: language === "bn" ? "মুছুন" : "Delete", style: "destructive", onPress: doDelete },
        ]
      );
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleLogin = () => {
    router.push("/auth");
  };

  const displayName = isAuthenticated && authUser ? authUser.name : tr("profile.student");
  const initials = getInitials(displayName);

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
        colors={[colors.primary, colors.primaryDark, colors.primary + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: topInset + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer} accessibilityLabel={`${displayName} profile avatar`}>
            <LinearGradient
              colors={["#FFFFFF40", "#FFFFFF15"]}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                <Text style={[styles.avatarInitials, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                  {initials}
                </Text>
              </View>
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelBadgeText, { fontFamily: "Inter_700Bold" }]}>
                {level}
              </Text>
            </View>
          </View>

          <Text style={[styles.headerName, { fontFamily: "Inter_700Bold" }]}>
            {displayName}
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
            <View style={styles.xpLevelRow}>
              <Text style={[styles.xpLevelLabel, { fontFamily: "Inter_600SemiBold" }]}>
                {language === "bn" ? "লেভেল" : "Level"} {level}
              </Text>
              <Text style={[styles.xpTotalLabel, { fontFamily: "Inter_500Medium" }]}>
                {totalXp} XP {language === "bn" ? "মোট" : "total"}
              </Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${xpInLevel}%` }]} />
            </View>
            <Text style={[styles.xpBarLabel, { fontFamily: "Inter_500Medium" }]}>
              {xpInLevel}/100 XP {language === "bn" ? "পরবর্তী লেভেলে" : "to next level"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {!isAuthenticated && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginTop: -20, marginHorizontal: 20 }}>
          <Pressable
            style={[styles.loginCard, { backgroundColor: colors.surface, borderColor: colors.primary + "30" }]}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel={`${tr("auth.login")} or ${tr("auth.register")}`}
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
          { icon: "flame", color: colors.streak, val: bestStreak, label: tr("profile.dayStreak"), delay: 0 },
          { icon: "checkmark-done", color: colors.success, val: userData.totalQuestionsSolved, label: tr("profile.questions"), delay: 100 },
          { icon: "analytics", color: colors.primary, val: accuracy, label: tr("dashboard.accuracy"), suffix: "%", delay: 200 },
          { icon: "time-outline", color: colors.warning, val: studyHours, label: language === "bn" ? "ঘন্টা পড়া" : "Study Hours", suffix: "h", delay: 300 },
        ].map((stat, i) => (
          <Animated.View
            key={stat.label}
            entering={FadeInDown.delay(200 + i * 80).duration(400)}
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            accessibilityLabel={`${stat.label}: ${stat.val}${stat.suffix || ""}`}
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {language === "bn" ? "অর্জন" : "Achievements"}
          </Text>
          <Text style={[styles.sectionBadge, { color: colors.primary, backgroundColor: colors.primary + "12", fontFamily: "Inter_600SemiBold" }]}>
            {achievementStats.earnedCount}/{achievementStats.total}
          </Text>
        </View>

        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((ach, idx) => {
            const unlocked = earnedKeys.has(ach.key);
            const progress = getAchievementProgress(userData, ach);
            return (
              <AchievementBadge
                key={ach.key}
                achievement={ach}
                unlocked={unlocked}
                progress={progress}
                index={idx}
                onPress={() => handleAchievementPress(ach)}
              />
            );
          })}
        </View>
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
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={lang === "en" ? "English" : "Bangla"}
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
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={name}
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

      <Animated.View entering={FadeInDown.delay(750).duration(400)}>
        <SettingsGroup title={(language === "bn" ? "পছন্দসমূহ" : "PREFERENCES").toUpperCase()} colors={colors}>
          <SettingsRow
            icon="notifications-outline"
            iconColor={colors.warning}
            label={language === "bn" ? "দৈনিক অনুস্মারক" : "Daily Reminder"}
            colors={colors}
            right={
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: colors.borderLight, true: colors.primary + "60" }}
                thumbColor={dailyReminder ? colors.primary : colors.textTertiary}
                accessibilityLabel={language === "bn" ? "দৈনিক অনুস্মারক" : "Daily reminder toggle"}
              />
            }
          />
        </SettingsGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).duration(400)}>
        <SettingsGroup title={(language === "bn" ? "সম্পর্কে" : "ABOUT").toUpperCase()} colors={colors}>
          <SettingsRow
            icon="information-circle-outline"
            iconColor={colors.primary}
            label={language === "bn" ? "অ্যাপ সম্পর্কে" : "About CrackIt"}
            colors={colors}
            onPress={() => {}}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            iconColor={colors.success}
            label={language === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}
            colors={colors}
            onPress={() => {}}
          />
          <SettingsRow
            icon="document-text-outline"
            iconColor={colors.accent}
            label={language === "bn" ? "সেবার শর্তাবলী" : "Terms of Service"}
            colors={colors}
            isLast
            onPress={() => {}}
          />
        </SettingsGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(850).duration(400)}>
        <SettingsGroup title={(language === "bn" ? "অ্যাকাউন্ট" : "ACCOUNT").toUpperCase()} colors={colors}>
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
            icon="refresh-outline"
            iconColor={colors.warning}
            label={tr("profile.resetAll")}
            onPress={handleReset}
            colors={colors}
            isLast={!isAuthenticated}
          />
          {isAuthenticated && (
            <SettingsRow
              icon="trash-outline"
              iconColor={colors.error}
              label={language === "bn" ? "অ্যাকাউন্ট মুছুন" : "Delete Account"}
              onPress={handleDeleteAccount}
              isLast
              colors={colors}
            />
          )}
        </SettingsGroup>
      </Animated.View>

      <Text style={[styles.version, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
        {tr("profile.version")}
      </Text>

      <AchievementDetailModal
        visible={achievementModalVisible}
        achievement={selectedAchievement}
        unlocked={selectedAchievement ? earnedKeys.has(selectedAchievement.key) : false}
        progress={selectedAchievement ? getAchievementProgress(userData, selectedAchievement) : 0}
        onClose={() => setAchievementModalVisible(false)}
        language={language}
      />
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
  avatarInitials: {
    fontSize: 28,
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
  xpLevelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 2,
  },
  xpLevelLabel: {
    fontSize: 12,
    color: "#FFFFFFDD",
  },
  xpTotalLabel: {
    fontSize: 11,
    color: "#FFFFFFAA",
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  achievementBadge: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    width: (SCREEN_WIDTH - 70) / 3,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementLabel: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
  },
  achievementProgressTrack: {
    width: "80%",
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  achievementProgressFill: {
    height: 3,
    borderRadius: 2,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 7,
    letterSpacing: 0.5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalRarityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalRarityText: {
    fontSize: 12,
    flex: 1,
  },
  modalXpText: {
    fontSize: 12,
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  modalStatusText: {
    fontSize: 14,
  },
  modalProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  modalProgressFill: {
    height: 6,
    borderRadius: 3,
  },
  modalProgressText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  modalCloseBtn: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCloseBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});
