import React, { useState } from "react";
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
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import {
  EXAM_TYPES,
  getSubjectsForExamType,
  getQuestionsForSubject,
  shuffleArray,
  type ExamType,
  type SubjectInfo,
} from "@/lib/questions";
import { getAdaptiveQuestions, getTopicStrength } from "@/lib/algorithm";

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, startExam, tr, language } = useApp();
  const [selectedExamType, setSelectedExamType] = useState<ExamType>(userData.examType);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const subjects = getSubjectsForExamType(selectedExamType);

  const handleTopicPress = (subject: SubjectInfo, topic: string) => {
    const questions = shuffleArray(getQuestionsForSubject(subject.name, topic)).slice(0, 10);
    if (questions.length === 0) return;
    startExam({
      subject: subject.name,
      topic,
      count: questions.length,
      timePerQuestion: 60,
      questions,
    });
    router.push("/exam");
  };

  const handleSubjectPress = (subject: SubjectInfo) => {
    const questions = shuffleArray(getQuestionsForSubject(subject.name)).slice(0, 10);
    if (questions.length === 0) return;
    startExam({
      subject: subject.name,
      count: questions.length,
      timePerQuestion: 60,
      questions,
    });
    router.push("/exam");
  };

  const handleAdaptive = () => {
    const questions = getAdaptiveQuestions(userData, selectedExamType, 10, language);
    if (questions.length === 0) return;
    startExam({
      subject: tr("practice.adaptive"),
      count: questions.length,
      timePerQuestion: 60,
      questions,
    });
    router.push("/exam");
  };

  const strengthColor = (strength: string) => {
    switch (strength) {
      case "weak": return colors.error;
      case "moderate": return colors.warning;
      case "strong": return colors.success;
      default: return colors.textTertiary;
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
        {tr("practice.title")}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.examTypesRow}
      >
        {EXAM_TYPES.map((exam) => {
          const isSelected = selectedExamType === exam.id;
          return (
            <Pressable
              key={exam.id}
              style={[
                styles.examTypeChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                setSelectedExamType(exam.id);
                setExpandedSubject(null);
              }}
            >
              <Ionicons
                name={exam.icon as any}
                size={16}
                color={isSelected ? "#FFFFFF" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.examTypeText,
                  {
                    color: isSelected ? "#FFFFFF" : colors.text,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                {language === "bn" ? exam.nameBn : exam.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={[styles.adaptiveCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary + "40" }]}
        onPress={handleAdaptive}
      >
        <Ionicons name="flash" size={22} color={colors.primary} />
        <View style={styles.adaptiveInfo}>
          <Text style={[styles.adaptiveTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
            {tr("practice.adaptive")}
          </Text>
          <Text style={[styles.adaptiveDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {tr("practice.adaptiveDesc")}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.primary} />
      </Pressable>

      {subjects.map((subject) => {
        const isExpanded = expandedSubject === subject.id;
        const questionCount = getQuestionsForSubject(subject.name).length;
        const progress = userData.subjectProgress[subject.name];
        const pct = progress ? Math.round((progress.correct / Math.max(progress.total, 1)) * 100) : 0;
        const subjectName = language === "bn" ? subject.nameBn : subject.name;

        return (
          <View key={subject.id} style={styles.subjectSection}>
            <Pressable
              style={[styles.subjectHeader, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => setExpandedSubject(isExpanded ? null : subject.id)}
            >
              <View style={[styles.subjectIconWrap, { backgroundColor: subject.color + "20" }]}>
                <Ionicons name={subject.icon as any} size={20} color={subject.color} />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {subjectName}
                </Text>
                <Text style={[styles.subjectMeta, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {questionCount} {tr("practice.questions")}{progress ? ` - ${pct}% ${tr("dashboard.accuracy").toLowerCase()}` : ""}
                </Text>
              </View>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>

            {isExpanded && (
              <View style={[styles.topicsContainer, { borderColor: colors.borderLight }]}>
                <Pressable
                  style={[styles.topicItem, { borderBottomColor: colors.borderLight }]}
                  onPress={() => handleSubjectPress(subject)}
                >
                  <View style={styles.topicInfo}>
                    <Ionicons name="shuffle-outline" size={18} color={colors.primary} />
                    <Text style={[styles.topicName, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      {tr("practice.allTopics")}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                </Pressable>

                {subject.topics.map((topic, idx) => {
                  const topicQuestions = getQuestionsForSubject(subject.name, topic).length;
                  const strength = getTopicStrength(userData, subject.name, topic);
                  const topicName = language === "bn" && subject.topicsBn[idx] ? subject.topicsBn[idx] : topic;
                  return (
                    <Pressable
                      key={topic}
                      style={[
                        styles.topicItem,
                        idx < subject.topics.length - 1 && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                      ]}
                      onPress={() => handleTopicPress(subject, topic)}
                    >
                      <View style={styles.topicInfo}>
                        <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
                        <View>
                          <View style={styles.topicNameRow}>
                            <Text style={[styles.topicName, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                              {topicName}
                            </Text>
                            {strength !== "unseen" && (
                              <View style={[styles.strengthDot, { backgroundColor: strengthColor(strength) }]} />
                            )}
                          </View>
                          <Text style={[styles.topicCount, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                            {topicQuestions} {topicQuestions !== 1 ? tr("practice.questions") : tr("practice.question")}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  examTypesRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  examTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  examTypeText: { fontSize: 14 },
  adaptiveCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  adaptiveInfo: { flex: 1 },
  adaptiveTitle: { fontSize: 14, marginBottom: 2 },
  adaptiveDesc: { fontSize: 12 },
  subjectSection: { marginHorizontal: 20, marginBottom: 10 },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  subjectIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, marginBottom: 2 },
  subjectMeta: { fontSize: 12 },
  topicsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  topicInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topicNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  topicName: { fontSize: 14 },
  topicCount: { fontSize: 11, marginTop: 2 },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
