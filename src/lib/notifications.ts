import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Capacitor } from '@capacitor/core'
import { db } from './firebase'
import { safeStorage } from './storage'
import { apiUrl } from './apiConfig'
import { getDeviceFingerprint } from './authService'

export interface NotificationPrefs {
  planCreated: boolean
  executed: boolean
  tp1: boolean
  tp2: boolean
  tp3: boolean
  moveBE: boolean
  beClosed: boolean
  stop: boolean
  riskAlert: boolean
  redFolderNews15m: boolean
  manualClosed: boolean
  updates: boolean
  sound: boolean
  vibrate: boolean
  [key: string]: boolean
}

const NOTIF_KEY = 'sr.notif.prefs'
export const HIGH_IMPORTANCE_CHANNEL_ID = 'sr-trade-alerts-v2'

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  planCreated: true,
  executed: true,
  tp1: true,
  tp2: true,
  tp3: true,
  moveBE: true,
  beClosed: true,
  stop: true,
  riskAlert: true,
  redFolderNews15m: true,
  manualClosed: false,
  updates: true,
  sound: true,
  vibrate: true,
}

export function getNotificationPrefs(): NotificationPrefs {
  try {
    const raw = safeStorage.getItem(NOTIF_KEY)
    if (!raw) return { ...DEFAULT_NOTIF_PREFS }
    return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_NOTIF_PREFS }
  }
}

export function saveNotificationPrefs(prefs: Partial<NotificationPrefs>): NotificationPrefs {
  try {
    const current = getNotificationPrefs()
    const updated = { ...current, ...prefs }
    safeStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return { ...DEFAULT_NOTIF_PREFS }
  }
}

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean((window as any).AndroidBridge) || Capacitor.isNativePlatform()
}

export async function areNotificationsEnabled(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (Capacitor.isNativePlatform()) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      const pushPerm = await PushNotifications.checkPermissions()
      if (pushPerm.receive === 'granted') return true
    } catch {}
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const status = await LocalNotifications.checkPermissions()
      return status.display === 'granted'
    } catch {
      return false
    }
  }

  if ((window as any).AndroidBridge?.areNotificationsEnabled) {
    try {
      return Boolean((window as any).AndroidBridge.areNotificationsEnabled())
    } catch {
      return true
    }
  }

  if ('Notification' in window) {
    return Notification.permission === 'granted'
  }

  return true
}

let channelInitialized = false
let pushListenersBound = false
let notifSequence = 0
let currentFcmToken: string | null = null

export function getRegisteredFcmToken(): string | null {
  return currentFcmToken
}

function nextUniqueNotificationId(): number {
  notifSequence = (notifSequence + 1) % 1000
  return Math.floor((Date.now() % 2000000) * 1000 + notifSequence)
}

/**
 * Creates the High-Priority Android Notification Channel (`importance: 5 / HIGH`)
 * for both `@capacitor/push-notifications` (closed-app FCM) and `@capacitor/local-notifications`.
 */
export async function ensureHighImportanceChannel(): Promise<void> {
  if (channelInitialized || typeof window === 'undefined' || !Capacitor.isNativePlatform()) return
  const channelConfig = {
    id: HIGH_IMPORTANCE_CHANNEL_ID,
    name: 'SR Terminal 24/7 High Priority ICT Alerts',
    description:
      '24/7 closed-app FCM push notifications for Safe Entry, +1R Move SL to BE, TP1/TP2/TP3, SL Hit, and 15m Red-Folder News',
    importance: 5 as const, // NotificationManager.IMPORTANCE_HIGH (wakes screen + heads-up banner + sound + vibration)
    visibility: 1 as const, // Notification.VISIBILITY_PUBLIC
    vibration: true,
    lights: true,
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.createChannel(channelConfig)
  } catch {}

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.createChannel(channelConfig)
    channelInitialized = true
  } catch {}
}

/**
 * Persists a device FCM push token to Firestore `users/{uid}.fcmTokens` (bounded to 20 tokens)
 * and registers it with the 24/7 backend market watcher (`POST /api/fcm/register`).
 */
