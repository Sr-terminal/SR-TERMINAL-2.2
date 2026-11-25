import { Suspense, lazy, useEffect, useState } from 'react'
import { Capacitor as CapCore } from '@capacitor/core'
import {
  Home as HomeIcon,
  CandlestickChart,
  LayoutGrid,
  MoreHorizontal,
  ShieldOff,
  Crown,
  Sparkles,
  LogOut,
  NotebookPen,
  Award,
  Timer,
} from 'lucide-react'
import Home from './Home'
import Terminal from './Terminal'
import TerminalLockedScreen from './TerminalLockedScreen'
import { startDeviceControl, subscribeDevice, checkUpdate, type DeviceState, type UpdateManifest } from '../lib/deviceControl'
import { safeStorage } from '../lib/storage'
import {
  evaluateEntitlement,
  isFeatureUnlockedByRewardedAd,
  subscribeRewardedAdUnlocks,
} from '../lib/subscriptionService'
import { signOutUser, type UserProfile } from '../lib/authService'
import { sendTradeNotification, requestNotificationPermission, registerDevicePushNotifications } from '../lib/notifications'
import { apiUrl } from '../lib/apiConfig'

const Matrix = lazy(() => import('./Matrix'))
const JournalScreen = lazy(() => import('./JournalScreen'))
const More = lazy(() => import('./More'))
const SubscriptionScreen = lazy(() => import('./SubscriptionScreen'))
const AiTradingAgent = lazy(() => import('./AiTradingAgent'))
const FundedAccountManager = lazy(() => import('./FundedAccountManager'))

export type Route = 'home' | 'terminal' | 'funded' | 'journal' | 'ai-agent' | 'matrix' | 'more'

const ROUTE_KEY = 'sr.apk.route'

const NAV: Array<{ id: Route; label: string; Icon: typeof HomeIcon }> = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'terminal', label: 'Terminal', Icon: CandlestickChart },
  { id: 'funded', label: 'Funded', Icon: Award },
  { id: 'journal', label: 'Journal', Icon: NotebookPen },
  { id: 'ai-agent', label: 'AI Agent', Icon: Sparkles },
  { id: 'matrix', label: 'Matrix', Icon: LayoutGrid },
  { id: 'more', label: 'More', Icon: MoreHorizontal },
]

interface NativeAppShellProps {
  userProfile?: UserProfile | null
  onSignOut?: () => void
}

function ScreenSkeleton() {
  return (
    <div className="p-4 space-y-3 max-w-xl mx-auto fadein">
      <div className="h-14 shimmer" />
      <div className="h-52 shimmer" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 shimmer" />
        <div className="h-24 shimmer" />
      </div>
    </div>
  )
}

