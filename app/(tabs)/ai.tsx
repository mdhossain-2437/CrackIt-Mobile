import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/query-client";
import { EXAM_TYPES, type Question, type ExamType, type Difficulty } from "@/lib/questions";
import type { Language } from "@/lib/i18n";
import * as Haptics from "expo-haptics";

const COUNTS = [3, 5, 10];

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, startExam, tr, language } = useApp();

  const [selectedExamType, setSelectedExamType] = useState<ExamType>(userData.examType);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "mixed">("mixed");
  const [count, setCount] = useState(5);
  const [questionLang, setQuestionLang] = useState<Language>(language);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const examTypeInfo = EXAM_TYPES.find((e) => e.id === selectedExamType);
  const subjects = examTypeInfo?.subjects || [];

  const difficulties: { id: Difficulty | "mixed"; label: string }[] = [
    { id: "mixed", label: tr("difficulty.mixed") },
    { id: "easy", label: tr("difficulty.easy") },
    { id: "medium", label: tr("difficulty.medium") },
    { id: "hard", label: tr("difficulty.hard") },
  ];

  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError(tr("ai.subjectRequired"));
      return;
    }
    setIsGenerating(true);
    setError("");
    setGeneratedQuestions([]);

    try {
      const res = await apiRequest("POST", "/api/generate-questions", {
        examType: selectedExamType,
        subject: subject.trim(),
        topic: topic.trim() || undefined,
        difficulty: difficulty === "mixed" ? undefined : difficulty,
        count,
        language: questionLang,
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(tr("ai.noQuestions"));
      }
    } catch (e: any) {
      setError(tr("ai.error"));
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePractice = () => {
    if (generatedQuestions.length === 0) return;
    startExam({
      subject: subject.trim(),
      topic: topic.trim() || undefined,
      count: generatedQuestions.length,
      timePerQuestion: 90,
      questions: generatedQuestions,
    });
    router.push("/exam");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          {tr("ai.title")}
        </Text>
        <Ionicons name="sparkles" size={24} color={colors.primary} />
      </View>

      <Text style={[styles.description, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
        {tr("ai.description")}
      </Text>

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("ai.language")}
      </Text>
      <View style={styles.chipsRow}>
        {(["en", "bn"] as Language[]).map((lang) => {
          const isSelected = questionLang === lang;
          const label = lang === "en" ? tr("common.english") : tr("common.bangla");
          return (
            <Pressable
              key={lang}
              style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
              onPress={() => setQuestionLang(lang)}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : colors.text, fontFamily: "Inter_500Medium" }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("ai.examType")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {EXAM_TYPES.map((exam) => {
          const isSelected = selectedExamType === exam.id;
          const examLabel = language === "bn" ? exam.nameBn : exam.name;
          return (
            <Pressable
              key={exam.id}
              style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
              onPress={() => setSelectedExamType(exam.id)}
              accessibilityRole="radio"
              accessibilityLabel={examLabel}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : colors.text, fontFamily: "Inter_500Medium" }]}>
                {examLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("ai.subject")}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
        placeholder={tr("ai.subjectPlaceholder")}
        placeholderTextColor={colors.textTertiary}
        value={subject}
        onChangeText={setSubject}
        accessibilityLabel={tr("ai.subject")}
      />

      {subjects.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsRow, { marginTop: 8 }]}
        >
          {subjects.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.chip, { backgroundColor: subject === s.name ? s.color + "20" : colors.surface, borderColor: subject === s.name ? s.color : colors.border }]}
              onPress={() => setSubject(s.name)}
            >
              <Text style={[styles.chipText, { color: subject === s.name ? s.color : colors.text, fontFamily: "Inter_500Medium" }]}>
                {language === "bn" ? s.nameBn : s.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("ai.topic")}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
        placeholder={tr("ai.topicPlaceholder")}
        placeholderTextColor={colors.textTertiary}
        value={topic}
        onChangeText={setTopic}
        accessibilityLabel={tr("ai.topic")}
      />

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("ai.difficulty")}
      </Text>
      <View style={styles.chipsRow}>
        {difficulties.map((d) => {
          const isSelected = difficulty === d.id;
          return (
            <Pressable
              key={d.id}
              style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
              onPress={() => setDifficulty(d.id)}
              accessibilityRole="radio"
              accessibilityLabel={d.label}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : colors.text, fontFamily: "Inter_500Medium" }]}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("ai.numQuestions")}
      </Text>
      <View style={styles.chipsRow}>
        {COUNTS.map((c) => {
          const isSelected = count === c;
          return (
            <Pressable
              key={c}
              style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
              onPress={() => setCount(c)}
              accessibilityRole="radio"
              accessibilityLabel={`${c} ${tr("practice.questions")}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : colors.text, fontFamily: "Inter_500Medium" }]}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error, fontFamily: "Inter_500Medium" }]}>
          {error}
        </Text>
      ) : null}

      <Pressable
        style={[styles.generateButton, { backgroundColor: isGenerating ? colors.border : colors.primary }]}
        onPress={handleGenerate}
        disabled={isGenerating}
        accessibilityRole="button"
        accessibilityLabel={isGenerating ? tr("ai.generating") : tr("ai.generate")}
        accessibilityState={{ disabled: isGenerating }}
      >
        {isGenerating ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={[styles.generateText, { fontFamily: "Inter_600SemiBold" }]}>
              {tr("ai.generating")}
            </Text>
          </View>
        ) : (
          <View style={styles.loadingRow}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={[styles.generateText, { fontFamily: "Inter_600SemiBold" }]}>
              {tr("ai.generate")}
            </Text>
          </View>
        )}
      </Pressable>

      {generatedQuestions.length > 0 && (
        <View style={styles.resultsSection}>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {tr("ai.generated")} {generatedQuestions.length} {tr("practice.questions")}
            </Text>
            <Pressable
              style={[styles.practiceBtn, { backgroundColor: colors.success }]}
              onPress={handlePractice}
              accessibilityRole="button"
              accessibilityLabel={tr("common.practice")}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={[styles.practiceBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                {tr("common.practice")}
              </Text>
            </Pressable>
          </View>

          {generatedQuestions.map((q, idx) => (
            <View key={q.id} style={[styles.questionPreview, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Text style={[styles.questionNum, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Q{idx + 1}
              </Text>
              <Text style={[styles.questionText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                {q.question}
              </Text>
              {q.options.map((opt, optIdx) => (
                <Text
                  key={optIdx}
                  style={[
                    styles.optionPreview,
                    {
                      color: optIdx === q.correctAnswer ? colors.success : colors.textSecondary,
                      fontFamily: optIdx === q.correctAnswer ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correctAnswer ? " ✓" : ""}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  title: { fontSize: 28 },
  description: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 16,
  },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  input: {
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  errorText: {
    paddingHorizontal: 20,
    marginTop: 12,
    fontSize: 13,
  },
  generateButton: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  generateText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  resultsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: { fontSize: 16 },
  practiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  practiceBtnText: { fontSize: 13, color: "#FFFFFF" },
  questionPreview: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  questionNum: { fontSize: 12, marginBottom: 6 },
  questionText: { fontSize: 14, marginBottom: 10, lineHeight: 20 },
  optionPreview: { fontSize: 13, marginBottom: 4, lineHeight: 18 },
});
