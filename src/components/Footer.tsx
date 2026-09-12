import { useState } from "react";
import { Mail, X } from "lucide-react";
import type { Page } from "@/types";

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, email, message } = contactForm;
    window.location.href =
      "mailto:stratustal.co@gmail.com?subject=Inquiry from SkillBridge&body=" +
      encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    setContactOpen(false);
  };

  return (
    <footer className="glass-panel relative border-t border-[var(--glass-border)] rounded-none">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-6 py-4 sm:justify-between">
        <p className="text-sm text-muted-c dark:text-muted-c">
          © 2026 SkillBridge. Built for learners, by learners.
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-c dark:text-muted-c">
          <button
            type="button"
            onClick={() => onNavigate("terms")}
            className="transition-colors hover:text-accent-c dark:hover:text-accent-c"
          >
            Terms of Service
          </button>
          <span className="text-muted-c/40">|</span>
          <button
            type="button"
            onClick={() => onNavigate("privacy")}
            className="transition-colors hover:text-accent-c dark:hover:text-accent-c"
          >
            Privacy Policy
          </button>
        </div>

        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-semibold text-secondary-c backdrop-blur-md transition hover:border-accent-c hover:text-accent-c dark:text-muted-c dark:hover:text-accent-c"
        >
          <Mail className="h-3.5 w-3.5 text-accent-c" />
          Contact Us
        </button>

        <div className="flex items-center gap-1.5 text-sm text-muted-c dark:text-muted-c">
          <span className="flex h-2 w-2 rounded-full bg-success-c" />
          All systems operational
        </div>
      </div>

      {contactOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-black/50 p-6 text-white shadow-2xl backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Contact Us</h2>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="text-white/60 transition hover:text-white"
                aria-label="Close contact form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input
                required
                value={contactForm.name}
                onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })}
                placeholder="Name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-orange-500/50"
              />
              <input
                required
                type="email"
                value={contactForm.email}
                onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-orange-500/50"
              />
              <textarea
                required
                value={contactForm.message}
                onChange={(event) => setContactForm({ ...contactForm, message: event.target.value })}
                placeholder="Message"
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-orange-500/50"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
