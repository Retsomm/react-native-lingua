export type AppTheme = "light" | "dark";

export const appThemeOptions: Array<{
  icon: "sunny" | "moon";
  label: string;
  value: AppTheme;
}> = [
  {
    icon: "sunny",
    label: "淺色",
    value: "light",
  },
  {
    icon: "moon",
    label: "深色",
    value: "dark",
  },
];

export const appThemeColors: Record<
  AppTheme,
  {
    background: string;
    borderSoft: string;
    danger: string;
    dangerBorder: string;
    dangerSoft: string;
    deepPurple: string;
    mutedIcon: string;
    progressTrack: string;
    surface: string;
    surfaceMuted: string;
    tabShadow: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  }
> = {
  dark: {
    background: "#080C14",
    borderSoft: "#252D43",
    danger: "#FF6B6D",
    dangerBorder: "#5C2630",
    dangerSoft: "#2A151A",
    deepPurple: "#9B86FF",
    mutedIcon: "#8F9AB8",
    progressTrack: "#4B3340",
    surface: "#101625",
    surfaceMuted: "#151B2B",
    tabShadow: "rgba(0, 0, 0, 0.35)",
    textPrimary: "#F8FAFC",
    textSecondary: "#AAB4CF",
    textTertiary: "#8F9AB8",
  },
  light: {
    background: "#FFFFFF",
    borderSoft: "#EEF0F5",
    danger: "#EF4444",
    dangerBorder: "#FFE0E0",
    dangerSoft: "#FFF5F5",
    deepPurple: "#5B3BF6",
    mutedIcon: "#838BA6",
    progressTrack: "#FFE5C7",
    surface: "#F6F7FB",
    surfaceMuted: "#FBFBFD",
    tabShadow: "rgba(13, 19, 43, 0.08)",
    textPrimary: "#0D132B",
    textSecondary: "#6E7894",
    textTertiary: "#7D87A3",
  },
};
