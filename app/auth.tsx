import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/query-client";
import { EXAM_TYPES } from "@/lib/questions";
import { t } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

type AuthMode = "login" | "register";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const EDUCATION_LEVELS = [
  { id: "primary", labelEn: "Primary (Class 1-5)", labelBn: "প্রাথমিক (১ম-৫ম শ্রেণি)", icon: "school-outline", color: "#4CAF50" },
  { id: "junior", labelEn: "Junior (Class 6-8)", labelBn: "জুনিয়র (৬ষ্ঠ-৮ম শ্রেণি)", icon: "book-outline", color: "#2196F3" },
  { id: "ssc", labelEn: "SSC (Class 9-10)", labelBn: "এসএসসি (৯ম-১০ম শ্রেণি)", icon: "library-outline", color: "#9C27B0" },
  { id: "hsc", labelEn: "HSC (Class 11-12)", labelBn: "এইচএসসি (১১শ-১২শ শ্রেণি)", icon: "school", color: "#FF5722" },
  { id: "university", labelEn: "University Admission", labelBn: "বিশ্ববিদ্যালয় ভর্তি", icon: "business-outline", color: "#E91E63" },
  { id: "job", labelEn: "Job Preparation", labelBn: "চাকরি প্রস্তুতি", icon: "briefcase-outline", color: "#FF9800" },
];

