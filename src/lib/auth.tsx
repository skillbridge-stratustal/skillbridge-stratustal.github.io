import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    name: string,
    email: string,
    password: string,
    teachSkill: string,
    learnSkill: string,
    gender: string
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_AVATAR =
  "https://images.pexels.com/photos/11156392/pexels-photo-11156392.jpeg?auto=compress&cs=tinysrgb&h=256&w=256&fit=crop";

function generateAvatarUrl(seed: string, gender: string): string {
  if (gender === "male") {
    return `https://randomuser.me/api/portraits/men/${seed}.jpg`;
  }
  if (gender === "female") {
    return `https://randomuser.me/api/portraits/women/${seed}.jpg`;
  }
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`;
}

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name ?? "",
    email: data.email ?? "",
    teachSkills: data.teach_skills ?? [],
    learnSkills: data.learn_skills ?? [],
    avatar: data.avatar ?? DEFAULT_AVATAR,
    location: data.location ?? "",
    bio: data.bio ?? "",
    isDefault: data.is_default ?? false,
  };
}

async function createProfile(
  supabaseUser: SupabaseUser,
  name: string,
  teachSkill: string,
  learnSkill: string,
  gender: string
): Promise<User> {
  const seedNum = Math.abs(hashCode(supabaseUser.id)) % 100;
  const avatarUrl = generateAvatarUrl(String(seedNum), gender);

  const profileData = {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name,
    avatar: avatarUrl,
    location: "",
    bio: "New to SkillBridge and excited to start swapping skills!",
    teach_skills: teachSkill ? [teachSkill] : [],
    learn_skills: learnSkill ? [learnSkill] : [],
    gender,
    is_default: false,
  };

  const { error } = await supabase.from("profiles").insert(profileData);
  if (error) {
    console.error("Failed to create profile:", error.message);
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name,
    teachSkills: teachSkill ? [teachSkill] : [],
    learnSkills: learnSkill ? [learnSkill] : [],
    avatar: avatarUrl,
    location: "",
    bio: "New to SkillBridge and excited to start swapping skills!",
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        fetchProfile(data.session.user.id).then((profile) => {
          if (!mounted) return;
          if (profile) {
            setUser(profile);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          (async () => {
            const profile = await fetchProfile(newSession.user.id);
            if (mounted) {
              setUser(profile);
              setLoading(false);
            }
          })();
        } else {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    const profile = await fetchProfile(session.user.id);
    if (profile) setUser(profile);
  }, [session]);

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      teachSkill: string,
      learnSkill: string,
      gender: string
    ): Promise<{ success: boolean; error?: string }> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return { success: false, error: translateAuthError(error.message) };
      }
      if (!data.user) {
        return { success: false, error: "Sign-up failed. Please try again." };
      }
      if (!data.session) {
        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        if (signInResult.error || !signInResult.data.user) {
          return {
            success: false,
            error: "Account created, but email confirmation is required. Please check your inbox (and spam folder) for a confirmation link before logging in.",
          };
        }
        const newProfile = await createProfile(signInResult.data.user, name, teachSkill, learnSkill, gender);
        setUser(newProfile);
        return { success: true };
      }
      const newProfile = await createProfile(data.user, name, teachSkill, learnSkill, gender);
      setUser(newProfile);
      return { success: true };
    },
    []
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: translateAuthError(error.message) };
      }
      if (!data.user) {
        return { success: false, error: "Sign-in failed. Please try again." };
      }
      const profile = await fetchProfile(data.user.id);
      if (profile) {
        setUser(profile);
      }
      return { success: true };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your email hasn't been confirmed yet. Check your inbox (and spam folder) for a confirmation link from Supabase, then try logging in.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many login attempts. Please wait a minute and try again.";
  }
  return message;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