export default function NativeAppShell({ userProfile, onSignOut }: NativeAppShellProps) {
  const [route, setRoute] = useState<Route>(() => {
    const saved = safeStorage.getItem(ROUTE_KEY)
    return (['home', 'terminal', 'funded', 'ai-agent', 'matrix', 'journal', 'more'] as string[]).includes(saved ?? '')
      ? (saved as Route)
      : 'home'
  })
  const [device, setDevice] = useState<DeviceState | null>(null)
  const [update, setUpdate] = useState<UpdateManifest | null>(null)
  const [showSubscription, setShowSubscription] = useState(false)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [, setRewardTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const unsub = subscribeRewardedAdUnlocks(() => setRewardTick((n) => n + 1))
    return unsub
  }, [])

  const entitlement = evaluateEntitlement(userProfile ?? null, nowTick)
  const terminalUnlocked = entitlement.isActive || isFeatureUnlockedByRewardedAd('basic_chart_view')
  const aiAgentUnlocked =
    entitlement.isActive ||
    isFeatureUnlockedByRewardedAd('basic_ai_agent_question')
  const aiAgentTitle =
    entitlement.isTrial || entitlement.tierLevel >= 2 ? 'AI Trading Agent' : 'Basic AI Agent'

  const go = (r: Route) => {
    setRoute(r)
    try {
      safeStorage.setItem(ROUTE_KEY, r)
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    startDeviceControl()
    const unsub = subscribeDevice(setDevice)
    void checkUpdate().then(setUpdate)
    void requestNotificationPermission(userProfile?.uid, userProfile?.email)
    return unsub
  }, [])

  // Register device FCM push token into Firestore `users/{uid}.fcmTokens` and 24/7 backend watcher
  useEffect(() => {
    if (!userProfile?.uid) return
    void registerDevicePushNotifications(userProfile.uid, userProfile.email)
  }, [userProfile?.uid, userProfile?.email])

  // Persistent Background Signal Stream (SSE) & Notification Dispatcher
  useEffect(() => {
    let evtSource: EventSource | null = null
    let reconnectTimeout: any = null

    const connectSSE = () => {
      try {
        evtSource = new EventSource(apiUrl('/api/signals/stream'))
        evtSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data)
            if (data && data.title && data.body && data.type !== 'CONNECTED') {
              void sendTradeNotification(data.type, data.title, data.body, data.eventId || data.id)
            }
          } catch {}
        }
        evtSource.onerror = () => {
          evtSource?.close()
          reconnectTimeout = setTimeout(connectSSE, 6000)
        }
      } catch {
        reconnectTimeout = setTimeout(connectSSE, 6000)
      }
    }

    connectSSE()

    return () => {
      evtSource?.close()
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
    }
  }, [])

  // Android hardware back button
  useEffect(() => {
    if (!CapCore.isNativePlatform()) return
    let App: typeof import('@capacitor/app') | null = null
    import('@capacitor/app').then((m) => {
      App = m
      m.App.addListener('backButton', () => {
        const cur = safeStorage.getItem(ROUTE_KEY) ?? 'home'
        if (cur !== 'home' && cur !== 'more') go('more')
        else if (cur === 'more') go('home')
        else m.App.exitApp()
      })
    })
    return () => {
      void App?.App.removeAllListeners?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (device?.status === 'blocked') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center bg-[#0B0E14]">
        <ShieldOff size={36} className="text-[#EF5350] mb-4" />
        <h1 className="display text-lg font-bold mb-2 text-[#FFFFFF]">Device Restricted</h1>
        <p className="text-[#787B86] text-sm">This device has been restricted. Please contact support.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col safe-top bg-[#0B0E14] text-[#FFFFFF]">
      {update && (
        <a
          href={update.url}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2 text-center text-[11px] font-semibold tracking-wide bg-[#FFFFFF] text-[#0B0E14] active:scale-98 block"
        >
          Update {update.versionName} Available — Tap to Download
        </a>
      )}

      {/* User Session & Entitlement Bar (with Live 24-Hour Trial Countdown Badge) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0B0E14] border-b border-[#1E222D] text-[11px] shrink-0 tabular-nums">
        <div className="flex items-center gap-2 text-[#787B86] min-w-0">
          <Crown
            size={12}
            className={
              entitlement.isActive
                ? 'text-[#26A69A] shrink-0'
                : entitlement.isExpired
                ? 'text-amber-400 shrink-0'
                : 'text-[#787B86] shrink-0'
            }
          />
          <span className={entitlement.isExpired ? 'text-amber-400 font-semibold' : 'text-[#FFFFFF] font-semibold'}>
            {entitlement.isTrial
              ? '24H Free Trial'
              : entitlement.isActive
              ? `${entitlement.planName}`
              : 'Free (Ad-Supported)'}
          </span>
          {entitlement.isTrial && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#26A69A]/15 border border-[#26A69A]/40 text-[#26A69A] font-mono text-[10px] font-bold">
              <Timer size={10} />
              <span>{entitlement.trialCountdownHhMmSs}</span>
            </span>
          )}
          {userProfile?.email && (
            <span className="text-[#787B86] truncate max-w-[160px] hidden sm:inline">· {userProfile.email}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!entitlement.isPro && (
            <button
              type="button"
              onClick={() => setShowSubscription(true)}
              className="px-2.5 py-1 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] text-[10px] font-semibold cursor-pointer active:scale-98"
            >
              {entitlement.isTrial ? 'Upgrade Ad-Free' : userProfile?.trialUsed ? 'Upgrade Pro' : '24H Trial'}
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOutUser()
              onSignOut?.()
            }}
            className="text-[#787B86] hover:text-[#FFFFFF] bg-[#131722] border border-[#1E222D] hover:border-[#2A2E39] px-2.5 py-1 rounded-[8px] flex items-center gap-1 text-[10px] font-medium cursor-pointer active:scale-98"
            title="Log out of current account"
          >
            <LogOut size={11} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-touch">
        {route === 'home' && <Home go={go} />}
        {route === 'terminal' &&
          (terminalUnlocked ? (
            <Terminal
              userProfile={userProfile ?? null}
              onOpenSubscription={() => setShowSubscription(true)}
            />
          ) : (
            <TerminalLockedScreen
              userProfile={userProfile ?? null}
              featureKey="basic_chart_view"
              featureTitle="Basic Chart View"
              allowRewardedAd={true}
              onViewPlans={() => setShowSubscription(true)}
              onSubscribeNow={() => setShowSubscription(true)}
              onOpenAuth={() => onSignOut?.()}
              onTrialActivated={() => setRewardTick((n) => n + 1)}
            />
          ))}
        <Suspense fallback={<ScreenSkeleton />}>
          {route === 'funded' && (
            <FundedAccountManager
              userProfile={userProfile ?? null}
              onOpenSubscription={() => setShowSubscription(true)}
              onOpenTerminalSymbol={(symId) => {
                try {
                  safeStorage.setItem('sr.symbol', symId)
                } catch {}
                go('terminal')
              }}
            />
          )}
          {route === 'matrix' &&
            (terminalUnlocked ? (
              <Matrix
                onOpenCell={(symId, tf) => {
                  try {
                    safeStorage.setItem('sr.symbol', symId)
                    safeStorage.setItem('sr.tf', tf)
                  } catch {
                    /* noop */
                  }
                  go('terminal')
                }}
              />
            ) : (
              <TerminalLockedScreen
                userProfile={userProfile ?? null}
                featureKey="basic_chart_view"
                featureTitle="Basic Chart & MTF Matrix View"
                allowRewardedAd={true}
                onViewPlans={() => setShowSubscription(true)}
                onSubscribeNow={() => setShowSubscription(true)}
                onOpenAuth={() => onSignOut?.()}
                onTrialActivated={() => setRewardTick((n) => n + 1)}
              />
            ))}
          {route === 'ai-agent' &&
            (aiAgentUnlocked ? (
              <AiTradingAgent userProfile={userProfile ?? null} />
            ) : (
              <TerminalLockedScreen
                userProfile={userProfile ?? null}
                featureKey="basic_ai_agent_question"
                featureTitle={aiAgentTitle}
                allowRewardedAd={true}
                onViewPlans={() => setShowSubscription(true)}
                onSubscribeNow={() => setShowSubscription(true)}
                onOpenAuth={() => onSignOut?.()}
                onTrialActivated={() => setRewardTick((n) => n + 1)}
              />
            ))}
          {route === 'journal' && (
            <JournalScreen userProfile={userProfile} onOpenSubscription={() => setShowSubscription(true)} />
          )}
          {route === 'more' && <More go={go} onSignOut={onSignOut} />}
        </Suspense>
      </div>

      {showSubscription && (
        <div className="fixed inset-0 z-50 bg-[#0B0E14] overflow-y-auto scroll-touch fadein">
          <Suspense fallback={<ScreenSkeleton />}>
            <SubscriptionScreen
              userProfile={userProfile ?? null}
              onClose={() => setShowSubscription(false)}
              onOpenAuth={() => {
                setShowSubscription(false)
                onSignOut?.()
              }}
            />
          </Suspense>
        </div>
      )}

      <nav className="safe-bottom border-t border-[#1E222D] bg-[#0B0E14] shrink-0">
        <div className="grid grid-cols-7 px-1 py-1.5 gap-1 max-w-xl mx-auto">
          {NAV.map(({ id, label, Icon }) => {
            const active = route === id
            return (
              <button
                key={id}
                onClick={() => go(id)}
                className={`flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 rounded-[10px] active:scale-98 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'text-[#FFFFFF] bg-[#131722] border border-[#1E222D]'
                    : 'text-[#787B86] hover:text-[#FFFFFF] border border-transparent'
                }`}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.75} />
                <span
                  className={`text-[9px] tracking-tight truncate ${
                    active ? 'font-semibold text-[#FFFFFF]' : 'font-medium text-[#787B86]'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
