import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield } from "lucide-react";

interface LegalPageProps {
  onBack: () => void;
}

const sectionCls = "mb-6";
const headingCls = "mb-2 text-lg font-bold tracking-tight text-primary-c dark:text-primary-c";
const bodyCls = "text-sm leading-relaxed text-secondary-c dark:text-faint-c";

const lastUpdated = "September 10, 2026";

export function TermsOfServicePage({ onBack }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-c transition-colors hover:text-primary-c dark:text-muted-c dark:hover:text-primary-c"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-accent-c backdrop-blur-md shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-c dark:text-primary-c">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-c dark:text-muted-c">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="rounded-[10px] border border-[var(--glass-border)] bg-white p-8 shadow-sm dark:border-[var(--glass-border)] dark:glass-panel">
          <div className={sectionCls}>
            <h2 className={headingCls}>1. Acceptance of Terms</h2>
            <p className={bodyCls}>
              By accessing or using SkillBridge ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to any part of the terms, you may not access the Service.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>2. Description of Service</h2>
            <p className={bodyCls}>
              SkillBridge is a skill-swapping platform that connects users who want to teach and learn skills
              from one another. The Service facilitates connections but does not guarantee the quality,
              safety, or outcome of any skill exchange between users.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>3. User Accounts</h2>
            <p className={bodyCls}>
              You must provide accurate and complete information when creating an account. You are responsible
              for maintaining the security of your account and password. SkillBridge cannot be liable for any
              loss or damage from your failure to comply with this obligation.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>4. User Conduct</h2>
            <p className={bodyCls}>
              You agree not to use the Service for any unlawful purpose or in any way that could harm,
              disable, or impair the Service. Prohibited conduct includes harassment, spam, impersonation,
              and sharing inappropriate or offensive content.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>5. Intellectual Property</h2>
            <p className={bodyCls}>
              All content you post on SkillBridge remains your property. By posting content, you grant
              SkillBridge a non-exclusive license to display it within the Service. You may not copy,
              distribute, or exploit any part of the Service without prior written consent.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>6. Termination</h2>
            <p className={bodyCls}>
              SkillBridge reserves the right to suspend or terminate your account at any time, for any reason,
              including violation of these Terms. Upon termination, your right to use the Service ceases
              immediately.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>7. Disclaimer of Warranties</h2>
            <p className={bodyCls}>
              The Service is provided "as is" and "as available" without warranties of any kind, whether
              express or implied. SkillBridge does not warrant that the Service will be uninterrupted,
              secure, or error-free.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>8. Limitation of Liability</h2>
            <p className={bodyCls}>
              To the fullest extent permitted by law, SkillBridge shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of or inability to use
              the Service.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>9. Changes to Terms</h2>
            <p className={bodyCls}>
              We may update these Terms from time to time. We will notify users of significant changes by
              posting the new Terms on this page. Continued use of the Service after changes constitutes
              acceptance of the updated Terms.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>10. Contact</h2>
            <p className={bodyCls}>
              If you have questions about these Terms, please contact us through the Contact Us link in the
              footer of this page.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function PrivacyPolicyPage({ onBack }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-c transition-colors hover:text-primary-c dark:text-muted-c dark:hover:text-primary-c"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-accent-c backdrop-blur-md shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-c dark:text-primary-c">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-c dark:text-muted-c">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="rounded-[10px] border border-[var(--glass-border)] bg-white p-8 shadow-sm dark:border-[var(--glass-border)] dark:glass-panel">
          <div className={sectionCls}>
            <h2 className={headingCls}>1. Information We Collect</h2>
            <p className={bodyCls}>
              When you create an account, we collect your name, email address, gender, and the skills you
              want to teach and learn. We also collect profile information you choose to provide, such as
              your location and bio.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>2. How We Use Your Information</h2>
            <p className={bodyCls}>
              We use your information to create and manage your account, match you with other users for skill
              swaps, display your profile to other users, and communicate with you about the Service. We do
              not sell your personal information to third parties.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>3. Profile Pictures</h2>
            <p className={bodyCls}>
              When you create an account, a profile picture is automatically generated based on your selected
              gender and a unique identifier tied to your account. You may replace this picture at any time
              from your profile settings.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>4. Data Storage</h2>
            <p className={bodyCls}>
              Your data is stored securely using Supabase infrastructure. Account information is protected by
              authentication and row-level security policies that ensure only you can access and modify your
              own profile data.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>5. Cookies and Tracking</h2>
            <p className={bodyCls}>
              We use essential cookies to maintain your login session. We do not use tracking cookies for
              advertising purposes.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>6. Data Sharing</h2>
            <p className={bodyCls}>
              Your profile information (name, avatar, skills, bio, and location) is visible to other users of
              the Service to facilitate skill matching. Your email address and password are never shared with
              other users.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>7. Data Retention</h2>
            <p className={bodyCls}>
              We retain your data for as long as your account is active. You may request deletion of your
              account and associated data at any time by contacting us.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>8. Your Rights</h2>
            <p className={bodyCls}>
              You have the right to access, correct, or delete your personal information. You can update your
              profile directly through the Service, or contact us for assistance.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>9. Children's Privacy</h2>
            <p className={bodyCls}>
              SkillBridge is not directed to children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected such data, please contact
              us so we can remove it.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>10. Changes to This Policy</h2>
            <p className={bodyCls}>
              We may update this Privacy Policy from time to time. We will notify users of significant changes
              by posting the new policy on this page. Continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </div>

          <div className={sectionCls}>
            <h2 className={headingCls}>11. Contact</h2>
            <p className={bodyCls}>
              If you have questions about this Privacy Policy, please contact us through the Contact Us link
              in the footer of this page.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
