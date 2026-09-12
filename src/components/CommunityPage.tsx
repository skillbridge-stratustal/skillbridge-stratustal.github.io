import { motion } from "framer-motion";
import { Users, Heart, Globe, TrendingUp, MessageCircle, Award } from "lucide-react";
import type { User, SwapRequest } from "@/types";

interface CommunityPageProps {
  users: User[];
  allRequests: SwapRequest[];
  blockedUserIds: string[];
}

export function CommunityPage({ users, allRequests, blockedUserIds }: CommunityPageProps) {
  const visibleUsers = users.filter((u) => !blockedUserIds.includes(u.id));
  const totalSkills = visibleUsers.reduce((sum, u) => sum + u.teachSkills.length, 0);
  const acceptedSwaps = allRequests.filter((r) => r.status === "accepted").length;

  const stats = [
    { icon: Users, label: "Active Members", value: visibleUsers.length, color: "text-accent-c dark:text-accent-c", bg: "border-accent-soft-c bg-accent-soft-c dark:border-accent-soft-c dark:bg-accent-soft-c" },
    { icon: Award, label: "Skills Offered", value: totalSkills, color: "text-success-c dark:text-success-c", bg: "border-success-soft-c bg-success-soft-c dark:border-success-soft-c dark:bg-success-soft-c" },
    { icon: Heart, label: "Swaps Completed", value: acceptedSwaps, color: "text-danger-c dark:text-danger-c", bg: "border-danger-soft-c bg-danger-soft-c dark:border-danger-soft-c dark:bg-danger-soft-c" },
    { icon: Globe, label: "Countries", value: new Set(visibleUsers.filter((u) => u.location).map((u) => u.location.split(",")[1]?.trim() || u.location)).size, color: "text-warning-c dark:text-warning-c", bg: "border-warning-soft-c bg-warning-soft-c dark:border-warning-soft-c dark:bg-warning-soft-c" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Generosity Over Transactions",
      description: "We believe knowledge should flow freely. When you teach, you're not selling a service, you're investing in someone's growth.",
    },
    {
      icon: Users,
      title: "Everyone is a Teacher",
      description: "You don't need a degree or certification to share what you know. If you've learned something, you can help someone else learn it too.",
    },
    {
      icon: TrendingUp,
      title: "Growth is the Goal",
      description: "Every swap makes both people better. The teacher reinforces their knowledge, and the learner gains a new skill. Win-win.",
    },
    {
      icon: MessageCircle,
      title: "Real Conversations",
      description: "Learning happens best person-to-person. That's why every swap is a 1-on-1 session, not a pre-recorded course.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="glass-button mb-4 inline-flex items-center gap-2 rounded-2xl px-4 py-1.5">
          <Users className="h-3.5 w-3.5 text-accent-c dark:text-accent-c" />
          <span className="text-xs font-medium text-secondary-c dark:text-faint-c">Our Community</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary-c sm:text-5xl dark:text-primary-c">
          A community built on <span className="text-accent-c dark:text-accent-c">shared knowledge</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-secondary-c dark:text-muted-c">
          SkillBridge connects people who want to teach with people who want to learn. No money, no
          subscriptions, just a global community helping each other grow.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`glass-tag glass-glow-hover flex flex-col items-center rounded-3xl border ${stat.bg} p-6`}
          >
            <stat.icon className={`h-7 w-7 ${stat.color}`} />
            <span className={`mt-3 text-3xl font-black ${stat.color}`}>{stat.value}</span>
            <span className="mt-1 text-xs font-medium text-muted-c dark:text-muted-c">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-primary-c dark:text-primary-c">
          What we believe
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-panel glass-glow-hover rounded-3xl p-6"
            >
              <div className="glass-tag mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border-accent-soft-c bg-accent-soft-c dark:border-accent-soft-c dark:bg-accent-soft-c">
                <value.icon className="h-5 w-5 text-accent-c dark:text-accent-c" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-primary-c dark:text-primary-c">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-c dark:text-muted-c">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent members */}
      <div>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-primary-c dark:text-primary-c">
          Recent members
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleUsers.slice(0, 6).map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-panel glass-glow-hover flex items-center gap-3 rounded-2xl p-4"
            >
              <img
                src={u.avatar}
                alt={u.name}
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/50 dark:ring-white/20"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-primary-c dark:text-primary-c">{u.name}</p>
                <p className="truncate text-xs text-muted-c dark:text-muted-c">{u.location || "Location not set"}</p>
                <p className="mt-0.5 truncate text-xs font-medium text-success-c dark:text-success-c">
                  {u.teachSkills[0] || "No skills listed"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