function StepIndicator({ currentStep, totalSteps, colors }: { currentStep: number; totalSteps: number; colors: any }) {
  return (
    <View style={indicatorStyles.container}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i + 1 <= currentStep;
        return (
          <React.Fragment key={i}>
            <View style={[indicatorStyles.dot, { backgroundColor: isActive ? "#FFFFFF" : "#FFFFFF40" }]}>
              {isActive && i + 1 < currentStep && (
                <Ionicons name="checkmark" size={12} color={colors.primary} />
              )}
              {(!isActive || i + 1 === currentStep) && (
                <Text style={[indicatorStyles.dotText, { color: isActive ? colors.primary : "#FFFFFF60", fontFamily: "Inter_600SemiBold" }]}>
                  {i + 1}
                </Text>
              )}
            </View>
            {i < totalSteps - 1 && (
              <View style={[indicatorStyles.line, { backgroundColor: isActive ? "#FFFFFF80" : "#FFFFFF20" }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function EducationCard({ level, isSelected, onPress, language, index }: { level: typeof EDUCATION_LEVELS[0]; isSelected: boolean; onPress: () => void; language: string; index: number }) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <Pressable
        style={[edStyles.card, {
          backgroundColor: isSelected ? level.color + "15" : colors.surface,
          borderColor: isSelected ? level.color : colors.borderLight,
          borderWidth: isSelected ? 2 : 1,
        }]}
        onPress={onPress}
      >
        <View style={[edStyles.iconWrap, { backgroundColor: level.color + "18" }]}>
          <Ionicons name={level.icon as any} size={22} color={level.color} />
        </View>
        <Text style={[edStyles.label, {
          color: isSelected ? level.color : colors.text,
          fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_500Medium",
        }]}>
          {language === "bn" ? level.labelBn : level.labelEn}
        </Text>
        {isSelected && (
          <View style={[edStyles.checkWrap, { backgroundColor: level.color }]}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

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

  const slideAnim = useSharedValue(0);

  useEffect(() => {
    slideAnim.value = withSpring(step === 2 ? 1 : 0, { damping: 20, stiffness: 120 });
  }, [step]);

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
        style={[styles.container]}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, "#0D47A1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.gradientBg, { paddingTop: topInset }]}
        >
          <View style={styles.topBar}>
            <Pressable onPress={handleSkip} style={styles.skipTopBtn}>
              <Text style={[styles.skipTopText, { fontFamily: "Inter_500Medium" }]}>
                {tr("auth.skipLogin")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.logoSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="flash" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.logoTitle, { fontFamily: "Inter_700Bold" }]}>
              {tr("app.name")}
            </Text>
            <Text style={[styles.logoSubtitle, { fontFamily: "Inter_400Regular" }]}>
              {tr("app.tagline")}
            </Text>
          </View>

          <View style={styles.langPills}>
            {(["en", "bn"] as Language[]).map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <Pressable
                  key={lang}
                  style={[styles.langPill, { backgroundColor: isSelected ? "#FFFFFF" : "#FFFFFF20", borderColor: isSelected ? "#FFFFFF" : "#FFFFFF40" }]}
                  onPress={() => setSelectedLanguage(lang)}
                >
                  <Text style={[styles.langPillText, { color: isSelected ? colors.primary : "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
                    {lang === "en" ? "EN" : "বাং"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === "register" && (
            <StepIndicator currentStep={step} totalSteps={2} colors={colors} />
          )}
        </LinearGradient>

        <View style={[styles.formContainer, { backgroundColor: colors.background, paddingBottom: bottomInset + 20 }]}>
          <View style={[styles.modeToggle, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Pressable
              style={[styles.modeBtn, mode === "login" && styles.modeBtnActive, mode === "login" && { backgroundColor: colors.primary }]}
              onPress={() => { setMode("login"); setStep(1); setError(""); }}
            >
              <Ionicons name="log-in-outline" size={18} color={mode === "login" ? "#FFF" : colors.textSecondary} />
              <Text style={[styles.modeBtnText, { color: mode === "login" ? "#FFF" : colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
                {tr("auth.login")}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, mode === "register" && styles.modeBtnActive, mode === "register" && { backgroundColor: colors.primary }]}
              onPress={() => { setMode("register"); setStep(1); setError(""); }}
            >
              <Ionicons name="person-add-outline" size={18} color={mode === "register" ? "#FFF" : colors.textSecondary} />
              <Text style={[styles.modeBtnText, { color: mode === "register" ? "#FFF" : colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
                {tr("auth.register")}
              </Text>
            </Pressable>
          </View>

          {mode === "login" && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.inputRow}>
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
                <View style={[styles.inputDivider, { backgroundColor: colors.borderLight }]} />
                <View style={styles.inputRow}>
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
              </View>
            </Animated.View>
          )}

          {mode === "register" && step === 1 && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
                    placeholder={tr("auth.name")}
                    placeholderTextColor={colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={[styles.inputDivider, { backgroundColor: colors.borderLight }]} />
                <View style={styles.inputRow}>
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
                <View style={[styles.inputDivider, { backgroundColor: colors.borderLight }]} />
                <View style={styles.inputRow}>
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
              </View>
            </Animated.View>
          )}

          {mode === "register" && step === 2 && (
            <Animated.View entering={FadeInRight.duration(300)}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                {tr("auth.selectLevel")}
              </Text>
              {EDUCATION_LEVELS.map((level, idx) => (
                <EducationCard
                  key={level.id}
                  level={level}
                  isSelected={educationLevel === level.id}
                  onPress={() => setEducationLevel(level.id)}
                  language={selectedLanguage}
                  index={idx}
                />
              ))}

              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold", marginTop: 20 }]}>
                {tr("auth.selectExam")}
              </Text>
              <View style={styles.examChipsWrap}>
                {EXAM_TYPES.map((exam) => {
                  const isSelected = selectedExamType === exam.id;
                  return (
                    <Pressable
                      key={exam.id}
                      style={[styles.examChip, {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.borderLight,
                      }]}
                      onPress={() => setSelectedExamType(exam.id)}
                    >
                      <Text style={[styles.examChipText, {
                        color: isSelected ? "#FFF" : colors.text,
                        fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_500Medium",
                      }]}>
                        {selectedLanguage === "bn" ? exam.nameBn : exam.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {error ? (
            <Animated.View entering={FadeInDown.duration(200)} style={[styles.errorBox, { backgroundColor: colors.errorLight }]}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error, fontFamily: "Inter_500Medium" }]}>
                {error}
              </Text>
            </Animated.View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.submitBtn, { backgroundColor: isLoading ? colors.border : colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                  {mode === "login"
                    ? tr("auth.login")
                    : step === 1
                    ? tr("auth.next")
                    : tr("auth.createAccount")}
                </Text>
                <Ionicons name={mode === "login" ? "log-in-outline" : step === 1 ? "arrow-forward" : "checkmark"} size={20} color="#FFFFFF" />
              </View>
            )}
          </Pressable>

          {mode === "register" && step === 2 && (
            <Pressable
              style={[styles.backBtn, { borderColor: colors.borderLight }]}
              onPress={() => setStep(1)}
            >
              <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
              <Text style={[styles.backBtnText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                {tr("auth.back")}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const indicatorStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
    gap: 0,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  dotText: {
    fontSize: 12,
  },
  line: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
});

const edStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBg: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipTopBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF18",
  },
  skipTopText: {
    color: "#FFFFFFCC",
    fontSize: 12,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoTitle: {
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 13,
    color: "#FFFFFFBB",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  langPills: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  langPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  langPillText: {
    fontSize: 14,
  },
  formContainer: {
    marginTop: -16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modeBtnActive: {},
  modeBtnText: {
    fontSize: 14,
  },
  inputGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 12,
    marginTop: 4,
  },
  examChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  examChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  examChipText: {
    fontSize: 13,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  backBtnText: {
    fontSize: 14,
  },
});
