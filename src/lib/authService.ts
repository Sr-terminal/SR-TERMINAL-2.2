import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
} from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseReady, handleFirestoreError, OperationType } from './firebase'
import { apiUrl } from './apiConfig'
import { toUserFriendlyError, stripUndefinedDeep } from './errorSanitizer'

export type SubscriptionTierLevel =
  | 'FREE'
  | 'FREE_AD_SUPPORTED'
  | 'TRIAL_24H'
  | 'LEVEL_1_STARTER'
  | 'LEVEL_2_ADVANCED'
  | 'LEVEL_3_FUNDED_ELITE'

export interface UserProfile {
  uid: string
  name: string | null
  email: string | null
  phone: string | null
  photoUrl: string | null
  role: 'user' | 'admin'
  accountStatus: 'active' | 'blocked' | 'suspended'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  trialUsed: boolean
  isTrial: boolean
  trialStart: string | null
  trialExpiry: string | null
  trialActivatedAt?: string | null
  trialExpiresAt?: string | null
  subscriptionStatus: 'none' | 'trial' | 'trial_expired' | 'active' | 'PRO' | 'expired' | 'pending' | 'cancelled' | 'blocked'
  subscriptionPlan: string
  subscriptionTier?: SubscriptionTierLevel
  subscriptionStart: string | null
  subscriptionExpiry: string | null
  autoPayEnabled?: boolean
  cancelAtPeriodEnd?: boolean
  autoPayCancelledAt?: string | null
  lastOrderId?: string | null
  lastPurchaseToken?: string | null
  fcmTokens?: string[]
  failedAttempts?: number
  lockedUntil?: number
  lastFailedAt?: string | null
  deviceFingerprint?: string
  deviceInfo?: {
    deviceModel?: string
    userAgent?: string
    platform?: string
    osVersion?: string
  } | null
  appVersion?: string | null
  adUsage?: {
    date: string
    count: number
  }
  createdAt: string
  lastLoginAt: string
  updatedAt?: string
}

const ADMIN_EMAILS = ['surajrayxyz09@gmail.com']
const MAX_FAILED_ATTEMPTS = 3
const LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minutes
const TRIAL_DURATION_24H_MS = 24 * 60 * 60 * 1000 // Strict 24-Hour Free Trial

// In-memory runtime state backed strictly by Firebase Auth + Cloud Firestore (ZERO localStorage-only auth fallbacks)
let activeProfileMemory: UserProfile | null = null
const sessionSubscribers = new Set<(profile: UserProfile | null) => void>()

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'srv_node'
  }
  const raw = [
    navigator.userAgent || '',
    navigator.language || '',
    screen?.width || 0,
    screen?.height || 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  ].join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i)
    hash |= 0
  }
  return `fp_${Math.abs(hash).toString(16)}`
}

export function isAndroidNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as any).Capacitor
  if (cap?.isNativePlatform?.()) return true
  const ua = navigator.userAgent || ''
  const isWv = /wv|Android.*Version\/[0-9.]+/i.test(ua)
  const isLocalOrigin =
    window.location.hostname === 'localhost' &&
    (window.location.protocol === 'https:' || window.location.protocol === 'capacitor:')
  return isWv && isLocalOrigin
}

export function getFriendlyAuthErrorMessage(err: any): string {
  return toUserFriendlyError(err)
}

function notifySessionSubscribers(profile: UserProfile | null) {
  activeProfileMemory = profile
  sessionSubscribers.forEach((cb) => {
    try {
      cb(profile)
    } catch {}
  })
}

export function setManualSessionProfile(profile: UserProfile | null) {
  notifySessionSubscribers(profile)
}

export function getCachedUserProfile(): UserProfile | null {
  return activeProfileMemory
}

/**
 * Checks & enforces the 3-attempt 5-minute freeze in Firestore (`security_logs`) and backend (`/api/auth/lockout-status`).
 */
