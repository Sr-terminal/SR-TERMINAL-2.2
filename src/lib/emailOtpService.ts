import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseReady } from './firebase'
import {
  syncUserProfileInFirestore,
  checkBruteForceLockout,
  recordBruteForceFailure,
  resetBruteForceLockout,
  getDeviceFingerprint,
  type UserProfile,
} from './authService'
import { apiUrl } from './apiConfig'
import { toUserFriendlyError, stripUndefinedDeep } from './errorSanitizer'

const OTP_COOLDOWN_MS = 60 * 1000 // 60 seconds resend cooldown
const cooldownMemory = new Map<string, number>()

export interface SendOtpResponse {
  success: boolean
  message: string
  expiresAt?: number
  locked?: boolean
  lockedUntil?: number
  remainingSeconds?: number
}

export function getRemainingOtpCooldown(email: string): number {
  const cleanEmail = email.trim().toLowerCase()
  const lastRequestedAt = cooldownMemory.get(cleanEmail) || 0
  if (!lastRequestedAt) return 0
  const elapsed = Date.now() - lastRequestedAt
  if (elapsed >= OTP_COOLDOWN_MS) return 0
  return Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000)
}

/**
 * 1. SEND 6-DIGIT EMAIL OTP VIA BREVO SMTP RELAY BACKEND
 * Never generates or exposes the OTP code in frontend code or API responses.
 * Syncs the hashed OTP record to Firestore `email_otps` with a 5-minute expiry.
 */
