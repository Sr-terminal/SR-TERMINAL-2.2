import { doc, updateDoc, setDoc, collection, addDoc } from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from './firebase'
import { type UserProfile, type SubscriptionTierLevel, isAndroidNativeApp, setManualSessionProfile, getDeviceFingerprint } from './authService'
import { apiUrl } from './apiConfig'
import { stripUndefinedDeep, toUserFriendlyError } from './errorSanitizer'

export const APP_PACKAGE_NAME = 'com.SRterminal.srterminal'
export const GOOGLE_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${APP_PACKAGE_NAME}`
export const GOOGLE_PLAY_SUBSCRIPTIONS_URL = `https://play.google.com/store/account/subscriptions?package=${APP_PACKAGE_NAME}`
export const PRIVACY_POLICY_URL = 'https://sr-terminal.app/privacy'
export const TRIAL_PLAN_ID = 'sr_terminal_24h_trial'
export const TRIAL_DURATION_HOURS = 24
export const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000 // Strict 24-Hour Free Trial

export type RewardedFeatureKey =
  | 'basic_chart_view'
  | 'basic_ai_agent_question'
  | 'basic_news_breakdown'

export interface SubscriptionPlan {
  id: string
  tier: SubscriptionTierLevel
  tierLevel: 1 | 2 | 3
  levelBadge: string
  name: string
  durationLabel: string
  durationDays: number
  priceDisplay: string
  priceInr: number
  originalPriceDisplay?: string
  badge?: string
  popular?: boolean
  adFreeLabel: string
  features: string[]
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sr_terminal_30d',
    tier: 'LEVEL_1_STARTER',
    tierLevel: 1,
    levelBadge: 'LEVEL 1 · STARTER PRO',
    name: 'Starter Pro Plan',
    durationLabel: '30 Days Access',
    durationDays: 30,
    priceDisplay: '₹999',
    priceInr: 999,
    originalPriceDisplay: '₹1,499',
    badge: '100% AD-FREE',
    adFreeLabel: '100% AD-FREE · ZERO ADS',
    features: [
      '100% Ad-Free Workspace (Removes All Rewarded & Banner Ads)',
      'Live Zero-Gap Institutional Tick Charts & Drawing Tools',
      'Red-Folder High-Impact News & IST Countdown Radar',
      '1–2 Daily Validated ICT Confluent Setups (London/NY)',
      'Basic AI Agent & Auto-Synced Cloud Chart Drawings',
    ],
  },
  {
    id: 'sr_terminal_2m',
    tier: 'LEVEL_2_ADVANCED',
    tierLevel: 2,
    levelBadge: 'LEVEL 2 · ADVANCED PRO',
    name: 'Advanced Pro Plan',
    durationLabel: '60 Days Access',
    durationDays: 60,
    priceDisplay: '₹1,899',
    priceInr: 1899,
    originalPriceDisplay: '₹2,499',
    badge: 'MOST POPULAR · AD-FREE',
    popular: true,
    adFreeLabel: '100% AD-FREE · FULL ICT + AI DESK',
    features: [
      'Everything in Level 1 (100% Ad-Free + Live Charts & News)',
      'All 1–4 Daily A+ Institutional ICT Signals (Protected SL)',
      'Historical Bar-by-Bar Chart Replay & Zero-Lookahead Backtest',
      'Full Win/Loss Analytics Report & Cloud Trade Journal',
      'AI Trading Agent & 24/7 Closed-App FCM Push Alerts',
    ],
  },
  {
    id: 'sr_terminal_1y',
    tier: 'LEVEL_3_FUNDED_ELITE',
    tierLevel: 3,
    levelBadge: 'LEVEL 3 · INSTITUTIONAL FUNDED ELITE',
    name: 'Institutional Funded Elite',
    durationLabel: '365 Days Access',
    durationDays: 365,
    priceDisplay: '₹12,999',
    priceInr: 12999,
    originalPriceDisplay: '₹19,999',
    badge: 'PROP FIRM PASS ENGINE · AD-FREE',
    adFreeLabel: '100% AD-FREE · PROP FIRM PASS MANAGER',
    features: [
      'Everything in Level 2 (All 1–4 A+ ICT Signals, AI Trading Agent & 24/7 Push)',
      'Full Funded Account / Prop Firm Pass Manager ($5K–$200K+)',
      'Ment Funding, Blue Guardian, Goat Funded, FTMO & FundedNext Presets',
      '60% Internal Daily Loss Safety Shield & Auto Recovery Mode',
      'Static/Trailing Drawdown Watermark Meter & Consistency Rule Calculator',
      'Funded-Only A+ Live Trade Feed (Min 1:2.5 R:R + Mandatory SL Guard)',
    ],
  },
]

