import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/query-client";
import { getWeakTopics } from "@/lib/algorithm";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function TypingDot({ delay }: { delay: number }) {
  const colors = useColors();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.ease }),
          withTiming(0.3, { duration: 400, easing: Easing.ease })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.primary,
        },
        style,
      ]}
    />
  );
}

function TypingIndicator() {
  const colors = useColors();
  return (
    <Animated.View entering={FadeIn.duration(200)} style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={[styles.botAvatarTiny, { backgroundColor: colors.primary }]}>
        <Ionicons name="sparkles" size={10} color="#FFFFFF" />
      </View>
      <View style={styles.typingDots}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </Animated.View>
  );
}

function SuggestionChip({ text, icon, onPress, colors }: { text: string; icon: string; onPress: () => void; colors: any }) {
  return (
    <Pressable
      style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={14} color={colors.primary} />
      <Text style={[styles.chipText, { color: colors.text }]} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );
}

function MessageBubble({ item, colors }: { item: ChatMessage; colors: any }) {
  const isUser = item.role === "user";

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()} style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="sparkles" size={13} color="#FFFFFF" />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.borderLight }],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isUser ? "#FFFFFF" : colors.text },
          ]}
          selectable
        >
          {item.content}
        </Text>
        <Text style={[styles.messageTime, { color: isUser ? "rgba(255,255,255,0.6)" : colors.textTertiary }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ChatbotScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, tr, language, authUser } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const weakTopics = useMemo(() => {
    return getWeakTopics(userData, userData.examType, 5);
  }, [userData]);

  const performanceContext = useMemo(() => {
    const subjectAccuracies: Record<string, number> = {};
    for (const [subj, prog] of Object.entries(userData.subjectProgress)) {
      if (prog.total > 0) {
        subjectAccuracies[subj] = prog.correct / prog.total;
      }
    }

    const recentExams = userData.examHistory.slice(0, 5).map((e) => ({
      subject: e.subject,
      score: e.score,
      date: e.date,
    }));

    return {
      totalSolved: userData.totalQuestionsSolved,
      totalCorrect: userData.totalCorrect,
      streak: userData.streak,
      xp: userData.xp,
      weakTopics: weakTopics.map((t) => ({ subject: t.subject, topic: t.topic, accuracy: t.accuracy })),
      recentExams,
      subjectAccuracies,
    };
  }, [userData, weakTopics]);

  const contextualSuggestions = useMemo(() => {
    const suggestions: { text: string; icon: string }[] = [];

    if (weakTopics.length > 0) {
      const weakest = weakTopics[0];
      suggestions.push({
        text: language === "bn"
          ? `${weakest.subject}/${weakest.topic} পর্যালোচনা করুন`
          : `Review ${weakest.subject} - ${weakest.topic}`,
        icon: "alert-circle-outline",
      });
    }

    if (userData.examHistory.length > 0) {
      const lastExam = userData.examHistory[0];
      if (lastExam.score < 60) {
        suggestions.push({
          text: language === "bn"
            ? `${lastExam.subject}-এ ${lastExam.score}% পেয়েছি, কী করব?`
            : `I scored ${lastExam.score}% in ${lastExam.subject}. What should I focus on?`,
          icon: "trending-up",
        });
      }
    }

    suggestions.push({
      text: tr("chatbot.studyPlan"),
      icon: "calendar-outline",
    });

    suggestions.push({
      text: tr("chatbot.practiceQuestions"),
      icon: "help-circle-outline",
    });

    suggestions.push({
      text: tr("chatbot.myProgress"),
      icon: "stats-chart-outline",
    });

    if (weakTopics.length > 1) {
      suggestions.push({
        text: tr("chatbot.reviewWeak"),
        icon: "fitness-outline",
      });
    }

    return suggestions.slice(0, 5);
  }, [weakTopics, userData, language, tr]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = currentMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await apiRequest("POST", "/api/chat", {
        message: text.trim(),
        examType: userData.examType,
        educationLevel: (authUser as any)?.educationLevel || (userData as any).educationLevel || "ssc",
        language,
        history: history.slice(-10),
        performanceContext,
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || tr("chatbot.error"),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: tr("chatbot.error"),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, userData, language, tr, performanceContext, authUser]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    return <MessageBubble item={item} colors={colors} />;
  }, [colors]);

  const overallAccuracy = userData.totalQuestionsSolved > 0
    ? Math.round((userData.totalCorrect / userData.totalQuestionsSolved) * 100)
    : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 8, backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="robot-happy-outline" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {tr("chatbot.title")}
              </Text>
              <View style={styles.onlineRow}>
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.onlineText, { color: colors.success }]}>
                  {tr("chatbot.online")}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeTop}>
              <View style={[styles.welcomeAvatar, { backgroundColor: colors.primaryLight }]}>
                <MaterialCommunityIcons name="robot-happy-outline" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                {tr("chatbot.title")}
              </Text>
              <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>
                {tr("chatbot.welcome")}
              </Text>

              {userData.totalQuestionsSolved > 0 && (
                <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {userData.totalQuestionsSolved}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                      {tr("dashboard.solved")}
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: overallAccuracy >= 60 ? colors.success : colors.error }]}>
                      {overallAccuracy}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                      {tr("dashboard.accuracy")}
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.streak }]}>
                      {userData.streak}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                      {tr("profile.dayStreak")}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.suggestionsSection}>
              <Text style={[styles.suggestionsLabel, { color: colors.textSecondary }]}>
                {tr("chatbot.suggestions")}
              </Text>
              <View style={styles.suggestionsWrap}>
                {contextualSuggestions.map((s, idx) => (
                  <SuggestionChip
                    key={idx}
                    text={s.text}
                    icon={s.icon}
                    onPress={() => sendMessage(s.text)}
                    colors={colors}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={isLoading ? <TypingIndicator /> : null}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {isLoading && messages.length === 0 && <TypingIndicator />}

        {messages.length > 0 && !isLoading && (
          <View style={styles.quickChipsRow}>
            <FlatList
              horizontal
              data={contextualSuggestions.slice(0, 3)}
              keyExtractor={(_, i) => `quick-${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickChipsContent}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.quickChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary + "30" }]}
                  onPress={() => sendMessage(item.text)}
                >
                  <Ionicons name={item.icon as any} size={12} color={colors.primary} />
                  <Text style={[styles.quickChipText, { color: colors.primary }]} numberOfLines={1}>
                    {item.text}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: bottomInset + 8, backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text }]}
              placeholder={tr("chatbot.placeholder")}
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              onSubmitEditing={() => sendMessage(input)}
              returnKeyType="send"
            />
            <Pressable
              style={[styles.sendBtn, { backgroundColor: input.trim() && !isLoading ? colors.primary : colors.border }]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 4 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "600" as const },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 11, fontWeight: "500" as const },
  welcomeContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  welcomeTop: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  welcomeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: { fontSize: 22, fontWeight: "700" as const, marginBottom: 8 },
  welcomeDesc: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 20, paddingHorizontal: 8 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700" as const },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "500" as const },
  statDivider: { width: 1, height: 28 },
  suggestionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  suggestionsLabel: { fontSize: 13, fontWeight: "600" as const, marginBottom: 10 },
  suggestionsWrap: {
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "85%",
    marginBottom: 2,
  },
  messageRowUser: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "90%",
  },
  userBubble: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: { fontSize: 14, lineHeight: 22 },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: "right" as const },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  botAvatarTiny: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quickChipsRow: {
    paddingVertical: 6,
  },
  quickChipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickChipText: { fontSize: 12, fontWeight: "500" as const, maxWidth: 150 },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
});
