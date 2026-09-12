import { motion, AnimatePresence } from "framer-motion";
import { SwapperCard } from "./SwapperCard";
import type { User, SwapRequest } from "@/types";

interface MatchMatrixProps {
  users: User[];
  currentUser: User | null;
  allRequests: SwapRequest[];
  blockedUserIds: string[];
  onRequest: (user: User) => void;
  onBlock: (user: User) => void;
  onViewProfile: (user: User) => void;
  onAccept: (id: number) => void;
  onTerminate: (swapId: number) => void;
}

export function MatchMatrix({
  users,
  currentUser,
  allRequests,
  blockedUserIds,
  onRequest,
  onBlock,
  onViewProfile,
  onAccept,
  onTerminate,
}: MatchMatrixProps) {
  const visibleUsers = currentUser
    ? users.filter((u) => u.id !== currentUser.id)
    : users;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-c sm:text-4xl dark:text-primary-c">
          Find Your Perfect Swap
        </h2>
        <p className="mt-2 text-base text-muted-c dark:text-muted-c">
          Browse skill swappers from the community and find your match.
        </p>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((u) => (
            <SwapperCard
              key={u.id}
              user={u}
              currentUser={currentUser}
              allRequests={allRequests}
              isBlocked={blockedUserIds.includes(u.id)}
              onBlock={onBlock}
              onViewProfile={onViewProfile}
              onRequest={onRequest}
              onAccept={onAccept}
              onTerminate={onTerminate}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {visibleUsers.length === 0 && (
        <div className="glass-panel flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <p className="text-lg font-semibold text-primary-c dark:text-primary-c">No matches found</p>
          <p className="mt-2 text-sm text-muted-c dark:text-muted-c">
            Try adjusting your search terms.
          </p>
        </div>
      )}
    </section>
  );
}
