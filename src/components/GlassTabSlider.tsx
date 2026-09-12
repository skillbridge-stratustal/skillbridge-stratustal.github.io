import { motion } from "framer-motion";

interface GlassTabSliderProps<T extends string> {
  tabs: { value: T; label: string }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function GlassTabSlider<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: GlassTabSliderProps<T>) {
  const activeIndex = tabs.findIndex((t) => t.value === activeTab);

  return (
    <div className="glass-button relative flex rounded-2xl p-1">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className="relative z-10 flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200"
          >
            <span
              className={
                isActive
                  ? "text-primary-c dark:text-primary-c"
                  : "text-muted-c hover:text-secondary-c dark:text-muted-c dark:hover:text-faint-c"
              }
            >
              {tab.label}
            </span>
          </button>
        );
      })}
      <motion.div
        className="absolute top-1 bottom-1 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-sm backdrop-blur-md dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)]"
        layout
        layoutId="glass-tab-blob"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{
          left: `${(activeIndex / tabs.length) * 100}%`,
          width: `${100 / tabs.length}%`,
        }}
      />
    </div>
  );
}
