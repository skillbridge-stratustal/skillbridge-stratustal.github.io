import { motion } from "framer-motion";
import { User, Menu } from "lucide-react";
import { ThemePicker } from "@/components/ThemePicker";
import { BrandLogo } from "@/components/BrandLogo";
import type { User as UserType } from "@/types";

interface FloatingActionsProps {
  user: UserType | null;
  isDark: boolean;
  onToggleDark: () => void;
  onLoginClick: () => void;
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export function FloatingActions({
  user,
  isDark: _isDark,
  onToggleDark: _onToggleDark,
  onLoginClick,
  onMenuClick,
  onProfileClick,
}: FloatingActionsProps) {
  return (
    <>
      <div className="fixed left-5 top-5 z-[60] lg:hidden">
        <BrandLogo size="sm" />
      </div>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
        className="fixed right-5 top-5 z-[60] flex items-center gap-2.5"
      >
      <button
        onClick={onMenuClick}
        className="glass-panel-strong flex h-10 w-10 items-center justify-center rounded-2xl text-secondary-c shadow-lg transition-all hover:scale-105 lg:hidden dark:text-muted-c"
        title="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <ThemePicker />

      {user ? (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={onProfileClick}
          className="flex items-center gap-2 rounded-2xl glass-panel-strong p-1 pr-3 shadow-lg transition-all hover:scale-105"
          title="My Profile"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-xl object-cover"
          />
          <span className="hidden text-sm font-semibold text-secondary-c sm:inline dark:text-muted-c">
            {user.name.split(" ")[0]}
          </span>
        </motion.button>
      ) : (
        <button
          onClick={onLoginClick}
          className="flex h-10 items-center gap-2 rounded-2xl bg-accent-c px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-accent-hover-c hover:scale-105"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Up</span>
        </button>
      )}
      </motion.div>
    </>
  );
}
