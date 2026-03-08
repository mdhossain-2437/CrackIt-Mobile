import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { EXAM_TYPES } from "@/lib/questions";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, setExamType, resetProgress } = useApp();

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

  const handleReset = () => {
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
        resetProgress();
      }
    } else {
      Alert.alert(
        "Reset Progress",
        "Are you sure you want to reset all progress? This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: () => resetProgress() },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
        Profile
      </Text>

      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Student
          </Text>
          <View style={[styles.examTag, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name={examTypeInfo?.icon as any} size={14} color={colors.primary} />
            <Text style={[styles.examTagText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              {examTypeInfo?.name} Preparation
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="flame" size={24} color={colors.streak} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {userData.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Day Streak
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="checkmark-done" size={24} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {userData.totalQuestionsSolved}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Questions
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="analytics" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {accuracy}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Accuracy
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="trophy" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {avgScore}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Avg Score
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        Exam Type
      </Text>
      <View style={styles.examTypeList}>
        {EXAM_TYPES.map((exam) => {
          const isSelected = userData.examType === exam.id;
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
                {exam.name} - {exam.description}
              </Text>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </Pressable>
          );
        })}
      </View>

      {Object.keys(userData.subjectProgress).length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold", marginTop: 24 }]}>
            Subject Progress
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
                  {progress.correct}/{progress.total} correct
                </Text>
              </View>
            );
          })}
        </>
      )}

      <Pressable
        style={[styles.resetButton, { borderColor: colors.error }]}
        onPress={handleReset}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
        <Text style={[styles.resetText, { color: colors.error, fontFamily: "Inter_600SemiBold" }]}>
          Reset All Progress
        </Text>
      </Pressable>

      <Text style={[styles.version, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
        CrackIt v1.0.0 - BrainSpark
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
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontSize: 18 },
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
  },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 12 },
  sectionTitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
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
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 32,
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