export async function checkBruteForceLockout(email: string): Promise<{
  locked: boolean
  failedAttempts: number
  lockedUntil: number
  remainingSeconds: number
}> {
  const cleanEmail = (email || '').trim().toLowerCase()
  const fp = getDeviceFingerprint()
  const now = Date.now()
  let maxAttempts = 0
  let maxLockedUntil = 0

  // 1. Check Firestore security_logs document
  if (db && cleanEmail) {
    try {
      const logId = `acct_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
      const snap = await getDoc(doc(db, 'security_logs', logId))
      if (snap.exists()) {
        const data = snap.data()
        const lu = Number(data?.lockedUntil || 0)
        const fa = Number(data?.failedAttempts || 0)
        if (lu > 0 && now >= lu) {
          // 5 minutes elapsed -> auto-reset
          await setDoc(
            doc(db, 'security_logs', logId),
            {
              identifier: cleanEmail,
              email: cleanEmail,
              deviceFingerprint: fp,
              eventType: 'LOCKOUT_RESET',
              failedAttempts: 0,
              lockedUntil: 0,
              reason: '5-minute cooldown expired',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          )
        } else {
          maxAttempts = Math.max(maxAttempts, fa)
          maxLockedUntil = Math.max(maxLockedUntil, lu)
        }
      }
    } catch {
      // Continue to backend check
    }
  }

  // 2. Check backend lockout status
  try {
    const res = await fetch(apiUrl('/api/auth/lockout-status'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp,
      },
      body: JSON.stringify({ email: cleanEmail, deviceFingerprint: fp }),
    })
    if (res.ok) {
      const data = await res.json()
      maxAttempts = Math.max(maxAttempts, Number(data?.failedAttempts || 0))
      maxLockedUntil = Math.max(maxLockedUntil, Number(data?.lockedUntil || 0))
    }
  } catch {}

  const locked = maxLockedUntil > now
  return {
    locked,
    failedAttempts: locked ? Math.max(MAX_FAILED_ATTEMPTS, maxAttempts) : maxAttempts,
    lockedUntil: locked ? maxLockedUntil : 0,
    remainingSeconds: locked ? Math.ceil((maxLockedUntil - now) / 1000) : 0,
  }
}

/**
 * Records a failed authentication or OTP attempt in both Firestore (`security_logs`) and backend.
 * On 3rd attempt (`attempts >= 3`), freezes login for 5 minutes (`lockedUntil = Date.now() + 5 * 60 * 1000`).
 */
export async function recordBruteForceFailure(
  email: string,
  reason: string
): Promise<{
  locked: boolean
  failedAttempts: number
  lockedUntil: number
  remainingAttempts: number
}> {
  const cleanEmail = (email || '').trim().toLowerCase()
  const fp = getDeviceFingerprint()
  const now = Date.now()

  let failedAttempts = 1
  let lockedUntil = 0

  // 1. Record on backend
  try {
    const res = await fetch(apiUrl('/api/auth/record-failure'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp,
      },
      body: JSON.stringify({ email: cleanEmail, deviceFingerprint: fp, reason }),
    })
    const data = await res.json().catch(() => ({}))
    if (typeof data?.failedAttempts === 'number') {
      failedAttempts = data.failedAttempts
    }
    if (typeof data?.lockedUntil === 'number') {
      lockedUntil = data.lockedUntil
    }
  } catch {}

  // 2. Record in Firestore `security_logs`
  if (db) {
    try {
      const idKey = cleanEmail || fp
      const logId = `acct_${idKey.replace(/[^a-z0-9]/g, '_')}`
      const snap = await getDoc(doc(db, 'security_logs', logId))
      if (snap.exists()) {
        const data = snap.data()
        const prevLu = Number(data?.lockedUntil || 0)
        const prevFa = prevLu > 0 && now >= prevLu ? 0 : Number(data?.failedAttempts || 0)
        failedAttempts = Math.max(failedAttempts, prevFa + 1)
      }
      if (failedAttempts >= MAX_FAILED_ATTEMPTS && lockedUntil <= now) {
        lockedUntil = now + LOCKOUT_DURATION_MS
      }
      const eventType = failedAttempts >= MAX_FAILED_ATTEMPTS ? 'ACCOUNT_FROZEN_5M' : 'AUTH_FAILED'
      await setDoc(
        doc(db, 'security_logs', logId),
        {
          identifier: idKey,
          email: cleanEmail,
          deviceFingerprint: fp,
          eventType,
          failedAttempts,
          lockedUntil,
          reason,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      )
    } catch {}
  }

  if (failedAttempts >= MAX_FAILED_ATTEMPTS && lockedUntil <= now) {
    lockedUntil = now + LOCKOUT_DURATION_MS
  }

  return {
    locked: lockedUntil > now,
    failedAttempts,
    lockedUntil,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts),
  }
}

/**
 * Resets failedAttempts = 0 and lockedUntil = 0 after a verified login or 5-minute expiry.
 */
export async function resetBruteForceLockout(email: string, uid?: string): Promise<void> {
  const cleanEmail = (email || '').trim().toLowerCase()
  const fp = getDeviceFingerprint()

  try {
    await fetch(apiUrl('/api/auth/reset-lockout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp,
      },
      body: JSON.stringify({ email: cleanEmail, deviceFingerprint: fp }),
    })
  } catch {}

  if (db && cleanEmail) {
    try {
      const logId = `acct_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
      await setDoc(
        doc(db, 'security_logs', logId),
        {
          identifier: cleanEmail,
          email: cleanEmail,
          deviceFingerprint: fp,
          eventType: 'AUTH_SUCCESS',
          failedAttempts: 0,
          lockedUntil: 0,
          reason: 'Verified login success',
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      )
    } catch {}
  }

  if (db && uid) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        failedAttempts: 0,
        lockedUntil: 0,
        updatedAt: new Date().toISOString(),
      })
    } catch {}
  }
}

