import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import {
  AlertCircle,
  RefreshCw,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Timer,
} from 'lucide-react'
import {
  signInWithGoogle,
  requestForgotPasswordLink,
  isAndroidNativeApp,
  checkBruteForceLockout,
  type UserProfile,
} from '../lib/authService'
import {
  sendEmailOtp,
  verifyEmailOtp,
  checkIfUserExists,
  completeEmailOtpLogin,
  getRemainingOtpCooldown,
} from '../lib/emailOtpService'
import { toUserFriendlyError } from '../lib/errorSanitizer'
import PrivacyPolicyScreen from './PrivacyPolicyScreen'

interface AuthScreenProps {
  onSuccess: (profile: UserProfile) => void
  onOpenPrivacyPolicy?: () => void
}

type AuthStep = 'email' | 'otp' | 'create_account' | 'login' | 'forgot_password'

function formatCountdownMmSs(remainingSeconds: number): string {
  const safe = Math.max(0, remainingSeconds)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [step, setStep] = useState<AuthStep>('email')
  const [previousStep, setPreviousStep] = useState<'email' | 'login'>('email')

  // Form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Mandatory Privacy Policy & Terms of Use Checkbox (unchecked by default)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [policyReaderSection, setPolicyReaderSection] = useState<'privacy' | 'terms' | null>(null)

  // Status & notifications
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [forgotCooldown, setForgotCooldown] = useState(0)

  // Strict 3-Attempt 5-Minute Freeze State
  const [lockedUntil, setLockedUntil] = useState<number>(0)
  const [freezeRemainingSec, setFreezeRemainingSec] = useState<number>(0)

  // 6-digit OTP manual input state (ZERO auto-fill / ZERO on-screen code exposure)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Verified session cache from server
  const verifiedSessionRef = useRef<{
    sessionToken?: string
    profile?: UserProfile
    isAdmin?: boolean
    accountExists?: boolean
  } | null>(null)

  const isFrozen = lockedUntil > Date.now() && freezeRemainingSec > 0

  // Check existing lockout status on mount and when email changes
  useEffect(() => {
    let active = true
    const checkInitialLock = async () => {
      const status = await checkBruteForceLockout(email.trim().toLowerCase())
      if (!active) return
      if (status.locked && status.lockedUntil > Date.now()) {
        setLockedUntil(status.lockedUntil)
        setFreezeRemainingSec(Math.ceil((status.lockedUntil - Date.now()) / 1000))
      }
    }
    void checkInitialLock()
    return () => {
      active = false
    }
  }, [step])

  // Live 1-second countdown timer for 5-minute Brute-Force Freeze
  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) {
      setFreezeRemainingSec(0)
      return
    }
    const updateTimer = () => {
      const rem = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (rem <= 0) {
        setLockedUntil(0)
        setFreezeRemainingSec(0)
        setError(null)
      } else {
        setFreezeRemainingSec(rem)
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  // Resend cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  // Forgot password cooldown timer
  useEffect(() => {
    if (forgotCooldown <= 0) return
    const interval = setInterval(() => {
      setForgotCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [forgotCooldown])

  // Focus the first digit input when transitioning to OTP verification step
  useEffect(() => {
    if (step === 'otp') {
      const timer = setTimeout(() => {
        otpInputsRef.current[0]?.focus()
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [step])

  const applyLockoutFromError = (err: any) => {
    if (err?.locked && err?.lockedUntil) {
      setLockedUntil(Number(err.lockedUntil))
      setFreezeRemainingSec(Math.max(1, Math.ceil((Number(err.lockedUntil) - Date.now()) / 1000)))
    }
  }

  // =========================================================================
  // 1. DISPATCH OTP TO ENTERED EMAIL ADDRESS VIA BREVO SMTP RELAY
  // =========================================================================
  const handleSendOtpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isFrozen) return
    setError(null)
    setInfoMessage(null)

    if (!agreedToTerms) {
      setError('Please tick "I agree to the Privacy Policy and Terms of Use" before continuing.')
      return
    }

    const rawInputEmail = email.trim()
    if (!rawInputEmail) {
      setError('Please enter your email address before requesting a verification code.')
      return
    }

    const cleanEmail = rawInputEmail.toLowerCase()
    setLoading(true)
    try {
      const res = await sendEmailOtp(cleanEmail, 'verify', undefined, honeypot)
      setOtp(['', '', '', '', '', ''])
      verifiedSessionRef.current = null
      setCooldown(60)
      setInfoMessage(
        res.message || `A 6-digit verification code has been dispatched to ${cleanEmail}. Check your email Inbox.`
      )
      setStep('otp')
    } catch (err: any) {
      applyLockoutFromError(err)
      setError(toUserFriendlyError(err, 'Unable to send verification code right now. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // 2. RESEND OTP CODE WITH COOLDOWN
  // =========================================================================
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading || isFrozen) return
    setError(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setError('Please enter your email address before requesting a verification code.')
      return
    }

    const remaining = getRemainingOtpCooldown(cleanEmail)
    if (remaining > 0) {
      setCooldown(remaining)
      return
    }

    setLoading(true)
    try {
      const res = await sendEmailOtp(cleanEmail, 'verify', undefined, honeypot)
      setCooldown(60)
      setOtp(['', '', '', '', '', ''])
      otpInputsRef.current[0]?.focus()
      setInfoMessage(res.message || `A new verification code has been dispatched to ${cleanEmail}.`)
    } catch (err: any) {
      applyLockoutFromError(err)
      setError(toUserFriendlyError(err, 'Unable to resend verification code. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // 3. MANUAL OTP INPUT HANDLERS
  // =========================================================================
  const handleOtpChange = (index: number, value: string) => {
    if (isFrozen) return
    const sanitized = value.replace(/\D/g, '')

    if (sanitized.length > 1) {
      const digits = sanitized.slice(0, 6).split('')
      const nextOtp = [...otp]
      digits.forEach((digit, i) => {
        if (index + i < 6) nextOtp[index + i] = digit
      })
      setOtp(nextOtp)
      const nextFocus = Math.min(index + digits.length, 5)
      otpInputsRef.current[nextFocus]?.focus()
      return
    }

    const singleDigit = sanitized.slice(-1)
    const nextOtp = [...otp]
    nextOtp[index] = singleDigit
    setOtp(nextOtp)

    if (singleDigit && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (isFrozen) return
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'Enter') {
      const fullCode = otp.join('')
      if (fullCode.length === 6) {
        void handleVerifyOtpSubmit()
      }
    }
  }

  // =========================================================================
  // 4. SERVER-SIDE OTP VERIFICATION & ROUTING (EXISTING VS NEW ACCOUNT)
  // =========================================================================
  const handleVerifyOtpSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (isFrozen) return
    setError(null)
    setInfoMessage(null)

    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    setLoading(true)

    try {
      const verifyRes = await verifyEmailOtp(cleanEmail, code, honeypot)
      if (!verifyRes.success) {
        if (verifyRes.locked && verifyRes.lockedUntil) {
          setLockedUntil(verifyRes.lockedUntil)
          setFreezeRemainingSec(Math.max(1, Math.ceil((verifyRes.lockedUntil - Date.now()) / 1000)))
        }
        setError(toUserFriendlyError(verifyRes.error || 'Incorrect verification code. Please check and try again.'))
        setLoading(false)
        return
      }

      verifiedSessionRef.current = {
        sessionToken: verifyRes.sessionToken,
        profile: verifyRes.profile,
        isAdmin: verifyRes.isAdmin,
        accountExists: verifyRes.accountExists,
      }

      const userStatus = await checkIfUserExists(cleanEmail)
      const isExistingAccount = Boolean(verifyRes.accountExists || userStatus.exists)

      if (isExistingAccount) {
        setPassword('')
        setStep('login')
        setInfoMessage('OTP verified. Enter your account password to sign in to the dashboard.')
      } else {
        setPassword('')
        setConfirmPassword('')
        setStep('create_account')
        setInfoMessage('OTP verified. Complete your trader profile to create your account.')
      }
    } catch (err: any) {
      applyLockoutFromError(err)
      setError(toUserFriendlyError(err, 'Verification failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // 5. NEW USER: COMPLETE ACCOUNT REGISTRATION (After OTP Verification)
  // =========================================================================
  const handleCompleteRegistrationSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isFrozen) return
    setError(null)

    const cleanName = fullName.trim()
    if (!cleanName) {
      setError('Please enter your full name.')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check.')
      return
    }

    setLoading(true)
    try {
      const cleanEmail = email.trim().toLowerCase()
      const profile = await completeEmailOtpLogin({
        email: cleanEmail,
        name: cleanName,
        password,
        isRegister: true,
        honeypot,
        verifiedProfile: verifiedSessionRef.current?.profile,
      })
      onSuccess(profile)
    } catch (err: any) {
      applyLockoutFromError(err)
      setError(toUserFriendlyError(err, 'Unable to complete registration right now. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // 6. EXISTING USER: VALIDATE PASSWORD & LOG IN STRAIGHT TO DASHBOARD
  // =========================================================================
  const handleCompleteLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isFrozen) return
    setError(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!password || password.length < 6) {
      setError('Please enter your password (minimum 6 characters).')
      return
    }

    setLoading(true)
    try {
      const profile = await completeEmailOtpLogin({
        email: cleanEmail,
        password,
        isRegister: false,
        honeypot,
        verifiedProfile: verifiedSessionRef.current?.profile,
      })
      onSuccess(profile)
    } catch (err: any) {
      applyLockoutFromError(err)
      setError(toUserFriendlyError(err, 'Invalid email or password. Please check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // 6B. FORGOT PASSWORD (1-HOUR SINGLE-USE EMAIL LINK VIA BREVO HTTPS API)
  // =========================================================================
  const handleOpenForgotPassword = (fromStep: 'email' | 'login') => {
    if (isFrozen) return
    setPreviousStep(fromStep)
    setError(null)
    setInfoMessage(null)
    setStep('forgot_password')
  }

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isFrozen || forgotCooldown > 0) return
    setError(null)
    setInfoMessage(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid registered email address.')
      return
    }

    setLoading(true)
    try {
      const res = await requestForgotPasswordLink(cleanEmail, honeypot)
      setForgotCooldown(60)
      setInfoMessage(
        res.message ||
          'If an account exists for this email, a password reset link (valid for 1 hour) has been sent. Please check your inbox and spam folder.'
      )
    } catch (err: any) {
      setError(toUserFriendlyError(err, 'Something went wrong. Please try again in a moment.'))
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // 7. GOOGLE SIGN IN OPTION
  // =========================================================================
  const handleGoogleSignIn = async () => {
    if (isFrozen) return
    setError(null)
    setInfoMessage(null)

    if (!agreedToTerms) {
      setError('Please tick "I agree to the Privacy Policy and Terms of Use" before signing in.')
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    const isNative = isAndroidNativeApp()

    const fallbackToOtpDispatch = async () => {
      if (cleanEmail && cleanEmail.includes('@')) {
        setGoogleLoading(true)
        try {
          const res = await sendEmailOtp(cleanEmail, 'verify', undefined, honeypot)
          setOtp(['', '', '', '', '', ''])
          setStep('otp')
          setInfoMessage(res.message || `Verification code sent to ${cleanEmail}.`)
          setCooldown(60)
        } catch (err: any) {
          applyLockoutFromError(err)
          setError(toUserFriendlyError(err, 'Unable to send verification code. Please try again.'))
        } finally {
          setGoogleLoading(false)
        }
      } else {
        setInfoMessage('Enter your Google email address below and tap SEND OTP for email verification.')
        const inputEl = document.getElementById('auth-email-input') as HTMLInputElement | null
        inputEl?.focus()
      }
    }

    if (isNative) {
      await fallbackToOtpDispatch()
      return
    }

    setGoogleLoading(true)
    try {
      const profile = await signInWithGoogle()
      onSuccess(profile)
    } catch (err: any) {
      setGoogleLoading(false)
      await fallbackToOtpDispatch()
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div
      id="sr-terminal-auth"
      className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#0B0E14] text-[#FFFFFF] p-4 select-none font-sans"
    >
      <main className="w-full max-w-[400px] my-auto">
        <div className="rounded-[12px] border border-[#1E222D] bg-[#131722] p-6 sm:p-7 overflow-hidden">
          {/* SR Terminal Brand Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-13 h-13 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] p-1.5 flex items-center justify-center">
              <img
                src="/sr-logo.png"
                alt="SR Terminal"
                className="w-full h-full object-contain rounded-[8px]"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML =
                      '<span class="font-mono font-bold text-base text-white tracking-widest">SR</span>'
                  }
                }}
              />
            </div>
          </div>

          {/* Dynamic Header */}
          <div className="text-center mb-5">
            <h1 className="text-base font-bold tracking-[0.12em] text-[#FFFFFF]">
              SR TERMINAL
            </h1>
            <p className="text-xs text-[#787B86] mt-1">
              {step === 'email' && 'Institutional Trading Workspace'}
              {step === 'otp' && 'Step 1 of 2 · Verify 6-Digit Email OTP'}
              {step === 'login' && 'Step 2 of 2 · Enter Password to Sign In'}
              {step === 'create_account' && 'Step 2 of 2 · Complete New Account Setup'}
              {step === 'forgot_password' && 'Account Recovery · 1-Hour Password Reset Link'}
            </p>
          </div>

          {/* Hidden Anti-Bot Honeypot Input */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Strict 3-Attempt 5-Minute Brute-Force Lockout Banner */}
          {isFrozen && (
            <div
              id="auth-freeze-banner"
              className="mb-4 p-3.5 rounded-[12px] bg-[#EF5350]/15 border border-[#EF5350]/40 text-[#EF5350] text-xs text-left flex items-start gap-2.5 fadein tabular-nums break-words overflow-hidden"
            >
              <Timer size={16} className="shrink-0 mt-0.5 text-[#EF5350]" />
              <div className="flex-1 min-w-0 break-words overflow-hidden">
                <p className="font-semibold text-[12px] leading-snug text-[#EF5350] break-words">
                  Too many failed attempts. Please try again in {formatCountdownMmSs(freezeRemainingSec)}.
                </p>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {!isFrozen && error && (
            <div
              id="auth-error"
              className="mb-4 p-3 rounded-[12px] bg-[#EF5350]/10 border border-[#EF5350]/30 text-[#EF5350] text-xs text-left flex items-start gap-2.5 fadein break-words overflow-hidden"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#EF5350]" />
              <p className="font-medium text-[11.5px] leading-snug flex-1 min-w-0 break-words overflow-hidden">
                {toUserFriendlyError(error)}
              </p>
            </div>
          )}

          {/* Info Notice */}
          {infoMessage && !isFrozen && (
            <div
              id="auth-info"
              className="mb-4 p-3 rounded-[12px] bg-[#26A69A]/10 border border-[#26A69A]/30 text-[#D1D4DC] text-xs text-left flex items-start gap-2.5 fadein break-words overflow-hidden"
            >
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-[#26A69A]" />
              <p className="font-medium text-[11.5px] leading-snug flex-1 min-w-0 break-words overflow-hidden">
                {infoMessage}
              </p>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 1: USER ENTERS EMAIL ADDRESS                                */}
          {/* ================================================================= */}
          {step === 'email' && (
            <div className="space-y-4">
              {/* Google Sign-In */}
              <button
                id="btn-google-auth"
                type="button"
                disabled={googleLoading || loading || isFrozen || !agreedToTerms}
                onClick={handleGoogleSignIn}
                className="w-full h-11 px-4 rounded-[12px] bg-[#0B0E14] hover:bg-[#191E2B] border border-[#1E222D] text-[#FFFFFF] font-medium text-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-98"
              >
                {googleLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#FFFFFF]" />
                    <span className="font-mono text-xs">CONNECTING GOOGLE...</span>
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
                      SIGN IN WITH GOOGLE
                    </span>
                  </>
                )}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1E222D]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono">
                  <span className="bg-[#131722] px-2.5 text-[#787B86]">OR EMAIL OTP + PASSWORD</span>
                </div>
              </div>

              {/* Email Input Form */}
              <form onSubmit={handleSendOtpSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-email-input"
                      className="block text-xs font-medium text-[#D1D4DC]"
                    >
                      Email address
                    </label>
                    <button
                      id="btn-forgot-password-initial"
                      type="button"
                      disabled={isFrozen}
                      onClick={() => handleOpenForgotPassword('email')}
                      className="text-[11px] text-[#787B86] hover:text-[#26A69A] underline cursor-pointer disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787B86] pointer-events-none"
                    />
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      autoFocus
                      disabled={isFrozen}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full h-11 pl-10 pr-3.5 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-sm text-[#FFFFFF] placeholder-[#787B86] focus:outline-none focus:border-[#FFFFFF] transition-all font-sans disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Mandatory Privacy Policy & Terms of Use Checkbox (Unchecked by default) */}
                <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-start gap-2.5 text-left">
                  <input
                    id="auth-privacy-checkbox"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked)
                      if (e.target.checked && error?.includes('Privacy Policy')) {
                        setError(null)
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-[#26A69A] rounded cursor-pointer shrink-0"
                  />
                  <label htmlFor="auth-privacy-checkbox" className="text-[11px] text-[#D1D4DC] leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPolicyReaderSection('privacy')
                      }}
                      className="text-[#26A69A] underline font-semibold hover:text-[#FFFFFF] cursor-pointer"
                    >
                      Privacy Policy
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPolicyReaderSection('terms')
                      }}
                      className="text-[#26A69A] underline font-semibold hover:text-[#FFFFFF] cursor-pointer"
                    >
                      Terms of Use
                    </button>
                  </label>
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={loading || !email.trim() || isFrozen || !agreedToTerms}
                  className="w-full h-11 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] active:scale-98 text-[#0B0E14] font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isFrozen ? (
                    <span className="tabular-nums">FROZEN ({formatCountdownMmSs(freezeRemainingSec)})</span>
                  ) : loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-[#0B0E14]" />
                      <span>DISPATCHING 6-DIGIT CODE...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND OTP</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 1B: FORGOT PASSWORD (1-HOUR SINGLE-USE EMAIL LINK REQUEST)   */}
          {/* ================================================================= */}
          {step === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] text-[11.5px] text-[#787B86] leading-relaxed">
                Enter your registered Email ID below. We will send you a single-use password reset link valid for <strong className="text-[#FFFFFF]">1 hour only</strong>.
              </div>

              <div>
                <label
                  htmlFor="forgot-email-input"
                  className="block text-xs font-medium text-[#D1D4DC] mb-1.5"
                >
                  Registered Email ID
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787B86] pointer-events-none"
                  />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    autoFocus
                    disabled={isFrozen || loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email address"
                    className="w-full h-11 pl-10 pr-3.5 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-sm text-[#FFFFFF] placeholder-[#787B86] focus:outline-none focus:border-[#FFFFFF] transition-all font-sans disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                id="btn-send-forgot-link"
                type="submit"
                disabled={loading || !email.trim() || isFrozen || forgotCooldown > 0}
                className="w-full h-11 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] active:scale-98 text-[#0B0E14] font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#0B0E14]" />
                    <span>SENDING 1-HOUR RESET LINK...</span>
                  </>
                ) : forgotCooldown > 0 ? (
                  <span className="tabular-nums">RESEND AVAILABLE IN {forgotCooldown}S</span>
                ) : (
                  <>
                    <span>SEND 1-HOUR RESET LINK</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  id="btn-forgot-back-to-login"
                  type="button"
                  onClick={() => {
                    setError(null)
                    setInfoMessage(null)
                    setStep(previousStep)
                  }}
                  className="text-xs text-[#787B86] hover:text-[#FFFFFF] transition-colors flex items-center justify-center gap-1.5 cursor-pointer mx-auto"
                >
                  <ArrowLeft size={12} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 2: VERIFY 6-DIGIT OTP FIRST (ZERO ON-SCREEN CODE EXPOSURE)   */}
          {/* ================================================================= */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#26A69A]/10 border border-[#26A69A]/30 text-[#26A69A] mb-2.5">
                  <Shield size={18} />
                </div>
                <h2 className="text-sm font-semibold text-[#FFFFFF]">
                  Enter the 6-digit OTP sent to your email
                </h2>
                <p className="text-xs font-mono font-medium text-[#26A69A] mt-1 break-all">
                  {email.trim().toLowerCase()}
                </p>
                <p className="text-[11px] text-[#787B86] mt-0.5">
                  Check your Inbox · Valid for 5 minutes
                </p>
              </div>

              {/* 6 Clean Input Boxes for Manual OTP Entry */}
              <div className="flex justify-between gap-1.5 sm:gap-2 pt-1">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={isFrozen}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl sm:text-2xl tabular-nums rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF] transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              {/* Manual Verification Button */}
              <button
                id="btn-verify-otp"
                type="submit"
                disabled={loading || otp.join('').length !== 6 || isFrozen}
                className="w-full h-11 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] active:scale-98 text-[#0B0E14] font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isFrozen ? (
                  <span className="tabular-nums">FROZEN ({formatCountdownMmSs(freezeRemainingSec)})</span>
                ) : loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#0B0E14]" />
                    <span>VERIFYING CODE...</span>
                  </>
                ) : (
                  <>
                    <span>VERIFY OTP & CONTINUE</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {/* Resend OTP & Change Email Options */}
              <div className="pt-2 flex flex-col gap-2.5 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5 text-[#787B86]">
                  <span>Didn&apos;t receive the code?</span>
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading || isFrozen}
                    onClick={handleResendOtp}
                    className="text-[#FFFFFF] hover:text-[#D1D4DC] disabled:text-[#787B86] disabled:cursor-not-allowed font-medium transition-colors cursor-pointer flex items-center gap-1 tabular-nums"
                  >
                    <RotateCcw size={11} />
                    <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setError(null)
                    setInfoMessage(null)
                  }}
                  className="text-[#787B86] hover:text-[#FFFFFF] transition-colors text-[11.5px] flex items-center justify-center gap-1 cursor-pointer mx-auto"
                >
                  <ArrowLeft size={11} />
                  <span>Change email address</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 3A: NEW USER → CREATE ACCOUNT PROCESS                       */}
          {/* ================================================================= */}
          {step === 'create_account' && (
            <form onSubmit={handleCompleteRegistrationSubmit} className="space-y-3.5">
              <div className="p-2.5 rounded-[12px] bg-[#26A69A]/10 border border-[#26A69A]/30 flex items-center justify-between text-[#26A69A] text-xs">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck size={16} className="shrink-0 text-[#26A69A]" />
                  <span className="font-mono text-[11px] truncate">
                    OTP Verified: <strong className="text-[#FFFFFF]">{email.trim().toLowerCase()}</strong>
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-medium text-[#D1D4DC] mb-1"
                >
                  Full name
                </label>
                <div className="relative">
                  <UserIcon
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787B86] pointer-events-none"
                  />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    autoFocus
                    disabled={isFrozen}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 pl-10 pr-3.5 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-sm text-[#FFFFFF] placeholder-[#787B86] focus:outline-none focus:border-[#FFFFFF] transition-all font-sans disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-medium text-[#D1D4DC] mb-1"
                >
                  Create password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787B86] pointer-events-none"
                  />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isFrozen}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create your account password"
                    className="w-full h-11 pl-10 pr-10 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-sm text-[#FFFFFF] placeholder-[#787B86] focus:outline-none focus:border-[#FFFFFF] transition-all font-sans disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787B86] hover:text-[#FFFFFF] cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-medium text-[#D1D4DC] mb-1"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787B86] pointer-events-none"
                  />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    disabled={isFrozen}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full h-11 pl-10 pr-10 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-sm text-[#FFFFFF] placeholder-[#787B86] focus:outline-none focus:border-[#FFFFFF] transition-all font-sans disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787B86] hover:text-[#FFFFFF] cursor-pointer p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                id="btn-create-account"
                type="submit"
                disabled={loading || !fullName.trim() || !password || !confirmPassword || isFrozen}
                className="w-full h-11 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] active:scale-98 text-[#0B0E14] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isFrozen ? (
                  <span className="tabular-nums">FROZEN ({formatCountdownMmSs(freezeRemainingSec)})</span>
                ) : loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#0B0E14]" />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <span>CREATE ACCOUNT & ENTER</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setInfoMessage('OTP verified. Enter your existing account password to sign in.')
                    setStep('login')
                  }}
                  className="text-xs text-[#787B86] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  Already have an account? <span className="text-[#FFFFFF] underline">Sign in with password</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 3B: EXISTING USER → ENTER PASSWORD & SIGN IN TO DASHBOARD    */}
          {/* ================================================================= */}
          {step === 'login' && (
            <form onSubmit={handleCompleteLoginSubmit} className="space-y-3.5">
              <div className="p-2.5 rounded-[12px] bg-[#26A69A]/10 border border-[#26A69A]/30 flex items-center justify-between text-[#26A69A] text-xs">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck size={16} className="shrink-0 text-[#26A69A]" />
                  <span className="font-mono text-[11px] truncate">
                    OTP Verified: <strong className="text-[#FFFFFF]">{email.trim().toLowerCase()}</strong>
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-medium text-[#D1D4DC]"
                  >
                    Password
                  </label>
                  <button
                    id="btn-forgot-password-login"
                    type="button"
                    disabled={isFrozen}
                    onClick={() => handleOpenForgotPassword('login')}
                    className="text-[11px] text-[#787B86] hover:text-[#26A69A] underline cursor-pointer disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787B86] pointer-events-none"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    disabled={isFrozen}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full h-11 pl-10 pr-10 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-sm text-[#FFFFFF] placeholder-[#787B86] focus:outline-none focus:border-[#FFFFFF] transition-all font-sans disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787B86] hover:text-[#FFFFFF] cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={loading || !password || isFrozen}
                className="w-full h-11 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] active:scale-98 text-[#0B0E14] font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isFrozen ? (
                  <span className="tabular-nums">FROZEN ({formatCountdownMmSs(freezeRemainingSec)})</span>
                ) : loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#0B0E14]" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO DASHBOARD</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col gap-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setInfoMessage('OTP verified. Complete your trader profile to create your account.')
                    setStep('create_account')
                  }}
                  className="text-xs text-[#787B86] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  New to SR Terminal? <span className="text-[#FFFFFF] underline">Create a new account</span>
                </button>
              </div>
            </form>
          )}

          {/* Privacy Policy Link */}
          <div className="mt-5 pt-3 border-t border-[#1E222D] text-center flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPolicyReaderSection('privacy')}
              className="text-[10px] text-[#787B86] hover:text-[#FFFFFF] font-mono transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-[#1E222D]">·</span>
            <button
              type="button"
              onClick={() => setPolicyReaderSection('terms')}
              className="text-[10px] text-[#787B86] hover:text-[#FFFFFF] font-mono transition-colors cursor-pointer"
            >
              Terms of Use & RBI Policy
            </button>
          </div>
        </div>
      </main>

      {/* Full-Screen Scrollable Privacy Policy & Terms of Use Reader Modal */}
      {policyReaderSection && (
        <div className="fixed inset-0 z-50 bg-[#0B0E14] overflow-y-auto scroll-touch fadein flex flex-col">
          <div className="flex-1">
            <PrivacyPolicyScreen
              initialSection={policyReaderSection}
              onBack={() => setPolicyReaderSection(null)}
            />
          </div>
          <div className="sticky bottom-0 z-20 p-3 bg-[#131722] border-t border-[#1E222D] flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAgreedToTerms(true)
                if (error?.includes('Privacy Policy')) setError(null)
                setPolicyReaderSection(null)
              }}
              className="px-5 py-2.5 rounded-[10px] bg-[#26A69A] hover:bg-[#1F8A7F] text-[#0B0E14] font-bold text-xs cursor-pointer active:scale-98"
            >
              Accept Policy & Return to Login
            </button>
            <button
              type="button"
              onClick={() => setPolicyReaderSection(null)}
              className="px-4 py-2.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] text-[#D1D4DC] hover:text-[#FFFFFF] font-semibold text-xs cursor-pointer active:scale-98"
            >
              Close Reader
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
