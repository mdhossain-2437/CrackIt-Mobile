import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
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
  type Difficulty,
} from "@/lib/questions";
import { getAdaptiveQuestions, getTopicStrength, getNextAdaptiveQuestion, getSmartRecommendations } from "@/lib/algorithm";
import { apiRequest } from "@/lib/query-client";

const PRACTICE_MODES: {
  id: PracticeMode | "adaptive";
  icon: string;
  color: string;
  gradient: [string, string];
  timePerQ: number | null;
  questionCount: number | null;
}[] = [
  { id: "relaxed", icon: "leaf-outline", color: "#4CAF50", gradient: ["#4CAF50", "#2E7D32"], timePerQ: null, questionCount: 10 },
  { id: "timed", icon: "time-outline", color: "#1A73E8", gradient: ["#1A73E8", "#1557B0"], timePerQ: 60, questionCount: 10 },
  { id: "speed", icon: "flash-outline", color: "#FF6B35", gradient: ["#FF6B35", "#E65100"], timePerQ: 15, questionCount: 10 },
  { id: "marathon", icon: "fitness-outline", color: "#9C27B0", gradient: ["#9C27B0", "#6A1B9A"], timePerQ: 60, questionCount: 50 },
  { id: "adaptive", icon: "pulse-outline", color: "#0891B2", gradient: ["#0891B2", "#0E7490"], timePerQ: 90, questionCount: 10 },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 50];
const DIFFICULTY_FILTERS: (Difficulty | "all")[] = ["all", "easy", "medium", "hard"];

function PulsingBadge({ color }: { color: string }) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 800, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  return (
    <Animated.View style={[{
      position: "absolute",
      top: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: color,
    }, pulseStyle]} />
  );
}