export async function syncFcmTokenToCloudAndBackend(
  token: string,
  uid?: string,
  email?: string | null
): Promise<void> {
  const cleanToken = (token || '').trim()
  if (!cleanToken) return
  currentFcmToken = cleanToken

  // 1. Register token with 24/7 backend market watcher (`server.ts`)
  try {
    await fetch(apiUrl('/api/fcm/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: cleanToken,
        uid: uid || 'anon',
        email: email || '',
        platform: isNativePlatform() ? 'android_fcm' : 'web_fcm',
        channelId: HIGH_IMPORTANCE_CHANNEL_ID,
      }),
    })
  } catch {}

  // 2. Save token to Firestore `users/{uid}.fcmTokens` (bounded max 20 tokens per firestore.rules)
  if (db && uid) {
    try {
      const userRef = doc(db, 'users', uid)
      const snap = await getDoc(userRef)
      if (snap.exists()) {
        const existing = Array.isArray(snap.data()?.fcmTokens) ? (snap.data()?.fcmTokens as string[]) : []
        const deduped = Array.from(new Set([cleanToken, ...existing.filter((t) => typeof t === 'string' && t.length <= 512)])).slice(
          0,
          20
        )
        await updateDoc(userRef, {
          fcmTokens: deduped,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.warn('[FCM-Sync] Firestore fcmTokens update notice:', err)
    }
  }
}

/**
 * Initializes Capacitor Push Notifications (`@capacitor/push-notifications`),
 * requests high-priority permissions, creates the `importance: 5 / HIGH` channel,
 * and saves the device's `fcmTokens` to Firestore `users` and the 24/7 backend watcher.
 */
export async function registerDevicePushNotifications(
  uid?: string,
  email?: string | null
): Promise<string | null> {
  if (typeof window === 'undefined') return null

  await ensureHighImportanceChannel()

  // 1. Native Android Capacitor Push Notifications (`@capacitor/push-notifications`)
  if (Capacitor.isNativePlatform()) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')

      if (!pushListenersBound) {
        pushListenersBound = true

        await PushNotifications.addListener('registration', (token) => {
          if (token?.value) {
            void syncFcmTokenToCloudAndBackend(token.value, uid, email)
          }
        })

        await PushNotifications.addListener('registrationError', (err) => {
          console.warn('[FCM] Native push registration error:', err)
        })

        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          const title = notification.title || 'SR TERMINAL ALERT'
          const body = notification.body || ''
          const type = (notification.data?.type as string) || 'UPDATE'
          void sendTradeNotification(type, title, body)
        })

        await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          const title = action.notification?.title || 'SR TERMINAL'
          const body = action.notification?.body || ''
          window.dispatchEvent(
            new CustomEvent('sr-notification-tap', {
              detail: { title, body, data: action.notification?.data },
            })
          )
        })
      }

      let permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions()
      }
      if (permStatus.receive === 'granted') {
        await PushNotifications.register()
      }
    } catch (err) {
      console.warn('[FCM] Capacitor PushNotifications init notice:', err)
    }
  }

  // 2. Check if Android Native Bridge exposes an FCM token directly
  if ((window as any).AndroidBridge?.getFcmToken) {
    try {
      const nativeTok = String((window as any).AndroidBridge.getFcmToken() || '').trim()
      if (nativeTok) {
        await syncFcmTokenToCloudAndBackend(nativeTok, uid, email)
        return nativeTok
      }
    } catch {}
  }

  // 3. Ensure deterministic device push token is registered in Firestore `users.fcmTokens` & backend watcher
  const fp = getDeviceFingerprint()
  const fallbackDeviceToken = currentFcmToken || `fcm_${isNativePlatform() ? 'android' : 'web'}_${uid || 'dev'}_${fp}`
  await syncFcmTokenToCloudAndBackend(fallbackDeviceToken, uid, email)
  return fallbackDeviceToken
}

