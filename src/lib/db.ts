import { supabase } from "@/lib/supabaseClient";
import type { SwapRequest, User } from "@/types";

const REQUESTS_KEY = "skillbridge_requests";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ── Profiles (Supabase) ──────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    teachSkills: row.teach_skills ?? [],
    learnSkills: row.learn_skills ?? [],
    avatar: row.avatar ?? "",
    location: row.location ?? "",
    bio: row.bio ?? "",
    isDefault: row.is_default ?? false,
  }));
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name ?? "",
    email: data.email ?? "",
    teachSkills: data.teach_skills ?? [],
    learnSkills: data.learn_skills ?? [],
    avatar: data.avatar ?? "",
    location: data.location ?? "",
    bio: data.bio ?? "",
    isDefault: data.is_default ?? false,
  };
}

export async function getBlockedUserIds(): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_blocked_user_ids");
  if (error || !data) return [];
  return data as string[];
}

export async function blockUser(blockedId: string): Promise<boolean> {
  const { error } = await supabase.from("blocks").insert({ blocked_id: blockedId });
  if (error) {
    console.error("Failed to block user:", error.message);
    return false;
  }
  return true;
}

export async function unblockUser(blockedId: string): Promise<boolean> {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocked_id", blockedId);
  if (error) {
    console.error("Failed to unblock user:", error.message);
    return false;
  }
  return true;
}

export async function updateUser(updated: User): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      name: updated.name,
      avatar: updated.avatar,
      location: updated.location,
      bio: updated.bio,
      teach_skills: updated.teachSkills,
      learn_skills: updated.learnSkills,
    })
    .eq("id", updated.id);

  if (error) {
    console.error("Failed to update profile:", error.message);
  }
}

// ── Swap Requests (localStorage) ──────────────────────────────────────────────

export function getAllRequests(): SwapRequest[] {
  return read<SwapRequest[]>(REQUESTS_KEY, []);
}

export function createRequest(req: Omit<SwapRequest, "id" | "createdAt" | "status">): SwapRequest {
  const requests = getAllRequests();
  const newReq: SwapRequest = {
    ...req,
    id: nextId(),
    status: "pending",
    createdAt: Date.now(),
  };
  requests.push(newReq);
  write(REQUESTS_KEY, requests);
  return newReq;
}

export function updateRequestStatus(id: number, status: "accepted" | "declined"): void {
  const requests = getAllRequests().map((r) =>
    r.id === id ? { ...r, status } : r
  );
  write(REQUESTS_KEY, requests);
}

export function getIncomingRequests(userId: string): SwapRequest[] {
  return getAllRequests().filter((r) => r.receiverId === userId);
}

export function getSentRequests(userId: string): SwapRequest[] {
  return getAllRequests().filter((r) => r.senderId === userId);
}

// ── Chat Messages (Supabase `messages` table) ───────────────────────────────
// Chat messages are now stored in Supabase and streamed via Realtime.
// See src/components/ChatDrawer.tsx for the live subscription + insert logic.
