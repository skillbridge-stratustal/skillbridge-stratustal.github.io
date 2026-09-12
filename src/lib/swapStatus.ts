import type { SwapRequest } from "@/types";

export type SwapButtonState =
  | "self"
  | "blocked"
  | "no-auth"
  | "can-request"
  | "pending-sender"
  | "pending-receiver"
  | "accepted"
  | "cooldown";

export interface SwapStatusInfo {
  state: SwapButtonState;
  requestId?: number;
}

/**
 * Computes the swap button state between the current user and a target user,
 * based on the full set of swap requests.
 */
export function getSwapStatus(
  currentUserId: string | null,
  targetId: string,
  allRequests: SwapRequest[]
): SwapStatusInfo {
  if (!currentUserId) return { state: "no-auth" };
  if (currentUserId === targetId) return { state: "self" };

  const between = allRequests.filter(
    (r) =>
      (r.senderId === currentUserId && r.receiverId === targetId) ||
      (r.senderId === targetId && r.receiverId === currentUserId)
  );

  // Check for accepted swap — highest priority
  const accepted = between.find((r) => r.status === "accepted");
  if (accepted) return { state: "accepted", requestId: accepted.id };

  // Check for pending swap
  const pending = between.find((r) => r.status === "pending");
  if (pending) {
    if (pending.senderId === currentUserId) {
      return { state: "pending-sender", requestId: pending.id };
    }
    return { state: "pending-receiver", requestId: pending.id };
  }

  // Check 24-hour rejection cooldown — most recent declined swap
  const declined = between
    .filter((r) => r.status === "declined")
    .sort((a, b) => b.createdAt - a.createdAt);

  if (declined.length > 0) {
    const latest = declined[0];
    // Only apply cooldown if current user was the sender of that declined request
    if (latest.senderId === currentUserId) {
      const hoursSince = (Date.now() - latest.createdAt) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return { state: "cooldown", requestId: latest.id };
      }
    }
  }

  return { state: "can-request" };
}

/**
 * Counts how many times a specific receiver has declined a specific sender.
 */
export function countDeclinesByReceiver(
  senderId: string,
  receiverId: string,
  allRequests: SwapRequest[]
): number {
  return allRequests.filter(
    (r) =>
      r.senderId === senderId &&
      r.receiverId === receiverId &&
      r.status === "declined"
  ).length;
}
