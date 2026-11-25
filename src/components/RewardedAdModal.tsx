import { useEffect, useState } from 'react'
import { Play, Crown, CheckCircle2, Sparkles, X, Volume2, ShieldCheck, AlertCircle } from 'lucide-react'
import type { UserProfile } from '../lib/authService'
import {
  consumeRewardedAdUnlock,
  hasReachedDailyRewardedAdLimit,
  type RewardedFeatureKey,
} from '../lib/subscriptionService'

interface RewardedAdModalProps {
  isOpen: boolean
  userProfile?: UserProfile | null
  featureKey: RewardedFeatureKey
  featureTitle: string
  onUnlocked: () => void
  onUpgradeToAdFree: () => void
  onClose: () => void
}

const AD_DURATION_SECONDS = 8

export default function RewardedAdModal({
  isOpen,
  userProfile,
  featureKey,
  featureTitle,
  onUnlocked,
  onUpgradeToAdFree,
  onClose,
}: RewardedAdModalProps) {
  const [stage, setStage] = useState<'PROMPT' | 'PLAYING' | 'COMPLETED' | 'LIMIT_REACHED'>('PROMPT')
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS)
  const [verifyingUnlock, setVerifyingUnlock] = useState(false)
  const [limitErrorMsg, setLimitErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (hasReachedDailyRewardedAdLimit(userProfile)) {
      setStage('LIMIT_REACHED')
      setLimitErrorMsg('Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.')
    } else {
      setStage('PROMPT')
      setLimitErrorMsg(null)
    }
    setSecondsLeft(AD_DURATION_SECONDS)
  }, [isOpen, userProfile])

  useEffect(() => {
    if (!isOpen || stage !== 'PLAYING') return
    if (secondsLeft <= 0) {
      let active = true
      setVerifyingUnlock(true)
      consumeRewardedAdUnlock(featureKey, userProfile)
        .then((res) => {
          if (!active) return
          if (res.success) {
            setStage('COMPLETED')
          } else {
            setStage('LIMIT_REACHED')
            setLimitErrorMsg(
              res.message || 'Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.'
            )
          }
        })
        .catch(() => {
          if (!active) return
          setStage('LIMIT_REACHED')
          setLimitErrorMsg('Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.')
        })
        .finally(() => {
          if (active) setVerifyingUnlock(false)
        })
      return () => {
        active = false
      }
    }
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearTimeout(timer)
  }, [isOpen, stage, secondsLeft, featureKey, userProfile])

  if (!isOpen) return null

  const handleStartAd = () => {
    if (hasReachedDailyRewardedAdLimit(userProfile)) {
      setStage('LIMIT_REACHED')
      setLimitErrorMsg('Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.')
      return
    }
    setStage('PLAYING')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 fadein">
      <div className="w-full max-w-md rounded-[14px] bg-[#131722] border border-[#1E222D] p-5 text-[#FFFFFF] shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E222D] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-[10px] font-bold">
              FREE TIER · REWARDED AD
            </span>
            <span className="text-xs font-semibold text-[#D1D4DC]">Basic Feature Access</span>
          </div>
          {stage !== 'PLAYING' && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[#787B86] hover:text-[#FFFFFF] cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {stage === 'LIMIT_REACHED' && (
          <div className="space-y-4">
            <div className="p-4 rounded-[12px] bg-[#F23645]/10 border border-[#F23645]/30 flex items-start gap-3 break-words overflow-hidden">
              <AlertCircle size={18} className="text-[#F23645] shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <div className="text-xs font-bold text-[#FFFFFF]">Daily Free Unlock Limit Reached</div>
                <p className="text-xs text-[#F23645] leading-relaxed break-words overflow-hidden">
                  {limitErrorMsg ||
                    'Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onUpgradeToAdFree}
                className="w-full py-3 px-4 rounded-[10px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Crown size={14} />
                <span>Upgrade to Ad-Free Pro Plan</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] text-[#787B86] hover:text-[#FFFFFF] font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {stage === 'PROMPT' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#FFFFFF]">
                Unlock {featureTitle}
              </h3>
              <p className="text-xs text-[#787B86] leading-relaxed">
                Your 24-Hour Free Trial has ended. On the Free (Ad-Supported) tier, you can watch a short Rewarded Ad to unlock{' '}
                <strong className="text-[#FFFFFF]">{featureTitle}</strong>, or upgrade to a{' '}
                <strong className="text-[#26A69A]">100% Ad-Free Pro Plan</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-2 text-[11px] text-[#D1D4DC]">
              <div className="flex items-center gap-2">
                <Play size={13} className="text-[#26A69A] shrink-0" />
                <span>Watch 1 short Rewarded Video Ad → Unlock this basic tool</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown size={13} className="text-amber-400 shrink-0" />
                <span>Pro plans remove all ads and unlock Live A+ Signals, Funded Account Pass Manager & Replay</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleStartAd}
                className="w-full py-3 px-4 rounded-[10px] bg-[#26A69A] hover:bg-[#1F8A7F] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Play size={14} fill="currentColor" />
                <span>Unlock via Rewarded Ad (Watch {AD_DURATION_SECONDS}s Ad)</span>
              </button>

              <button
                type="button"
                onClick={onUpgradeToAdFree}
                className="w-full py-3 px-4 rounded-[10px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Crown size={14} />
                <span>Upgrade to 100% Ad-Free Pro</span>
              </button>
            </div>
          </div>
        )}

        {stage === 'PLAYING' && (
          <div className="space-y-4">
            <div className="relative rounded-[12px] bg-[#0B0E14] border border-[#26A69A]/40 p-5 text-center space-y-3 overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#787B86]">
                <span className="flex items-center gap-1 text-[#26A69A]">
                  <Volume2 size={12} /> SPONSORED INSTITUTIONAL BRIEF
                </span>
                <span className="px-2 py-0.5 rounded bg-[#131722] border border-[#1E222D] text-[#FFFFFF] font-bold">
                  {verifyingUnlock ? 'Verifying...' : `Reward in ${secondsLeft}s`}
                </span>
              </div>

              <div className="py-4 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#26A69A]/15 border border-[#26A69A]/40 flex items-center justify-center mx-auto text-[#26A69A]">
                  <Sparkles size={22} />
                </div>
                <div className="text-sm font-bold text-[#FFFFFF]">
                  SR Terminal — 100% Ad-Free Institutional Pro
                </div>
                <p className="text-xs text-[#787B86] max-w-xs mx-auto leading-relaxed">
                  Upgrade to Level 3 Funded Elite for Ment Funding, Blue Guardian & Goat Funded Trader Pass Manager, 60% Anti-Breach Shield, and 24/7 Closed-App Alerts.
                </p>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[#131722] overflow-hidden">
                <div
                  className="h-full bg-[#26A69A] transition-all duration-1000"
                  style={{
                    width: `${((AD_DURATION_SECONDS - secondsLeft) / AD_DURATION_SECONDS) * 100}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] text-center text-[#787B86]">
              Please keep this window open until the timer completes to claim your reward.
            </p>
          </div>
        )}

        {stage === 'COMPLETED' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#089981]/20 border border-[#089981]/50 flex items-center justify-center mx-auto text-[#26A69A]">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <div className="text-base font-bold text-[#FFFFFF]">Reward Granted!</div>
              <p className="text-xs text-[#787B86]">
                <strong className="text-[#FFFFFF]">{featureTitle}</strong> is now unlocked.
              </p>
            </div>
            <button
              type="button"
              onClick={onUnlocked}
              className="w-full py-3 px-4 rounded-[10px] bg-[#26A69A] hover:bg-[#1F8A7F] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShieldCheck size={15} />
              <span>Continue to {featureTitle}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
