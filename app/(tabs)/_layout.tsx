import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

function NativeTabLayout() {
  const { tr } = useApp();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>{tr("nav.home")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="practice">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>{tr("nav.practice")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ai">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} />
        <Label>{tr("nav.ai")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analytics">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>{tr("nav.analytics")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>{tr("nav.profile")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function AnimatedTabIcon({ name, focusedName, color, focused, size }: { name: string; focusedName: string; color: string; focused: boolean; size: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, { damping: 12, stiffness: 200 });
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [focused]);

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={(focused ? focusedName : name) as any} size={size} color={color} />
    </Animated.View>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const { tr } = useApp();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
          marginTop: -2,
        },
        tabBarStyle: {
          position: "absolute" as const,
          backgroundColor: isIOS ? "transparent" : theme.tabBarBg,
          borderTopWidth: 0,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
          ...(!isIOS && !isWeb ? {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            boxShadow: `0px -2px 20px ${theme.shadow}`,
          } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" }]}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.tabBarBg, borderTopWidth: 1, borderTopColor: theme.tabBarBorder }]} />
          ) : null,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tr("nav.home"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="home-outline" focusedName="home" color={color} focused={focused} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: tr("nav.practice"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="book-outline" focusedName="book" color={color} focused={focused} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: tr("nav.ai"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="sparkles-outline" focusedName="sparkles" color={color} focused={focused} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: tr("nav.analytics"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="bar-chart-outline" focusedName="bar-chart" color={color} focused={focused} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tr("nav.profile"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="person-outline" focusedName="person" color={color} focused={focused} size={23} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