export interface EntitlementState {
  isActive: boolean
  isTrial: boolean
  isPro: boolean
  isAdFree: boolean
  isFreeAdSupported: boolean
  isBlocked: boolean
  isExpired: boolean
  autoPayEnabled: boolean
  cancelAtPeriodEnd: boolean
  status: UserProfile['subscriptionStatus']
  tier: SubscriptionTierLevel
  tierLevel: 0 | 1 | 2 | 3
  tierBadge: string
  maxDailySignals: number
  canAccessStarterFeatures: boolean
  canAccessAdvancedFeatures: boolean
  canAccessFundedEliteManager: boolean
  planName: string
  daysRemaining: number
  hoursRemaining: number
  trialRemainingMs: number
  trialRemainingSeconds: number
  trialCountdownHhMmSs: string
  expiryDate: string | null
  expiryDateFormatted: string | null
}

// ============================================================================
// REWARDED AD UNLOCK ENGINE FOR POST-24H-TRIAL FREE USERS
// Strict 5-Ads/Day Server & Firestore Cap (`users/{uid}.adUsage`) · Basic Features Only
// ============================================================================
const ALLOWED_BASIC_FEATURES: ReadonlySet<string> = new Set<RewardedFeatureKey>([
  'basic_chart_view',
  'basic_ai_agent_question',
  'basic_news_breakdown',
])
const REWARDED_AD_UNLOCK_DURATION_MS = 30 * 60 * 1000
const MAX_DAILY_REWARDED_ADS_HIDDEN = 5
const rewardedUnlocksMap = new Map<RewardedFeatureKey, number>()
const rewardedUnlockListeners = new Set<() => void>()

