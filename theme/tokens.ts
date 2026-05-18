export const colors = {
  primary: {
    purple: "#6C4EF5",
    deepPurple: "#5B3BF6",
    blue: "#4D8BFF",
    green: "#21C16B",
  },
  semantic: {
    success: "#21C16B",
    warning: "#FFC800",
    streak: "#FF8A00",
    error: "#FF4D4F",
    info: "#4D8BFF",
  },
  neutral: {
    textPrimary: "#0D132B",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    surface: "#F6F7FB",
    background: "#FFFFFF",
  },
} as const;

export const typography = {
  fontFamily: {
    regular: "Poppins-Regular",
    medium: "Poppins-Medium",
    semiBold: "Poppins-SemiBold",
    bold: "Poppins-Bold",
  },
  scale: {
    h1: {
      label: "H1",
      usage: "Page / Screen Title",
      size: 32,
      weight: "Bold",
      lineHeight: 38,
    },
    h2: {
      label: "H2",
      usage: "Section Title",
      size: 24,
      weight: "SemiBold",
      lineHeight: 31,
    },
    h3: {
      label: "H3",
      usage: "Card / Module Title",
      size: 20,
      weight: "SemiBold",
      lineHeight: 26,
    },
    h4: {
      label: "H4",
      usage: "Subheading",
      size: 16,
      weight: "Medium",
      lineHeight: 22,
    },
    bodyLarge: {
      label: "Body Large",
      usage: "Important content",
      size: 16,
      weight: "Regular",
      lineHeight: 26,
    },
    bodyMedium: {
      label: "Body Medium",
      usage: "Body text",
      size: 14,
      weight: "Regular",
      lineHeight: 22,
    },
    bodySmall: {
      label: "Body Small",
      usage: "Supporting text",
      size: 13,
      weight: "Regular",
      lineHeight: 21,
    },
    caption: {
      label: "Caption",
      usage: "Labels, meta text",
      size: 11,
      weight: "Regular",
      lineHeight: 15,
    },
  },
} as const;

export const radius = {
  card: 16,
  swatch: 8,
} as const;
