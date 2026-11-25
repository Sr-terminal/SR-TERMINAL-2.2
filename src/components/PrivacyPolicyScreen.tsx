import {
  Shield,
  ArrowLeft,
  ExternalLink,
  Mail,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Timer,
} from 'lucide-react'
import { APP_PACKAGE_NAME, GOOGLE_PLAY_SUBSCRIPTIONS_URL } from '../lib/subscriptionService'

interface PrivacyPolicyScreenProps {
  onBack?: () => void
  initialSection?: 'privacy' | 'terms'
}

export default function PrivacyPolicyScreen({ onBack, initialSection = 'privacy' }: PrivacyPolicyScreenProps) {
  return (
    <div className="min-h-full bg-[#0B0E14] text-[#FFFFFF] p-4 font-sans fadein max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E222D] pb-4 mb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-[8px] bg-[#131722] border border-[#1E222D] hover:border-[#2A2E39] text-[#FFFFFF] smooth-ui active:scale-98 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#26A69A]" />
              <h1 className="text-base md:text-lg font-bold tracking-tight">
                {initialSection === 'terms'
                  ? 'Terms of Use, 24-Hour Trial & RBI Subscription Policy'
                  : 'Privacy Policy, Data Security & RBI Subscription Terms'}
              </h1>
            </div>
            <p className="text-[11px] text-[#787B86] mt-0.5 font-mono">
              SR TERMINAL ({APP_PACKAGE_NAME}) · Google Play Billing & RBI e-Mandate Compliant
            </p>
          </div>
        </div>

        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-[11px] text-[#787B86] hover:text-[#FFFFFF] smooth-ui active:scale-98"
        >
          <span>Web View</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Top Guarantee Summary Card */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#26A69A]/40 mb-5 space-y-2.5 text-xs text-[#D1D4DC]">
        <div className="flex items-center gap-2 text-[#26A69A] font-semibold text-[11px] tracking-wider uppercase font-mono">
          <Lock size={14} />
          <span>Encrypted User Data Protection & Zero Data Sharing Guarantee</span>
        </div>
        <p className="leading-relaxed text-[#787B86]">
          SR TERMINAL (<span className="font-mono text-[#FFFFFF]">{APP_PACKAGE_NAME}</span>) protects all user accounts,
          funded account challenge profiles, chart drawings, and trade journals with end-to-end TLS 1.3 transport encryption
          and Cloud Firestore identity-isolated security rules. We strictly enforce{' '}
          <strong className="text-[#FFFFFF]">ZERO third-party data selling or sharing</strong>, and never access your
          contacts, SMS, call logs, camera, microphone, or GPS location.
        </p>
      </div>

      {/* 24-Hour Trial & Tiered Ad-Free Subscription Summary */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] mb-5 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 text-[#26A69A] font-bold text-[11px] tracking-wider uppercase font-mono">
          <Timer size={14} />
          <span>24-Hour Free Trial, Post-Trial Rewarded Ads & 100% Ad-Free Pro Tiers</span>
        </div>
        <p className="text-[#787B86] leading-relaxed">
          Every newly registered account receives a <strong className="text-[#FFFFFF]">24-Hour Free Trial</strong>{' '}
          (<span className="font-mono text-[#FFFFFF]">trialExpiresAt = createdAt + 24 hours</span>) with full Ad-Free
          institutional access. After 24 hours, accounts without a paid plan switch to the{' '}
          <strong className="text-[#FFFFFF]">Free (Ad-Supported)</strong> tier where premium actions can be unlocked via
          Rewarded Ads, or upgraded to our <strong className="text-[#26A69A]">100% Ad-Free Paid Tiers</strong> (Level 1
          Starter Pro, Level 2 Advanced Pro, or Level 3 Institutional Funded Elite).
        </p>
      </div>

      {/* RBI Auto-Pay & Non-Refundable Active Cycle Highlight */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] mb-5 space-y-3 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px] tracking-wider uppercase font-mono">
            <CreditCard size={14} />
            <span>RBI-Compliant Auto-Pay Cancellation & Non-Refundable Validity Policy</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#26A69A]/15 text-[#26A69A] border border-[#26A69A]/30 font-mono text-[10px] font-bold">
            GOOGLE PLAY VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center gap-1.5 text-[#26A69A] font-semibold text-[11px]">
              <CheckCircle2 size={13} />
              <span>1. Right to Cancel Auto-Pay Anytime</span>
            </div>
            <p className="text-[11px] text-[#787B86] leading-relaxed">
              In compliance with Reserve Bank of India (RBI) recurring e-Mandate / UPI Auto-Pay guidelines and Google Play
              Billing policy, you can cancel your recurring Auto-Pay mandate at any time from{' '}
              <strong className="text-[#FFFFFF]">Profile → Manage Subscription → Cancel Auto-Pay</strong> or directly in
              Google Play Subscriptions.
            </p>
          </div>

          <div className="p-3 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
              <FileCheck size={13} />
              <span>2. Full Pro Access Until Validity Ends</span>
            </div>
            <p className="text-[11px] text-[#787B86] leading-relaxed">
              Cancelling Auto-Pay immediately stops all future recurring billing charges. Once a billing cycle is charged,
              the active period is <strong className="text-[#FFFFFF]">non-refundable</strong>, and your paid{' '}
              <strong className="text-[#26A69A]">Pro subscription remains 100% active with full institutional access</strong>{' '}
              until your current <span className="font-mono text-[#FFFFFF]">subscriptionExpiry</span> date ends.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-4 text-[#D1D4DC] text-xs leading-relaxed">
        <section className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-1.5">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">01. Encrypted Data Protection & Cloud Architecture</h2>
          <p className="text-[#787B86]">
            All authentication records, hashed OTP tokens, funded account challenge settings (`funded_accounts/&#123;uid&#125;`),
            chart drawings (`users/&#123;uid&#125;/drawings`), and trade journals (`users/&#123;uid&#125;/journals`) are stored
            in Google Cloud Firestore with strict document-level ownership verification. Passwords and 6-digit email
            verification OTPs are cryptographically hashed with per-record salts and protected by a strict 3-attempt,
            5-minute anti-brute-force freeze.
          </p>
        </section>

        <section className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-1.5">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">02. Zero Data Sharing & Financial Privacy</h2>
          <p className="text-[#787B86]">
            We never sell, rent, trade, or disclose your email address, trade journal history, funded challenge parameters,
            or analytical setups to third-party marketers, brokers, or data brokers. All subscription payments are processed
            exclusively by Google Play Billing (<span className="font-mono text-[#FFFFFF]">{APP_PACKAGE_NAME}</span>); SR
            TERMINAL never collects or stores your credit/debit card numbers, UPI PINs, or bank credentials.
          </p>
        </section>

        <section className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-1.5">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">
            03. 24-Hour Free Trial, Tiered 100% Ad-Free Plans & RBI Auto-Pay Cancellation Policy
          </h2>
          <ul className="list-disc pl-4 space-y-1.5 text-[#787B86]">
            <li>
              <strong className="text-[#FFFFFF]">24-Hour Free Trial & Post-Trial Rewarded Ads:</strong> New accounts receive a
              one-time 24-Hour Free Trial validated on the server. Once the 24-hour trial expires, users on the Free tier can
              unlock premium tools temporarily via Rewarded Ads or upgrade to an Ad-Free Pro Tier.
            </li>
            <li>
              <strong className="text-[#FFFFFF]">Progressive 100% Ad-Free Tiers:</strong> Level 1 — Starter Pro (30 Days,
              Ad-Free, live charts, Red-Folder News, 1–2 daily setups), Level 2 — Advanced Pro (60 Days, Ad-Free, all 1–4
              daily A+ ICT signals, Chart Replay, Win/Loss Report, AI Trading Agent, 24/7 closed-app push notifications), and
              Level 3 — Institutional Funded Elite (365 Days, Ad-Free, full Funded Account Pass Manager for $5K–$200K prop
              challenges with 60% daily safety shield and auto recovery mode).
            </li>
            <li>
              <strong className="text-[#FFFFFF]">Cancel Auto-Pay Anytime:</strong> You may disable automatic renewal at any
              time with one tap inside the app or via Google Play Store. Upon cancellation, your status updates to{' '}
              <span className="font-mono text-[#FFFFFF]">autoPayEnabled: false</span> and{' '}
              <span className="font-mono text-[#FFFFFF]">cancelAtPeriodEnd: true</span>.
            </li>
            <li>
              <strong className="text-[#FFFFFF]">Non-Refundable Active Cycle with Full Validity Access:</strong> Because
              digital institutional analytics, live data feeds, and 24/7 cloud push engines are provisioned immediately
              upon purchase verification, active billing cycles are non-refundable. However, cancelling Auto-Pay never
              terminates your access early—you retain 100% Pro access until the exact minute your paid billing cycle
              expires.
            </li>
          </ul>
          <div className="pt-2">
            <a
              href={GOOGLE_PLAY_SUBSCRIPTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[11px] text-[#26A69A] hover:border-[#26A69A]/50 font-mono"
            >
              <span>Manage Mandate on Google Play Store</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </section>

        <section className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-1.5">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">04. 24/7 Closed-App Push Notifications (FCM)</h2>
          <p className="text-[#787B86]">
            When you grant notification permissions on Android, SR TERMINAL registers a device push token (`fcmTokens`)
            with Firebase Cloud Messaging to deliver high-priority trade lifecycle alerts (Safe Entry Confirmed, Move SL
            to Break-Even at +1R, TP1/TP2/TP3 Hit, Stop Loss Hit, and 15-Minute Red-Folder High-Impact News warnings)
            even when your screen is off or the app is closed. You can toggle individual alert types anytime under{' '}
            <strong className="text-[#FFFFFF]">More → Trade Notifications</strong>.
          </p>
        </section>

        <section className="p-4 rounded-[12px] bg-[#131722] border border-[#EF5350]/30 space-y-1.5">
          <div className="flex items-center gap-2 text-[#EF5350] font-semibold text-sm">
            <AlertTriangle size={15} />
            <h2>05. Educational & Prop-Firm Trading Risk Disclaimer</h2>
          </div>
          <p className="text-[#787B86]">
            SR TERMINAL is strictly a quantitative market analysis workspace, automated charting utility, prop-firm risk
            calculator, and educational decision-support platform based on Inner Circle Trader (ICT) price-action
            methodology. Nothing in this application constitutes financial, investment, brokerage, or trading advice.
            Foreign Exchange (Forex), Precious Metals (Gold/XAUUSD), Indices (NAS100/US30), Cryptocurrencies (BTCUSD), and
            Proprietary Trading Firm Challenges carry substantial risk of capital loss or challenge breach. Past win-rate
            performance or backtest simulations do not guarantee future profits. Users are solely responsible for their
            own trade execution and risk management decisions.
          </p>
        </section>

        <section className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-1.5">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">06. Account & Data Deletion Rights</h2>
          <p className="text-[#787B86]">
            You have the right to request permanent deletion of your SR TERMINAL account and all associated Cloud
            Firestore data (profile, funded account tracker, trade journals, chart drawings, and push tokens) at any time via{' '}
            <strong className="text-[#FFFFFF]">More → Account & Profile → Delete Account & Data</strong>.
          </p>
        </section>

        <section className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-2">
          <h2 className="text-sm font-semibold text-[#FFFFFF]">07. Grievance Officer & Contact Information</h2>
          <div className="p-3 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[11px] text-[#787B86] space-y-1 font-mono">
            <div>
              <strong className="text-[#FFFFFF]">Platform:</strong> SR TERMINAL ({APP_PACKAGE_NAME})
            </div>
            <div>
              <strong className="text-[#FFFFFF]">Data Controller & Support:</strong> Suraj Ray
            </div>
            <div className="flex items-center gap-1.5 text-[#26A69A]">
              <Mail size={13} />
              <span>surajrayxyz09@gmail.com</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
