import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { FloatingActions } from "@/components/FloatingActions";
import { Hero } from "@/components/Hero";
import { MatchMatrix } from "@/components/MatchMatrix";
import { HowItWorks } from "@/components/HowItWorks";
import { CommunityPage } from "@/components/CommunityPage";
import { Footer } from "@/components/Footer";
import { LoginModal } from "@/components/LoginModal";
import { InboxDrawer } from "@/components/InboxDrawer";
import { ChatDrawer } from "@/components/ChatDrawer";
import { ProfileView } from "@/components/ProfileView";
import { PublicProfileModal } from "@/components/PublicProfileModal";
import { TermsOfServicePage, PrivacyPolicyPage } from "@/components/LegalPages";
import { ToastProvider, useToast } from "@/components/ToastProvider";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient"; 
import {
  getAllUsers,
  updateUser,
  getBlockedUserIds,
  blockUser,
  unblockUser,
} from "@/lib/db";
import type { User, SwapRequest, Page } from "@/types";
import { getSwapStatus, countDeclinesByReceiver } from "@/lib/swapStatus";

const PROTECTED_PAGES: Page[] = ["profile", "chat"];

function SkillBridgeApp() {
  const { showToast } = useToast();
  const { isDark, toggleDark } = useTheme();
  const { user, loading, signUp, signIn, signOut, refreshProfile } = useAuth();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRequests, setAllRequests] = useState<SwapRequest[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutWarningOpen, setLogoutWarningOpen] = useState(false);
  const [chatRefreshKey, setChatRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [learnQuery, setLearnQuery] = useState("");
  const [teachQuery, setTeachQuery] = useState("");
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const currentPageRef = useRef(currentPage);
  const allUsersRef = useRef(allUsers);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  const refreshBlocked = () => {
    getBlockedUserIds().then(setBlockedUserIds);
  };

  // 🔴 Fetch Swaps directly from Supabase
  const refreshRequests = async () => {
    const { data, error } = await supabase.from("swaps").select("*");
    if (data && !error) {
      const formattedSwaps: SwapRequest[] = data.map((s: any) => ({
        id: s.id,
        senderId: s.sender_id,
        receiverId: s.receiver_id,
        senderName: s.sender_name || "User",
        receiverName: s.receiver_name || "User",
        teachSkill: s.teach_skill,
        learnSkill: s.learn_skill,
        status: s.status,
        createdAt: s.created_at ? new Date(s.created_at).getTime() : Date.now(),
      }));
      setAllRequests(formattedSwaps);
    }
  };

  useEffect(() => {
    let mounted = true;
    getAllUsers().then((users) => {
      if (mounted) setAllUsers(users);
    });
    refreshBlocked();
    
    // Load swaps on mount
    refreshRequests();

    // 🔴 Listen to Realtime updates for Swaps!
    const channel = supabase
      .channel('public:swaps')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'swaps' },
        (payload) => {
          console.log("🔔 SWAP UPDATE RECEIVED:", payload);
          refreshRequests(); // Immediately download the new changes!
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 🔴 Listen for incoming messages in real time
  useEffect(() => {
    if (!user) return;

    const msgChannel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as {
            receiver_id: string;
            sender_id: string;
            content: string;
          };
          if (newMsg.receiver_id !== user.id) return;
          if (currentPageRef.current === "chat") return;

          const sender = allUsersRef.current.find(
            (u) => u.id === newMsg.sender_id
          );
          const senderName = sender?.name || "Someone";
          const snippet = newMsg.content?.slice(0, 60) || "";
          showToast(`New message from ${senderName}: ${snippet}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [user]);

  const refreshUsers = () => {
    getAllUsers().then(setAllUsers);
  };

  const handleLogIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await signIn(email, password);
    if (result.success) {
      showToast("Welcome back!");
    }
    return result;
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
    teachSkill: string,
    learnSkill: string,
    gender: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await signUp(name, email, password, teachSkill, learnSkill, gender);
    if (result.success) {
      refreshUsers();
      showToast(`Account created! Welcome to SkillBridge, ${name}.`);
    }
    return result;
  };

  const requestLogout = () => {
    setLogoutWarningOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutWarningOpen(false);
    await signOut();
    setCurrentPage("home");
    showToast("You've been logged out.");
  };

  const handleSaveProfile = async (updated: User) => {
    await updateUser(updated);
    await refreshProfile();
    refreshUsers();
    showToast("Profile updated successfully!");
  };

  // 🔴 Write new Swap Request directly to Supabase (with duplicate + cooldown checks)
  const handleRequestSwap = async (target: User) => {
    if (!user) return;

    const status = getSwapStatus(user.id, target.id, allRequests);

    // Prevent duplicate: already accepted
    if (status.state === "accepted") {
      showToast("You already have an active swap with this person.");
      return;
    }
    // Prevent duplicate: already pending
    if (status.state === "pending-sender" || status.state === "pending-receiver") {
      showToast("There's already a pending swap request between you two.");
      return;
    }
    // 24-hour rejection cooldown
    if (status.state === "cooldown") {
      showToast("You must wait 24 hours before sending another request to this person.");
      return;
    }

    const teachSkill = target.teachSkills[0] || "their skill";
    const learnSkill = target.learnSkills[0] || "your skill";
    
    const { error } = await supabase.from("swaps").insert({
      sender_id: user.id,
      receiver_id: target.id,
      sender_name: user.name,
      receiver_name: target.name,
      teach_skill: teachSkill,
      learn_skill: learnSkill,
      status: "pending"
    });

    if (error) {
      console.error(error);
      showToast("Failed to send request.");
      return;
    }

    refreshRequests();
    showToast(`Swap request sent to ${target.name}!`);
  };

  // 🔴 Accept Request in Supabase
  const handleAcceptRequest = async (id: number) => {
    await supabase.from("swaps").update({ status: "accepted" }).eq("id", id);
    refreshRequests();
    setChatRefreshKey((k) => k + 1);
    showToast("Request accepted! You can now arrange your swap session.");
  };

  // 🔴 Terminate an active swap by deleting the row
  const handleTerminateSwap = async (swapId: number) => {
    const { error } = await supabase.from("swaps").delete().eq("id", swapId);
    if (error) {
      console.error(error);
      showToast("Failed to terminate swap.");
      return;
    }
    refreshRequests();
    setChatRefreshKey((k) => k + 1);
    showToast("Swap terminated");
  };

  // 🔴 Decline Request in Supabase (with 3-strike auto-block)
  const handleDeclineRequest = async (id: number) => {
    const req = allRequests.find((r) => r.id === id);
    if (!req) return;

    await supabase.from("swaps").update({ status: "declined" }).eq("id", id);
    refreshRequests();

    // Check if this is the 3rd decline by this receiver of this sender
    const declineCount = countDeclinesByReceiver(req.senderId, req.receiverId, allRequests);
    // declineCount is the count BEFORE this decline (since state hasn't refreshed yet)
    // So if declineCount === 2, this decline will be the 3rd
    if (declineCount + 1 >= 3 && user) {
      const sender = allUsers.find((u) => u.id === req.senderId);
      if (sender) {
        const ok = await blockUser(sender.id);
        if (ok) {
          refreshBlocked();
          showToast(`${sender.name} has been automatically blocked after 3 declined requests.`);
          return;
        }
      }
    }

    showToast("Request declined.");
  };

  const handleBlockUser = async (target: User) => {
    if (!user) return;
    const isBlocked = blockedUserIds.includes(target.id);
    if (isBlocked) {
      const ok = await unblockUser(target.id);
      if (ok) {
        refreshBlocked();
        showToast(`Unblocked ${target.name}.`);
      }
    } else {
      const ok = await blockUser(target.id);
      if (ok) {
        refreshBlocked();
        showToast(`Blocked ${target.name}. They can no longer see your profile or message you.`);
      }
    }
  };

  const handleNavigate = (page: Page) => {
    if (PROTECTED_PAGES.includes(page) && !user) {
      setLoginOpen(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    handleNavigate("home");
  };

  const incomingRequests = useMemo(
    () => (user ? allRequests.filter((r) => r.receiverId === user.id) : []),
    [allRequests, user]
  );

  const sentRequests = useMemo(
    () => (user ? allRequests.filter((r) => r.senderId === user.id) : []),
    [allRequests, user]
  );

  const unreadCount = incomingRequests.filter((r) => r.status === "pending").length;

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (user && blockedUserIds.includes(u.id)) return false;
      if (learnQuery) {
        const q = learnQuery.toLowerCase();
        const matches =
          u.teachSkills.some((s) => s.toLowerCase().includes(q)) ||
          u.bio.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (teachQuery) {
        const q = teachQuery.toLowerCase();
        const matches =
          u.learnSkills.some((s) => s.toLowerCase().includes(q)) ||
          u.bio.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allUsers, learnQuery, teachQuery, user, blockedUserIds]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent-c" />
          <p className="text-sm text-muted-c">Loading SkillBridge...</p>
        </div>
      </div>
    );
  }

  const effectivePage =
    PROTECTED_PAGES.includes(currentPage) && !user ? "home" : currentPage;

  return (
    <div className="relative min-h-screen">
      {/* Animated gradient orbs background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="glass-orb orb-animate-1 orb-1 left-[5%] top-[10%] h-[500px] w-[500px]" />
        <div className="glass-orb orb-animate-2 orb-2 right-[10%] top-[30%] h-[400px] w-[400px]" />
        <div className="glass-orb orb-animate-3 orb-3 left-[30%] bottom-[10%] h-[450px] w-[450px]" />
        <div className="glass-orb orb-animate-1 orb-4 right-[25%] bottom-[20%] h-[350px] w-[350px]" />
      </div>

      <div className="relative z-10">
        <Sidebar
          currentPage={effectivePage}
          user={user}
          unreadCount={unreadCount}
          onNavigate={handleNavigate}
          onInboxClick={() => setInboxOpen(true)}
          onLoginClick={() => setLoginOpen(true)}
          onLogOut={requestLogout}
          onBack={handleBack}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <FloatingActions
          user={user}
          isDark={isDark}
          onToggleDark={toggleDark}
          onLoginClick={() => setLoginOpen(true)}
          onMenuClick={() => setSidebarOpen(true)}
          onProfileClick={() => handleNavigate("profile")}
        />

        <div className="lg:pl-20 transition-all duration-300">
          <main className="pt-6">
            {effectivePage === "home" && (
              <Hero onExplore={() => handleNavigate("explore")} />
            )}

            {effectivePage === "explore" && (
              <div className="pt-8">
                <section className="mx-auto max-w-7xl px-6 pb-4">
                  <div className="glass-panel rounded-3xl p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-c dark:text-accent-c">
                          <Search className="h-3.5 w-3.5" />
                          What do you want to learn?
                        </label>
                        <input
                          value={learnQuery}
                          onChange={(e) => setLearnQuery(e.target.value)}
                          placeholder="e.g. Guitar, Python..."
                          className="glass-input w-full rounded-2xl px-4 py-2.5 text-sm text-primary-c placeholder:text-muted-c outline-none transition-colors focus-accent dark:text-primary-c dark:placeholder:text-muted-c"
                        />
                      </div>
                      <div>
                        <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success-c dark:text-success-c">
                          <Search className="h-3.5 w-3.5" />
                          What can you teach?
                        </label>
                        <input
                          value={teachQuery}
                          onChange={(e) => setTeachQuery(e.target.value)}
                          placeholder="e.g. Design, French..."
                          className="glass-input w-full rounded-2xl px-4 py-2.5 text-sm text-primary-c placeholder:text-muted-c outline-none transition-colors focus-accent dark:text-primary-c dark:placeholder:text-muted-c"
                        />
                      </div>
                    </div>
                  </div>
                </section>
                <MatchMatrix
                  users={filteredUsers}
                  currentUser={user}
                  allRequests={allRequests}
                  blockedUserIds={blockedUserIds}
                  onRequest={handleRequestSwap}
                  onBlock={handleBlockUser}
                  onViewProfile={setViewingUser}
                  onAccept={handleAcceptRequest}
                  onTerminate={handleTerminateSwap}
                />
              </div>
            )}

            {effectivePage === "how-it-works" && <HowItWorks />}

            {effectivePage === "community" && (
              <CommunityPage users={allUsers} allRequests={allRequests} blockedUserIds={blockedUserIds} />
            )}

            {effectivePage === "profile" && user && (
              <div className="pt-8">
                <ProfileView
                  user={user}
                  onSave={handleSaveProfile}
                  onBack={() => handleNavigate("home")}
                />
              </div>
            )}

            {effectivePage === "chat" && user && (
              <ChatDrawer
                key={chatRefreshKey}
                currentUser={user}
                allUsers={allUsers}
                requests={allRequests}
                blockedUserIds={blockedUserIds}
                onSimulateAccept={handleAcceptRequest}
                onBack={() => handleNavigate("home")}
              />
            )}

            {effectivePage === "terms" && (
              <TermsOfServicePage onBack={() => handleNavigate("home")} />
            )}

            {effectivePage === "privacy" && (
              <PrivacyPolicyPage onBack={() => handleNavigate("home")} />
            )}
          </main>

          {effectivePage === "home" && <Footer onNavigate={handleNavigate} />}
        </div>

        <PublicProfileModal user={viewingUser} onClose={() => setViewingUser(null)} />

        <LoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLogIn={handleLogIn}
          onSignUp={handleSignUp}
          onNavigateTerms={() => {
            setLoginOpen(false);
            handleNavigate("terms");
          }}
          onNavigatePrivacy={() => {
            setLoginOpen(false);
            handleNavigate("privacy");
          }}
        />
        <InboxDrawer
          isOpen={inboxOpen}
          onClose={() => setInboxOpen(false)}
          incomingRequests={incomingRequests}
          sentRequests={sentRequests}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
        />

        {/* Logout confirmation dialog */}
        <AnimatePresence>
          {logoutWarningOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              onClick={() => setLogoutWarningOpen(false)}
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="glass-panel-strong relative w-full max-w-sm rounded-3xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full glass-tag bg-warning-soft-c">
                    <AlertTriangle className="h-6 w-6 text-warning-c" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-primary-c">
                    Are you sure you want to log out?
                  </h3>
                  <p className="mt-2 text-sm text-secondary-c">
                    You'll need to sign in again to access your profile, inbox, and swap requests.
                  </p>
                  <div className="mt-6 flex w-full gap-3">
                    <button
                      onClick={() => setLogoutWarningOpen(false)}
                      className="glass-button flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold text-secondary-c transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmLogout}
                      className="flex-1 rounded-2xl bg-danger-c px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SkillBridgeApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}