function CircularProgress({ size, strokeWidth, progress, color, bgColor }: {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  bgColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${clampedProgress}% progress`}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: bgColor,
        position: "absolute",
      }} />
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        borderTopColor: clampedProgress >= 75 ? color : "transparent",
        borderRightColor: clampedProgress >= 50 ? color : "transparent",
        borderBottomColor: clampedProgress >= 25 ? color : "transparent",
        borderLeftColor: clampedProgress > 0 ? color : "transparent",
        position: "absolute",
        transform: [{ rotate: "-90deg" }],
      }} />
      <View style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text style={{ fontSize: size * 0.22, fontFamily: "Inter_700Bold", color }}>
          {clampedProgress}%
        </Text>
      </View>
    </View>
  );
}

function AnimatedSubjectCard({
  subject,
  isExpanded,
  onToggle,
  onSubjectPress,
  onTopicPress,
  questionCount,
  pct,
  subjectName,
  colors,
  language,
  userData,
  tr,
  strengthColor,
  index,
  bookmarkedTopics,
}: {
  subject: SubjectInfo;
  isExpanded: boolean;
  onToggle: () => void;
  onSubjectPress: () => void;
  onTopicPress: (topic: string) => void;
  questionCount: number;
  pct: number;
  subjectName: string;
  colors: any;
  language: string;
  userData: any;
  tr: (key: string) => string;
  strengthColor: (s: string) => string;
  index: number;
  bookmarkedTopics: Set<string>;
}) {
  const cardScale = useSharedValue(1);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handlePressIn = () => {
    cardScale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={styles.subjectSection}>
      <Animated.View style={cardAnimStyle}>
        <Pressable
          style={[styles.subjectHeader, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          onPress={onToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`${subjectName}, ${questionCount} ${tr("practice.questions")}, ${pct}% progress`}
          accessibilityHint={isExpanded ? "Collapse topic list" : "Expand to see topics"}
          accessibilityState={{ expanded: isExpanded }}
        >
          <LinearGradient
            colors={[subject.color + "25", subject.color + "08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subjectGradientBg}
          />
          <View style={[styles.subjectIconWrap, { backgroundColor: subject.color + "20" }]}>
            <Ionicons name={subject.icon as any} size={22} color={subject.color} />
          </View>
          <View style={styles.subjectInfo}>
            <Text style={[styles.subjectName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {subjectName}
            </Text>
            <Text style={[styles.subjectMeta, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {questionCount} {tr("practice.questions")}
            </Text>
          </View>
          <CircularProgress
            size={44}
            strokeWidth={3}
            progress={pct}
            color={subject.color}
            bgColor={colors.borderLight}
          />
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      </Animated.View>

      {isExpanded && (
        <Animated.View entering={FadeIn.duration(250)} style={[styles.topicsContainer, { borderColor: colors.borderLight, backgroundColor: colors.surface }]}>
          <Pressable
            style={[styles.topicItem, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
            onPress={onSubjectPress}
            accessibilityRole="button"
            accessibilityLabel={`${tr("practice.allTopics")} for ${subjectName}`}
          >
            <View style={styles.topicInfo}>
              <View style={[styles.topicIconWrap, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name="shuffle-outline" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.topicName, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {tr("practice.allTopics")}
              </Text>
            </View>
            <Ionicons name="play-circle" size={22} color={colors.primary} />
          </Pressable>

          {subject.topics.map((topic, idx) => {
            const topicQuestions = getQuestionsForSubject(subject.name, topic).length;
            const strength = getTopicStrength(userData, subject.name, topic);
            const topicName = language === "bn" && subject.topicsBn[idx] ? subject.topicsBn[idx] : topic;
            const isWeak = strength === "weak";
            const hasBookmark = bookmarkedTopics.has(`${subject.name}::${topic}`);
            return (
              <Pressable
                key={topic}
                style={[
                  styles.topicItem,
                  idx < subject.topics.length - 1 && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                ]}
                onPress={() => onTopicPress(topic)}
                accessibilityRole="button"
                accessibilityLabel={`${topicName}, ${topicQuestions} ${tr("practice.questions")}, strength: ${strength}${hasBookmark ? ", bookmarked" : ""}`}
              >
                <View style={styles.topicInfo}>
                  <View style={[styles.topicIconWrap, { backgroundColor: strengthColor(strength) + "15" }]}>
                    <Ionicons name="document-text-outline" size={16} color={strength !== "unseen" ? strengthColor(strength) : colors.textSecondary} />
                  </View>
                  <View>
                    <View style={styles.topicNameRow}>
                      <Text style={[styles.topicName, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                        {topicName}
                      </Text>
                      {hasBookmark && (
                        <Ionicons name="bookmark" size={14} color={colors.warning} style={{ marginLeft: 4 }} />
                      )}
                      {strength !== "unseen" && (
                        <View style={[styles.strengthBadge, { backgroundColor: strengthColor(strength) + "18" }]}>
                          {isWeak && <PulsingBadge color={strengthColor(strength)} />}
                          <View style={[styles.strengthDot, { backgroundColor: strengthColor(strength) }]} />
                          <Text style={[styles.strengthText, { color: strengthColor(strength), fontFamily: "Inter_500Medium" }]}>
                            {strength === "weak" ? "!" : strength === "moderate" ? "~" : ""}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.topicCount, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                      {topicQuestions} {topicQuestions !== 1 ? tr("practice.questions") : tr("practice.question")}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </Animated.View>
  );
}

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, startExam, tr, language, authUser, isAuthenticated } = useApp();
  const [selectedExamType, setSelectedExamType] = useState<ExamType>(userData.examType);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<PracticeMode | "adaptive">("timed");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ subject: string; questions: any[]; topic?: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: 0,
    explanation: "",
    subject: "",
    topic: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (isAuthenticated) {
      apiRequest("GET", "/api/bookmarks")
        .then((r) => r.json())
        .then((data) => {
          if (data.bookmarks) {
            const topics = new Set<string>();
            data.bookmarks.forEach((b: any) => {
              if (b.subject && b.topic) topics.add(`${b.subject}::${b.topic}`);
            });
            setBookmarkedTopics(topics);
          }
        })
        .catch(() => {})
        .finally(() => setRefreshing(false));
    } else {
      setTimeout(() => setRefreshing(false), 600);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      apiRequest("GET", "/api/bookmarks")
        .then((r) => r.json())
        .then((data) => {
          if (data.bookmarks) {
            const topics = new Set<string>();
            data.bookmarks.forEach((b: any) => {
              if (b.subject && b.topic) topics.add(`${b.subject}::${b.topic}`);
            });
            setBookmarkedTopics(topics);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

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

  const spacedReviewItems = useMemo(() => {
    return getSmartRecommendations(userData, selectedExamType, 20).filter(
      (r) => r.type === "spaced_review"
    );
  }, [userData, selectedExamType]);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase();
    return subjects.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(q) || s.nameBn.includes(q);
      const topicMatch = s.topics.some((t) => t.toLowerCase().includes(q)) ||
        s.topicsBn.some((t) => t.includes(q));
      return nameMatch || topicMatch;
    });
  }, [subjects, searchQuery]);

  const modeConfig = PRACTICE_MODES.find((m) => m.id === selectedMode)!;

  const launchExamWithMode = (subject: string, questions: any[], topic?: string) => {
    let filtered = questions;
    if (selectedDifficulty !== "all") {
      const diffFiltered = questions.filter((q: any) => q.difficulty === selectedDifficulty);
      if (diffFiltered.length > 0) filtered = diffFiltered;
    }

    if (selectedMode === "adaptive") {
      const adaptiveQuestions = getAdaptiveQuestions(userData, selectedExamType, selectedQuestionCount, language);
      if (adaptiveQuestions.length === 0) return;
      startExam({
        subject,
        topic,
        count: adaptiveQuestions.length,
        timePerQuestion: 90,
        questions: adaptiveQuestions,
        adaptive: true,
      });
      router.push("/exam");
      return;
    }

    const count = Math.min(selectedQuestionCount, filtered.length);
    const sliced = shuffleArray(filtered).slice(0, count);
    if (sliced.length === 0) return;

    const timePerQ = modeConfig.timePerQ ?? 9999;

    startExam({
      subject,
      topic,
      count: sliced.length,
      timePerQuestion: timePerQ,
      questions: sliced,
      practiceMode: selectedMode as PracticeMode,
    });
    router.push("/exam");
  };

  const handleTopicPress = (subject: SubjectInfo, topic: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const questions = getQuestionsForSubject(subject.name, topic);
    if (questions.length === 0) return;
    setPendingAction({ subject: subject.name, questions, topic });
    setShowModeModal(true);
  };

  const handleSubjectPress = (subject: SubjectInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const questions = getQuestionsForSubject(subject.name);
    if (questions.length === 0) return;
    setPendingAction({ subject: subject.name, questions });
    setShowModeModal(true);
  };

  const handleSpacedReview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const questions = getAdaptiveQuestions(userData, selectedExamType, 10, language);
    if (questions.length === 0) return;
    startExam({
      subject: tr("practice.spacedReview"),
      count: questions.length,
      timePerQuestion: 90,
      questions,
    });
    router.push("/exam");
  };

  const handleAdaptive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModeModal(false);
    if (pendingAction) {
      launchExamWithMode(pendingAction.subject, pendingAction.questions, pendingAction.topic);
      setPendingAction(null);
    }
  };

  const handleCreateQuestion = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        language === "bn" ? "লগইন প্রয়োজন" : "Login Required",
        language === "bn" ? "প্রশ্ন তৈরি করতে লগইন করুন" : "Please login to create questions"
      );
      return;
    }
    const { question, optionA, optionB, optionC, optionD, explanation, subject, topic } = createForm;
    if (!question.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      Alert.alert(
        language === "bn" ? "অসম্পূর্ণ" : "Incomplete",
        language === "bn" ? "প্রশ্ন এবং সব অপশন পূরণ করুন" : "Please fill in the question and all options"
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/questions/create", {
        examType: selectedExamType,
        subject: subject.trim() || "General",
        topic: topic.trim() || "General",
        difficulty: createForm.difficulty,
        language,
        question: question.trim(),
        options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
        correctAnswer: createForm.correctAnswer,
        explanation: explanation.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        language === "bn" ? "সফল!" : "Success!",
        language === "bn" ? "আপনার প্রশ্ন তৈরি হয়েছে" : "Your question has been created"
      );
      setShowCreateModal(false);
      setCreateForm({
        question: "", optionA: "", optionB: "", optionC: "", optionD: "",
        correctAnswer: 0, explanation: "", subject: "", topic: "", difficulty: "medium",
      });
    } catch (e: any) {
      Alert.alert(language === "bn" ? "ত্রুটি" : "Error", e.message || "Failed to create question");
    } finally {
      setIsSubmitting(false);
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

  const difficultyColor = (d: string) => {
    switch (d) {
      case "easy": return "#4CAF50";
      case "medium": return "#FF9800";
      case "hard": return "#F44336";
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
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
          colors={[colors.primary + "12", colors.primary + "04", "transparent"]}
          style={[styles.heroGradient, { paddingTop: topInset + 16 }]}
        >
          <Text
            style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}
            accessibilityRole="header"
          >
            {tr("practice.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {subjects.length} {language === "bn" ? "বিষয়" : "subjects"} {"\u2022"} {subjects.reduce((acc, s) => acc + getQuestionsForSubject(s.name).length, 0)} {tr("practice.questions")}
          </Text>
        </LinearGradient>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={tr("practice.searchPlaceholder")}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel={tr("practice.searchPlaceholder")}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

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
                    borderColor: isSelected ? colors.primary : isRecommended ? colors.primary + "60" : colors.borderLight,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedExamType(exam.id);
                  setExpandedSubject(null);
                  setSearchQuery("");
                }}
                accessibilityRole="button"
                accessibilityLabel={`${language === "bn" ? exam.nameBn : exam.name}${isRecommended ? ", recommended" : ""}${isSelected ? ", selected" : ""}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={exam.icon as any}
                  size={15}
                  color={isSelected ? "#FFFFFF" : isRecommended ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.examTypeText,
                    {
                      color: isSelected ? "#FFFFFF" : isRecommended ? colors.primary : colors.text,
                      fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_500Medium",
                    },
                  ]}
                >
                  {language === "bn" ? exam.nameBn : exam.name}
                </Text>
                {isRecommended && !isSelected && (
                  <View style={[styles.recommendedDot, { backgroundColor: colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {spacedReviewItems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Pressable
              style={[styles.spacedReviewBanner, { borderColor: colors.error + "30" }]}
              onPress={handleSpacedReview}
              accessibilityRole="button"
              accessibilityLabel={`${spacedReviewItems.length} ${tr("practice.spacedReviewDesc")}. ${tr("practice.reviewNow")}`}
            >
              <LinearGradient
                colors={[colors.error + "15", colors.error + "08"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.spacedReviewGradient}
              >
                <View style={[styles.spacedReviewIcon, { backgroundColor: colors.error + "20" }]}>
                  <Ionicons name="alarm-outline" size={22} color={colors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.spacedReviewTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                      {tr("practice.spacedReview")}
                    </Text>
                    <View style={[styles.urgencyBadge, { backgroundColor: colors.error + "20" }]}>
                      <Text style={[styles.urgencyText, { color: colors.error, fontFamily: "Inter_600SemiBold" }]}>
                        {tr("practice.overdue")}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.spacedReviewDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                    {spacedReviewItems.length} {tr("practice.spacedReviewDesc")}
                  </Text>
                </View>
                <View style={[styles.reviewNowButton, { backgroundColor: colors.error }]}>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.specialCardsRow}>
          <Pressable
            style={[styles.specialCard, { flex: 1 }]}
            onPress={handleAdaptive}
            accessibilityRole="button"
            accessibilityLabel={`${tr("practice.adaptive")} - Smart practice`}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary + "CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.specialCardGradient}
            >
              <View style={styles.specialCardIcon}>
                <Ionicons name="flash" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.specialCardTitle, { fontFamily: "Inter_600SemiBold" }]}>
                {tr("practice.adaptive")}
              </Text>
              <Text style={[styles.specialCardDesc, { fontFamily: "Inter_400Regular" }]}>
                {language === "bn" ? "স্মার্ট" : "Smart"}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={[styles.specialCard, { flex: 1 }]}
            onPress={handleAdaptiveMode}
            accessibilityRole="button"
            accessibilityLabel={`${tr("adaptive.title")} - Real-time difficulty`}
          >
            <LinearGradient
              colors={[colors.warning, "#E65100"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.specialCardGradient}
            >
              <View style={styles.specialCardIcon}>
                <Ionicons name="speedometer" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.specialCardTitle, { fontFamily: "Inter_600SemiBold" }]}>
                {tr("adaptive.title")}
              </Text>
              <Text style={[styles.specialCardDesc, { fontFamily: "Inter_400Regular" }]}>
                {language === "bn" ? "রিয়েল-টাইম" : "Real-time"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            {tr("practice.difficultyFilter")}:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {DIFFICULTY_FILTERS.map((d) => {
              const isActive = selectedDifficulty === d;
              const dColor = d === "all" ? colors.primary : difficultyColor(d);
              return (
                <Pressable
                  key={d}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? dColor + "18" : colors.surface,
                      borderColor: isActive ? dColor : colors.borderLight,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDifficulty(d);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${d === "all" ? tr("practice.all") : tr(`difficulty.${d}`)} difficulty filter`}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isActive ? dColor : colors.textSecondary,
                        fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {d === "all" ? tr("practice.all") : tr(`difficulty.${d}`)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Text
          style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}
          accessibilityRole="header"
        >
          {language === "bn" ? "বিষয়সমূহ" : "Subjects"}
        </Text>

        {filteredSubjects.length === 0 && searchQuery.length > 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={colors.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.emptyText, fontFamily: "Inter_500Medium" }]}>
              {tr("practice.noResults")}
            </Text>
          </View>
        )}

        {filteredSubjects.map((subject, index) => {
          const isExpanded = expandedSubject === subject.id;
          const questionCount = getQuestionsForSubject(subject.name).length;
          const progress = userData.subjectProgress[subject.name];
          const pct = progress ? Math.round((progress.correct / Math.max(progress.total, 1)) * 100) : 0;
          const subjectName = language === "bn" ? subject.nameBn : subject.name;

          return (
            <AnimatedSubjectCard
              key={subject.id}
              subject={subject}
              isExpanded={isExpanded}
              onToggle={() => setExpandedSubject(isExpanded ? null : subject.id)}
              onSubjectPress={() => handleSubjectPress(subject)}
              onTopicPress={(topic) => handleTopicPress(subject, topic)}
              questionCount={questionCount}
              pct={pct}
              subjectName={subjectName}
              colors={colors}
              language={language}
              userData={userData}
              tr={tr}
              strengthColor={strengthColor}
              index={index}
              bookmarkedTopics={bookmarkedTopics}
            />
          );
        })}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowCreateModal(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={language === "bn" ? "প্রশ্ন তৈরি করুন" : "Create Question"}
        accessibilityHint="Opens form to create a new question"
      >
        <LinearGradient
          colors={["#7C3AED", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>

      <Modal visible={showModeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {tr("mode.select")}
              </Text>
              <Pressable
                onPress={() => { setShowModeModal(false); setPendingAction(null); }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <View style={styles.modesGrid}>
                {PRACTICE_MODES.map((mode) => {
                  const isActive = selectedMode === mode.id;
                  return (
                    <Pressable
                      key={mode.id}
                      style={[
                        styles.modeCard,
                        {
                          backgroundColor: isActive ? mode.color + "12" : colors.surface,
                          borderColor: isActive ? mode.color : colors.borderLight,
                          borderWidth: isActive ? 2 : 1,
                        },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedMode(mode.id);
                        if (mode.id === "marathon") setSelectedQuestionCount(50);
                        else if (mode.id === "adaptive") setSelectedQuestionCount(10);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${tr(`mode.${mode.id}`)} mode`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <LinearGradient
                        colors={isActive ? [mode.color + "18", "transparent"] : ["transparent", "transparent"]}
                        style={styles.modeCardGradientBg}
                      />
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

              {selectedMode !== "marathon" && selectedMode !== "adaptive" && (
                <View style={styles.questionCountSection}>
                  <Text style={[styles.questionCountLabel, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {tr("practice.questionCount")}
                  </Text>
                  <View style={styles.questionCountRow}>
                    {QUESTION_COUNTS.map((c) => {
                      const isActive = selectedQuestionCount === c;
                      return (
                        <Pressable
                          key={c}
                          style={[
                            styles.questionCountChip,
                            {
                              backgroundColor: isActive ? colors.primary + "18" : colors.surface,
                              borderColor: isActive ? colors.primary : colors.borderLight,
                            },
                          ]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedQuestionCount(c);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`${c} questions`}
                          accessibilityState={{ selected: isActive }}
                        >
                          <Text
                            style={[
                              styles.questionCountText,
                              {
                                color: isActive ? colors.primary : colors.textSecondary,
                                fontFamily: isActive ? "Inter_600SemiBold" : "Inter_500Medium",
                              },
                            ]}
                          >
                            {c}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            <Pressable
              style={styles.startButtonWrap}
              onPress={handleConfirmMode}
              accessibilityRole="button"
              accessibilityLabel={tr("mode.start")}
            >
              <LinearGradient
                colors={PRACTICE_MODES.find(m => m.id === selectedMode)!.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={[styles.startButtonText, { fontFamily: "Inter_600SemiBold" }]}>
                  {tr("mode.start")}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.createModalContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  {language === "bn" ? "প্রশ্ন তৈরি করুন" : "Create Question"}
                </Text>
                <Pressable
                  onPress={() => setShowCreateModal(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[styles.createLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                  {language === "bn" ? "প্রশ্ন" : "Question"} *
                </Text>
                <TextInput
                  style={[styles.createInput, styles.createInputMultiline, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.surface }]}
                  placeholder={language === "bn" ? "আপনার প্রশ্ন লিখুন..." : "Write your question..."}
                  placeholderTextColor={colors.textTertiary}
                  value={createForm.question}
                  onChangeText={(t) => setCreateForm(p => ({ ...p, question: t }))}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel={language === "bn" ? "প্রশ্ন" : "Question"}
                />

                <View style={styles.createOptionsGrid}>
                  {["A", "B", "C", "D"].map((label, idx) => (
                    <View key={label} style={styles.createOptionRow}>
                      <Pressable
                        style={[
                          styles.createOptionRadio,
                          {
                            borderColor: createForm.correctAnswer === idx ? "#4CAF50" : colors.borderLight,
                            backgroundColor: createForm.correctAnswer === idx ? "#4CAF5020" : "transparent",
                          },
                        ]}
                        onPress={() => setCreateForm(p => ({ ...p, correctAnswer: idx }))}
                        accessibilityRole="radio"
                        accessibilityLabel={`Option ${label} is correct answer`}
                        accessibilityState={{ selected: createForm.correctAnswer === idx }}
                      >
                        <Text style={{ color: createForm.correctAnswer === idx ? "#4CAF50" : colors.textSecondary, fontSize: 12, fontFamily: "Inter_600SemiBold" as const }}>
                          {label}
                        </Text>
                      </Pressable>
                      <TextInput
                        style={[styles.createInput, { flex: 1, color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.surface }]}
                        placeholder={`${language === "bn" ? "অপশন" : "Option"} ${label}`}
                        placeholderTextColor={colors.textTertiary}
                        value={(createForm as any)[`option${label}`]}
                        onChangeText={(t) => setCreateForm(p => ({ ...p, [`option${label}`]: t }))}
                        accessibilityLabel={`Option ${label}`}
                      />
                    </View>
                  ))}
                </View>
                <Text style={[styles.createHint, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
                  {language === "bn" ? "সঠিক উত্তর নির্বাচন করতে A/B/C/D ট্যাপ করুন" : "Tap A/B/C/D to select the correct answer"}
                </Text>

                <View style={styles.createRowFields}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.createLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                      {language === "bn" ? "বিষয়" : "Subject"}
                    </Text>
                    <TextInput
                      style={[styles.createInput, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.surface }]}
                      placeholder={language === "bn" ? "যেমন: গণিত" : "e.g. Mathematics"}
                      placeholderTextColor={colors.textTertiary}
                      value={createForm.subject}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, subject: t }))}
                      accessibilityLabel={language === "bn" ? "বিষয়" : "Subject"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.createLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                      {language === "bn" ? "টপিক" : "Topic"}
                    </Text>
                    <TextInput
                      style={[styles.createInput, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.surface }]}
                      placeholder={language === "bn" ? "যেমন: বীজগণিত" : "e.g. Algebra"}
                      placeholderTextColor={colors.textTertiary}
                      value={createForm.topic}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, topic: t }))}
                      accessibilityLabel={language === "bn" ? "টপিক" : "Topic"}
                    />
                  </View>
                </View>

                <Text style={[styles.createLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                  {language === "bn" ? "কঠিনতা" : "Difficulty"}
                </Text>
                <View style={styles.createDifficultyRow}>
                  {(["easy", "medium", "hard"] as const).map((d) => {
                    const isActive = createForm.difficulty === d;
                    const dColor = d === "easy" ? "#4CAF50" : d === "medium" ? "#FF9800" : "#F44336";
                    return (
                      <Pressable
                        key={d}
                        style={[
                          styles.createDifficultyChip,
                          {
                            backgroundColor: isActive ? dColor + "20" : colors.surface,
                            borderColor: isActive ? dColor : colors.borderLight,
                          },
                        ]}
                        onPress={() => setCreateForm(p => ({ ...p, difficulty: d }))}
                        accessibilityRole="button"
                        accessibilityLabel={`${tr(`difficulty.${d}`)} difficulty`}
                        accessibilityState={{ selected: isActive }}
                      >
                        <Text style={{ color: isActive ? dColor : colors.textSecondary, fontSize: 13, fontFamily: "Inter_500Medium" as const }}>
                          {d === "easy" ? (language === "bn" ? "সহজ" : "Easy") : d === "medium" ? (language === "bn" ? "মাঝারি" : "Medium") : (language === "bn" ? "কঠিন" : "Hard")}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.createLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                  {language === "bn" ? "ব্যাখ্যা (ঐচ্ছিক)" : "Explanation (optional)"}
                </Text>
                <TextInput
                  style={[styles.createInput, styles.createInputMultiline, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.surface }]}
                  placeholder={language === "bn" ? "কেন এটি সঠিক উত্তর..." : "Why this is the correct answer..."}
                  placeholderTextColor={colors.textTertiary}
                  value={createForm.explanation}
                  onChangeText={(t) => setCreateForm(p => ({ ...p, explanation: t }))}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel={language === "bn" ? "ব্যাখ্যা" : "Explanation"}
                />

                <Pressable
                  style={[styles.startButtonWrap, { marginTop: 16, opacity: isSubmitting ? 0.6 : 1 }]}
                  onPress={handleCreateQuestion}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel={language === "bn" ? "প্রশ্ন জমা দিন" : "Submit Question"}
                  accessibilityState={{ disabled: isSubmitting }}
                >
                  <LinearGradient
                    colors={["#7C3AED", "#4F46E5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startButton}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={[styles.startButtonText, { fontFamily: "Inter_600SemiBold" }]}>
                          {language === "bn" ? "প্রশ্ন জমা দিন" : "Submit Question"}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  heroGradient: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
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
  examTypeText: { fontSize: 13 },
  recommendedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  spacedReviewBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  spacedReviewGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  spacedReviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  spacedReviewTitle: {
    fontSize: 15,
  },
  spacedReviewDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 10,
  },
  reviewNowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  specialCardsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  specialCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  specialCardGradient: {
    padding: 16,
    borderRadius: 16,
    minHeight: 100,
    justifyContent: "flex-end",
  },
  specialCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  specialCardTitle: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  specialCardDesc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  subjectSection: { marginHorizontal: 20, marginBottom: 10 },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    overflow: "hidden",
  },
  subjectGradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  subjectIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, marginBottom: 2 },
  subjectMeta: { fontSize: 12, marginBottom: 4 },
  topicsContainer: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  topicInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  topicIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  topicNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topicName: { fontSize: 14 },
  topicCount: { fontSize: 11, marginTop: 2 },
  strengthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    position: "relative",
  },
  strengthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 10,
  },
  fab: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 90 : 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    overflow: "hidden",
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    width: "47%" as any,
    padding: 14,
    borderRadius: 16,
    position: "relative",
    minHeight: 130,
    overflow: "hidden",
  },
  modeCardGradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  questionCountSection: {
    marginBottom: 20,
  },
  questionCountLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  questionCountRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  questionCountChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 52,
    alignItems: "center",
  },
  questionCountText: {
    fontSize: 14,
  },
  startButtonWrap: {
    marginBottom: Platform.OS === "web" ? 34 : 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: { fontSize: 16, color: "#FFFFFF" },
  createModalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "92%",
  },
  createLabel: {
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  createInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  createInputMultiline: {
    minHeight: 70,
    paddingTop: 12,
  },
  createOptionsGrid: {
    marginTop: 12,
    gap: 10,
  },
  createOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  createOptionRadio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  createHint: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
  createRowFields: {
    flexDirection: "row",
    gap: 12,
  },
  createDifficultyRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  createDifficultyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
});
