import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useColors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/query-client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTIONS_EN = [
  "Explain the Liberation War of 1971",
  "Give me 5 physics MCQs on Optics",
  "What should I study for BCS?",
  "Explain কারক in Bangla grammar",
];

const SUGGESTIONS_BN = [
  "মুক্তিযুদ্ধের ইতিহাস ব্যাখ্যা করুন",
  "আলোকবিজ্ঞানের উপর ৫টি MCQ দিন",
  "বিসিএস এর জন্য কী পড়া উচিত?",
  "বাংলা ব্যাকরণে কারক ব্যাখ্যা করুন",
];

export default function ChatbotScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userData, tr, language } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const suggestions = language === "bn" ? SUGGESTIONS_BN : SUGGESTIONS_EN;

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
        educationLevel: (userData as any).educationLevel || "ssc",
        language,
        history: history.slice(-10),
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
  }, [messages, isLoading, userData, language, tr]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <Animated.View entering={FadeIn.duration(300)} style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? colors.primary : colors.surface,
              borderColor: isUser ? colors.primary : colors.borderLight,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUser ? "#FFFFFF" : colors.text,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {tr("chatbot.title")}
            </Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <View style={[styles.welcomeAvatar, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="sparkles" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.welcomeText, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {tr("chatbot.title")}
            </Text>
            <Text style={[styles.welcomeDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {tr("chatbot.welcome")}
            </Text>
            <Text style={[styles.suggestionsLabel, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
              {tr("chatbot.suggestions")}
            </Text>
            <View style={styles.suggestionsGrid}>
              {suggestions.map((s, idx) => (
                <Pressable
                  key={idx}
                  style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                  onPress={() => sendMessage(s)}
                >
                  <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                  <Text style={[styles.suggestionText, { color: colors.text, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                    {s}
                  </Text>
                </Pressable>
              ))}
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
          />
        )}

        {isLoading && (
          <View style={[styles.typingIndicator, { backgroundColor: colors.surface }]}>
            <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
            </View>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.typingText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {tr("chatbot.thinking")}
            </Text>
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: bottomInset + 8, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
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
              <Ionicons name="send" size={18} color="#FFFFFF" />
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17 },
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  welcomeAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: { fontSize: 22, marginBottom: 8 },
  welcomeDesc: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  suggestionsLabel: { fontSize: 13, marginBottom: 12 },
  suggestionsGrid: {
    width: "100%",
    gap: 8,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: { flex: 1, fontSize: 13, lineHeight: 18 },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "85%",
  },
  messageRowUser: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: "90%",
  },
  messageText: { fontSize: 14, lineHeight: 22 },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  typingText: { fontSize: 13 },
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
});