function resolveDefaultTier(
  status: UserProfile['subscriptionStatus'],
  plan?: string,
  existingTier?: SubscriptionTierLevel,
  isAdmin?: boolean
): SubscriptionTierLevel {
  if (isAdmin) return 'LEVEL_3_FUNDED_ELITE'
  if (existingTier) return existingTier
  if (status === 'trial') return 'TRIAL_24H'
  if (status === 'PRO' || status === 'active') {
    if (plan === 'sr_terminal_1y') return 'LEVEL_3_FUNDED_ELITE'
    if (plan === 'sr_terminal_2m') return 'LEVEL_2_ADVANCED'
    return 'LEVEL_1_STARTER'
  }
  return 'FREE_AD_SUPPORTED'
}

/**
 * Sync or create user profile in Cloud Firestore (`ai-studio-srterminalprivat-41ef7494-5a58-4184-8c13-0b1ee9f8f190`)
 * Automatically grants a strict 24-Hour Free Trial (`trialExpiresAt = createdAt + 24 * 60 * 60 * 1000`) to new accounts.
 * Strictly strips all `undefined` values before any Firestore write and only writes permitted non-privileged fields on login.
 */
export async function syncUserProfileInFirestore(user: User, customName?: string): Promise<UserProfile> {
  const nowMs = Date.now()
  const nowIso = new Date(nowMs).toISOString()
  const emailLower = (user.email || '').toLowerCase().trim()
  const isAdmin = ADMIN_EMAILS.includes(emailLower)
  const fp = getDeviceFingerprint()

  if (!db) {
    throw new Error('Unable to connect. Please check your internet and try again.')
  }

  const userRef = doc(db, 'users', user.uid)
  try {
    const snap = await getDoc(userRef)

    if (snap.exists()) {
      const data = snap.data() as UserProfile
      const existingRole: 'user' | 'admin' = data.role === 'admin' || isAdmin ? 'admin' : 'user'
      const existingStatus: UserProfile['subscriptionStatus'] = data.subscriptionStatus || 'none'
      const existingPlan: string = data.subscriptionPlan || 'none'
      const createdAtMs = data.createdAt ? new Date(data.createdAt).getTime() : nowMs
      const computed24hTrialIso = new Date((!isNaN(createdAtMs) ? createdAtMs : nowMs) + TRIAL_DURATION_24H_MS).toISOString()
      const trialExpiresIso = data.trialExpiresAt || data.trialExpiry || computed24hTrialIso

      const resolvedTier: SubscriptionTierLevel = resolveDefaultTier(
        existingStatus,
        existingPlan,
        data.subscriptionTier,
        existingRole === 'admin'
      )

      // Only write permitted non-privileged login metadata fields so hardened firestore.rules never reject client login
      const safeLoginUpdates = stripUndefinedDeep({
        lastLoginAt: nowIso,
        updatedAt: nowIso,
        name: customName || user.displayName || data.name || (emailLower ? emailLower.split('@')[0] : 'SR Trader'),
        email: user.email || data.email || null,
        photoUrl: user.photoURL || data.photoUrl || null,
        isEmailVerified: Boolean(user.emailVerified || data.isEmailVerified || true),
        subscriptionTier: resolvedTier,
        failedAttempts: 0,
        lockedUntil: 0,
        deviceFingerprint: fp,
      })

      try {
        await updateDoc(userRef, safeLoginUpdates)
      } catch (updateErr) {
        console.warn('[SR-Auth] Non-critical login metadata sync notice:', updateErr)
      }

      const merged: UserProfile = stripUndefinedDeep({
        ...data,
        ...safeLoginUpdates,
        role: existingRole,
        subscriptionStatus: existingStatus,
        subscriptionPlan: existingPlan,
        subscriptionTier: resolvedTier,
        trialExpiresAt: trialExpiresIso,
        trialExpiry: trialExpiresIso,
      })

      notifySessionSubscribers(merged)
      fetch(apiUrl('/api/auth/sync-profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }).catch(() => {})
      return merged
    } else {
      const trialExpiresIso = new Date(nowMs + TRIAL_DURATION_24H_MS).toISOString()
      const newProfile: UserProfile = stripUndefinedDeep({
        uid: user.uid,
        name: customName || user.displayName || (emailLower ? emailLower.split('@')[0] : 'SR Trader'),
        email: user.email || null,
        phone: user.phoneNumber || null,
        photoUrl: user.photoURL || null,
        role: isAdmin ? 'admin' : 'user',
        accountStatus: 'active',
        isEmailVerified: true,
        isPhoneVerified: Boolean(user.phoneNumber),
        trialUsed: true,
        isTrial: !isAdmin,
        trialStart: nowIso,
        trialExpiry: trialExpiresIso,
        trialActivatedAt: nowIso,
        trialExpiresAt: trialExpiresIso,
        subscriptionStatus: isAdmin ? 'PRO' : 'trial',
        subscriptionPlan: isAdmin ? 'sr_terminal_1y' : 'sr_terminal_24h_trial',
        subscriptionTier: isAdmin ? 'LEVEL_3_FUNDED_ELITE' : 'TRIAL_24H',
        subscriptionStart: isAdmin ? nowIso : null,
        subscriptionExpiry: isAdmin ? new Date(nowMs + 365 * 86400000).toISOString() : null,
        autoPayEnabled: false,
        cancelAtPeriodEnd: false,
        failedAttempts: 0,
        lockedUntil: 0,
        deviceFingerprint: fp,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      })
      await setDoc(userRef, newProfile)
      notifySessionSubscribers(newProfile)
      fetch(apiUrl('/api/auth/sync-profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      }).catch(() => {})
      return newProfile
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`)
  }
}

/**
 * Google Sign-In via Firebase Authentication + Cloud Firestore
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  if (!isFirebaseReady() || !auth || !googleProvider) {
    throw new Error('Unable to connect. Please check your internet and try again.')
  }

  const isNative = isAndroidNativeApp()

  if (!isNative) {
    const result = await signInWithPopup(auth, googleProvider)
    const profile = await syncUserProfileInFirestore(result.user)
    if (profile.email) {
      await resetBruteForceLockout(profile.email, profile.uid)
    }
    return profile
  }

  await signInWithRedirect(auth, googleProvider)
  throw new Error('Redirecting to Google Sign-In...')
}

/**
 * Email & Password Registration (Strictly verifies real password & creates Firebase Auth + Firestore user)
 */
export async function registerWithEmail(name: string, email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim() || cleanEmail.split('@')[0]

  const lockStatus = await checkBruteForceLockout(cleanEmail)
  if (lockStatus.locked) {
    const mins = String(Math.floor(lockStatus.remainingSeconds / 60)).padStart(2, '0')
    const secs = String(lockStatus.remainingSeconds % 60).padStart(2, '0')
    throw new Error(`Too many failed attempts. Please try again in ${mins}:${secs}.`)
  }

  if (!isFirebaseReady() || !auth) {
    throw new Error('Unable to connect. Please check your internet and try again.')
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass)
  if (cleanName) {
    await updateProfile(cred.user, { displayName: cleanName }).catch(() => {})
  }
  const profile = await syncUserProfileInFirestore(cred.user, cleanName)
  await resetBruteForceLockout(cleanEmail, profile.uid)
  return profile
}

/**
 * Email & Password Sign-In (Strictly verifies real password via Firebase Auth; records brute-force failures)
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase()

  const lockStatus = await checkBruteForceLockout(cleanEmail)
  if (lockStatus.locked) {
    const mins = String(Math.floor(lockStatus.remainingSeconds / 60)).padStart(2, '0')
    const secs = String(lockStatus.remainingSeconds % 60).padStart(2, '0')
    throw new Error(`Too many failed attempts. Please try again in ${mins}:${secs}.`)
  }

  if (!isFirebaseReady() || !auth) {
    throw new Error('Unable to connect. Please check your internet and try again.')
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass)
    const profile = await syncUserProfileInFirestore(cred.user)
    await resetBruteForceLockout(cleanEmail, profile.uid)
    return profile
  } catch (err: any) {
    const fail = await recordBruteForceFailure(cleanEmail, err?.code || 'INVALID_PASSWORD')
    if (fail.locked) {
      const remSec = Math.max(1, Math.ceil((fail.lockedUntil - Date.now()) / 1000))
      const mins = String(Math.floor(remSec / 60)).padStart(2, '0')
      const secs = String(remSec % 60).padStart(2, '0')
      throw new Error(`Too many failed attempts. Please try again in ${mins}:${secs}.`)
    }
    throw new Error('Invalid email or password. Please check your details and try again.')
  }
}

/**
 * Step B: Request 1-Hour Single-Use Forgot Password Link via Brevo Transactional HTTPS API
 * Stores SHA-256 tokenHash in Firestore `password_resets` (`expiresAt = Date.now() + 60 * 60 * 1000`, `used: false`).
 */
export async function requestForgotPasswordLink(
  email: string,
  honeypot = ''
): Promise<{
  success: boolean
  message: string
}> {
  const cleanEmail = (email || '').trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid registered email address.')
  }

  const fp = getDeviceFingerprint()
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://ais-pre-72tc6y7p7dv2upr3ewjnp6-257338808391.asia-east1.run.app'

  const response = await fetch(apiUrl('/api/auth/forgot-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fp,
    },
    body: JSON.stringify({
      email: cleanEmail,
      origin,
      honeypot,
      deviceFingerprint: fp,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.success) {
    throw new Error(toUserFriendlyError(data?.error || 'Something went wrong. Please try again in a moment.'))
  }

  // Persist hashed reset token metadata in Firestore `password_resets/{tokenHash}` with 1-hour expiry
  if (db && data.tokenHash) {
    try {
      await setDoc(
        doc(db, 'password_resets', String(data.tokenHash)),
        stripUndefinedDeep({
          tokenHash: String(data.tokenHash),
          email: cleanEmail,
          expiresAt: Number(data.expiresAt || Date.now() + 60 * 60 * 1000),
          createdAt: Date.now(),
          used: false,
        })
      )
    } catch {
      // Server-side hashed token store remains primary
    }
  }

  return {
    success: true,
    message:
      data.message ||
      'If an account exists for this email, a password reset link (valid for 1 hour) has been sent. Please check your inbox and spam folder.',
  }
}

/**
 * Step C: Verify 1-Hour Single-Use Reset Token & Update Password in Firebase Auth + Firestore `users/{uid}`
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{
  success: boolean
  email?: string
  message: string
}> {
  const cleanToken = (token || '').trim()
  if (!cleanToken || cleanToken.length < 16) {
    throw new Error('This reset link has expired or was already used. Please request a new one.')
  }
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.')
  }

  const fp = getDeviceFingerprint()
  const response = await fetch(apiUrl('/api/auth/reset-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fp,
    },
    body: JSON.stringify({
      token: cleanToken,
      newPassword,
      deviceFingerprint: fp,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.success) {
    throw new Error(
      toUserFriendlyError(
        data?.error || 'This reset link has expired or was already used. Please request a new one.'
      )
    )
  }

  // Mark token as `used: true` in Firestore `password_resets/{tokenHash}` if present
  if (db && data.tokenHash) {
    try {
      await setDoc(
        doc(db, 'password_resets', String(data.tokenHash)),
        {
          used: true,
          usedAt: Date.now(),
        },
        { merge: true }
      )
    } catch {}
  }

  if (data.email) {
    await resetBruteForceLockout(String(data.email))
  }

  return {
    success: true,
    email: data.email,
    message: data.message || 'Your password has been updated. You can now sign in with your new password.',
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  await requestForgotPasswordLink(email)
}

export async function signOutUser(): Promise<void> {
  activeProfileMemory = null
  notifySessionSubscribers(null)
  if (auth) {
    try {
      await signOut(auth)
    } catch (err) {
      console.warn('Firebase signOut error:', err)
    }
  }
}

export async function requestAccountDeletion(uid: string, reason: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore database not available')
  }
  try {
    await addDoc(collection(db, 'deletionRequests'), {
      uid,
      reason: reason.trim() || 'User requested account deletion from app',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    })
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'deletionRequests')
  }
}

export function subscribeUserProfile(callback: (profile: UserProfile | null) => void): () => void {
  sessionSubscribers.add(callback)

  if (activeProfileMemory) {
    callback(activeProfileMemory)
  }

  if (!isFirebaseReady() || !auth) {
    callback(activeProfileMemory)
    return () => {
      sessionSubscribers.delete(callback)
    }
  }

  getRedirectResult(auth)
    .then(async (result) => {
      if (result?.user) {
        const profile = await syncUserProfileInFirestore(result.user)
        callback(profile)
      }
    })
    .catch((err) => {
      console.warn('Redirect sign-in check:', err)
    })

  let unsubFirestore: (() => void) | null = null

  const unsubAuth = onAuthStateChanged(auth, async (user) => {
    if (unsubFirestore) {
      unsubFirestore()
      unsubFirestore = null
    }

    if (!user) {
      activeProfileMemory = null
      callback(null)
      return
    }

    const initialProfile = await syncUserProfileInFirestore(user)
    callback(initialProfile)

    if (db) {
      const userRef = doc(db, 'users', user.uid)
      unsubFirestore = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile
            activeProfileMemory = data
            callback(data)
          }
        },
        (err) => {
          console.warn('User profile snapshot listener warning:', err)
        }
      )
    }
  })

  return () => {
    sessionSubscribers.delete(callback)
    unsubAuth()
    if (unsubFirestore) unsubFirestore()
  }
}

export function subscribeToUserDoc(
  uid: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  if (!uid || !isFirebaseReady() || !db) {
    return () => {}
  }

  const userRef = doc(db, 'users', uid)
  const unsubscribe = onSnapshot(
    userRef,
    (snap) => {
      if (!snap.exists()) {
        activeProfileMemory = null
        notifySessionSubscribers(null)
        callback(null)
        return
      }

      const data = snap.data() as UserProfile
      let currentStatus = data.subscriptionStatus || 'none'
      const expDate = data.subscriptionExpiry || data.trialExpiry
      if (
        (currentStatus === 'active' ||
          currentStatus === 'PRO' ||
          currentStatus === 'trial' ||
          (currentStatus === 'cancelled' && data.cancelAtPeriodEnd)) &&
        expDate
      ) {
        const expTime = new Date(expDate).getTime()
        if (!isNaN(expTime) && Date.now() >= expTime) {
          currentStatus = currentStatus === 'trial' ? 'trial_expired' : 'expired'
          data.subscriptionStatus = currentStatus
          updateDoc(userRef, {
            subscriptionStatus: currentStatus,
            updatedAt: new Date().toISOString(),
          }).catch(() => {})
        }
      }

      activeProfileMemory = data
      notifySessionSubscribers(data)
      fetch(apiUrl('/api/auth/sync-profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {})
      callback(data)
    },
    (err) => {
      console.warn('[SR-Realtime] Firestore snapshot listener warning:', err)
    }
  )

  return () => {
    unsubscribe()
  }
}
