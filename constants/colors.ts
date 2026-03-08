import { useColorScheme } from "react-native";

const Colors = {
  light: {
    primary: "#1A73E8",
    primaryDark: "#1557B0",
    primaryLight: "#E8F0FE",
    background: "#FFFFFF",
    surface: "#F8F9FA",
    text: "#202124",
    textSecondary: "#5F6368",
    textTertiary: "#9AA0A6",
    border: "#DADCE0",
    borderLight: "#E8EAED",
    success: "#34A853",
    successLight: "#E6F4EA",
    error: "#EA4335",
    errorLight: "#FCE8E6",
    warning: "#FBBC04",
    warningLight: "#FEF7E0",
    tint: "#1A73E8",
    tabIconDefault: "#9AA0A6",
    tabIconSelected: "#1A73E8",
    card: "#FFFFFF",
    streak: "#FF6D00",
  },
  dark: {
    primary: "#8AB4F8",
    primaryDark: "#669DF6",
    primaryLight: "#1A2744",
    background: "#121212",
    surface: "#1E1E1E",
    text: "#E8EAED",
    textSecondary: "#9AA0A6",
    textTertiary: "#5F6368",
    border: "#3C4043",
    borderLight: "#2D2D2D",
    success: "#81C995",
    successLight: "#1B3A2A",
    error: "#F28B82",
    errorLight: "#3C2020",
    warning: "#FDD663",
    warningLight: "#3C3520",
    tint: "#8AB4F8",
    tabIconDefault: "#5F6368",
    tabIconSelected: "#8AB4F8",
    card: "#1E1E1E",
    streak: "#FFAB40",
  },
};

export function useColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? Colors.dark : Colors.light;
}

export default Colors;