export function formatTrialCountdownHhMmSs(remainingMs: number): string {
  const safeMs = Math.max(0, remainingMs)
  const totalSec = Math.floor(safeMs / 1000)
  const hrs = Math.floor(totalSec / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function isBasicRewardedFeature(featureKey?: string | null): featureKey is RewardedFeatureKey {
  return Boolean(featureKey && ALLOWED_BASIC_FEATURES.has(featureKey))
}

export function isFeatureUnlockedByRewardedAd(featureKey: RewardedFeatureKey): boolean {
  if (!isBasicRewardedFeature(featureKey)) return false
  const expiresAt = rewardedUnlocksMap.get(featureKey) || 0
  return expiresAt > Date.now()
}

export const isRewardedFeatureUnlocked = isFeatureUnlockedByRewardedAd

export function getRewardedAdUnlockRemainingMinutes(featureKey: RewardedFeatureKey): number {
  const expiresAt = rewardedUnlocksMap.get(featureKey) || 0
  const diff = expiresAt - Date.now()
  return diff > 0 ? Math.ceil(diff / 60000) : 0
}

export const getRewardedUnlockRemainingMinutes = getRewardedAdUnlockRemainingMinutes

export function hasReachedDailyRewardedAdLimit(userProfile?: UserProfile | null): boolean {
  if (!userProfile?.adUsage) return false
  const todayStr = new Date().toISOString().slice(0, 10)
  return (
    userProfile.adUsage.date === todayStr &&
    Number(userProfile.adUsage.count || 0) >= MAX_DAILY_REWARDED_ADS_HIDDEN
  )
}

export function grantRewardedAdFeatureUnlock(featureKey: RewardedFeatureKey): number {
  if (!isBasicRewardedFeature(featureKey)) return 0
  const expiresAt = Date.now() + REWARDED_AD_UNLOCK_DURATION_MS
  rewardedUnlocksMap.set(featureKey, expiresAt)
  rewardedUnlockListeners.forEach((cb) => {
    try {
      cb()
    } catch {}
  })
  return expiresAt
}

/**
 * Consumes 1 Rewarded Ad watch for a BASIC feature only, enforcing the hidden 5-ads/day cap
 * in both Firestore (`users/{uid}.adUsage`) and backend (`POST /api/billing/consume-rewarded-ad`).
 * Clearing app cache or reinstalling cannot reset the counter.
 */
export async function consumeRewardedAdUnlock(
  featureKey: RewardedFeatureKey,
  userProfile?: UserProfile | null
): Promise<{
  success: boolean
  limitReached?: boolean
  expiresAt?: number
  message: string
}> {
  if (!isBasicRewardedFeature(featureKey)) {
    return {
      success: false,
      message: 'This Pro feature cannot be unlocked via ads. Upgrade to an Ad-Free Pro plan for full access.',
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const currentFirestoreCount =
    userProfile?.adUsage?.date === todayStr ? Number(userProfile.adUsage.count || 0) : 0

  if (currentFirestoreCount >= MAX_DAILY_REWARDED_ADS_HIDDEN) {
    return {
      success: false,
      limitReached: true,
      message: 'Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.',
    }
  }

  let nextCount = currentFirestoreCount + 1
  const fp = getDeviceFingerprint()

  // 1. Server-side check & increment
  try {
    const res = await fetch(apiUrl('/api/billing/consume-rewarded-ad'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp,
      },
      body: JSON.stringify({
        uid: userProfile?.uid || '',
        email: userProfile?.email || '',
        featureKey,
        deviceFingerprint: fp,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 429 || data?.limitReached) {
      return {
        success: false,
        limitReached: true,
        message: 'Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.',
      }
    }
    if (!res.ok) {
      return {
        success: false,
        limitReached: true,
        message: 'Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.',
      }
    }
    if (typeof data?.adUsage?.count === 'number') {
      nextCount = Math.max(nextCount, data.adUsage.count)
    }
  } catch {
    // Offline fallback still enforces Firestore count below
  }

  if (nextCount > MAX_DAILY_REWARDED_ADS_HIDDEN) {
    return {
      success: false,
      limitReached: true,
      message: 'Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.',
    }
  }

  // 2. Native AdMob Rewarded Video Ad if running on Android APK
  try {
    const capAdMob = typeof window !== 'undefined' ? (window as any).Capacitor?.Plugins?.AdMob : null
    if (capAdMob && typeof capAdMob.showRewardVideoAd === 'function') {
      await capAdMob
        .prepareRewardVideoAd?.({
          adId: 'ca-app-pub-3940256099942544/5224354917',
          isTesting: false,
        })
        .catch(() => {})
      await capAdMob.showRewardVideoAd().catch(() => {})
    }
  } catch {}

  const updatedAdUsage = {
    date: todayStr,
    count: nextCount,
  }

  // 3. Persist updated adUsage in Firestore `users/{uid}`
  if (db && userProfile?.uid) {
    try {
      const nowIso = new Date().toISOString()
      await updateDoc(doc(db, 'users', userProfile.uid), {
        adUsage: updatedAdUsage,
        updatedAt: nowIso,
      })
      setManualSessionProfile({
        ...userProfile,
        adUsage: updatedAdUsage,
        updatedAt: nowIso,
      })
    } catch {
      // Non-fatal if server Admin SDK already wrote it
    }
  }

  const expiresAt = grantRewardedAdFeatureUnlock(featureKey)
  return {
    success: true,
    expiresAt,
    message: 'Unlocked.',
  }
}

export function subscribeRewardedAdUnlocks(cb: () => void): () => void {
  rewardedUnlockListeners.add(cb)
  return () => {
    rewardedUnlockListeners.delete(cb)
  }
}

export const subscribeRewardedUnlocks = subscribeRewardedAdUnlocks

export async function triggerNativeAdMobRewardedAd(
  featureKey: RewardedFeatureKey,
  userProfile?: UserProfile | null
): Promise<{
  handledNatively: boolean
  rewarded: boolean
  limitReached?: boolean
  errorMessage?: string
}> {
  if (hasReachedDailyRewardedAdLimit(userProfile)) {
    return {
      handledNatively: true,
      rewarded: false,
      limitReached: true,
      errorMessage: 'Daily free unlock limit reached. Upgrade to an Ad-Free Pro plan for uninterrupted access.',
    }
  }
  return { handledNatively: false, rewarded: false }
}

function resolvePlanTier(planId: string, explicitTier?: SubscriptionTierLevel): {
  tier: SubscriptionTierLevel
  tierLevel: 1 | 2 | 3
} {
  if (explicitTier === 'LEVEL_3_FUNDED_ELITE' || planId === 'sr_terminal_1y' || planId === 'com.srterminal.pro.funded_elite') {
    return { tier: 'LEVEL_3_FUNDED_ELITE', tierLevel: 3 }
  }
  if (explicitTier === 'LEVEL_2_ADVANCED' || planId === 'sr_terminal_2m' || planId === 'com.srterminal.pro.advanced') {
    return { tier: 'LEVEL_2_ADVANCED', tierLevel: 2 }
  }
  return { tier: 'LEVEL_1_STARTER', tierLevel: 1 }
}

/**
 * Evaluates whether the user has an active 24-Hour Free Trial, Paid Ad-Free Tier (Level 1 / 2 / 3),
 * or Post-Trial Free (Ad-Supported) tier.
 * RBI Auto-Pay Rule: When a user cancels Auto-Pay (`cancelAtPeriodEnd: true`, `autoPayEnabled: false`),
 * their paid Pro subscription remains 100% active and non-refundable until `subscriptionExpiry`.
 */
export function evaluateEntitlement(profile: UserProfile | null, nowMs = Date.now()): EntitlementState {
  if (!profile) {
    return {
      isActive: false,
      isTrial: false,
      isPro: false,
      isAdFree: false,
      isFreeAdSupported: true,
      isBlocked: false,
      isExpired: false,
      autoPayEnabled: false,
      cancelAtPeriodEnd: false,
      status: 'none',
      tier: 'FREE_AD_SUPPORTED',
      tierLevel: 0,
      tierBadge: 'FREE · AD-SUPPORTED',
      maxDailySignals: 1,
      canAccessStarterFeatures: false,
      canAccessAdvancedFeatures: false,
      canAccessFundedEliteManager: false,
      planName: 'Free (Ad-Supported)',
      daysRemaining: 0,
      hoursRemaining: 0,
      trialRemainingMs: 0,
      trialRemainingSeconds: 0,
      trialCountdownHhMmSs: '00:00:00',
      expiryDate: null,
      expiryDateFormatted: null,
    }
  }

  if (profile.accountStatus === 'blocked' || profile.accountStatus === 'suspended' || profile.subscriptionStatus === 'blocked') {
    return {
      isActive: false,
      isTrial: false,
      isPro: false,
      isAdFree: false,
      isFreeAdSupported: false,
      isBlocked: true,
      isExpired: false,
      autoPayEnabled: false,
      cancelAtPeriodEnd: false,
      status: 'blocked',
      tier: 'FREE_AD_SUPPORTED',
      tierLevel: 0,
      tierBadge: 'SUSPENDED',
      maxDailySignals: 0,
      canAccessStarterFeatures: false,
      canAccessAdvancedFeatures: false,
      canAccessFundedEliteManager: false,
      planName: 'Account Suspended',
      daysRemaining: 0,
      hoursRemaining: 0,
      trialRemainingMs: 0,
      trialRemainingSeconds: 0,
      trialCountdownHhMmSs: '00:00:00',
      expiryDate: null,
      expiryDateFormatted: null,
    }
  }

  // Authorized Administrator always has full Level 3 Institutional Funded Elite access
  if (profile.role === 'admin' || (profile.email || '').toLowerCase() === 'surajrayxyz09@gmail.com') {
    return {
      isActive: true,
      isTrial: false,
      isPro: true,
      isAdFree: true,
      isFreeAdSupported: false,
      isBlocked: false,
      isExpired: false,
      autoPayEnabled: true,
      cancelAtPeriodEnd: false,
      status: 'PRO',
      tier: 'LEVEL_3_FUNDED_ELITE',
      tierLevel: 3,
      tierBadge: 'L3 · FUNDED ELITE',
      maxDailySignals: 4,
      canAccessStarterFeatures: true,
      canAccessAdvancedFeatures: true,
      canAccessFundedEliteManager: true,
      planName: 'Level 3 · Institutional Funded Elite',
      daysRemaining: 365,
      hoursRemaining: 365 * 24,
      trialRemainingMs: 0,
      trialRemainingSeconds: 0,
      trialCountdownHhMmSs: '00:00:00',
      expiryDate: 'Unlimited Admin License',
      expiryDateFormatted: 'Unlimited Admin License',
    }
  }

  const status = profile.subscriptionStatus
  const createdAtMs = profile.createdAt ? new Date(profile.createdAt).getTime() : nowMs
  const default24hExpiryIso = new Date((!isNaN(createdAtMs) ? createdAtMs : nowMs) + TRIAL_DURATION_MS).toISOString()
  const trialExpiresIso = profile.trialExpiresAt || profile.trialExpiry || default24hExpiryIso
  const trialExpiryMs = new Date(trialExpiresIso).getTime()
  const paidExpiryIso = profile.subscriptionExpiry
  const paidExpiryMs = paidExpiryIso ? new Date(paidExpiryIso).getTime() : 0

  const cancelAtPeriodEnd = Boolean(profile.cancelAtPeriodEnd)
  const autoPayEnabled = cancelAtPeriodEnd
    ? false
    : typeof profile.autoPayEnabled === 'boolean'
    ? profile.autoPayEnabled
    : status === 'PRO' || status === 'active'

  // 1. Check active Paid Subscription (including RBI-compliant cancelled Auto-Pay that hasn't reached subscriptionExpiry)
  const isPaidStatus =
    status === 'active' ||
    status === 'PRO' ||
    (status === 'cancelled' && cancelAtPeriodEnd)

  if (isPaidStatus && paidExpiryMs > nowMs) {
    const diffMs = paidExpiryMs - nowMs
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    const hoursRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)))
    const { tier, tierLevel } = resolvePlanTier(profile.subscriptionPlan, profile.subscriptionTier)
    const matchedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === profile.subscriptionPlan || p.tier === tier)
    const formattedExp = new Date(paidExpiryMs).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    return {
      isActive: true,
      isTrial: false,
      isPro: true,
      isAdFree: true,
      isFreeAdSupported: false,
      isBlocked: false,
      isExpired: false,
      autoPayEnabled,
      cancelAtPeriodEnd,
      status: 'PRO',
      tier,
      tierLevel,
      tierBadge:
        tierLevel === 3
          ? 'L3 · FUNDED ELITE'
          : tierLevel === 2
          ? 'L2 · ADVANCED PRO'
          : 'L1 · STARTER PRO',
      maxDailySignals: tierLevel >= 2 ? 4 : 2,
      canAccessStarterFeatures: true,
      canAccessAdvancedFeatures: tierLevel >= 2,
      canAccessFundedEliteManager: tierLevel >= 3,
      planName: matchedPlan ? `${matchedPlan.levelBadge}` : 'Level 2 · Advanced Pro',
      daysRemaining,
      hoursRemaining,
      trialRemainingMs: 0,
      trialRemainingSeconds: 0,
      trialCountdownHhMmSs: '00:00:00',
      expiryDate: formattedExp,
      expiryDateFormatted: formattedExp,
    }
  }

  // 2. Check active 24-Hour Free Trial
  const isWithin24hTrial =
    !isNaN(trialExpiryMs) &&
    trialExpiryMs > nowMs &&
    (status === 'trial' || (status === 'none' && !paidExpiryIso))

  if (isWithin24hTrial) {
    const trialRemainingMs = Math.max(0, trialExpiryMs - nowMs)
    const trialRemainingSeconds = Math.max(0, Math.floor(trialRemainingMs / 1000))
    const hoursRemaining = Math.max(1, Math.ceil(trialRemainingMs / (1000 * 60 * 60)))
    const formattedExp = new Date(trialExpiryMs).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return {
      isActive: true,
      isTrial: true,
      isPro: false,
      isAdFree: true,
      isFreeAdSupported: false,
      isBlocked: false,
      isExpired: false,
      autoPayEnabled: false,
      cancelAtPeriodEnd: false,
      status: 'trial',
      tier: 'TRIAL_24H',
      tierLevel: 3, // Full access during 24-Hour Free Trial
      tierBadge: '24H FREE TRIAL',
      maxDailySignals: 4,
      canAccessStarterFeatures: true,
      canAccessAdvancedFeatures: true,
      canAccessFundedEliteManager: true,
      planName: '24-Hour Free Trial',
      daysRemaining: 1,
      hoursRemaining,
      trialRemainingMs,
      trialRemainingSeconds,
      trialCountdownHhMmSs: formatTrialCountdownHhMmSs(trialRemainingMs),
      expiryDate: formattedExp,
      expiryDateFormatted: formattedExp,
    }
  }

  // 3. Post-Trial / Expired -> Switch to Free (Ad-Supported) Tier
  const expiredType =
    status === 'trial' || status === 'trial_expired' || (!paidExpiryIso && trialExpiryMs <= nowMs)
      ? 'trial_expired'
      : 'expired'
  const formattedExp = paidExpiryIso
    ? new Date(paidExpiryMs).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return {
    isActive: false,
    isTrial: false,
    isPro: false,
    isAdFree: false,
    isFreeAdSupported: true,
    isBlocked: false,
    isExpired: true,
    autoPayEnabled: false,
    cancelAtPeriodEnd: false,
    status: expiredType,
    tier: 'FREE_AD_SUPPORTED',
    tierLevel: 0,
    tierBadge: 'FREE · AD-SUPPORTED',
    maxDailySignals: 1,
    canAccessStarterFeatures: false,
    canAccessAdvancedFeatures: false,
    canAccessFundedEliteManager: false,
    planName: 'Free Tier (Ad-Supported)',
    daysRemaining: 0,
    hoursRemaining: 0,
    trialRemainingMs: 0,
    trialRemainingSeconds: 0,
    trialCountdownHhMmSs: '00:00:00',
    expiryDate: formattedExp,
    expiryDateFormatted: formattedExp,
  }
}

/**
 * Activates the one-time 24-Hour Free Trial in Cloud Firestore (`users/{uid}`)
 */
export async function start24HourFreeTrial(profile: UserProfile): Promise<{
  success: boolean
  message: string
}> {
  if (!db) {
    return {
      success: false,
      message: 'Cloud database connection unavailable. Please check your internet connection.',
    }
  }

  const createdAtMs = profile.createdAt ? new Date(profile.createdAt).getTime() : Date.now()
  const existingTrialExp = profile.trialExpiresAt || profile.trialExpiry
  if (
    profile.trialUsed &&
    existingTrialExp &&
    new Date(existingTrialExp).getTime() <= Date.now()
  ) {
    return {
      success: false,
      message: 'Your 24-Hour Free Trial has already been completed. Use Rewarded Ads or upgrade to an Ad-Free Pro Tier.',
    }
  }

  try {
    const now = new Date()
    const baseMs = !isNaN(createdAtMs) && Date.now() - createdAtMs < TRIAL_DURATION_MS ? createdAtMs : now.getTime()
    const startTime = new Date(baseMs).toISOString()
    const expiryDate = new Date(baseMs + TRIAL_DURATION_MS)
    const expiryTime = expiryDate.toISOString()

    const userRef = doc(db, 'users', profile.uid)
    await setDoc(
      userRef,
      stripUndefinedDeep({
        trialUsed: true,
        isTrial: true,
        trialStart: startTime,
        trialExpiry: expiryTime,
        trialActivatedAt: startTime,
        trialExpiresAt: expiryTime,
        subscriptionStatus: 'trial',
        subscriptionPlan: TRIAL_PLAN_ID,
        subscriptionTier: 'TRIAL_24H',
        updatedAt: now.toISOString(),
      }),
      { merge: true }
    )

    await addDoc(
      collection(db, 'subscriptions'),
      stripUndefinedDeep({
        uid: profile.uid,
        productId: TRIAL_PLAN_ID,
        planName: '24-Hour Free Trial',
        orderId: `TRIAL24H_${profile.uid}_${Date.now()}`,
        purchaseToken: `trial24h_token_${profile.uid}`,
        status: 'TRIAL',
        autoPayEnabled: false,
        cancelAtPeriodEnd: false,
        startTime,
        expiryTime,
        verifiedAt: now.toISOString(),
      })
    )

    return {
      success: true,
      message: `24-Hour Free Trial Activated! Full Ad-Free Institutional Access unlocked until ${expiryDate.toLocaleString('en-IN')}.`,
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`)
    } catch {}
    return {
      success: false,
      message: 'Could not activate 24-Hour Free Trial. Please check your connection and try again.',
    }
  }
}

// Keep alias so any existing callers compile cleanly
export const start7DayFreeTrial = start24HourFreeTrial

/**
 * Initiates a Google Play Billing purchase flow for `com.SRterminal.srterminal`
 * with server-side purchase token verification updating Firestore `subscriptions` and `users.subscriptionStatus = 'PRO'`
 * along with the user's progressive Ad-Free tier (`LEVEL_1_STARTER`, `LEVEL_2_ADVANCED`, or `LEVEL_3_FUNDED_ELITE`).
 */
export async function purchaseSubscription(
  planId: string,
  profile: UserProfile | null
): Promise<{
  success: boolean
  message: string
  orderId?: string
}> {
  if (!profile) {
    return {
      success: false,
      message: 'Please sign in with your account first to link your subscription.',
    }
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) {
    return { success: false, message: 'Invalid subscription plan selected.' }
  }

  let purchaseToken = `gp_tok_${APP_PACKAGE_NAME}_${plan.id}_${profile.uid}_${Date.now()}`
  let orderId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}`

  // 1. Check for Native Android Google Play Billing Bridge (`com.SRterminal.srterminal`)
  if (typeof window !== 'undefined' && isAndroidNativeApp()) {
    const androidBilling = (window as any).AndroidBilling || (window as any).SRBillingBridge
    if (androidBilling && typeof androidBilling.launchPurchaseFlow === 'function') {
      try {
        const rawResult = await androidBilling.launchPurchaseFlow(plan.id, profile.uid)
        const result = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult
        if (result && result.success && result.purchaseToken) {
          purchaseToken = String(result.purchaseToken)
          if (result.orderId) orderId = String(result.orderId)
        } else if (result && result.cancelled) {
          return {
            success: false,
            message: result?.message || 'Google Play purchase was cancelled.',
          }
        }
      } catch (err: any) {
        return {
          success: false,
          message: toUserFriendlyError(err, 'Google Play Billing error occurred.'),
        }
      }
    }
  }

  // 2. Server-side Purchase Token Verification (`/api/billing/verify-purchase`)
  try {
    const verifyRes = await fetch(apiUrl('/api/billing/verify-purchase'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageName: APP_PACKAGE_NAME,
        uid: profile.uid,
        email: profile.email,
        planId: plan.id,
        tier: plan.tier,
        durationDays: plan.durationDays,
        purchaseToken,
        orderId,
      }),
    })
    const verifyData = await verifyRes.json().catch(() => ({}))
    if (!verifyRes.ok || !verifyData?.success) {
      return {
        success: false,
        message: toUserFriendlyError(verifyData?.error, 'Unable to verify subscription purchase right now.'),
      }
    }

    const startTime = verifyData.startTime || new Date().toISOString()
    const expiryTime =
      verifyData.expiryTime || new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString()
    const verifiedOrderId = verifyData.orderId || orderId

    await recordVerifiedPurchaseInFirestore(
      profile.uid,
      plan,
      verifiedOrderId,
      purchaseToken,
      startTime,
      expiryTime
    )

    return {
      success: true,
      orderId: verifiedOrderId,
      message: `${plan.levelBadge} (${plan.name}) verified! 100% Ad-Free institutional access unlocked until ${new Date(
        expiryTime
      ).toLocaleDateString('en-IN')}.`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: toUserFriendlyError(err, 'Could not complete server-side purchase verification.'),
    }
  }
}

async function recordVerifiedPurchaseInFirestore(
  uid: string,
  plan: SubscriptionPlan,
  orderId: string,
  purchaseToken: string,
  startTime: string,
  expiryTime: string
): Promise<void> {
  if (!db) {
    throw new Error('Unable to connect. Please check your internet and try again.')
  }

  const nowIso = new Date().toISOString()

  try {
    await addDoc(
      collection(db, 'subscriptions'),
      stripUndefinedDeep({
        uid,
        productId: plan.id,
        planName: `${plan.levelBadge} — ${plan.name}`,
        orderId,
        purchaseToken,
        status: 'PRO',
        autoPayEnabled: true,
        cancelAtPeriodEnd: false,
        startTime,
        expiryTime,
        verifiedAt: nowIso,
      })
    )

    const userRef = doc(db, 'users', uid)
    await setDoc(
      userRef,
      stripUndefinedDeep({
        isTrial: false,
        trialUsed: true,
        subscriptionStatus: 'PRO',
        subscriptionPlan: plan.id,
        subscriptionTier: plan.tier,
        subscriptionStart: startTime,
        subscriptionExpiry: expiryTime,
        autoPayEnabled: true,
        cancelAtPeriodEnd: false,
        autoPayCancelledAt: null,
        lastOrderId: orderId,
        lastPurchaseToken: purchaseToken,
        updatedAt: nowIso,
      }),
      { merge: true }
    )
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`)
  }
}

/**
 * RBI-Compliant Subscription Cancellation & Auto-Pay Control:
 * - Sets `autoPayEnabled: false` and `cancelAtPeriodEnd: true` in Firestore `users/{uid}` and backend server.
 * - Cancelling Auto-Pay stops all future recurring charges while keeping the user's current paid Pro
 *   subscription 100% active and non-refundable until `subscriptionExpiry`.
 */
export async function cancelRecurringAutoPay(profile: UserProfile): Promise<{
  success: boolean
  message: string
  expiryFormatted?: string
}> {
  if (!profile?.uid) {
    return { success: false, message: 'User session not found.' }
  }

  const nowIso = new Date().toISOString()
  const expiryIso = profile.subscriptionExpiry || profile.trialExpiry
  const expiryFormatted = expiryIso
    ? new Date(expiryIso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'your current billing period end'

  try {
    // 1. Sync with backend RBI Auto-Pay cancellation ledger
    await fetch(apiUrl('/api/billing/cancel-autopay'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: profile.uid,
        email: profile.email,
        subscriptionExpiry: expiryIso,
      }),
    }).catch(() => {})

    // 2. Update Cloud Firestore `users/{uid}` — keep `subscriptionStatus: 'PRO'` active until `subscriptionExpiry`
    if (db) {
      const userRef = doc(db, 'users', profile.uid)
      await updateDoc(
        userRef,
        stripUndefinedDeep({
          autoPayEnabled: false,
          cancelAtPeriodEnd: true,
          autoPayCancelledAt: nowIso,
          subscriptionStatus: profile.subscriptionStatus === 'trial' ? 'trial' : 'PRO',
          updatedAt: nowIso,
        })
      )

      await addDoc(
        collection(db, 'subscriptions'),
        stripUndefinedDeep({
          uid: profile.uid,
          productId: profile.subscriptionPlan || 'sr_terminal_30d',
          planName: 'Auto-Pay Mandate Cancelled (Active Until Expiry)',
          orderId: profile.lastOrderId || `AUTOPAY_CANCEL_${Date.now()}`,
          purchaseToken: profile.lastPurchaseToken || `cancel_tok_${profile.uid}`,
          status: 'PRO',
          autoPayEnabled: false,
          cancelAtPeriodEnd: true,
          cancelledAt: nowIso,
          startTime: profile.subscriptionStart || nowIso,
          expiryTime: expiryIso || nowIso,
          verifiedAt: nowIso,
        })
      )
    }

    return {
      success: true,
      expiryFormatted,
      message: `Auto-Pay recurring mandate cancelled. No future recurring charges will be deducted. Your current paid Pro subscription remains 100% active and non-refundable until ${expiryFormatted}.`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: toUserFriendlyError(err, 'Unable to update Auto-Pay mandate status. Please try again.'),
    }
  }
}

export const cancelSubscriptionAutoPay = cancelRecurringAutoPay
