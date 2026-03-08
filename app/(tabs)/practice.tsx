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

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, startExam } = useApp();
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
        Practice
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
                {exam.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {subjects.map((subject) => {
        const isExpanded = expandedSubject === subject.id;
        const questionCount = getQuestionsForSubject(subject.name).length;
        const progress = userData.subjectProgress[subject.name];
        const pct = progress ? Math.round((progress.correct / Math.max(progress.total, 1)) * 100) : 0;

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
                  {subject.name}
                </Text>
                <Text style={[styles.subjectMeta, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {questionCount} questions{progress ? ` - ${pct}% accuracy` : ""}
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
                      All Topics (Mixed)
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                </Pressable>

                {subject.topics.map((topic, idx) => {
                  const topicQuestions = getQuestionsForSubject(subject.name, topic).length;
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
                          <Text style={[styles.topicName, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                            {topic}
                          </Text>
                          <Text style={[styles.topicCount, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                            {topicQuestions} question{topicQuestions !== 1 ? "s" : ""}
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
    marginBottom: 20,
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
  topicName: { fontSize: 14 },
  topicCount: { fontSize: 11, marginTop: 2 },
});
