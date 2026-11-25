import { useState } from 'react'
import {
  Lock,
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Layers,
  RotateCcw,
  Play,
} from 'lucide-react'
import type { UserProfile } from '../lib/authService'
import { toUserFriendlyError } from '../lib/errorSanitizer'
import {
  evaluateEntitlement,
  start24HourFreeTrial,
  purchaseSubscription,
  isBasicRewardedFeature,
  SUBSCRIPTION_PLANS,
  type RewardedFeatureKey,
} from '../lib/subscriptionService'
import RewardedAdModal from './RewardedAdModal'

interface TerminalLockedScreenProps {
  userProfile: UserProfile | null
  featureKey?: RewardedFeatureKey
  featureTitle?: string
  allowRewardedAd?: boolean
  onViewPlans: () => void
  onSubscribeNow: () => void
  onOpenAuth?: () => void
  onTrialActivated?: () => void
}

export default function TerminalLockedScreen({
  userProfile,
  featureKey = 'basic_chart_view',
  featureTitle = 'Basic Chart View',
  allowRewardedAd,
  onViewPlans,
  onOpenAuth,
  onTrialActivated,
}: TerminalLockedScreenProps) {
  const [activatingTrial, setActivatingTrial] = useState(false)
  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const entitlement = evaluateEntitlement(userProfile)
  const hasUsedTrial = Boolean(
    userProfile?.trialUsed ||
      userProfile?.isTrial ||
      userProfile?.trialStart ||
      entitlement.status === 'trial_expired'
  )
  const isExpired = entitlement.isExpired || hasUsedTrial
  const canUnlockWithAd =
    allowRewardedAd !== undefined ? allowRewardedAd && isBasicRewardedFeature(featureKey) : isBasicRewardedFeature(featureKey)

  const handleStartTrial = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!userProfile) {
      onOpenAuth?.()
      return
    }

    try {
      setActivatingTrial(true)
      const res = await start24HourFreeTrial(userProfile)
      if (res.success) {
        setSuccessMsg(res.message)
        onTrialActivated?.()
      } else {
        setErrorMsg(toUserFriendlyError(res.message, 'Unable to activate 24-Hour Free Trial right now.'))
      }
    } catch (err: any) {
      setErrorMsg(toUserFriendlyError(err, 'Unable to activate 24-Hour Free Trial. Please check your connection.'))
    } finally {
      setActivatingTrial(false)
    }
  }

  const handleQuickSubscribe = async () => {
    if (!userProfile) {
      onOpenAuth?.()
      return
    }
    const defaultPlan = SUBSCRIPTION_PLANS[1] || SUBSCRIPTION_PLANS[0]
    try {
      const res = await purchaseSubscription(defaultPlan.id, userProfile)
      if (res.success) {
        setSuccessMsg(res.message)
        onTrialActivated?.()
      } else {
        onViewPlans()
      }
    } catch {
      onViewPlans()
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 bg-[#0B0E14] text-[#FFFFFF] font-sans fadein">
      <div className="w-full max-w-lg bg-[#131722] border border-[#1E222D] rounded-[12px] p-6 sm:p-7 relative overflow-hidden">
        {/* Lock / Premium Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center text-[#FFFFFF]">
              <Lock size={24} strokeWidth={2} />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-[6px] bg-[#FFFFFF] text-[#0B0E14]">
              <Crown size={12} strokeWidth={2.5} />
            </div>
          </div>

          {isExpired ? (
            <>
              <div className="text-[11px] font-semibold text-amber-400 mb-1 font-mono uppercase">
                {canUnlockWithAd
                  ? '24-Hour Trial Ended · Free (Ad-Supported) Tier'
                  : 'Ad-Free Pro Feature · Subscription Required'}
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#FFFFFF]">
                Unlock {featureTitle}
              </h1>
              <p className="text-xs text-[#787B86] mt-1 max-w-md">
                {canUnlockWithAd
                  ? 'Watch a short Rewarded Ad for temporary basic access, or upgrade to a 100% Ad-Free Pro Tier (Level 1, Level 2, or Level 3 Funded Elite).'
                  : 'This institutional Pro tool is strictly reserved for active 24-Hour Free Trial or paid 100% Ad-Free Pro Subscription members.'}
              </p>
            </>
          ) : (
            <>
              <div className="text-[11px] font-semibold text-[#089981] mb-1">
                Institutional Workspace
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#FFFFFF]">
                Activate 24-Hour Free Trial
              </h1>
              <p className="text-xs text-[#787B86] mt-1 max-w-md">
                Start your 24-Hour Free Trial to unlock all institutional ICT trading models, Funded Account Pass Manager, real-time charts, and AI Trading Agent.
              </p>
            </>
          )}
        </div>

        {/* Notification Feedback */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-[12px] bg-[#F23645]/10 border border-[#F23645]/30 text-[#F23645] text-xs flex items-center gap-2 break-words overflow-hidden">
            <AlertCircle size={15} className="shrink-0" />
            <span className="flex-1 min-w-0 break-words overflow-hidden">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 rounded-[12px] bg-[#089981]/10 border border-[#089981]/30 text-[#089981] text-xs flex items-center gap-2 break-words overflow-hidden">
            <CheckCircle2 size={15} className="shrink-0" />
            <span className="flex-1 min-w-0 break-words overflow-hidden">{successMsg}</span>
          </div>
        )}

        {/* Locked Institutional Features List */}
        <div className="mt-5 p-4 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] space-y-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[#787B86] font-semibold mb-1">
            Tiered Institutional Capabilities
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-[#D1D4DC]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#089981] shrink-0" />
              <span>1–4 Daily Validated A+ ICT Institutional Setups (Protected SL)</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#089981] shrink-0" />
              <span>Funded Account Pass Manager (Ment Funding, Blue Guardian, Goat Funded, FTMO)</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={14} className="text-[#089981] shrink-0" />
              <span>Historical Chart Replay, Win/Loss Report & AI Trading Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-[#089981] shrink-0" />
              <span>100% Ad-Free Execution Across Level 1, Level 2 & Level 3 Tiers</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col gap-2.5">
          {!hasUsedTrial && !isExpired && (
            <button
              type="button"
              onClick={handleStartTrial}
              disabled={activatingTrial}
              className="w-full py-3 px-4 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] text-xs font-bold smooth-ui flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Sparkles size={14} />
              <span>{activatingTrial ? 'Activating 24-Hour Trial...' : 'Start Your 24-Hour Free Trial'}</span>
            </button>
          )}

          {isExpired && (
            <>
              {canUnlockWithAd && (
                <button
                  type="button"
                  onClick={() => setShowRewardedAdModal(true)}
                  className="w-full py-3 px-4 rounded-[12px] bg-[#26A69A] hover:bg-[#1F8A7F] text-[#0B0E14] text-xs font-bold smooth-ui flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Unlock Basic Access via Rewarded Ad</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleQuickSubscribe}
                className="w-full py-3 px-4 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] text-xs font-bold smooth-ui flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Crown size={14} />
                <span>Upgrade to Ad-Free Pro</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onViewPlans}
            className="w-full py-3 px-4 rounded-[12px] bg-[#0B0E14] hover:bg-[#181C27] border border-[#1E222D] text-[#FFFFFF] text-xs font-semibold smooth-ui flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Compare Level 1 / Level 2 / Level 3 Ad-Free Tiers</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="mt-4 text-center text-[11px] text-[#787B86]">
          <span>Official Google Play Licensing · Cancel Auto-Pay Anytime</span>
          {hasUsedTrial && (
            <div className="text-[#787B86] mt-0.5">
              One account = one 24-hour free trial · Upgrade anytime for 100% Ad-Free Pro access
            </div>
          )}
        </div>
      </div>

      {canUnlockWithAd && (
        <RewardedAdModal
          isOpen={showRewardedAdModal}
          userProfile={userProfile}
          featureKey={featureKey}
          featureTitle={featureTitle}
          onUnlocked={() => {
            setShowRewardedAdModal(false)
            onTrialActivated?.()
          }}
          onUpgradeToAdFree={() => {
            setShowRewardedAdModal(false)
            onViewPlans()
          }}
          onClose={() => setShowRewardedAdModal(false)}
        />
      )}
    </div>
  )
}
