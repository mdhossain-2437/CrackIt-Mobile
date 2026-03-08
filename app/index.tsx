import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { EXAM_TYPES, type ExamType } from "@/lib/questions";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, isLoading, completeOnboarding } = useApp();
  const [selectedType, setSelectedType] = useState<ExamType | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const tr = (key: string) => t(key, selectedLanguage);

  useEffect(() => {
    if (!isLoading && userData.onboarded) {
      router.replace("/(tabs)");
    }
  }, [isLoading, userData.onboarded]);

  if (isLoading || userData.onboarded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleContinue = async () => {
    if (!selectedType || isSubmitting) return;
    setIsSubmitting(true);
    await completeOnboarding(selectedType, selectedLanguage);
    router.replace("/(tabs)");
  };

  const competitiveExams = EXAM_TYPES.filter((e) => e.category === "competitive");
  const boardExams = EXAM_TYPES.filter((e) => e.category === "board");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topInset + 40, paddingBottom: bottomInset + 20, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="flash" size={32} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          {tr("app.name")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
          {tr("app.tagline")}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        {tr("onboarding.selectLanguage")}
      </Text>
      <View style={styles.langRow}>
        {(["en", "bn"] as Language[]).map((lang) => {
          const isSelected = selectedLanguage === lang;
          return (
            <Pressable
              key={lang}
              style={[
                styles.langCard,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text style={[styles.langEmoji, { fontSize: 28 }]}>
                {lang === "en" ? "🇬🇧" : "🇧🇩"}
              </Text>
              <Text style={[styles.langName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                {lang === "en" ? "English" : "বাংলা"}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold", marginTop: 24 }]}>
        {tr("onboarding.selectExam")}
      </Text>

      <Text style={[styles.categoryLabel, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
        {tr("onboarding.competitive")}
      </Text>
      <View style={styles.examGrid}>
        {competitiveExams.map((exam) => {
          const isSelected = selectedType === exam.id;
          return (
            <Pressable
              key={exam.id}
              style={[
                styles.examCard,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedType(exam.id)}
              testID={`exam-type-${exam.id}`}
            >
              <View style={[styles.examIconContainer, { backgroundColor: isSelected ? colors.primary : colors.border }]}>
                <Ionicons
                  name={exam.icon as any}
                  size={24}
                  color={isSelected ? "#FFFFFF" : colors.textSecondary}
                />
              </View>
              <Text style={[styles.examName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                {selectedLanguage === "bn" ? exam.nameBn : exam.name}
              </Text>
              <Text style={[styles.examDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                {selectedLanguage === "bn" ? exam.descriptionBn : exam.description}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.categoryLabel, { color: colors.textSecondary, fontFamily: "Inter_500Medium", marginTop: 20 }]}>
        {tr("onboarding.board")}
      </Text>
      <View style={styles.examGrid}>
        {boardExams.map((exam) => {
          const isSelected = selectedType === exam.id;
          return (
            <Pressable
              key={exam.id}
              style={[
                styles.examCard,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedType(exam.id)}
              testID={`exam-type-${exam.id}`}
            >
              <View style={[styles.examIconContainer, { backgroundColor: isSelected ? colors.primary : colors.border }]}>
                <Ionicons
                  name={exam.icon as any}
                  size={24}
                  color={isSelected ? "#FFFFFF" : colors.textSecondary}
                />
              </View>
              <Text style={[styles.examName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                {selectedLanguage === "bn" ? exam.nameBn : exam.name}
              </Text>
              <Text style={[styles.examDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                {selectedLanguage === "bn" ? exam.descriptionBn : exam.description}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.continueButton,
          {
            backgroundColor: selectedType ? colors.primary : colors.border,
            opacity: isSubmitting ? 0.7 : 1,
            marginTop: 24,
          },
        ]}
        onPress={handleContinue}
        disabled={!selectedType || isSubmitting}
        testID="continue-button"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.continueText, { fontFamily: "Inter_600SemiBold" }]}>
            {tr("onboarding.getStarted")}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  langRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  langCard: {
    width: "44%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    position: "relative",
  },
  langEmoji: {
    marginBottom: 8,
  },
  langName: {
    fontSize: 15,
  },
  categoryLabel: {
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  examGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  examCard: {
    width: "47%",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    position: "relative",
  },
  examIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  examName: {
    fontSize: 15,
    marginBottom: 4,
  },
  examDesc: {
    fontSize: 11,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  continueText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});