export async function requestNotificationPermission(uid?: string, email?: string | null): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if ((window as any).AndroidBridge?.requestPermission) {
    try {
      ;(window as any).AndroidBridge.requestPermission()
    } catch {}
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureHighImportanceChannel()
      const { PushNotifications } = await import('@capacitor/push-notifications')
      const pushPerm = await PushNotifications.requestPermissions()
      if (pushPerm.receive === 'granted') {
        await PushNotifications.register()
      }
    } catch {}

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const status = await LocalNotifications.checkPermissions()
      if (status.display === 'granted') {
        void registerDevicePushNotifications(uid, email)
        return true
      }
      const res = await LocalNotifications.requestPermissions()
      if (res.display === 'granted') {
        void registerDevicePushNotifications(uid, email)
        return true
      }
    } catch {
      return Boolean((window as any).AndroidBridge)
    }
  }

  if ('Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        void registerDevicePushNotifications(uid, email)
        return true
      }
      const res = await Notification.requestPermission()
      if (res === 'granted') {
        void registerDevicePushNotifications(uid, email)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return true
}

const PLAYED_ALERT_IDS_STORAGE_KEY = 'sr.notifications.played_ids.v1'
const AUDIO_COOLDOWN_MS = 30_000 // Strict 30-second audio cooldown between chimes
const playedAlertIds = new Set<string>()
let playedAlertIdsHydrated = false
let lastChimePlayedAt = 0
let sharedAudioCtx: AudioContext | null = null

function hydratePlayedAlertIds(): void {
  if (playedAlertIdsHydrated) return
  playedAlertIdsHydrated = true
  try {
    const raw = safeStorage.getItem(PLAYED_ALERT_IDS_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item === 'string' && item) playedAlertIds.add(item)
      }
    }
  } catch {}
}

function recordPlayedAlertId(alertId: string): void {
  if (!alertId) return
  hydratePlayedAlertIds()
  playedAlertIds.add(alertId)
  try {
    const recent = Array.from(playedAlertIds).slice(-600)
    safeStorage.setItem(PLAYED_ALERT_IDS_STORAGE_KEY, JSON.stringify(recent))
  } catch {}
}

export function hasAlertBeenPlayed(alertId: string): boolean {
  hydratePlayedAlertIds()
  return playedAlertIds.has(alertId)
}

/**
 * Plays a clean harmonic alert sound via Web Audio API.
 * Enforces a strict playedAlertIds Set check and a 30-second audio cooldown
 * so the chime sound plays at most once per real trade event (never every second).
 */
export function playAlertChime(alertId?: string, isManualTest = false) {
  if (typeof window === 'undefined') return
  hydratePlayedAlertIds()

  const nowMs = Date.now()
  if (alertId && !isManualTest && playedAlertIds.has(`chime:${alertId}`)) {
    return
  }
  if (!isManualTest && nowMs - lastChimePlayedAt < AUDIO_COOLDOWN_MS) {
    return
  }

  lastChimePlayedAt = nowMs
  if (alertId) {
    recordPlayedAlertId(`chime:${alertId}`)
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass()
    }
    const ctx = sharedAudioCtx
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.18)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(440, now)
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.18)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.36)
    osc2.stop(now + 0.36)
  } catch {}
}

const TYPE_KEY_MAP: Record<string, keyof NotificationPrefs> = {
  PRE_TRADE_APPROACHING: 'planCreated',
  PLAN_CREATED: 'planCreated',
  ENTRY_CONFIRMED: 'executed',
  TRADE_EXECUTED: 'executed',
  TP1_HIT: 'tp1',
  TP2_HIT: 'tp2',
  TP3_HIT: 'tp3',
  MOVE_BREAKEVEN: 'moveBE',
  BREAKEVEN: 'beClosed',
  BREAKEVEN_CLOSED: 'beClosed',
  STOP_HIT: 'stop',
  RISK_ALERT: 'riskAlert',
  RED_FOLDER_15M_ALERT: 'redFolderNews15m',
  NEWS_ALERT_15M: 'redFolderNews15m',
  MANUAL_CLOSED: 'manualClosed',
  INVALIDATED: 'stop',
  EXPIRED: 'updates',
  UPDATE: 'updates',
  AI_AGENT_UPDATE: 'updates',
  TASK_COMPLETE: 'updates',
  TEST: 'updates',
}

