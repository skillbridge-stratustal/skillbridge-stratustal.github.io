export type Category = "Tech" | "Design" | "Languages" | "Music";

export interface User {
  id: string;
  name: string;
  email: string;
  teachSkills: string[];
  learnSkills: string[];
  avatar: string;
  location: string;
  bio: string;
  isDefault?: boolean;
}

export type PublicUser = Omit<User, "email">;

export type SwapStatus = "pending" | "accepted" | "declined";

export interface SwapRequest {
  id: number;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  teachSkill: string;
  learnSkill: string;
  status: SwapStatus;
  createdAt: number;
}

export interface ProfileMedia {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
  sortOrder: number;
  createdAt: number;
}

export type Page = "home" | "explore" | "how-it-works" | "community" | "profile" | "chat" | "terms" | "privacy";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}
