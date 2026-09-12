import { motion } from "framer-motion";
import { Zap, ArrowRightLeft } from "lucide-react";

interface HeroProps {
  onExplore: () => void;
}

export function Hero({ onExplore }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-16 pb-16">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-button mb-5 inline-flex items-center gap-2 rounded-2xl px-4 py-1.5">
            <span className="text-xs font-medium text-secondary-c dark:text-faint-c">
              Peer-to-Peer Learning Platform
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-primary-c sm:text-5xl lg:text-6xl dark:text-primary-c">
            Trade What You Know.
            <br />
            <span className="text-accent-c dark:text-accent-c">Learn What You Love.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-secondary-c dark:text-muted-c">
            Join thousands of learners teaching and learning from each other. No money involved,
            just a fair, community-driven exchange of knowledge.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={onExplore}
              className="flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-accent-c px-6 py-3.5 text-base font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-accent-hover-c sm:w-auto"
            >
              <Zap className="h-5 w-5" />
              Explore Swaps
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative hidden h-[460px] items-center justify-center lg:flex"
        >
          <SwapLogo />
        </motion.div>
      </div>
    </section>
  );
}

function SwapLogo() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
      className="flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="glass-panel-strong flex h-32 w-32 items-center justify-center rounded-[2rem] shadow-2xl"
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
          }}
        >
          <ArrowRightLeft className="h-10 w-10 text-white" strokeWidth={2.5} />
        </div>
      </motion.div>
      <p className="mt-6 text-2xl font-bold tracking-tight text-primary-c dark:text-primary-c">
        Skill<span className="text-accent-c dark:text-accent-c">Bridge</span>
      </p>
    </motion.div>
  );
}
