import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeName =
  | "stratustal"
  | "cotton-candy"
  | "frozen-mist"
  | "neon"
  | "forest"
  | "sunset"
  | "ocean"
  | "lavender"
  | "midnight"
  | "crimson"
  | "mint"
  | "slate"
  | "rose-gold"
  | "high-contrast"
  | "deuteranopia"
  | "protanopia";

export type FontScale = "normal" | "large" | "x-large";

export interface ThemeOption {
  value: ThemeName;
  label: string;
  description: string;
  swatch: string[];
  accessibility?: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "stratustal",
    label: "Default",
    description: "Warm earthy tones",
    swatch: ["#ea580c", "#f97316", "#fed7aa", "#1c1917"],
  },
  {
    value: "cotton-candy",
    label: "Cotton Candy",
    description: "Sweet pink & purple",
    swatch: ["#ec4899", "#f472b6", "#fbcfe8", "#a855f7"],
  },
  {
    value: "frozen-mist",
    label: "Frozen Mist",
    description: "Cool icy blues",
    swatch: ["#0284c7", "#38bdf8", "#bae6fd", "#e0f2fe"],
  },
  {
    value: "neon",
    label: "Neon",
    description: "Electric vibrant glow",
    swatch: ["#6366f1", "#818cf8", "#22d3ee", "#0a0a0f"],
  },
  {
    value: "forest",
    label: "Forest",
    description: "Natural green harmony",
    swatch: ["#16a34a", "#4ade80", "#bbf7d0", "#14532d"],
  },
  {
    value: "sunset",
    label: "Sunset",
    description: "Warm reds & gold",
    swatch: ["#dc2626", "#f97316", "#fbbf24", "#7c2d12"],
  },
  {
    value: "ocean",
    label: "Ocean",
    description: "Teal & aqua depths",
    swatch: ["#0891b2", "#2dd4bf", "#99f6e4", "#042f2e"],
  },
  {
    value: "lavender",
    label: "Lavender",
    description: "Soft purple & slate",
    swatch: ["#7c3aed", "#a78bfa", "#ddd6fe", "#c4b5fd"],
  },
  {
    value: "midnight",
    label: "Midnight",
    description: "Deep blue & gold",
    swatch: ["#1e3a8a", "#3b82f6", "#fbbf24", "#0f172a"],
  },
  {
    value: "crimson",
    label: "Crimson",
    description: "Deep red & burgundy",
    swatch: ["#b91c1c", "#dc2626", "#fca5a5", "#450a0a"],
  },
  {
    value: "mint",
    label: "Mint",
    description: "Fresh mint & sage",
    swatch: ["#0d9488", "#2dd4bf", "#a7f3d0", "#042f2e"],
  },
  {
    value: "slate",
    label: "Slate",
    description: "Professional gray & blue",
    swatch: ["#475569", "#64748b", "#94a3b8", "#1e293b"],
  },
  {
    value: "rose-gold",
    label: "Rose Gold",
    description: "Warm rose & copper",
    swatch: ["#be185d", "#f472b6", "#fde68a", "#78350f"],
  },
  {
    value: "high-contrast",
    label: "High Contrast",
    description: "Maximum contrast for visual impairment",
    swatch: ["#000000", "#ffffff", "#facc15", "#000000"],
    accessibility: true,
  },
  {
    value: "deuteranopia",
    label: "Deuteranopia",
    description: "Colour-blind friendly (green-blind)",
    swatch: ["#0066cc", "#ff8800", "#ffffff", "#1a1a1a"],
    accessibility: true,
  },
  {
    value: "protanopia",
    label: "Protanopia",
    description: "Colour-blind friendly (red-blind)",
    swatch: ["#0099cc", "#ffaa00", "#ffffff", "#1a1a1a"],
    accessibility: true,
  },
];

export const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "x-large", label: "Extra Large" },
];

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  toggleDark: () => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("stratustal");
  const [isDark, setIsDarkState] = useState(false);
  const [fontScale, setFontScaleState] = useState<FontScale>("normal");

  useEffect(() => {
    const storedTheme = localStorage.getItem("skillbridge_theme") as ThemeName | null;
    if (storedTheme) setThemeState(storedTheme);

    const storedDark = localStorage.getItem("skillbridge_dark");
    if (storedDark === "true") setIsDarkState(true);

    const storedFontScale = localStorage.getItem("skillbridge_font_scale") as FontScale | null;
    if (storedFontScale) setFontScaleState(storedFontScale);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("skillbridge_theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("skillbridge_dark", String(isDark));
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-font-scale", fontScale);
    localStorage.setItem("skillbridge_font_scale", fontScale);
  }, [fontScale]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const setIsDark = (dark: boolean) => setIsDarkState(dark);
  const toggleDark = () => setIsDarkState((prev) => !prev);
  const setFontScale = (s: FontScale) => setFontScaleState(s);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, setIsDark, toggleDark, fontScale, setFontScale }}>
      {children}
    </ThemeContext.Provider>
  );
}
