import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowLeft,
  X,
  Clock,
} from "lucide-react";
import type { SwapRequest, User, ChatMessage } from "@/types";
import { supabase } from "@/lib/supabaseClient"; 

interface ChatContact {
  swap: SwapRequest;
  partner: User;
}

interface ChatDrawerProps {
  currentUser: User;
  allUsers: User[];
  requests: SwapRequest[];
  blockedUserIds: string[];
  onSimulateAccept: (id: number) => void;
  onBack: () => void;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function ChatDrawer({
  currentUser,
  allUsers,
  requests,
  blockedUserIds,
  onSimulateAccept,
  onBack,
}: ChatDrawerProps) {
  const [selectedSwapId, setSelectedSwapId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Build contact list
  const contacts: ChatContact[] = useMemo(() => {
    return requests
      .filter((r) => r.status !== "declined")
      .map((r) => {
        const partnerId = r.senderId === currentUser.id ? r.receiverId : r.senderId;
        const partner = allUsers.find((u) => u.id === partnerId);
        if (!partner) return null;
        return { swap: r, partner };
      })
      .filter((c): c is ChatContact => c !== null)
      .filter((c) => !blockedUserIds.includes(c.partner.id));
  }, [requests, allUsers, currentUser.id, blockedUserIds]);

  const activeChatsCount = contacts.filter((c) => c.swap.status === "accepted").length;
  const selectedContact = contacts.find((c) => c.swap.id === selectedSwapId) ?? null;

  // 🔴 Fetch messages and subscribe to Supabase Realtime
  useEffect(() => {
    if (!selectedSwapId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    // 1. Fetch historical messages on load
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("swap_id", selectedSwapId)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (data && !error) {
        const formattedMessages: ChatMessage[] = data.map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id,
          text: msg.content,
          createdAt: new Date(msg.created_at).getTime(),
        }));
        setMessages(formattedMessages);
      }
    };

    fetchMessages();

    // 2. Listen for new messages incoming in real-time
    const channel = supabase
      .channel(`chat_room_${selectedSwapId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("🔔 REALTIME EVENT RECEIVED:", payload);
          const newMsg = payload.new;
          
          // Force both IDs into Strings so Postgres and React match
          if (String(newMsg.swap_id) !== String(selectedSwapId)) return;

          setMessages((prev) => {
            // Replace optimistic temp message with the real DB row, or append if new
            const tempIdx = prev.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.senderId === newMsg.sender_id &&
                m.text === newMsg.content
            );
            
            if (tempIdx >= 0) {
              const copy = [...prev];
              copy[tempIdx] = {
                id: newMsg.id,
                senderId: newMsg.sender_id,
                text: newMsg.content,
                createdAt: new Date(newMsg.created_at).getTime(),
              };
              return copy;
            }
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                senderId: newMsg.sender_id,
                text: newMsg.content,
                createdAt: new Date(newMsg.created_at).getTime(),
              },
            ];
          });
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime Status:", status);
      });

    // Cleanup subscription when leaving the chat
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedSwapId]);

  // Auto-scroll the messages container to bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSelectContact = (swapId: number) => {
    setSelectedSwapId(swapId);
  };

  // 🔴 Send message to Supabase
  const handleSend = async () => {
    if (!inputText.trim() || !selectedSwapId || !selectedContact) return;

    const messageContent = inputText.trim();
    setInputText("");

    const messageId = crypto.randomUUID();
    
    const optimisticMessage: ChatMessage = {
      id: messageId,
      senderId: currentUser.id,
      text: messageContent,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const { error } = await supabase.from("messages").insert({
      id: messageId,
      swap_id: selectedSwapId,
      sender_id: currentUser.id,
      receiver_id: selectedContact.partner.id,
      content: messageContent,
    });

    if (error) {
      console.error("Failed to send message:", error.message);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSimulateAccept = () => {
    if (selectedContact) {
      onSimulateAccept(selectedContact.swap.id);
    }
  };

  // 🔴 Handle Scheduling (also sent as a message to DB)
  const handleSchedule = async () => {
    if (!selectedSwapId || !scheduleDate || !scheduleTime || !selectedContact) return;

    const dateObj = new Date(`${scheduleDate}T${scheduleTime}`);
    const formatted = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const content = `Session scheduled for ${formatted}`;
    const messageId = crypto.randomUUID();

    const optimisticMessage: ChatMessage = {
      id: messageId,
      senderId: currentUser.id,
      text: content,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setScheduleOpen(false);
    setScheduleDate("");
    setScheduleTime("");

    await supabase.from("messages").insert({
      id: messageId,
      swap_id: selectedSwapId,
      sender_id: currentUser.id,
      receiver_id: selectedContact.partner.id,
      content: content,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="glass-button flex h-9 items-center gap-1.5 rounded-2xl px-3 text-sm font-medium text-secondary-c transition-all dark:text-muted-c"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-accent-soft-c backdrop-blur-md">
            <MessageSquare className="h-5 w-5 text-accent-c" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-c dark:text-primary-c">
              Messages
            </h1>
            <p className="text-xs text-muted-c dark:text-muted-c">
              {activeChatsCount} active {activeChatsCount === 1 ? "chat" : "chats"}
            </p>
          </div>
        </div>
      </div>

      {/* Chat layout */}
      <div className="glass-panel flex h-[calc(100vh-180px)] min-h-[500px] overflow-hidden rounded-3xl">
        {/* Left: Contact list */}
        <div
          className={`${
            selectedContact ? "hidden md:flex" : "flex"
          } w-full flex-col border-r border-[var(--glass-border)] md:w-72 lg:w-80`}
        >
          <div className="border-b border-[var(--glass-border)] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary-c dark:text-primary-c">
                Swap Contacts
              </span>
              {activeChatsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-c px-1.5 text-[10px] font-bold text-white shadow-sm">
                  {activeChatsCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MessageSquare className="h-10 w-10 text-faint-c dark:text-secondary-c" />
                <p className="mt-3 text-sm text-muted-c dark:text-muted-c">
                  No swap contacts yet.
                </p>
                <p className="mt-1 text-xs text-faint-c dark:text-faint-c">
                  Accept swap requests to start chatting.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {contacts.map((contact) => {
                  const isActive = selectedSwapId === contact.swap.id;
                  const isAccepted = contact.swap.status === "accepted";
                  const partnerTeachSkill =
                    contact.swap.senderId === currentUser.id
                      ? contact.swap.teachSkill
                      : contact.swap.learnSkill;
                  return (
                    <button
                      key={contact.swap.id}
                      onClick={() => handleSelectContact(contact.swap.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                        isActive
                          ? "bg-accent-soft-c border border-[var(--accent-soft)]"
                          : "hover:bg-[var(--glass-bg)] border border-transparent"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={contact.partner.avatar}
                          alt={contact.partner.name}
                          className="h-11 w-11 rounded-2xl object-cover ring-2 ring-[var(--glass-highlight)]"
                        />
                        {isAccepted && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--glass-bg)] bg-success-c" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary-c dark:text-primary-c">
                          {contact.partner.name}
                        </p>
                        <p className="truncate text-xs text-muted-c dark:text-muted-c">
                          Trading: {partnerTeachSkill}
                        </p>
                      </div>
                      {!isAccepted && (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-warning-c" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat window */}
        <div
          className={`${
            selectedContact ? "flex" : "hidden md:flex"
          } flex-1 flex-col`}
        >
          {selectedContact ? (
            <>
              {/* Sticky top bar with partner info + actions */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedSwapId(null)}
                    className="glass-button flex h-8 w-8 items-center justify-center rounded-xl text-secondary-c md:hidden dark:text-muted-c"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <img
                    src={selectedContact.partner.avatar}
                    alt={selectedContact.partner.name}
                    className="h-10 w-10 rounded-2xl object-cover ring-2 ring-[var(--glass-highlight)]"
                  />
                  <div>
                    <p className="text-sm font-bold text-primary-c dark:text-primary-c">
                      {selectedContact.partner.name}
                    </p>
                    <p className="text-xs text-muted-c dark:text-muted-c">
                      {selectedContact.partner.location || "Remote"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedContact.swap.status === "accepted" && (
                    <button
                      onClick={() => setScheduleOpen(true)}
                      className="glass-button flex h-9 items-center gap-1.5 rounded-2xl px-3 text-xs font-semibold text-secondary-c transition-all hover:scale-105 dark:text-muted-c"
                      title="Schedule Session"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Schedule</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Glass context banner */}
              <div className="border-b border-[var(--glass-border)] bg-accent-soft-c px-4 py-2.5 backdrop-blur-md">
                <p className="text-center text-xs font-medium text-accent-hover-c dark:text-accent-c">
                  You offer{" "}
                  <strong className="font-bold">
                    {selectedContact.swap.senderId === currentUser.id
                      ? selectedContact.swap.learnSkill
                      : selectedContact.swap.teachSkill}
                  </strong>{" "}
                  <span className="mx-1 text-muted-c dark:text-muted-c">{"\u2194"}</span>{" "}
                  They offer{" "}
                  <strong className="font-bold">
                    {selectedContact.swap.senderId === currentUser.id
                      ? selectedContact.swap.teachSkill
                      : selectedContact.swap.learnSkill}
                  </strong>
                </p>
              </div>

              {selectedContact.swap.status === "accepted" ? (
                <>
                  {/* Messages area */}
                  <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft-c">
                          <MessageSquare className="h-6 w-6 text-accent-c" />
                        </div>
                        <p className="text-sm font-semibold text-primary-c dark:text-primary-c">
                          Start the conversation
                        </p>
                        <p className="mt-1 text-xs text-muted-c dark:text-muted-c">
                          Say hello to {selectedContact.partner.name.split(" ")[0]}!
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                          const isMe = msg.senderId === currentUser.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div className="max-w-[75%]">
                                <div
                                  className={`px-4 py-2.5 text-sm shadow-sm ${
                                    isMe
                                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl rounded-tr-none"
                                      : "border border-white/60 bg-white/80 text-primary-c backdrop-blur-md dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:text-primary-c rounded-2xl rounded-tl-none"
                                  }`}
                                >
                                  {msg.text}
                                </div>
                                <p
                                  className={`mt-1 text-[10px] text-faint-c dark:text-faint-c ${
                                    isMe ? "text-right" : "text-left"
                                  }`}
                                >
                                  {formatTimestamp(msg.createdAt)}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Floating input bar */}
                  <div className="border-t border-[var(--glass-border)] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-white/50 bg-white/40 px-5 py-3 text-sm text-primary-c backdrop-blur-lg outline-none transition-colors placeholder:text-muted-c focus:border-accent-c dark:border-[var(--glass-border)] dark:bg-[var(--glass-input-bg)] dark:text-primary-c dark:placeholder:text-muted-c"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Pending / locked state */
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel-strong w-full max-w-sm rounded-3xl p-8"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft-c">
                      <Lock className="h-7 w-7 text-warning-c" />
                    </div>
                    <h3 className="text-lg font-bold text-primary-c dark:text-primary-c">
                      Chat Locked
                    </h3>
                    <p className="mt-2 text-sm text-muted-c dark:text-muted-c">
                      Swap request pending. Messaging will unlock once accepted.
                    </p>
                    
                    {/* 🚨 THE FIX: Logic check to differentiate Sender from Receiver! */}
                    <div className="mt-6">
                      {selectedContact.swap.senderId === currentUser.id ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] px-4 py-2.5 text-sm font-medium text-muted-c">
                          <Clock className="h-4 w-4" />
                          Waiting for {selectedContact.partner.name.split(" ")[0]} to accept...
                        </div>
                      ) : (
                        <button
                          onClick={handleSimulateAccept}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-c px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-hover-c"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept Swap
                        </button>
                      )}
                    </div>

                  </motion.div>
                </div>
              )}
            </>
          ) : (
            /* Empty state when no contact selected */
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft-c backdrop-blur-md">
                <MessageSquare className="h-8 w-8 text-accent-c" />
              </div>
              <h3 className="text-lg font-bold text-primary-c dark:text-primary-c">
                Select a contact
              </h3>
              <p className="mt-2 text-sm text-muted-c dark:text-muted-c">
                Choose a swap partner from the list to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule session modal */}
      <AnimatePresence>
        {scheduleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            onClick={() => setScheduleOpen(false)}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md dark:bg-black/50" />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-panel-strong relative w-full max-w-sm rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setScheduleOpen(false)}
                className="absolute right-4 top-4 text-muted-c transition-colors hover:text-primary-c"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-5 flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-accent-soft-c backdrop-blur-md">
                  <Calendar className="h-6 w-6 text-accent-c" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-primary-c">
                  Schedule a Session
                </h3>
                <p className="mt-1 text-sm text-muted-c">
                  Pick a date and time to meet with {selectedContact?.partner.name.split(" ")[0]}.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="glass-input w-full rounded-2xl px-4 py-2.5 text-sm text-primary-c outline-none transition-colors focus-accent dark:text-primary-c"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="glass-input w-full rounded-2xl px-4 py-2.5 text-sm text-primary-c outline-none transition-colors focus-accent dark:text-primary-c"
                  />
                </div>
              </div>

              <button
                onClick={handleSchedule}
                disabled={!scheduleDate || !scheduleTime}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-c px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-accent-hover-c disabled:opacity-40"
              >
                <Clock className="h-4 w-4" />
                Confirm Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}