import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sun, Moon, Accessibility, Type } from "lucide-react";
import { useTheme, THEME_OPTIONS, FONT_SCALE_OPTIONS, type ThemeName, type FontScale } from "@/lib/theme";

export function ThemePicker() {
  const { theme, setTheme, isDark, toggleDark, fontScale, setFontScale } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentLabel = THEME_OPTIONS.find((t) => t.value === theme)?.label ?? "Theme";

  const regularThemes = THEME_OPTIONS.filter((t) => !t.accessibility);
  const accessibilityThemes = THEME_OPTIONS.filter((t) => t.accessibility);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`glass-button flex h-9 items-center gap-2 rounded-2xl px-3 transition-all ${
          open ? "ring-2 ring-accent-c" : ""
        }`}
        title="Change theme & accessibility"
      >
        <Palette className="h-4 w-4 text-accent-c" />
        <span className="hidden text-sm font-semibold text-secondary-c sm:inline">
          {currentLabel}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="glass-panel-strong absolute right-0 top-11 z-[90] max-h-[75vh] w-72 overflow-y-auto rounded-2xl p-4"
          >
            {/* Header with light/dark toggle */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-c">
                Appearance
              </span>
              <button
                onClick={toggleDark}
                className="flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-input-bg)] px-2.5 py-1 transition-all"
                title={isDark ? "Switch to light" : "Switch to dark"}
              >
                {isDark ? (
                  <Moon className="h-3.5 w-3.5 text-info-c" />
                ) : (
                  <Sun className="h-3.5 w-3.5 text-warning-c" />
                )}
                <span className="text-xs font-semibold text-secondary-c">
                  {isDark ? "Dark" : "Light"}
                </span>
              </button>
            </div>

            {/* Font size control */}
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-input-bg)] p-2.5">
              <Type className="h-4 w-4 shrink-0 text-muted-c" />
              <div className="flex flex-1 gap-1">
                {FONT_SCALE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFontScale(opt.value as FontScale)}
                    className={`flex-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                      fontScale === opt.value
                        ? "bg-accent-c text-white shadow-sm"
                        : "text-secondary-c hover:bg-[var(--glass-bg)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme cards */}
            <div className="space-y-2">
              {regularThemes.map((opt) => {
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value as ThemeName)}
                    className={`group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                      isActive
                        ? "border-accent-c bg-accent-soft-c"
                        : "border-[var(--glass-border)] hover:border-accent-soft-c hover:bg-[var(--glass-bg)]"
                    }`}
                  >
                    <div className="flex shrink-0 gap-1">
                      {opt.swatch.map((c, i) => (
                        <div
                          key={i}
                          className="h-7 w-7 rounded-lg shadow-sm ring-1 ring-black/5"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-primary-c">{opt.label}</p>
                      <p className="truncate text-xs text-muted-c">{opt.description}</p>
                    </div>
                    {isActive && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-c">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Accessibility themes */}
            {accessibilityThemes.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <Accessibility className="h-3.5 w-3.5 text-accent-c" />
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-c">
                    Accessibility
                  </span>
                </div>
                <div className="space-y-2">
                  {accessibilityThemes.map((opt) => {
                    const isActive = theme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value as ThemeName)}
                        className={`group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                          isActive
                            ? "border-accent-c bg-accent-soft-c"
                            : "border-[var(--glass-border)] hover:border-accent-soft-c hover:bg-[var(--glass-bg)]"
                        }`}
                      >
                        <div className="flex shrink-0 gap-1">
                          {opt.swatch.map((c, i) => (
                            <div
                              key={i}
                              className="h-7 w-7 rounded-lg shadow-sm ring-1 ring-black/5"
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-primary-c">{opt.label}</p>
                          <p className="truncate text-xs text-muted-c">{opt.description}</p>
                        </div>
                        {isActive && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-c">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer hint */}
            <p className="mt-3 border-t border-[var(--glass-border)] pt-2.5 text-center text-[11px] text-faint-c">
              Theme, mode & size are saved automatically
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
