import { motion, AnimatePresence } from "framer-motion";
import { X, Inbox, Send, Check, Clock, XCircle, GraduationCap, BookOpen } from "lucide-react";
import { useState } from "react";
import { GlassTabSlider } from "@/components/GlassTabSlider";
import type { SwapRequest } from "@/types";

type InboxTab = "incoming" | "sent";

interface InboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incomingRequests: SwapRequest[];
  sentRequests: SwapRequest[];
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}

export function InboxDrawer({
  isOpen,
  onClose,
  incomingRequests,
  sentRequests,
  onAccept,
  onDecline,
}: InboxDrawerProps) {
  const [tab, setTab] = useState<InboxTab>("incoming");

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const statusConfig = {
    pending: { icon: Clock, text: "Pending", cls: "bg-warning-soft-c text-warning-text-c border-warning-soft-c dark:bg-warning-soft-c dark:text-warning-c dark:border-warning-soft-c" },
    accepted: { icon: Check, text: "Accepted", cls: "bg-success-light-c text-success-text-c border-success-soft-c dark:bg-success-soft-c dark:text-success-c dark:border-success-soft-c" },
    declined: { icon: XCircle, text: "Declined", cls: "bg-danger-soft-c text-danger-text-c border-danger-soft-c dark:bg-danger-soft-c dark:text-danger-c dark:border-danger-soft-c" },
  };

  const StatusBadge = ({ status }: { status: SwapRequest["status"] }) => {
    const { icon: Icon, text, cls } = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
        <Icon className="h-3 w-3" />
        {text}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/20 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col border-l border-[var(--glass-border)] glass-panel shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-6 py-4 dark:border-[var(--glass-border)]">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary-c dark:text-primary-c">
                <Inbox className="h-5 w-5 text-accent-c dark:text-accent-c" />
                Inbox
              </h2>
              <button
                onClick={onClose}
                className="text-muted-c transition-colors hover:text-primary-c dark:hover:text-primary-c"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 py-3">
              <GlassTabSlider
                tabs={[
                  { value: "incoming" as InboxTab, label: `Incoming (${incomingRequests.length})` },
                  { value: "sent" as InboxTab, label: `Sent (${sentRequests.length})` },
                ]}
                activeTab={tab}
                onTabChange={setTab}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {tab === "incoming" ? (
                incomingRequests.length === 0 ? (
                  <EmptyState icon={Inbox} text="No incoming requests yet." />
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((req) => (
                      <RequestCard key={req.id} req={req} direction="incoming" formatTime={formatTime} onAccept={onAccept} onDecline={onDecline} />
                    ))}
                  </div>
                )
              ) : sentRequests.length === 0 ? (
                <EmptyState icon={Send} text="No sent requests yet." />
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((req) => (
                    <RequestCard key={req.id} req={req} direction="sent" formatTime={formatTime} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="h-10 w-10 text-faint-c dark:text-secondary-c" />
      <p className="mt-3 text-sm text-muted-c dark:text-muted-c">{text}</p>
    </div>
  );
}

function RequestCard({
  req,
  direction,
  formatTime,
  onAccept,
  onDecline,
}: {
  req: SwapRequest;
  direction: "incoming" | "sent";
  formatTime: (ts: number) => string;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
}) {
  const otherName = direction === "incoming" ? req.senderName : req.receiverName;
  const statusConfig = {
    pending: { icon: Clock, text: "Pending", cls: "bg-warning-soft-c text-warning-text-c border-warning-soft-c dark:bg-warning-soft-c dark:text-warning-c dark:border-warning-soft-c" },
    accepted: { icon: Check, text: "Accepted", cls: "bg-success-light-c text-success-text-c border-success-soft-c dark:bg-success-soft-c dark:text-success-c dark:border-success-soft-c" },
    declined: { icon: XCircle, text: "Declined", cls: "bg-danger-soft-c text-danger-text-c border-danger-soft-c dark:bg-danger-soft-c dark:text-danger-c dark:border-danger-soft-c" },
  };
  return (
    <div className="rounded-[10px] border border-[var(--glass-border)] glass-panel p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-primary-c dark:text-primary-c">{otherName}</span>
        <span className="text-xs text-muted-c dark:text-muted-c">{formatTime(req.createdAt)}</span>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs">
          <GraduationCap className="h-3.5 w-3.5 text-success-c dark:text-success-c" />
          <span className="text-secondary-c dark:text-faint-c">They teach: <strong className="font-semibold">{req.teachSkill}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <BookOpen className="h-3.5 w-3.5 text-danger-c dark:text-danger-c" />
          <span className="text-secondary-c dark:text-faint-c">You learn: <strong className="font-semibold">{req.learnSkill}</strong></span>
        </div>
      </div>

      {direction === "incoming" && req.status === "pending" ? (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onAccept?.(req.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-success-c px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-success-c"
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </button>
          <button
            onClick={() => onDecline?.(req.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[var(--glass-border)] px-3 py-2 text-xs font-semibold text-secondary-c transition-all hover:bg-[var(--glass-bg)] dark:border-[var(--glass-border)] dark:text-faint-c dark:hover:bg-[var(--glass-bg)]"
          >
            <XCircle className="h-3.5 w-3.5" />
            Decline
          </button>
        </div>
      ) : (
        <div className="mt-3 flex justify-end">
          <StatusBadgeMini status={req.status} statusConfig={statusConfig} />
        </div>
      )}
    </div>
  );
}

function StatusBadgeMini({ status, statusConfig }: { status: SwapRequest["status"]; statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; text: string; cls: string }> }) {
  const { icon: Icon, text, cls } = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}
