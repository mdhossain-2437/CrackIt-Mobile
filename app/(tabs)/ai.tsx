import React, { useState } from "react";
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
import * as Haptics from "expo-haptics";

const DIFFICULTIES: { id: Difficulty | "mixed"; label: string }[] = [
  { id: "mixed", label: "Mixed" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const COUNTS = [3, 5, 10];

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, startExam } = useApp();

  const [selectedExamType, setSelectedExamType] = useState<ExamType>(userData.examType);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "mixed">("mixed");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const examTypeInfo = EXAM_TYPES.find((e) => e.id === selectedExamType);
  const subjects = examTypeInfo?.subjects || [];

  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject");
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
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError("No questions generated. Try a different topic.");
      }
    } catch (e: any) {
      setError("Failed to generate questions. Please try again.");
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
          AI Generator
        </Text>
        <Ionicons name="sparkles" size={24} color={colors.primary} />
      </View>

      <Text style={[styles.description, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
        Generate fresh MCQ questions on any topic using AI. Perfect for targeted practice.
      </Text>

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        Exam Type
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {EXAM_TYPES.map((exam) => {
          const isSelected = selectedExamType === exam.id;
          return (
            <Pressable
              key={exam.id}
              style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
              onPress={() => setSelectedExamType(exam.id)}
            >
              <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : colors.text, fontFamily: "Inter_500Medium" }]}>
                {exam.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        Subject
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
        placeholder="e.g., Physics, Biology, Bangladesh Affairs"
        placeholderTextColor={colors.textTertiary}
        value={subject}
        onChangeText={setSubject}
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
                {s.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        Topic (Optional)
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
        placeholder="e.g., Thermodynamics, Genetics"
        placeholderTextColor={colors.textTertiary}
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        Difficulty
      </Text>
      <View style={styles.chipsRow}>
        {DIFFICULTIES.map((d) => {
          const isSelected = difficulty === d.id;
          return (
            <Pressable
              key={d.id}
              style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
              onPress={() => setDifficulty(d.id)}
            >
              <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : colors.text, fontFamily: "Inter_500Medium" }]}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        Number of Questions
      </Text>
      <View style={styles.chipsRow}>
        {COUNTS.map((c) => {
          const isSelected = count === c;
          return (
            <Pressable
              key={c}
              style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
              onPress={() => setCount(c)}
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
      >
        {isGenerating ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={[styles.generateText, { fontFamily: "Inter_600SemiBold" }]}>
              Generating...
            </Text>
          </View>
        ) : (
          <View style={styles.loadingRow}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={[styles.generateText, { fontFamily: "Inter_600SemiBold" }]}>
              Generate Questions
            </Text>
          </View>
        )}
      </Pressable>

      {generatedQuestions.length > 0 && (
        <View style={styles.resultsSection}>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              Generated {generatedQuestions.length} Questions
            </Text>
            <Pressable
              style={[styles.practiceBtn, { backgroundColor: colors.success }]}
              onPress={handlePractice}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={[styles.practiceBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                Practice
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
                  {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correctAnswer ? " (Correct)" : ""}
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
