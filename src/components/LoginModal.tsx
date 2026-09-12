import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cloud, LogIn, UserPlus, Loader2, Eye, EyeOff, ChevronDown } from "lucide-react";
import { GlassTabSlider } from "@/components/GlassTabSlider";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (
    name: string,
    email: string,
    password: string,
    teachSkill: string,
    learnSkill: string,
    gender: string
  ) => Promise<{ success: boolean; error?: string }>;
  onNavigateTerms: () => void;
  onNavigatePrivacy: () => void;
}

type Tab = "login" | "signup";

export function LoginModal({ isOpen, onClose, onLogIn, onSignUp, onNavigateTerms, onNavigatePrivacy }: LoginModalProps) {
  const [tab, setTab] = useState<Tab>("signup");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    teachSkill: "",
    learnSkill: "",
    gender: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const reset = () => {
    setError("");
    setLoading(false);
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setLoginForm({ email: "", password: "" });
    setSignupForm({ name: "", email: "", password: "", teachSkill: "", learnSkill: "", gender: "" });
    setAgreedToTerms(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const result = await onLogIn(loginForm.email, loginForm.password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed. Please try again.");
      return;
    }
    reset();
    onClose();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!signupForm.teachSkill || !signupForm.learnSkill) {
      setError("Please enter at least one skill to teach and one to learn.");
      return;
    }
    if (!signupForm.gender) {
      setError("Please select your gender.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    const result = await onSignUp(
      signupForm.name,
      signupForm.email,
      signupForm.password,
      signupForm.teachSkill,
      signupForm.learnSkill,
      signupForm.gender
    );
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Sign-up failed. Please try again.");
      return;
    }
    reset();
    onClose();
  };

  const inputCls =
    "glass-input w-full rounded-2xl px-4 py-2.5 text-sm text-primary-c placeholder:text-muted-c outline-none transition-colors focus-accent dark:text-primary-c dark:placeholder:text-muted-c";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-md dark:bg-black/40" />
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-panel-strong relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-muted-c transition-colors hover:text-primary-c dark:hover:text-primary-c"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-accent-c backdrop-blur-md shadow-lg">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-primary-c dark:text-primary-c">
                Welcome to SkillBridge
              </h2>
              <p className="mt-1.5 text-sm text-muted-c dark:text-muted-c">
                Sign in to swap skills with the community.
              </p>
            </div>

            <div className="mb-6">
              <GlassTabSlider
                tabs={[
                  { value: "login" as Tab, label: "Log In" },
                  { value: "signup" as Tab, label: "Sign Up" },
                ]}
                activeTab={tab}
                onTabChange={(t) => {
                  setTab(t);
                  setError("");
                }}
              />
            </div>

            {error && (
              <div className="glass-tag mb-4 rounded-2xl border-danger-soft-c bg-danger-soft-c px-4 py-2.5 text-sm font-medium text-danger-text-c backdrop-blur-md dark:border-danger-soft-c dark:bg-danger-soft-c dark:text-danger-c">
                {error}
              </div>
            )}

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className={inputCls}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className={`${inputCls} pr-11`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-c transition-colors hover:text-primary-c dark:text-muted-c dark:hover:text-primary-c"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-c px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-accent-hover-c disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Log In
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Full Name</label>
                  <input
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    placeholder="e.g. Alex Doe"
                    className={inputCls}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Email</label>
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className={inputCls}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className={`${inputCls} pr-11`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-c transition-colors hover:text-primary-c dark:text-muted-c dark:hover:text-primary-c"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Skill to Teach</label>
                    <input
                      value={signupForm.teachSkill}
                      onChange={(e) => setSignupForm({ ...signupForm, teachSkill: e.target.value })}
                      placeholder="e.g. Python"
                      className={inputCls}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Skill to Learn</label>
                    <input
                      value={signupForm.learnSkill}
                      onChange={(e) => setSignupForm({ ...signupForm, learnSkill: e.target.value })}
                      placeholder="e.g. Guitar"
                      className={inputCls}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-c dark:text-faint-c">Gender</label>
                  <div className="relative">
                    <select
                      value={signupForm.gender}
                      onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}
                      className={`${inputCls} appearance-none pr-10 [&>option]:text-black`}
                      disabled={loading}
                    >
                      <option value="" className="text-black">Select gender...</option>
                      <option value="male" className="text-black">Male</option>
                      <option value="female" className="text-black">Female</option>
                      <option value="other" className="text-black">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-c" />
                  </div>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-secondary-c dark:text-faint-c">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-accent-c"
                  />
                  <span>
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={onNavigateTerms}
                      className="font-semibold text-accent-c underline-offset-2 hover:underline"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={onNavigatePrivacy}
                      className="font-semibold text-accent-c underline-offset-2 hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-c px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-accent-hover-c disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-xs text-muted-c dark:text-muted-c">
              Join a community of learners. No subscriptions, no payments. Use "Sign Up" to create your account.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
