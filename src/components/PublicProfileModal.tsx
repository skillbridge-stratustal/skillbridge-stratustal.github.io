import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, GraduationCap, BookOpen, Sparkles } from "lucide-react";
import type { User } from "@/types";
import { ProfileMediaGallery } from "@/components/ProfileMediaGallery";

interface PublicProfileModalProps {
  user: User | null;
  onClose: () => void;
}

export function PublicProfileModal({ user, onClose }: PublicProfileModalProps) {
  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative my-auto w-full max-w-3xl rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-muted-c transition hover:text-primary-c dark:text-muted-c dark:hover:text-primary-c"
              aria-label="Close profile"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/50 dark:ring-white/20"
                />
                {user.isDefault && (
                  <span className="absolute -top-2 -right-2 flex items-center gap-0.5 rounded-full bg-accent-c px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    <Sparkles className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold tracking-tight text-primary-c dark:text-primary-c">
                  {user.name}
                </h2>
                {user.location && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-c dark:text-muted-c">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-input-bg)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-c dark:text-muted-c">
                  About
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-secondary-c dark:text-muted-c">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-input-bg)] p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-success-c dark:text-success-c">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Teaching
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {user.teachSkills.length > 0 ? (
                    user.teachSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border-success-soft-c bg-success-soft-c px-2.5 py-1 text-xs font-medium text-success-text-c dark:border-success-soft-c dark:bg-success-soft-c dark:text-success-c"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-c">No skills listed</span>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-input-bg)] p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger-c dark:text-danger-c">
                  <BookOpen className="h-3.5 w-3.5" />
                  Wants to Learn
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {user.learnSkills.length > 0 ? (
                    user.learnSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border-danger-soft-c bg-danger-soft-c px-2.5 py-1 text-xs font-medium text-danger-text-c dark:border-danger-soft-c dark:bg-danger-soft-c dark:text-danger-c"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-c">No skills listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Media gallery */}
            <div className="mt-5">
              <ProfileMediaGallery userId={user.id} editable={false} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