export async function sendEmailOtp(
  email: string,
  purpose: 'login' | 'register' | 'verify' = 'verify',
  name?: string,
  honeypot = ''
): Promise<SendOtpResponse> {
  const cleanEmail = (email || '').trim().toLowerCase()
  const fp = getDeviceFingerprint()

  // Check active 5-minute brute-force lockout first
  const lockStatus = await checkBruteForceLockout(cleanEmail)
  if (lockStatus.locked) {
    const mins = String(Math.floor(lockStatus.remainingSeconds / 60)).padStart(2, '0')
    const secs = String(lockStatus.remainingSeconds % 60).padStart(2, '0')
    const err: any = new Error(`Too many failed attempts. Please try again in ${mins}:${secs}.`)
    err.locked = true
    err.lockedUntil = lockStatus.lockedUntil
    throw err
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    const fail = await recordBruteForceFailure(cleanEmail || fp, 'INVALID_EMAIL_FORMAT')
    if (fail.locked) {
      const remSec = Math.max(1, Math.ceil((fail.lockedUntil - Date.now()) / 1000))
      const mins = String(Math.floor(remSec / 60)).padStart(2, '0')
      const secs = String(remSec % 60).padStart(2, '0')
      const err: any = new Error(`Too many failed attempts. Please try again in ${mins}:${secs}.`)
      err.locked = true
      err.lockedUntil = fail.lockedUntil
      throw err
    }
    throw new Error('Please enter a valid email address.')
  }

  const remainingCooldown = getRemainingOtpCooldown(cleanEmail)
  if (remainingCooldown > 0) {
    throw new Error(`Please wait ${remainingCooldown} seconds before requesting a new code.`)
  }

  const response = await fetch(apiUrl('/api/auth/request-otp'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fp,
    },
    body: JSON.stringify({
      email: cleanEmail,
      purpose,
      name,
      honeypot,
      deviceFingerprint: fp,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 429 && data?.locked) {
    const err: any = new Error(toUserFriendlyError(data.error || 'Too many failed attempts. Please try again in 05:00.'))
    err.locked = true
    err.lockedUntil = data.lockedUntil || Date.now() + 5 * 60 * 1000
    throw err
  }

  if (!response.ok || !data?.success) {
    throw new Error(toUserFriendlyError(data?.error || 'Something went wrong. Please try again in a moment.'))
  }

  cooldownMemory.set(cleanEmail, Date.now())

  // Persist hashed OTP record in Firestore `email_otps` with 5-minute expiry
  if (db && data.codeHash && data.salt) {
    try {
      const otpDocId = `otp_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
      await setDoc(
        doc(db, 'email_otps', otpDocId),
        stripUndefinedDeep({
          email: cleanEmail,
          codeHash: String(data.codeHash),
          salt: String(data.salt),
          attempts: 0,
          expiresAt: Number(data.expiresAt || Date.now() + 5 * 60 * 1000),
          lockedUntil: 0,
          createdAt: Date.now(),
          purpose,
        })
      )
    } catch {
      // Server-side hashed OTP store remains primary
    }
  }

  return {
    success: true,
    expiresAt: data.expiresAt,
    message: data.message || `A 6-digit verification code has been sent to ${cleanEmail}.`,
  }
}

export interface VerifyOtpResult {
  success: boolean
  error?: string
  sessionToken?: string
  profile?: UserProfile
  isAdmin?: boolean
  accountExists?: boolean
  locked?: boolean
  lockedUntil?: number
  remainingSeconds?: number
}

/**
 * 2. VERIFY 6-DIGIT EMAIL OTP ON SERVER
 * Enforces strict 3-attempt 5-minute freeze on wrong OTP codes.
 */
export async function verifyEmailOtp(
  email: string,
  inputCode: string,
  honeypot = ''
): Promise<VerifyOtpResult> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanCode = inputCode.trim().replace(/\D/g, '')
  const fp = getDeviceFingerprint()

  const lockStatus = await checkBruteForceLockout(cleanEmail)
  if (lockStatus.locked) {
    const mins = String(Math.floor(lockStatus.remainingSeconds / 60)).padStart(2, '0')
    const secs = String(lockStatus.remainingSeconds % 60).padStart(2, '0')
    return {
      success: false,
      locked: true,
      lockedUntil: lockStatus.lockedUntil,
      remainingSeconds: lockStatus.remainingSeconds,
      error: `Too many failed attempts. Login frozen for ${mins}:${secs} to protect your account.`,
    }
  }

  if (cleanCode.length !== 6) {
    return {
      success: false,
      error: 'Please enter the complete 6-digit verification code.',
    }
  }

  const response = await fetch(apiUrl('/api/auth/verify-otp'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fp,
    },
    body: JSON.stringify({
      email: cleanEmail,
      code: cleanCode,
      honeypot,
      deviceFingerprint: fp,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 429 || data?.locked) {
    const lockedUntil = Number(data?.lockedUntil || Date.now() + 5 * 60 * 1000)
    await recordBruteForceFailure(cleanEmail, 'OTP_LOCKED_3_ATTEMPTS')
    return {
      success: false,
      locked: true,
      lockedUntil,
      remainingSeconds: Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000)),
      error: toUserFriendlyError(data?.error || 'Too many failed attempts. Please try again in 05:00.'),
    }
  }

  if (!response.ok || !data?.success) {
    await recordBruteForceFailure(cleanEmail, 'OTP_MISMATCH')
    return {
      success: false,
      error: toUserFriendlyError(data?.error || 'Incorrect verification code. Please check your email and try again.'),
    }
  }

  return {
    success: true,
    sessionToken: data.sessionToken,
    profile: data.profile as UserProfile | undefined,
    isAdmin: Boolean(data.isAdmin),
    accountExists: Boolean(data.accountExists),
  }
}

/**
 * 3. CHECK IF ACCOUNT ALREADY EXISTS (Server + Firebase Auth)
 */
export async function checkIfUserExists(email: string): Promise<{ exists: boolean; profile?: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) return { exists: false }

  try {
    const res = await fetch(apiUrl('/api/auth/check-account'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.exists) {
        return {
          exists: true,
          profile: data.profile as UserProfile | undefined,
        }
      }
    }
  } catch {}

  if (isFirebaseReady() && auth) {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, cleanEmail)
      if (methods && methods.length > 0) {
        return { exists: true }
      }
    } catch {}
  }

  return { exists: false }
}

/**
 * 4. COMPLETE LOGIN OR ACCOUNT REGISTRATION AFTER OTP VERIFICATION
 * Strictly verifies the user's real password via Firebase Authentication + Backend SHA-256 hash check.
 * ZERO arbitrary password bypasses (`SrBridge_...` removed completely).
 * Enforces the 3-attempt 5-minute freeze on wrong passwords.
 */
export async function completeEmailOtpLogin(params: {
  email: string
  name?: string
  password?: string
  isRegister: boolean
  honeypot?: string
  verifiedProfile?: UserProfile
}): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase()
  const cleanName = params.name?.trim() || cleanEmail.split('@')[0]
  const password = params.password || ''
  const fp = getDeviceFingerprint()

  // 1. Check active 5-minute brute-force freeze
  const lockStatus = await checkBruteForceLockout(cleanEmail)
  if (lockStatus.locked) {
    const mins = String(Math.floor(lockStatus.remainingSeconds / 60)).padStart(2, '0')
    const secs = String(lockStatus.remainingSeconds % 60).padStart(2, '0')
    const err: any = new Error(`Too many failed attempts. Please try again in ${mins}:${secs}.`)
    err.locked = true
    err.lockedUntil = lockStatus.lockedUntil
    throw err
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  if (!isFirebaseReady() || !auth) {
    throw new Error('Unable to connect. Please check your internet and try again.')
  }

  // 2. Verify with backend password hash ledger first
  const serverRes = await fetch(apiUrl('/api/auth/complete-login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fp,
    },
    body: JSON.stringify({
      email: cleanEmail,
      name: cleanName,
      password,
      isRegister: params.isRegister,
      honeypot: params.honeypot || '',
      deviceFingerprint: fp,
    }),
  })

  const serverData = await serverRes.json().catch(() => ({}))

  if (serverRes.status === 429 || serverData?.locked) {
    const err: any = new Error(
      toUserFriendlyError(serverData?.error || 'Too many failed attempts. Please try again in 05:00.')
    )
    err.locked = true
    err.lockedUntil = serverData?.lockedUntil || Date.now() + 5 * 60 * 1000
    throw err
  }

  if (!serverRes.ok || !serverData?.success) {
    throw new Error(toUserFriendlyError(serverData?.error || 'Invalid email or password. Please check your details and try again.'))
  }

  // 3. Strictly authenticate with Firebase Auth using the user's REAL password
  try {
    if (params.isRegister) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
        if (cleanName) {
          await updateProfile(cred.user, { displayName: cleanName }).catch(() => {})
        }
        const profile = await syncUserProfileInFirestore(cred.user, cleanName)
        await resetBruteForceLockout(cleanEmail, profile.uid)
        return profile
      } catch (regErr: any) {
        if (regErr?.code === 'auth/email-already-in-use') {
          // Account already exists in Firebase Auth -> must match the real password!
          const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, password)
          const profile = await syncUserProfileInFirestore(loginCred.user, cleanName)
          await resetBruteForceLockout(cleanEmail, profile.uid)
          return profile
        }
        throw regErr
      }
    } else {
      // Existing user login -> strictly verify with signInWithEmailAndPassword
      try {
        const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, password)
        const profile = await syncUserProfileInFirestore(loginCred.user, cleanName)
        await resetBruteForceLockout(cleanEmail, profile.uid)
        return profile
      } catch (signInErr: any) {
        // If password was just reset on backend (`serverData.success === true`) and Firebase Auth is out of sync,
        // or user was registered in server store first, attempt creation once if user-not-found
        if (signInErr?.code === 'auth/user-not-found') {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
          if (cleanName) {
            await updateProfile(cred.user, { displayName: cleanName }).catch(() => {})
          }
          const profile = await syncUserProfileInFirestore(cred.user, cleanName)
          await resetBruteForceLockout(cleanEmail, profile.uid)
          return profile
        }
        throw signInErr
      }
    }
  } catch (fbErr: any) {
    const code = fbErr?.code || ''
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found'
    ) {
      const fail = await recordBruteForceFailure(cleanEmail, code)
      if (fail.locked) {
        const remSec = Math.max(1, Math.ceil((fail.lockedUntil - Date.now()) / 1000))
        const mins = String(Math.floor(remSec / 60)).padStart(2, '0')
        const secs = String(remSec % 60).padStart(2, '0')
        const lockErr: any = new Error(`Too many failed attempts. Please try again in ${mins}:${secs}.`)
        lockErr.locked = true
        lockErr.lockedUntil = fail.lockedUntil
        throw lockErr
      }
      throw new Error('Invalid email or password. Please check your details and try again.')
    }
    throw new Error(toUserFriendlyError(fbErr))
  }
}
