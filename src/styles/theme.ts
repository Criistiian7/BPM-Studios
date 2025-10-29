/**
 * Configurația de theme centralizată pentru aplicația BeatPlanner
 * Conține toate culorile, spacing-urile și stilurile pentru consistență
 */

// Configurații pentru culori
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7c3aed",
    800: "#6b21a8",
    900: "#581c87",
  },
} as const;

// Configurații pentru spacing
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
} as const;

// Configurații pentru border radius
export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// Configurații pentru shadow
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

// Configurații pentru font sizes
export const fontSizes = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem", // 48px
} as const;

// Configurații pentru font weights
export const fontWeights = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

// Configurații pentru line heights
export const lineHeights = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

// Configurații pentru transitions
export const transitions = {
  fast: "150ms ease-in-out",
  normal: "300ms ease-in-out",
  slow: "500ms ease-in-out",
  verySlow: "1000ms ease-in-out",
} as const;

// Configurații pentru z-index
export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Configurații pentru breakpoints
export const breakpoints = {
  xs: "375px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Configurații pentru componente specifice
export const componentStyles = {
  card: {
    base: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    padding: "p-4 sm:p-6",
    rounded: "rounded-2xl",
    shadow: "shadow-lg",
  },
  button: {
    base: "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger:
      "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500",
  },
  input: {
    base: "block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white",
  },
  avatar: {
    base: "rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300",
  },
} as const;

// Configurații pentru dark mode
export const darkMode = {
  colors: {
    background: {
      primary: "#111827",
      secondary: "#1f2937",
      tertiary: "#374151",
    },
    text: {
      primary: "#f9fafb",
      secondary: "#d1d5db",
      tertiary: "#9ca3af",
    },
    border: {
      primary: "#374151",
      secondary: "#4b5563",
    },
  },
} as const;

// Configurații pentru light mode
export const lightMode = {
  colors: {
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
    },
    text: {
      primary: "#111827",
      secondary: "#374151",
      tertiary: "#6b7280",
    },
    border: {
      primary: "#e5e7eb",
      secondary: "#d1d5db",
    },
  },
} as const;

// Funcție pentru a obține culorile pentru tema curentă
export const getThemeColors = (isDark: boolean) => {
  return isDark ? darkMode.colors : lightMode.colors;
};

// Funcție pentru a obține clasele CSS pentru componente
export const getComponentClasses = (
  component: keyof typeof componentStyles,
  variant?: string
) => {
  const baseClasses = componentStyles[component].base;
  const variantClasses = variant
    ? componentStyles[component][
        variant as keyof (typeof componentStyles)[typeof component]
      ]
    : "";

  return `${baseClasses} ${variantClasses}`.trim();
};

// Export pentru toate configurațiile
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  fontSizes,
  fontWeights,
  lineHeights,
  transitions,
  zIndex,
  breakpoints,
  componentStyles,
  darkMode,
  lightMode,
  getThemeColors,
  getComponentClasses,
} as const;
