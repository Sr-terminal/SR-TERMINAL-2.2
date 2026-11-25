import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { BUILD } from './version'

export interface FreeAccessPolicy {
  allowedSymbols: string[]
  allowedIntervals: string[]
  allowTradePlan: boolean
  allowOrderbook: boolean
  allowMatrix: boolean
  allowAcademy: boolean
}

export interface RemoteConfig {
  maintenanceMode: boolean
  minimumAppVersion: string
  latestAppVersion: string
  supportMessage: string
  announcement: string
  freeAccessPolicy: FreeAccessPolicy
  planPrices: {
    sr_terminal_30d: number
    sr_terminal_2m: number
    sr_terminal_1y: number
  }
  updatedAt?: string
  updatedBy?: string
}

export const DEFAULT_CONFIG: RemoteConfig = {
  maintenanceMode: false,
  minimumAppVersion: '2.8.9.0',
  latestAppVersion: BUILD,
  supportMessage: 'Institutional Trading Support active: surajrayxyz09@gmail.com',
  announcement: 'SR Terminal v2.8.9.15: Institutional Google Play Access & Terminal Security active.',
  freeAccessPolicy: {
    allowedSymbols: ['EURUSD'],
    allowedIntervals: ['1h', '4h'],
    allowTradePlan: false,
    allowOrderbook: false,
    allowMatrix: false,
    allowAcademy: false,
  },
  planPrices: {
    sr_terminal_30d: 999,
    sr_terminal_2m: 1899,
    sr_terminal_1y: 12999,
  },
}

/**
 * Fetch remote config once with fallback
 */
export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  if (!db) return DEFAULT_CONFIG
  try {
    const ref = doc(db, 'system_config', 'app_settings')
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { ...DEFAULT_CONFIG, ...(snap.data() as Partial<RemoteConfig>) }
    }
    // Initialize default doc if not present
    await setDoc(ref, DEFAULT_CONFIG)
    return DEFAULT_CONFIG
  } catch (err) {
    console.warn('Failed to load remote config from Firestore, using defaults:', err)
    return DEFAULT_CONFIG
  }
}

/**
 * Real-time listener for remote config changes
 */
export function subscribeRemoteConfig(callback: (config: RemoteConfig) => void): () => void {
  if (!db) {
    callback(DEFAULT_CONFIG)
    return () => {}
  }

  try {
    const ref = doc(db, 'system_config', 'app_settings')
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          callback({ ...DEFAULT_CONFIG, ...(snap.data() as Partial<RemoteConfig>) })
        } else {
          callback(DEFAULT_CONFIG)
        }
      },
      (err) => {
        console.warn('Remote config snapshot listener error:', err)
        callback(DEFAULT_CONFIG)
      }
    )
  } catch {
    callback(DEFAULT_CONFIG)
    return () => {}
  }
}
