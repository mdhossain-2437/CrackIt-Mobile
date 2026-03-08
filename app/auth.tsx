import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/query-client";
import { EXAM_TYPES } from "@/lib/questions";
import { t } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

type AuthMode = "login" | "register";

const EDUCATION_LEVELS = [
  { id: "primary", labelEn: "Primary (Class 1-5)", labelBn: "প্রাথমিক (১ম-৫ম শ্রেণি)", icon: "school-outline" },
  { id: "junior", labelEn: "Junior (Class 6-8)", labelBn: "জুনিয়র (৬ষ্ঠ-৮ম শ্রেণি)", icon: "book-outline" },
  { id: "ssc", labelEn: "SSC (Class 9-10)", labelBn: "এসএসসি (৯ম-১০ম শ্রেণি)", icon: "library-outline" },
  { id: "hsc", labelEn: "HSC (Class 11-12)", labelBn: "এইচএসসি (১১শ-১২শ শ্রেণি)", icon: "school" },
  { id: "university", labelEn: "University Admission", labelBn: "বিশ্ববিদ্যালয় ভর্তি", icon: "business-outline" },
  { id: "job", labelEn: "Job Preparation", labelBn: "চাকরি প্রস্তুতি", icon: "briefcase-outline" },
];

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loginUser, registerUser, language: appLanguage } = useApp();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [educationLevel, setEducationLevel] = useState("ssc");
  const [selectedExamType, setSelectedExamType] = useState("bcs");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(appLanguage || "en");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const tr = (key: string) => t(key, selectedLanguage);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(tr("auth.fillFields"));
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await loginUser(email.trim(), password.trim());
    } catch (e: any) {
      setError(e.message || tr("auth.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(tr("auth.fillFields"));
      return;
    }
    if (password.length < 6) {
      setError(tr("auth.passwordShort"));
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await registerUser(name.trim(), email.trim(), password.trim(), educationLevel, selectedExamType, selectedLanguage);
    } catch (e: any) {
      setError(e.message || tr("auth.registerFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "login") {
      handleLogin();
    } else {
      if (step < 2) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError(tr("auth.fillFields"));
          return;
        }
        if (password.length < 6) {
          setError(tr("auth.passwordShort"));
          return;
        }
        setError("");
        setStep(2);
      } else {
        handleRegister();
      }
    }
  };

  const handleSkip = () => {
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: topInset + 20, paddingBottom: bottomInset + 40, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="flash" size={36} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {tr("app.name")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {tr("app.tagline")}
          </Text>
        </View>

        <View style={styles.langRow}>
          {(["en", "bn"] as Language[]).map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <Pressable
                key={lang}
                style={[styles.langChip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text style={{ fontSize: 16 }}>{lang === "en" ? "🇬🇧" : "🇧🇩"}</Text>
                <Text style={[styles.langChipText, { color: isSelected ? "#FFF" : colors.text, fontFamily: "Inter_500Medium" }]}>
                  {lang === "en" ? "EN" : "বাং"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeBtn, mode === "login" && { backgroundColor: colors.primary }]}
            onPress={() => { setMode("login"); setStep(1); setError(""); }}
          >
            <Text style={[styles.modeBtnText, { color: mode === "login" ? "#FFF" : colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
              {tr("auth.login")}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === "register" && { backgroundColor: colors.primary }]}
            onPress={() => { setMode("register"); setStep(1); setError(""); }}
          >
            <Text style={[styles.modeBtnText, { color: mode === "register" ? "#FFF" : colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
              {tr("auth.register")}
            </Text>
          </Pressable>
        </View>

        {mode === "login" && (
          <>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
                placeholder={tr("auth.email")}
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
                placeholder={tr("auth.password")}
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </>
        )}

        {mode === "register" && step === 1 && (
          <>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
                placeholder={tr("auth.name")}
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
                placeholder={tr("auth.email")}
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
                placeholder={tr("auth.password")}
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </>
        )}

        {mode === "register" && step === 2 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {tr("auth.selectLevel")}
            </Text>
            {EDUCATION_LEVELS.map((level) => {
              const isSelected = educationLevel === level.id;
              return (
                <Pressable
                  key={level.id}
                  style={[styles.levelItem, {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }]}
                  onPress={() => setEducationLevel(level.id)}
                >
                  <Ionicons
                    name={level.icon as any}
                    size={22}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.levelText, {
                    color: isSelected ? colors.primary : colors.text,
                    fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                  }]}>
                    {selectedLanguage === "bn" ? level.labelBn : level.labelEn}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}

            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold", marginTop: 20 }]}>
              {tr("auth.selectExam")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.examChipsRow}>
              {EXAM_TYPES.map((exam) => {
                const isSelected = selectedExamType === exam.id;
                return (
                  <Pressable
                    key={exam.id}
                    style={[styles.examChip, {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }]}
                    onPress={() => setSelectedExamType(exam.id)}
                  >
                    <Text style={[styles.examChipText, {
                      color: isSelected ? "#FFF" : colors.text,
                      fontFamily: "Inter_500Medium",
                    }]}>
                      {selectedLanguage === "bn" ? exam.nameBn : exam.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.errorLight }]}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error, fontFamily: "Inter_500Medium" }]}>
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.submitBtn, { backgroundColor: isLoading ? colors.border : colors.primary }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>
              {mode === "login"
                ? tr("auth.login")
                : step === 1
                ? tr("auth.next")
                : tr("auth.createAccount")}
            </Text>
          )}
        </Pressable>

        {mode === "register" && step === 2 && (
          <Pressable
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={() => setStep(1)}
          >
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
            <Text style={[styles.backBtnText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
              {tr("auth.back")}
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.skipBtn} onPress={handleSkip}>
          <Text style={[styles.skipBtnText, { color: colors.textTertiary, fontFamily: "Inter_400Regular" }]}>
            {tr("auth.skipLogin")}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", marginBottom: 24 },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 32, marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: "center" },
  langRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  langChipText: { fontSize: 14 },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  modeBtnText: { fontSize: 15 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 15 },
  sectionTitle: { fontSize: 16, marginBottom: 12, marginTop: 4 },
  levelItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  levelText: { flex: 1, fontSize: 14 },
  examChipsRow: { gap: 8, marginBottom: 8 },
  examChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  examChipText: { fontSize: 13 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: { flex: 1, fontSize: 13 },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnText: { fontSize: 16, color: "#FFFFFF" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  backBtnText: { fontSize: 14 },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  skipBtnText: { fontSize: 13 },
});
