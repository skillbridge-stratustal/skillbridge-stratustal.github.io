import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Compass, HelpCircle, Users, User, Bell, X, LogOut, ArrowLeft, MessageSquare } from "lucide-react";
import type { Page, User as UserType } from "@/types";
import { BrandLogo } from "@/components/BrandLogo";

interface SidebarProps {
  currentPage: Page;
  user: UserType | null;
  unreadCount: number;
  onNavigate: (page: Page) => void;
  onInboxClick: () => void;
  onLoginClick: () => void;
  onLogOut: () => void;
  onBack: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { page: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { page: "home", label: "Home", icon: Home },
  { page: "explore", label: "Explore Swaps", icon: Compass },
  { page: "how-it-works", label: "How It Works", icon: HelpCircle },
  { page: "community", label: "Community", icon: Users },
];

export function Sidebar({
  currentPage,
  user,
  unreadCount,
  onNavigate,
  onInboxClick,
  onLoginClick,
  onLogOut,
  onBack,
  isOpen,
  onClose,
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const expanded = isHovered || isOpen;
  const showBackButton = currentPage !== "home";

  const navLabelExpanded = "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all";
  const navLabelCollapsed = "relative flex w-full items-center justify-center rounded-2xl px-0 py-2.5 text-sm font-medium transition-all";

  const getNavClass = (isActive: boolean) => {
    const base = isActive
      ? "border border-[var(--accent-soft)] bg-[var(--accent-soft)] text-accent-hover-c backdrop-blur-md shadow-sm"
      : "border border-transparent text-secondary-c hover:bg-[var(--glass-bg)] hover:text-primary-c dark:text-muted-c dark:hover:bg-[var(--glass-bg)] dark:hover:text-primary-c";
    return `${expanded ? navLabelExpanded : navLabelCollapsed} ${base}`;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`glass-panel fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[var(--glass-border)] transition-all duration-300 lg:translate-x-0 ${
          expanded ? "lg:w-64" : "lg:w-20"
        } w-64 rounded-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className={expanded ? "flex" : "hidden"}>
            <BrandLogo size="md" showTagline />
          </div>
          {!expanded && (
            <BrandLogo size="md" showText={false} />
          )}
          <button onClick={onClose} className="text-muted-c lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* Back button - only on non-home pages */}
          {showBackButton && (
            <button
              onClick={() => {
                onBack();
                onClose();
              }}
              className={getNavClass(false)}
              title={!expanded ? "Back to Home" : undefined}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              {expanded && "Back to Home"}
            </button>
          )}

          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                }}
                className={getNavClass(isActive)}
                title={!expanded ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {expanded && item.label}
                {expanded && isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-c"
                  />
                )}
              </button>
            );
          })}

          {user && (
            <button
              onClick={() => {
                onNavigate("profile");
                onClose();
              }}
              className={getNavClass(currentPage === "profile")}
              title={!expanded ? "My Profile" : undefined}
            >
              <User className="h-4 w-4 shrink-0" />
              {expanded && "My Profile"}
            </button>
          )}

          {user && (
            <button
              onClick={() => {
                onNavigate("chat");
                onClose();
              }}
              className={getNavClass(currentPage === "chat")}
              title={!expanded ? "Messages" : undefined}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              {expanded && "Messages"}
            </button>
          )}
        </nav>

        <div className="space-y-3 border-t border-[var(--glass-border)] px-3 py-4">
          {user && (
            <button
              onClick={() => {
                onInboxClick();
                onClose();
              }}
              className={getNavClass(false)}
              title={!expanded ? "Inbox" : undefined}
            >
              <Bell className="h-4 w-4 shrink-0" />
              {expanded && "Inbox"}
              {expanded && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-c px-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                  {unreadCount}
                </span>
              )}
              {!expanded && unreadCount > 0 && (
                <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-c px-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className={`rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md ${expanded ? "flex items-center gap-2.5 px-3 py-2.5" : "p-2"}`}>
              {expanded ? (
                <>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--glass-highlight)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-primary-c dark:text-primary-c">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-c dark:text-muted-c">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogOut}
                    className="flex h-7 w-7 items-center justify-center rounded-xl text-muted-c transition-colors hover:bg-[var(--glass-bg)] hover:text-secondary-c dark:hover:bg-[var(--glass-bg)]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--glass-highlight)]"
                  />
                  <button
                    onClick={onLogOut}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--glass-border)] glass-button text-secondary-c backdrop-blur-md"
                    title="Log out"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
