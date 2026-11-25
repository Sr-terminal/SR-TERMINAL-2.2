import { useState } from 'react'
import {
  X,
  AlertCircle,
  LogOut,
  Shield,
  Trash2,
  RefreshCw,
  Crown,
  ExternalLink,
  Ban,
} from 'lucide-react'
import {
  signInWithGoogle,
  signOutUser,
  requestAccountDeletion,
  getFriendlyAuthErrorMessage,
  type UserProfile,
} from '../lib/authService'
import { toUserFriendlyError } from '../lib/errorSanitizer'
import {
  evaluateEntitlement,
  cancelSubscriptionAutoPay,
  GOOGLE_PLAY_SUBSCRIPTIONS_URL,
} from '../lib/subscriptionService'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile | null
  onOpenSubscription?: () => void
  onSignOut?: () => void
}

export default function AuthModal({
  isOpen,
  onClose,
  userProfile,
  onOpenSubscription,
  onSignOut,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [cancellingAutoPay, setCancellingAutoPay] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  if (!isOpen) return null

  const entitlement = evaluateEntitlement(userProfile)

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      setSuccessMsg('Signed in successfully!')
      setTimeout(() => {
        setSuccessMsg(null)
      }, 2000)
    } catch (err: any) {
      console.warn('[SR-AuthModal] Sign-In caught:', err)
      setError(getFriendlyAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAutoPay = async () => {
    if (!userProfile) return
    setError(null)
    setSuccessMsg(null)
    setCancellingAutoPay(true)
    try {
      const res = await cancelSubscriptionAutoPay(userProfile)
      setSuccessMsg(res.message)
    } catch (err: any) {
      setError(toUserFriendlyError(err, 'Unable to update Auto-Pay mandate right now. Please try again.'))
    } finally {
      setCancellingAutoPay(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setSuccessMsg('Signed out safely.')
      onSignOut?.()
      setTimeout(() => {
        setSuccessMsg(null)
        onClose()
      }, 400)
    } catch (err: any) {
      setError(toUserFriendlyError(err, 'Something went wrong while signing out.'))
    }
  }

  const handleDeleteAccount = async () => {
    if (!userProfile) return
    setDeleting(true)
    setError(null)
    try {
      await requestAccountDeletion(userProfile.uid, deleteReason)
      await signOutUser()
      onSignOut?.()
      setShowDeleteConfirm(false)
      setSuccessMsg('Account deletion request registered.')
      setTimeout(() => {
        setSuccessMsg(null)
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(toUserFriendlyError(err, 'Unable to submit account deletion request right now.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 fadein select-none"
      onClick={onClose}
    >
      <div
        id="auth-modal-container"
        className="card w-full max-w-sm p-5 border-[#1E222D] bg-[#131722] rounded-[12px] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#787B86] hover:text-[#FFFFFF] p-1 rounded-[8px] cursor-pointer smooth-ui active:scale-98"
        >
          <X size={18} />
        </button>

        {/* Title with SR Logo */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] p-0.5 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/sr-logo.png"
              alt="SR"
              className="w-full h-full object-contain rounded-[6px]"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                if (target.parentElement) {
                  target.parentElement.innerHTML =
                    '<span class="font-mono font-bold text-[10px] text-white">SR</span>'
                }
              }}
            />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-[#FFFFFF]">
              {userProfile ? 'Trader Account & Subscription' : 'SR Terminal Auth'}
            </h2>
            <p className="text-[11px] text-[#787B86]">
              {userProfile ? userProfile.email ?? 'Active Session' : 'Google Authentication'}
            </p>
          </div>
        </div>

        {/* Notification banners */}
        {error && (
          <div className="mb-3 p-2.5 rounded-[12px] bg-[#EF5350]/10 border border-[#EF5350]/30 text-[#EF5350] text-[11px] flex items-start gap-2 break-words overflow-hidden">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#EF5350]" />
            <span className="flex-1 min-w-0 break-words overflow-hidden">{toUserFriendlyError(error)}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-[12px] bg-[#26A69A]/10 border border-[#26A69A]/30 text-[#26A69A] text-[11px] flex items-start gap-2 break-words overflow-hidden">
            <Shield size={14} className="shrink-0 mt-0.5 text-[#26A69A]" />
            <span className="flex-1 min-w-0 break-words overflow-hidden">{successMsg}</span>
          </div>
        )}

        {/* LOGGED IN USER PROFILE */}
        {userProfile ? (
          <div className="space-y-3">
            <div className="p-3 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] flex items-center gap-3">
              {userProfile.photoUrl ? (
                <img
                  src={userProfile.photoUrl}
                  alt={userProfile.name || 'User'}
                  className="w-10 h-10 rounded-full border border-[#1E222D] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#131722] border border-[#1E222D] flex items-center justify-center text-xs font-bold text-[#FFFFFF]">
                  {(userProfile.name || userProfile.email || 'TR')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#FFFFFF] truncate">
                  {userProfile.name || 'SR Trader'}
                </div>
                <div className="text-[11px] text-[#787B86] truncate">
                  {userProfile.email || 'Verified User'}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#26A69A] font-semibold">
                  <span>Verified Trader · Cloud Synced</span>
                </div>
              </div>
            </div>

            {/* Subscription & RBI Auto-Pay Management Card */}
            <div className="p-3 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] tabular-nums space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787B86] flex items-center gap-1.5">
                  <Crown size={12} className="text-[#26A69A]" />
                  <span>Subscription</span>
                </span>
                <span className={`font-bold font-mono text-[11px] ${entitlement.isActive ? 'text-[#26A69A]' : 'text-[#787B86]'}`}>
                  {entitlement.isTrial ? '7-DAY TRIAL' : entitlement.isActive ? `PRO (${entitlement.planName})` : 'FREE TIER'}
                </span>
              </div>

              <div className="text-[11px] text-[#787B86] leading-relaxed">
                {entitlement.isActive ? (
                  <>
                    <div>
                      <strong className="text-[#FFFFFF]">{entitlement.daysRemaining} days</strong> remaining
                      {entitlement.expiryDate
                        ? ` (Valid until ${new Date(entitlement.expiryDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })})`
                        : ''}
                    </div>
                    <div className="mt-1 font-mono text-[10px]">
                      Auto-Pay Mandate:{' '}
                      <span className={entitlement.cancelAtPeriodEnd ? 'text-amber-400 font-bold' : 'text-[#26A69A] font-bold'}>
                        {entitlement.cancelAtPeriodEnd ? 'CANCELLED (Active Until Expiry)' : 'ACTIVE'}
                      </span>
                    </div>
                  </>
                ) : (
                  'Start 7-day free trial or subscribe via Google Play for full ICT access'
                )}
              </div>

              {onOpenSubscription && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenSubscription()
                  }}
                  className="w-full py-2 rounded-[8px] bg-[#131722] hover:bg-[#181C27] border border-[#1E222D] text-[11px] font-semibold text-[#FFFFFF] smooth-ui active:scale-98 cursor-pointer"
                >
                  Manage Subscription & Plans
                </button>
              )}

              {/* RBI-Compliant Auto-Pay Cancel & Google Play Renewal Control */}
              {entitlement.isActive && (
                <div className="pt-2 border-t border-[#1E222D] space-y-1.5">
                  {!entitlement.cancelAtPeriodEnd ? (
                    <button
                      type="button"
                      disabled={cancellingAutoPay}
                      onClick={handleCancelAutoPay}
                      className="w-full py-2 px-3 rounded-[8px] bg-[#EF5350]/15 hover:bg-[#EF5350]/25 border border-[#EF5350]/40 text-[#EF5350] text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Ban size={12} />
                      <span>{cancellingAutoPay ? 'Cancelling Auto-Pay...' : 'Cancel Auto-Pay / Manage Renewal'}</span>
                    </button>
                  ) : (
                    <div className="p-2 rounded-[8px] bg-[#131722] border border-amber-500/30 text-[10px] text-amber-300 font-mono text-center">
                      ✓ Auto-Pay Cancelled · Current Pro Access Active Until Expiry
                    </div>
                  )}

                  <a
                    href={GOOGLE_PLAY_SUBSCRIPTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-3 rounded-[8px] bg-[#131722] hover:bg-[#181C27] border border-[#1E222D] text-[#787B86] hover:text-[#FFFFFF] text-[10px] font-mono flex items-center justify-center gap-1.5"
                  >
                    <span>Open Google Play Subscriptions</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            {/* Sign out button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-[12px] bg-[#0B0E14] hover:bg-[#181C27] border border-[#1E222D] text-[#787B86] hover:text-[#FFFFFF] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer smooth-ui active:scale-98"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>

            {/* Delete Account disclosure */}
            <div className="pt-2 border-t border-[#1E222D] text-center">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-[11px] text-[#787B86] hover:text-[#EF5350] smooth-ui active:scale-98 cursor-pointer"
                >
                  Delete Account & Data
                </button>
              ) : (
                <div className="p-2.5 rounded-[12px] bg-[#EF5350]/10 border border-[#EF5350]/30 text-left space-y-2">
                  <div className="text-[10px] text-[#EF5350] font-bold flex items-center gap-1">
                    <Trash2 size={11} />
                    <span>Permanent Account Deletion</span>
                  </div>
                  <input
                    type="text"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Reason (optional)..."
                    className="w-full px-2.5 py-1.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[11px] text-[#FFFFFF]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={handleDeleteAccount}
                      className="flex-1 py-1.5 rounded-[8px] bg-[#EF5350] text-[#FFFFFF] text-[11px] font-semibold cursor-pointer smooth-ui active:scale-98"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-[#787B86] hover:text-[#FFFFFF] text-[11px] cursor-pointer smooth-ui active:scale-98"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            <div className="text-center py-2">
              <p className="text-xs text-[#787B86] leading-relaxed font-sans">
                Sign in with your Google Account to synchronize your setups, journal notes, and Pro subscriptions.
              </p>
            </div>

            <button
              id="modal-btn-google-signin"
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] smooth-ui active:scale-98 text-[#0B0E14] font-semibold text-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 select-none"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-[#0B0E14]" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.15C3.25 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.27C.46 8.2 0 10.05 0 12s.46 3.8 1.27 5.41l4.01-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.27 6.59l4.01 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                    />
                  </svg>
                  <span className="text-xs font-semibold tracking-wider">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            <div className="pt-3 border-t border-[#1E222D] text-center">
              <span className="text-[11px] text-[#787B86]">
                Instant cloud synchronization across devices
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
