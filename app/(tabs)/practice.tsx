import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
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
  getRecommendedExamTypes,
  type ExamType,
  type SubjectInfo,
  type PracticeMode,
} from "@/lib/questions";
import { getAdaptiveQuestions, getTopicStrength, getNextAdaptiveQuestion } from "@/lib/algorithm";

const PRACTICE_MODES: {
  id: PracticeMode;
  icon: string;
  color: string;
  timePerQ: number | null;
  questionCount: number | null;
}[] = [
  { id: "relaxed", icon: "leaf-outline", color: "#4CAF50", timePerQ: null, questionCount: 10 },
  { id: "timed", icon: "time-outline", color: "#1A73E8", timePerQ: 60, questionCount: 10 },
  { id: "speed", icon: "flash-outline", color: "#FF6B35", timePerQ: 15, questionCount: 10 },
  { id: "marathon", icon: "fitness-outline", color: "#9C27B0", timePerQ: 60, questionCount: 50 },
];

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, startExam, tr, language, authUser, isAuthenticated } = useApp();
  const [selectedExamType, setSelectedExamType] = useState<ExamType>(userData.examType);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<PracticeMode>("timed");
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ subject: string; questions: any[]; topic?: string } | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const subjects = getSubjectsForExamType(selectedExamType);
  const recommendedTypes = isAuthenticated && authUser?.educationLevel
    ? getRecommendedExamTypes(authUser.educationLevel)
    : [];
  const sortedExamTypes = recommendedTypes.length > 0
    ? [...EXAM_TYPES].sort((a, b) => {
        const aRec = recommendedTypes.includes(a.id) ? 0 : 1;
        const bRec = recommendedTypes.includes(b.id) ? 0 : 1;
        return aRec - bRec;
      })
    : EXAM_TYPES;

  const modeConfig = PRACTICE_MODES.find((m) => m.id === selectedMode)!;

  const launchExamWithMode = (subject: string, questions: any[], topic?: string) => {
    const count = selectedMode === "marathon" ? Math.min(50, questions.length) : Math.min(10, questions.length);
    const sliced = shuffleArray(questions).slice(0, count);
    if (sliced.length === 0) return;

    const timePerQ = modeConfig.timePerQ ?? 9999;

    startExam({
      subject,
      topic,
      count: sliced.length,
      timePerQuestion: timePerQ,
      questions: sliced,
      practiceMode: selectedMode,
    });
    router.push("/exam");
  };

  const handleTopicPress = (subject: SubjectInfo, topic: string) => {
    const questions = getQuestionsForSubject(subject.name, topic);
    if (questions.length === 0) return;
    setPendingAction({ subject: subject.name, questions, topic });
    setShowModeModal(true);
  };

  const handleSubjectPress = (subject: SubjectInfo) => {
    const questions = getQuestionsForSubject(subject.name);
    if (questions.length === 0) return;
    setPendingAction({ subject: subject.name, questions });
    setShowModeModal(true);
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

  const handleAdaptiveMode = () => {
    const initialQ = getNextAdaptiveQuestion(selectedExamType, "medium", new Set(), language);
    if (!initialQ) return;
    startExam({
      subject: tr("adaptive.title"),
      count: 10,
      timePerQuestion: 90,
      questions: [initialQ],
      adaptive: true,
    });
    router.push("/exam");
  };

  const handleConfirmMode = () => {
    setShowModeModal(false);
    if (pendingAction) {
      launchExamWithMode(pendingAction.subject, pendingAction.questions, pendingAction.topic);
      setPendingAction(null);
    }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
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
          {sortedExamTypes.map((exam) => {
            const isSelected = selectedExamType === exam.id;
            const isRecommended = recommendedTypes.includes(exam.id);
            return (
              <Pressable
                key={exam.id}
                style={[
                  styles.examTypeChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : isRecommended ? colors.primary + "60" : colors.border,
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
                  color={isSelected ? "#FFFFFF" : isRecommended ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.examTypeText,
                    {
                      color: isSelected ? "#FFFFFF" : isRecommended ? colors.primary : colors.text,
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

        <Pressable
          style={[styles.adaptiveModeCard, { backgroundColor: colors.warningLight, borderColor: colors.warning + "40" }]}
          onPress={handleAdaptiveMode}
        >
          <Ionicons name="speedometer" size={22} color={colors.warning} />
          <View style={styles.adaptiveInfo}>
            <Text style={[styles.adaptiveTitle, { color: colors.warning, fontFamily: "Inter_600SemiBold" }]}>
              {tr("adaptive.title")}
            </Text>
            <Text style={[styles.adaptiveDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {tr("adaptive.practiceDesc")}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.warning} />
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

      <Modal visible={showModeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {tr("mode.select")}
              </Text>
              <Pressable onPress={() => { setShowModeModal(false); setPendingAction(null); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.modesGrid}>
              {PRACTICE_MODES.map((mode) => {
                const isActive = selectedMode === mode.id;
                return (
                  <Pressable
                    key={mode.id}
                    style={[
                      styles.modeCard,
                      {
                        backgroundColor: isActive ? mode.color + "15" : colors.surface,
                        borderColor: isActive ? mode.color : colors.borderLight,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedMode(mode.id)}
                  >
                    <View style={[styles.modeIconWrap, { backgroundColor: mode.color + "20" }]}>
                      <Ionicons name={mode.icon as any} size={24} color={mode.color} />
                    </View>
                    <Text style={[styles.modeCardTitle, { color: isActive ? mode.color : colors.text, fontFamily: "Inter_600SemiBold" }]}>
                      {tr(`mode.${mode.id}`)}
                    </Text>
                    <Text style={[styles.modeCardDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                      {tr(`mode.${mode.id}.desc`)}
                    </Text>
                    <View style={styles.modeCardMeta}>
                      {mode.timePerQ ? (
                        <Text style={[styles.modeMetaText, { color: mode.color, fontFamily: "Inter_500Medium" }]}>
                          {mode.timePerQ}s {tr("mode.perQuestion")}
                        </Text>
                      ) : (
                        <Text style={[styles.modeMetaText, { color: mode.color, fontFamily: "Inter_500Medium" }]}>
                          {tr("mode.noTimer")}
                        </Text>
                      )}
                      {mode.id === "marathon" && (
                        <Text style={[styles.modeMetaText, { color: mode.color, fontFamily: "Inter_500Medium" }]}>
                          50 {tr("mode.questions")}
                        </Text>
                      )}
                    </View>
                    {isActive && (
                      <View style={[styles.modeCheck, { backgroundColor: mode.color }]}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.startButton, { backgroundColor: PRACTICE_MODES.find(m => m.id === selectedMode)!.color }]}
              onPress={handleConfirmMode}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={[styles.startButtonText, { fontFamily: "Inter_600SemiBold" }]}>
                {tr("mode.start")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
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
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  adaptiveModeCard: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20 },
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  modeCard: {
    width: "47%",
    padding: 14,
    borderRadius: 14,
    position: "relative",
    minHeight: 140,
  },
  modeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modeCardTitle: { fontSize: 15, marginBottom: 4 },
  modeCardDesc: { fontSize: 11, lineHeight: 16, marginBottom: 8 },
  modeCardMeta: { gap: 2 },
  modeMetaText: { fontSize: 11 },
  modeCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: Platform.OS === "web" ? 34 : 10,
  },
  startButtonText: { fontSize: 16, color: "#FFFFFF" },
});
