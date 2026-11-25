import { useState, useEffect } from 'react'
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  CreditCard,
  XCircle,
  FileText,
  Lock,
  Timer,
  Play,
} from 'lucide-react'
import {
  SUBSCRIPTION_PLANS,
  APP_PACKAGE_NAME,
  GOOGLE_PLAY_STORE_URL,
  GOOGLE_PLAY_SUBSCRIPTIONS_URL,
  evaluateEntitlement,
  purchaseSubscription,
  start24HourFreeTrial,
  cancelRecurringAutoPay,
  type SubscriptionPlan,
} from '../lib/subscriptionService'
import type { UserProfile } from '../lib/authService'
import { toUserFriendlyError } from '../lib/errorSanitizer'
import PrivacyPolicyScreen from './PrivacyPolicyScreen'
import RewardedAdModal from './RewardedAdModal'

interface SubscriptionScreenProps {
  userProfile: UserProfile | null
  onOpenAuth: () => void
  onClose?: () => void
}

export default function SubscriptionScreen({ userProfile, onOpenAuth, onClose }: SubscriptionScreenProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('sr_terminal_2m')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [trialLoading, setTrialLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [agreedToRbiPolicy, setAgreedToRbiPolicy] = useState(true)
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false)
  const [showRewardedModal, setShowRewardedModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [nowTick, setNowTick] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const entitlement = evaluateEntitlement(userProfile, nowTick)
  const canStartTrial =
    userProfile &&
    !userProfile.trialUsed &&
    !userProfile.isTrial &&
    !userProfile.trialStart &&
    entitlement.status === 'none'

  if (showPrivacyPolicyModal) {
    return <PrivacyPolicyScreen onBack={() => setShowPrivacyPolicyModal(false)} />
  }

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setStatusMsg(null)

    if (!userProfile) {
      onOpenAuth()
      return
    }

    if (!agreedToRbiPolicy) {
      setStatusMsg({
        type: 'error',
        text: 'Please accept the Privacy Policy & RBI Auto-Pay Non-Refundable Validity terms before subscribing.',
      })
      return
    }

    setLoadingPlan(plan.id)
    try {
      const res = await purchaseSubscription(plan.id, userProfile)
      setStatusMsg({
        type: res.success ? 'success' : 'error',
        text: res.success ? res.message : toUserFriendlyError(res.message, 'Unable to complete purchase right now.'),
      })
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: toUserFriendlyError(err, 'Unable to complete purchase. Please try again.'),
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleStartTrial = async () => {
    setStatusMsg(null)
    if (!userProfile) {
      onOpenAuth()
      return
    }

    setTrialLoading(true)
    try {
      const res = await start24HourFreeTrial(userProfile)
      setStatusMsg({
        type: res.success ? 'success' : 'error',
        text: res.success ? res.message : toUserFriendlyError(res.message, 'Could not start 24-Hour Free Trial.'),
      })
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: toUserFriendlyError(err, 'Could not start 24-Hour Free Trial. Please try again.'),
      })
    } finally {
      setTrialLoading(false)
    }
  }

  const handleCancelAutoPay = async () => {
    if (!userProfile) return
    setStatusMsg(null)
    setCancelLoading(true)
    try {
      const res = await cancelRecurringAutoPay(userProfile)
      setStatusMsg({
        type: res.success ? 'success' : 'error',
        text: res.success ? res.message : toUserFriendlyError(res.message, 'Could not cancel Auto-Pay mandate.'),
      })
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: toUserFriendlyError(err, 'Could not cancel Auto-Pay mandate. Please try again.'),
      })
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-[#0B0E14] text-[#FFFFFF] p-4 font-sans fadein max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E222D] pb-4 mb-5">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-[10px] bg-[#131722] border border-[#1E222D] hover:border-[#2A2E39] text-[#FFFFFF] smooth-ui active:scale-98 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-[#FFFFFF]" />
              <h1 className="text-lg font-bold tracking-tight">Tiered 100% Ad-Free Pro & Manage Subscription</h1>
            </div>
            <p className="text-xs text-[#787B86] mt-0.5">
              24-Hour Free Trial · Level 1 Starter · Level 2 Advanced · Level 3 Funded Elite ({APP_PACKAGE_NAME})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPrivacyPolicyModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#131722] border border-[#1E222D] text-xs text-[#26A69A] hover:border-[#26A69A]/50 smooth-ui active:scale-98 cursor-pointer"
        >
          <FileText size={12} />
          <span>Privacy & RBI Policy</span>
        </button>
      </div>

      {/* Live 24-Hour Trial Countdown Banner */}
      {entitlement.isTrial && (
        <div className="p-4 rounded-[12px] bg-[#131722] border border-[#26A69A]/40 mb-5 flex flex-wrap items-center justify-between gap-3 tabular-nums">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#26A69A]/15 border border-[#26A69A]/40 flex items-center justify-center text-[#26A69A] shrink-0">
              <Timer size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#26A69A] font-bold">
                ACTIVE 24-HOUR FREE TRIAL · FULL LEVEL 3 ACCESS
              </div>
              <div className="text-xs text-[#D1D4DC] mt-0.5">
                Upgrade to any paid plan below to lock in permanent <strong className="text-[#FFFFFF]">100% Ad-Free</strong> access.
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-[8px] bg-[#0B0E14] border border-[#26A69A]/40 font-mono text-sm font-bold text-[#26A69A]">
            {entitlement.trialCountdownHhMmSs}
          </div>
        </div>
      )}

      {/* Post-Trial Free (Ad-Supported) Banner with Rewarded Ad Unlock Option */}
      {!entitlement.isActive && userProfile && (
        <div className="p-4 rounded-[12px] bg-[#131722] border border-amber-500/40 mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              FREE TIER (AD-SUPPORTED) · 24-HOUR TRIAL COMPLETED
            </div>
            <div className="text-xs text-[#D1D4DC]">
              Watch a short Rewarded Ad to unlock basic tools (Basic Chart View, Basic AI Agent, Basic News), or choose a <strong className="text-[#FFFFFF]">100% Ad-Free Pro Tier</strong> below for Live A+ Signals, Funded Account Pass Manager & Replay.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRewardedModal(true)}
            className="px-3.5 py-2 rounded-[8px] bg-[#26A69A] hover:bg-[#1F8A7F] text-[#0B0E14] font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-98 shrink-0"
          >
            <Play size={13} fill="currentColor" />
            <span>Unlock Basic View via Rewarded Ad</span>
          </button>
        </div>
      )}

      {/* Active Entitlement & RBI-Compliant Auto-Pay Management Banner */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] mb-5 space-y-3 tabular-nums">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787B86]">
              Current Account Entitlement & Tier Status
            </div>
            {userProfile ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-semibold border ${
                    entitlement.isActive
                      ? 'bg-[#089981]/10 text-[#089981] border-[#089981]/30'
                      : 'bg-[#0B0E14] text-[#787B86] border-[#1E222D]'
                  }`}
                >
                  {entitlement.isActive ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>
                        {entitlement.isTrial ? `ACTIVE: 24-Hour Free Trial (${entitlement.trialCountdownHhMmSs})` : `ACTIVE: ${entitlement.planName}`}
                      </span>
                    </>
                  ) : (
                    <span>FREE TIER (AD-SUPPORTED)</span>
                  )}
                </span>

                {entitlement.isActive && (
                  <span className="px-2 py-0.5 rounded bg-[#26A69A]/15 text-[#26A69A] border border-[#26A69A]/30 text-[10px] font-mono font-bold">
                    100% AD-FREE · LEVEL {entitlement.tierLevel}
                  </span>
                )}

                {entitlement.isActive && entitlement.expiryDateFormatted && (
                  <span className="text-xs text-[#787B86]">
                    Valid until {entitlement.expiryDateFormatted}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs text-[#787B86]">
                Sign in with your account to get your automatic 24-Hour Free Trial or activate an Ad-Free Pro Tier.
              </div>
            )}
          </div>

          {!userProfile && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-[10px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] font-semibold text-xs smooth-ui shrink-0 active:scale-98 cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* RBI-Compliant Auto-Pay Control Panel (Visible when user has an active Paid Pro subscription) */}
        {userProfile && entitlement.isPro && (
          <div className="pt-3 border-t border-[#1E222D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CreditCard size={14} className={entitlement.cancelAtPeriodEnd ? 'text-amber-400' : 'text-[#26A69A]'} />
                <span>
                  RBI Auto-Pay Renewal Status:{' '}
                  {entitlement.cancelAtPeriodEnd ? (
                    <strong className="text-amber-400">AUTO-PAY CANCELLED (NO FUTURE CHARGE)</strong>
                  ) : (
                    <strong className="text-[#26A69A]">ACTIVE RECURRING MANDATE</strong>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-[#787B86] leading-relaxed">
                {entitlement.cancelAtPeriodEnd ? (
                  <>
                    Recurring Auto-Pay is disabled (<span className="font-mono text-[#FFFFFF]">autoPayEnabled: false</span>,{' '}
                    <span className="font-mono text-[#FFFFFF]">cancelAtPeriodEnd: true</span>). Your current paid Pro
                    subscription remains <strong className="text-[#26A69A]">100% active and non-refundable</strong> until{' '}
                    <strong className="text-[#FFFFFF]">{entitlement.expiryDateFormatted}</strong>.
                  </>
                ) : (
                  <>
                    Per RBI e-Mandate rules, you can cancel Auto-Pay anytime. Cancelling stops future recurring charges
                    while keeping your current paid Pro cycle 100% active until{' '}
                    <strong className="text-[#FFFFFF]">{entitlement.expiryDateFormatted}</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {!entitlement.cancelAtPeriodEnd && (
                <button
                  type="button"
                  onClick={handleCancelAutoPay}
                  disabled={cancelLoading}
                  className="px-3 py-2 rounded-[8px] bg-[#EF5350]/15 hover:bg-[#EF5350]/25 border border-[#EF5350]/40 text-[#EF5350] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <XCircle size={13} />
                  <span>{cancelLoading ? 'Cancelling Auto-Pay...' : 'Cancel Auto-Pay / Manage Renewal'}</span>
                </button>
              )}
              <a
                href={GOOGLE_PLAY_SUBSCRIPTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] hover:border-[#2A2E39] text-[#D1D4DC] text-[11px] font-mono flex items-center gap-1.5"
              >
                <span>Google Play Subscriptions</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-[12px] border mb-5 flex items-start gap-2.5 text-xs break-words overflow-hidden ${
            statusMsg.type === 'success'
              ? 'bg-[#089981]/10 border-[#089981]/30 text-[#089981]'
              : 'bg-[#F23645]/10 border-[#F23645]/30 text-[#F23645]'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
          )}
          <span className="flex-1 min-w-0 break-words overflow-hidden">{statusMsg.text}</span>
        </div>
      )}

      {/* One-Time 24-Hour Free Trial Banner (If not yet activated) */}
      {canStartTrial && (
        <div className="p-5 rounded-[12px] bg-[#131722] border border-[#1E222D] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#089981]">
              <Sparkles size={13} />
              <span>NEW TRADER ENTITLEMENT</span>
            </div>
            <h2 className="text-base font-bold text-[#FFFFFF]">
              Activate Your 24-Hour Free Trial
            </h2>
            <p className="text-xs text-[#787B86]">
              Experience 24 hours of 100% Ad-Free Level 3 Institutional Funded Elite access with live zero-gap charts,
              1–4 daily A+ ICT signals, AI Agent, and Prop Firm Pass Manager.
            </p>
          </div>
          <button
            onClick={handleStartTrial}
            disabled={trialLoading}
            className="px-5 py-3 rounded-[10px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] font-semibold text-xs smooth-ui shrink-0 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {trialLoading ? 'Activating Trial...' : 'Start 24-Hour Free Trial'}
          </button>
        </div>
      )}

      {/* Pre-Subscribe Mandatory RBI Policy & Privacy Checkbox */}
      <div className="p-3.5 rounded-[12px] bg-[#131722] border border-[#1E222D] mb-5 flex items-start gap-3">
        <input
          id="rbi-policy-checkbox"
          type="checkbox"
          checked={agreedToRbiPolicy}
          onChange={(e) => setAgreedToRbiPolicy(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#26A69A] rounded cursor-pointer shrink-0"
        />
        <label htmlFor="rbi-policy-checkbox" className="text-[11.5px] text-[#D1D4DC] leading-relaxed cursor-pointer">
          I agree to the{' '}
          <button
            type="button"
            onClick={() => setShowPrivacyPolicyModal(true)}
            className="text-[#26A69A] underline font-semibold cursor-pointer"
          >
            Privacy Policy, Data Security & RBI Subscription Policy
          </button>
          : All paid tiers are <strong className="text-[#FFFFFF]">100% Ad-Free</strong>. I can cancel Auto-Pay anytime to
          stop future recurring charges; once a billing cycle is charged, it is{' '}
          <strong className="text-[#FFFFFF]">non-refundable</strong> and my paid Pro access remains{' '}
          <strong className="text-[#26A69A]">100% active until my subscriptionExpiry date ends</strong>.
        </label>
      </div>

      {/* 3 Progressive Ad-Free Subscription Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 tabular-nums">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id
          const isCurrentPlan =
            entitlement.isActive && !entitlement.isTrial && userProfile?.subscriptionPlan === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative rounded-[12px] p-5 border smooth-ui cursor-pointer flex flex-col justify-between ${
                plan.tierLevel === 3
                  ? 'bg-[#131722] border-[#26A69A]/70'
                  : plan.popular
                  ? 'bg-[#131722] border-[#FFFFFF]'
                  : isSelected
                  ? 'bg-[#131722] border-[#2A2E39]'
                  : 'bg-[#131722] border-[#1E222D] hover:border-[#2A2E39]'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold tracking-wider uppercase ${
                    plan.tierLevel === 3
                      ? 'bg-[#26A69A] text-[#0B0E14]'
                      : 'bg-[#FFFFFF] text-[#0B0E14]'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#26A69A]">
                  {plan.levelBadge}
                </div>
                <h3 className="text-base font-bold text-[#FFFFFF] mt-1">{plan.name}</h3>
                <div className="text-[10px] font-mono text-[#787B86] mt-0.5">
                  {plan.durationLabel} · {plan.adFreeLabel}
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#FFFFFF]">
                    {plan.priceDisplay}
                  </span>
                  {plan.originalPriceDisplay && (
                    <span className="text-xs text-[#787B86] line-through">
                      {plan.originalPriceDisplay}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#1E222D] space-y-2">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#D1D4DC]">
                      <CheckCircle2 size={13} className="text-[#089981] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={loadingPlan === plan.id || isCurrentPlan}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubscribe(plan)
                }}
                className={`mt-5 w-full py-2.5 px-4 rounded-[10px] font-semibold text-xs smooth-ui cursor-pointer active:scale-98 ${
                  isCurrentPlan
                    ? 'bg-[#089981]/20 text-[#089981] border border-[#089981]/30 cursor-default'
                    : plan.tierLevel === 3
                    ? 'bg-[#26A69A] hover:bg-[#1F8A7F] text-[#0B0E14]'
                    : plan.popular
                    ? 'bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14]'
                    : 'bg-[#0B0E14] hover:bg-[#191E2B] text-[#FFFFFF] border border-[#1E222D]'
                }`}
              >
                {isCurrentPlan
                  ? 'Current Active Tier'
                  : loadingPlan === plan.id
                  ? 'Verifying Google Play...'
                  : `Subscribe — ${plan.priceDisplay}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Google Play Billing & Security Notice */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-2 text-xs text-[#787B86]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[#FFFFFF] font-semibold">
            <ShieldCheck size={15} className="text-[#089981]" />
            <span>Google Play Billing, Encrypted Data Security & RBI Auto-Pay</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPrivacyPolicyModal(true)}
            className="inline-flex items-center gap-1 text-[11px] text-[#26A69A] hover:underline font-mono cursor-pointer"
          >
            <Lock size={11} />
            <span>Read Full Privacy & RBI Policy →</span>
          </button>
        </div>
        <p className="leading-relaxed">
          All subscriptions are processed via Google Play Billing (<span className="text-[#D1D4DC] font-mono">{APP_PACKAGE_NAME}</span>)
          with server-side purchase token verification. Every paid tier is 100% Ad-Free. You can cancel Auto-Pay anytime
          under <strong className="text-[#FFFFFF]">Manage Subscription → Cancel Auto-Pay</strong> or via{' '}
          <a href={GOOGLE_PLAY_STORE_URL} target="_blank" rel="noreferrer" className="text-[#26A69A] underline">
            Google Play Store
          </a>
          .
        </p>
      </div>

      <RewardedAdModal
        isOpen={showRewardedModal}
        userProfile={userProfile}
        featureKey="basic_chart_view"
        featureTitle="Basic Chart View"
        onUnlocked={() => {
          setShowRewardedModal(false)
          onClose?.()
        }}
        onUpgradeToAdFree={() => setShowRewardedModal(false)}
        onClose={() => setShowRewardedModal(false)}
      />
    </div>
  )
}
