import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { EXAM_TYPES } from "@/lib/questions";
import type { Language } from "@/lib/i18n";

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
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
        {tr("profile.title")}
      </Text>

      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {isAuthenticated && authUser ? authUser.name : tr("profile.student")}
          </Text>
          {isAuthenticated && authUser && (
            <Text style={[styles.profileEmail, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {authUser.email}
            </Text>
          )}
          <View style={styles.tagRow}>
            <View style={[styles.examTag, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={examTypeInfo?.icon as any} size={14} color={colors.primary} />
              <Text style={[styles.examTagText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {examName} {tr("profile.preparation")}
              </Text>
            </View>
            {isAuthenticated && authUser?.educationLevel && (
              <View style={[styles.examTag, { backgroundColor: colors.successLight }]}>
                <Ionicons name="school-outline" size={14} color={colors.success} />
                <Text style={[styles.examTagText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>
                  {tr(`education.${authUser.educationLevel}`)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {!isAuthenticated && (
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Pressable
            style={[styles.loginPrompt, { backgroundColor: colors.primaryLight, borderColor: colors.primary + "40" }]}
            onPress={handleLogin}
          >
            <Ionicons name="log-in-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.loginPromptTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {tr("auth.login")} / {tr("auth.register")}
              </Text>
              <Text style={[styles.loginPromptDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                {language === "bn" ? "আপনার অগ্রগতি সংরক্ষণ করুন" : "Save your progress across devices"}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </Pressable>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="flame" size={24} color={colors.streak} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {userData.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {tr("profile.dayStreak")}
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="checkmark-done" size={24} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {userData.totalQuestionsSolved}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {tr("profile.questions")}
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="analytics" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {accuracy}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {tr("dashboard.accuracy")}
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="trophy" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {avgScore}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {tr("profile.avgScore")}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {tr("profile.language")}
        </Text>
        <View style={styles.langRow}>
          {(["en", "bn"] as Language[]).map((lang) => {
            const isSelected = language === lang;
            return (
              <Pressable
                key={lang}
                style={[
                  styles.langItem,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.borderLight,
                  },
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Text style={{ fontSize: 22 }}>{lang === "en" ? "🇬🇧" : "🇧🇩"}</Text>
                <Text style={[styles.langText, { color: isSelected ? colors.primary : colors.text, fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {lang === "en" ? "English" : "বাংলা"}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {tr("profile.examType")}
        </Text>
        <View style={styles.examTypeList}>
          {EXAM_TYPES.map((exam) => {
            const isSelected = userData.examType === exam.id;
            const name = language === "bn" ? exam.nameBn : exam.name;
            const desc = language === "bn" ? exam.descriptionBn : exam.description;
            return (
              <Pressable
                key={exam.id}
                style={[
                  styles.examTypeItem,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.borderLight,
                  },
                ]}
                onPress={() => setExamType(exam.id)}
              >
                <Ionicons
                  name={exam.icon as any}
                  size={20}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.examTypeItemText,
                    {
                      color: isSelected ? colors.primary : colors.text,
                      fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {name} - {desc}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {Object.keys(userData.subjectProgress).length > 0 && (
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold", marginTop: 24 }]}>
            {tr("profile.subjectProgress")}
          </Text>
          {Object.entries(userData.subjectProgress).map(([name, progress]) => {
            const pct = Math.round((progress.correct / Math.max(progress.total, 1)) * 100);
            return (
              <View key={name} style={[styles.progressItem, { borderColor: colors.borderLight }]}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressName, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                    {name}
                  </Text>
                  <Text style={[styles.progressPct, { color: colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
                    {pct}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct}%`, backgroundColor: pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.error },
                    ]}
                  />
                </View>
                <Text style={[styles.progressMeta, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                  {progress.correct}/{progress.total} {tr("dashboard.correct")}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      )}

      {isAuthenticated && (
        <Pressable
          style={[styles.logoutButton, { borderColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.primary} />
          <Text style={[styles.logoutText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
            {tr("auth.logout")}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.resetButton, { borderColor: colors.error }]}
        onPress={handleReset}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
        <Text style={[styles.resetText, { color: colors.error, fontFamily: "Inter_600SemiBold" }]}>
          {tr("profile.resetAll")}
        </Text>
      </Pressable>

      <Text style={[styles.version, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
        {tr("profile.version")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18 },
  profileEmail: { fontSize: 13 },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  examTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examTagText: { fontSize: 12 },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  loginPromptTitle: { fontSize: 14, marginBottom: 2 },
  loginPromptDesc: { fontSize: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statItem: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
    elevation: 2,
  },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 12 },
  sectionTitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  langRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  langText: { flex: 1, fontSize: 15 },
  examTypeList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  examTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  examTypeItemText: { flex: 1, fontSize: 14 },
  progressItem: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressName: { fontSize: 14 },
  progressPct: { fontSize: 14 },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressMeta: { fontSize: 11 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: { fontSize: 14 },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetText: { fontSize: 14 },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
  },
});