/**
 * Unified notification dispatcher for Android Native APK (FCM + LocalNotifications) and Web Browser.
 * Deduplicates alerts by eventId and content signature in playedAlertIds Set.
 */
export async function sendTradeNotification(
  type: string,
  title: string,
  body: string,
  eventId?: string
): Promise<boolean> {
  if (typeof window === 'undefined') return false
  hydratePlayedAlertIds()

  const isManualTest = type === 'TEST'
  const canonicalId = (eventId || `${type}:${title}:${body}`).trim()
  const contentSignature = `${type}:${title}`.trim()

  if (!isManualTest) {
    if (playedAlertIds.has(canonicalId) || playedAlertIds.has(contentSignature)) {
      return false
    }
    recordPlayedAlertId(canonicalId)
    recordPlayedAlertId(contentSignature)
  }

  const prefs = getNotificationPrefs()
  const prefKey = TYPE_KEY_MAP[type]
  if (prefKey && prefs[prefKey] === false) {
    return false
  }

  if (prefs.sound !== false) {
    playAlertChime(canonicalId, isManualTest)
  }

  if (prefs.vibrate !== false && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([120, 60, 180])
    } catch {}
  }

  const uniqueId = nextUniqueNotificationId()
  let sent = false

  if ((window as any).AndroidBridge?.postNotification) {
    try {
      ;(window as any).AndroidBridge.postNotification(title, body)
      sent = true
    } catch (e) {
      console.warn('AndroidBridge notification failed:', e)
    }
  }

  if (!sent && Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await ensureHighImportanceChannel()
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: uniqueId,
            channelId: HIGH_IMPORTANCE_CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 50), allowWhileIdle: true },
            sound: prefs.sound !== false ? 'beep.wav' : undefined,
            actionTypeId: '',
            extra: { type, notificationId: uniqueId },
          },
        ],
      })
      sent = true
    } catch (e) {
      console.warn('Capacitor LocalNotifications dispatch notice:', e)
    }
  }

  if (!sent && 'Notification' in window) {
    try {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg && typeof reg.showNotification === 'function') {
            await reg.showNotification(title, {
              body,
              icon: '/favicon.ico',
              tag: `sr-${uniqueId}`,
              renotify: true,
              vibrate: [200, 100, 250],
            } as any)
            sent = true
          }
        }
        if (!sent) {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: `sr-${uniqueId}`,
          })
          sent = true
        }
      }
    } catch (e) {
      console.warn('Web notification failed:', e)
    }
  }

  try {
    window.dispatchEvent(new CustomEvent('sr-notification', { detail: { id: uniqueId, type, title, body } }))
  } catch {}

  return sent
}

export function requestBatteryOptimizationExemption(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if ((window as any).AndroidBridge?.requestBatteryOptimizationExemption) {
      ;(window as any).AndroidBridge.requestBatteryOptimizationExemption()
      return true
    }
  } catch {}
  return false
}

export async function testNotification(): Promise<boolean> {
  // Also trigger backend FCM test dispatch so closed-app / background FCM pipeline is exercised
  try {
    await fetch(apiUrl('/api/fcm/test-lifecycle'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: currentFcmToken,
        eventType: 'ENTRY_CONFIRMED',
      }),
    })
  } catch {}

  return sendTradeNotification(
    'TEST',
    '⚡ [ICT 24/7 FCM] XAUUSD BUY | Entry: 2750.50 | Protected SL: 2742.00 | TP1: 2767.50 | R:R 1:2.00',
    '⚡ [24/7 CLOSED-APP FCM] High-Priority Channel (IMPORTANCE_HIGH = 5), Closed-App Push Watcher, Sound & Vibration 100% Active!'
  )
}
