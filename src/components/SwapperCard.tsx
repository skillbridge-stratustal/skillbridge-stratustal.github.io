import { motion } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  BookOpen,
  Clock,
  Check,
  Sparkles,
  Ban,
  User as UserIcon,
  MessageSquare,
  Hourglass,
  Trash2,
} from "lucide-react";
import type { User } from "@/types";
import { getSwapStatus, type SwapButtonState } from "@/lib/swapStatus";

interface SwapperCardProps {
  user: User;
  currentUser: User | null;
  allRequests: import("@/types").SwapRequest[];
  isBlocked: boolean;
  onBlock: (user: User) => void;
  onViewProfile: (user: User) => void;
  onRequest: (user: User) => void;
  onAccept: (id: number) => void;
  onTerminate: (swapId: number) => void;
}

export function SwapperCard({
  user,
  currentUser,
  allRequests,
  isBlocked,
  onBlock,
  onViewProfile,
  onRequest,
  onAccept,
  onTerminate,
}: SwapperCardProps) {
  const statusInfo = getSwapStatus(currentUser?.id ?? null, user.id, allRequests);
  const state: SwapButtonState = isBlocked ? "blocked" : statusInfo.state;

  const buttonConfig: Record<
    SwapButtonState,
    { label: React.ReactNode; disabled: boolean; cls: string; onClick?: () => void }
  > = {
    self: {
      label: "This is you",
      disabled: true,
      cls: "glass-button cursor-default text-muted-c dark:text-muted-c",
    },
    blocked: {
      label: "Blocked",
      disabled: true,
      cls: "glass-button cursor-not-allowed text-muted-c dark:text-muted-c",
    },
    "no-auth": {
      label: "Log in to request",
      disabled: true,
      cls: "glass-button cursor-not-allowed text-muted-c dark:text-muted-c",
    },
    "can-request": {
      label: (
        <>
          <Check className="h-4 w-4" />
          Request Swap
        </>
      ),
      disabled: false,
      cls: "bg-accent-c text-white shadow-lg backdrop-blur-md hover:bg-accent-hover-c",
      onClick: () => onRequest(user),
    },
    "pending-sender": {
      label: (
        <>
          <Clock className="h-4 w-4" />
          Pending...
        </>
      ),
      disabled: true,
      cls: "glass-button cursor-not-allowed text-muted-c dark:text-muted-c",
    },
    "pending-receiver": {
      label: (
        <>
          <Check className="h-4 w-4" />
          Accept Swap
        </>
      ),
      disabled: false,
      cls: "bg-success-c text-white shadow-lg backdrop-blur-md hover:bg-success-c",
      onClick: () => statusInfo.requestId && onAccept(statusInfo.requestId),
    },
    accepted: {
      label: (
        <>
          <Trash2 className="h-4 w-4" />
          Terminate Swap
        </>
      ),
      disabled: false,
      cls: "bg-danger-c text-white shadow-lg backdrop-blur-md hover:bg-danger-c",
      onClick: () => statusInfo.requestId && onTerminate(statusInfo.requestId),
    },
    cooldown: {
      label: (
        <>
          <Hourglass className="h-4 w-4" />
          Try again in 24h
        </>
      ),
      disabled: true,
      cls: "glass-button cursor-not-allowed text-muted-c dark:text-muted-c",
    },
  };

  const cfg = buttonConfig[state];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="glass-panel glass-glow-hover group relative flex flex-col rounded-3xl p-5"
    >
      {user.isDefault && (
        <div className="absolute -top-2.5 left-4 z-10">
          <span className="glass-tag inline-flex items-center gap-1 rounded-full border-accent-soft-c bg-accent-soft-c px-2.5 py-0.5 text-[10px] font-bold text-accent-hover-c backdrop-blur-md dark:border-accent-soft-c dark:bg-accent-soft-c dark:text-accent-c">
            <Sparkles className="h-2.5 w-2.5" />
            Verified
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/50 dark:ring-white/20"
        />
        <div className="flex-1">
          <h3 className="text-base font-bold tracking-tight text-primary-c dark:text-primary-c">{user.name}</h3>
          {user.location && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-c dark:text-muted-c">
              <MapPin className="h-3 w-3" />
              {user.location}
            </div>
          )}
        </div>
      </div>

      {/* Teaching Skills */}
      <div className="mt-4">
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-success-text-c dark:text-success-c">
          <GraduationCap className="h-3 w-3" />
          Teaching
        </p>
        <div className="flex flex-wrap gap-1.5">
          {user.teachSkills.length > 0 ? (
            user.teachSkills.map((s) => (
              <span
                key={s}
                className="glass-tag rounded-full border-success-soft-c bg-success-soft-c px-2.5 py-1 text-xs font-medium text-success-text-c dark:border-success-soft-c dark:bg-success-soft-c dark:text-success-c"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-c">No skills listed</span>
          )}
        </div>
      </div>

      {/* Learning Skills */}
      <div className="mt-3">
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-danger-text-c dark:text-danger-c">
          <BookOpen className="h-3 w-3" />
          Wants to Learn
        </p>
        <div className="flex flex-wrap gap-1.5">
          {user.learnSkills.length > 0 ? (
            user.learnSkills.map((s) => (
              <span
                key={s}
                className="glass-tag rounded-full border-danger-soft-c bg-danger-soft-c px-2.5 py-1 text-xs font-medium text-danger-text-c dark:border-danger-soft-c dark:bg-danger-soft-c dark:text-danger-c"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-c">No skills listed</span>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-secondary-c dark:text-muted-c">{user.bio}</p>

      {/* CTA */}
      <div className="mt-5 flex-1" />
      <div className="mb-2 flex w-full">
        <button
          onClick={() => onViewProfile(user)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-semibold text-secondary-c backdrop-blur-md transition-all hover:border-accent-c hover:text-accent-c dark:text-muted-c dark:hover:text-accent-c"
        >
          <UserIcon className="h-4 w-4" />
          View Profile
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={cfg.onClick}
          disabled={cfg.disabled}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${cfg.cls}`}
        >
          {cfg.label}
        </button>
        {state !== "self" && state !== "no-auth" && (
          <button
            onClick={() => onBlock(user)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all ${
              isBlocked
                ? "border-danger-soft-c bg-danger-soft-c text-danger-c dark:border-danger-soft-c dark:bg-danger-soft-c dark:text-danger-c"
                : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-muted-c hover:text-danger-c dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:text-muted-c dark:hover:text-danger-c"
            }`}
            title={isBlocked ? "Unblock user" : "Block user"}
          >
            <Ban className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
