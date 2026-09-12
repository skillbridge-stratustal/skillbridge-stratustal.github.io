import { motion } from "framer-motion";
import { UserCheck, Zap, Video, ArrowRight, Heart } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: UserCheck,
      title: "Create Your Profile",
      description: "List the skills you can teach and what you want to learn. It takes less than 2 minutes.",
      color: "text-success-c dark:text-success-c",
      bg: "border-success-soft-c bg-success-soft-c dark:border-success-soft-c dark:bg-success-soft-c",
    },
    {
      icon: Zap,
      title: "Find Your Match",
      description: "Browse the community, filter by category, and send a swap request to someone who fits.",
      color: "text-accent-c dark:text-accent-c",
      bg: "border-accent-soft-c bg-accent-soft-c dark:border-accent-soft-c dark:bg-accent-soft-c",
    },
    {
      icon: Video,
      title: "Swap & Learn",
      description: "Meet 1-on-1 over video. You teach what you know, then learn what you've always wanted.",
      color: "text-danger-c dark:text-danger-c",
      bg: "border-danger-soft-c bg-danger-soft-c dark:border-danger-soft-c dark:bg-danger-soft-c",
    },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-c sm:text-4xl dark:text-primary-c">
          How It Works
        </h2>
        <p className="mt-2 text-base text-muted-c dark:text-muted-c">
          Three simple steps to start swapping skills.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-panel glass-glow-hover relative rounded-3xl p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`glass-tag flex h-12 w-12 items-center justify-center rounded-2xl border ${step.bg}`}>
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>
              <span className="text-5xl font-black text-faint-c dark:text-faint-c">{i + 1}</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-primary-c dark:text-primary-c">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary-c dark:text-muted-c">{step.description}</p>
            {i < 2 && (
              <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-faint-c md:block dark:text-faint-c" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="glass-panel relative mt-12 overflow-hidden rounded-3xl p-8"
      >
        <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-xl">
            <div className="glass-tag mb-3 inline-flex items-center gap-2 rounded-full border-accent-soft-c bg-accent-soft-c px-4 py-1.5 dark:border-accent-soft-c dark:bg-accent-soft-c">
              <Heart className="h-3.5 w-3.5 text-accent-c dark:text-accent-c" />
              <span className="text-xs font-semibold text-accent-hover-c dark:text-accent-c">Community First</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-primary-c sm:text-3xl dark:text-primary-c">
              Knowledge is better when it's shared
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary-c dark:text-muted-c">
              SkillBridge is built on a simple idea: everyone has something to teach, and everyone has
              something to learn. No subscriptions, no payments, just a community of people helping
              each other grow.
            </p>
          </div>

          <div className="flex shrink-0 gap-4">
            <div className="glass-panel flex flex-col items-center rounded-2xl px-6 py-5">
              <span className="text-3xl font-black text-accent-c dark:text-accent-c">12,847</span>
              <span className="mt-1 text-xs font-medium text-muted-c dark:text-muted-c">Skills Swapped</span>
            </div>
            <div className="glass-panel flex flex-col items-center rounded-2xl px-6 py-5">
              <span className="text-3xl font-black text-danger-c dark:text-danger-c">3,420</span>
              <span className="mt-1 text-xs font-medium text-muted-c dark:text-muted-c">Active Members</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
