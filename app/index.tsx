import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { EXAM_TYPES, type ExamType } from "@/lib/questions";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, isLoading, completeOnboarding } = useApp();
  const [selectedType, setSelectedType] = useState<ExamType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

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
    await completeOnboarding(selectedType);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 40, paddingBottom: bottomInset + 20 }]}>
      <View style={styles.header}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="flash" size={32} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          CrackIt
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
          Your AI-powered exam preparation partner
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          What exam are you preparing for?
        </Text>

        <View style={styles.examGrid}>
          {EXAM_TYPES.map((exam) => {
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
                  {exam.name}
                </Text>
                <Text style={[styles.examDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {exam.description}
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
      </View>

      <Pressable
        style={[
          styles.continueButton,
          {
            backgroundColor: selectedType ? colors.primary : colors.border,
            opacity: isSubmitting ? 0.7 : 1,
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
            Get Started
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
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
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  examGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  examCard: {
    width: "47%",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    position: "relative",
  },
  examIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  examName: {
    fontSize: 16,
    marginBottom: 4,
  },
  examDesc: {
    fontSize: 12,
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
