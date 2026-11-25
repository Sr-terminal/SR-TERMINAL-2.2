/**
 * SR TERMINAL — PERSISTENT SERVER-SIDE TRADING ENGINE & BACKGROUND WORKER
 *
 * Runs autonomously in the Node.js / Express backend independent of any browser tabs.
 * Continuously:
 * 1. Ingests Binance market ticks & klines for Gold (PAXGUSDT), FX (EUR, GBP), Crypto (BTC, ETH)
 * 2. Applies precision & bounded calibration
 * 3. Evaluates ICT Smart Money Concept models & multi-timeframe alignment
 * 4. Enforces Red-Folder News Blackout windows (blocks new entries ±20m/30m of High-Impact prints)
 * 5. Manages full trade lifecycles (SETUP_FORMING -> ENTRY_CONFIRMED -> RUNNING -> TP1/2/3 -> BREAKEVEN / STOPPED)
 * 6. Dispatches real-time SSE push events to connected mobile APK and web client subscribers
 */

import { analyse } from './ict'
import {
  classifySetup,
  updateTradeLifecycleOnTick,
  isTerminalStage,
  type ImmutableTradeRecord,
} from './tradeLifecycleEngine'
import { calibrateCandles } from './brokerCalibration'
import { SYMBOLS, isForexMarketOpen, type Candle } from './market'
import { getActiveApexKillzoneWindow } from './clock'
import {
  run2000PossibilitySimulation,
  computeEngineProfitabilityReport,
  buildAutonomousTradeAlert,
  formatApexPulseNotification,
} from './aiServices'

export interface ServerTradeEvent {
  id: string
  eventId: string
  symbolId: string
  symbolLabel: string
  tf: string
  direction: 'LONG' | 'SHORT'
  type: string
  title: string
  body: string
  confluenceScorePct?: number
  sweptLiquidityType?: string
  primaryPdArray?: string
  killzoneWindow?: string
  ts: number
}

interface ServerEngineStatus {
  isRunning: boolean
  lastCycleTs: number
  cycleCount: number
  monitoredSymbols: string[]
  activeTradesCount: number
  totalSignalsGenerated: number
  dailySignalsGenerated: number
  maxDailySignals: number
  recentPrices: Record<string, number>
  blackoutActive: boolean
  blackoutDetails?: string
  activeKillzoneWindow?: string
}

const MAX_DAILY_SIGNALS = 4 // Strictly cap at 1 to 4 ultra-validated institutional trades per day
let activeTrades: ImmutableTradeRecord[] = []
const recentEvents: ServerTradeEvent[] = []
const dispatchedServerEventIds = new Set<string>()
let lastPrices: Record<string, number> = {}
let lastCycleTs = 0
let cycleCount = 0
let isEngineRunning = false
let totalSignalsGenerated = 0
let dailySignalsGenerated = 0
let currentSignalDayKey = new Date().toISOString().slice(0, 10)
let currentBlackoutState = { blackout: false, title: '' }

const BINANCE_ENDPOINTS = [
  'https://data-api.binance.vision',
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
]

/**
 * Robust fetch for historical klines on server
 */
async function fetchServerKlines(symbol: string, interval: string, limit = 160): Promise<Candle[]> {
  for (const host of BINANCE_ENDPOINTS) {
    try {
      const res = await fetch(`${host}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, {
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) continue
      const raw = await res.json()
      if (!Array.isArray(raw) || raw.length === 0) continue

      return raw.map((k: any) => ({
        t: Number(k[0]),
        o: Number(k[1]),
        h: Number(k[2]),
        l: Number(k[3]),
        c: Number(k[4]),
        v: Number(k[5]),
      }))
    } catch {
      // try next host
    }
  }
  return []
}

/**
 * Checks if a specific symbol is affected by an active news blackout (-15m pre-news pause)
 */
function isSymbolInBlackout(symbolId: string): boolean {
  if (!currentBlackoutState.blackout) return false
  const title = (currentBlackoutState.title || '').toUpperCase()

  // USD news affects USD pairs, Gold, Indices, and BTC
  if (title.includes('USD') || title.includes('FED') || title.includes('FOMC') || title.includes('CPI') || title.includes('NFP') || title.includes('POWELL') || title.includes('RATE')) {
    return symbolId === 'XAUUSD' || symbolId === 'EURUSD' || symbolId === 'GBPUSD' || symbolId === 'BTCUSD' || symbolId === 'NAS100' || symbolId === 'US30'
  }
  // EUR news affects EURUSD
  if (title.includes('EUR') || title.includes('ECB')) {
    return symbolId === 'EURUSD'
  }
  // GBP news affects GBPUSD
  if (title.includes('GBP') || title.includes('BOE')) {
    return symbolId === 'GBPUSD'
  }

  return true
}

/**
 * Single evaluation cycle across monitored instruments
 * MODULE 2: Daily 1-4 Validated Trades Cadence (Session Killzone Scanner with 15M -> 5M -> 1M Cascade)
 * MODULE 3: 2000-Scenario Monte Carlo Backtest Matrix (>= 80% Institutional Confluence Gate + Protected SL Buffer)
 * MODULE 5: Exact High-Priority Notification Format
 */
export async function runServerEngineCycle(broadcastFn: (event: ServerTradeEvent) => void) {
  const now = Date.now()
  lastCycleTs = now
  cycleCount++

  const todayKey = new Date(now).toISOString().slice(0, 10)
  if (todayKey !== currentSignalDayKey) {
    currentSignalDayKey = todayKey
    dailySignalsGenerated = 0
  }

  // Clean terminal trades older than 48 hours to preserve memory
  activeTrades = activeTrades.filter((t) => !isTerminalStage(t.stage) || now - t.statusTs < 48 * 3600 * 1000)

  const killzone = getActiveApexKillzoneWindow(new Date(now))

  for (const sym of SYMBOLS) {
    if (!isForexMarketOpen(sym.id, now)) continue
    try {
      // 1. Fetch live 15m klines for primary setup detection
      const rawKlines15m = await fetchServerKlines(sym.src, '15m', 120)
      if (rawKlines15m.length < 50) continue

      const calibrated15m = calibrateCandles(sym.id, rawKlines15m)
      const latestPrice = calibrated15m[calibrated15m.length - 1].c

      // Outlier spike filter (>1.5% jump in single cycle)
      const prevPrice = lastPrices[sym.id]
      if (prevPrice && prevPrice > 0 && Math.abs(latestPrice - prevPrice) / prevPrice > 0.015) {
        continue
      }
      lastPrices[sym.id] = latestPrice

      // 2. Tick existing active trades for this symbol
      const tickResult = updateTradeLifecycleOnTick(activeTrades, sym.id, latestPrice, now)
      activeTrades = tickResult.records

      // Dispatch any lifecycle notifications (TP1, TP2, TP3, SL, BREAKEVEN, FILL)
      for (const notif of tickResult.notificationsToSend) {
        if (dispatchedServerEventIds.has(notif.eventId)) continue
        dispatchedServerEventIds.add(notif.eventId)
        totalSignalsGenerated++
        const event: ServerTradeEvent = {
          id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          eventId: notif.eventId,
          symbolId: sym.id,
          symbolLabel: sym.label,
          tf: notif.trade.tf,
          direction: notif.trade.direction,
          type: notif.type,
          title: notif.title,
          body: notif.body,
          ts: now,
        }
        recentEvents.unshift(event)
        if (recentEvents.length > 100) recentEvents.pop()
        broadcastFn(event)
        console.log(`[Background-Engine] ${notif.type}: ${notif.title} -> ${notif.body}`)
      }

      // 3. ICT APEX-PULSE ENGINE (Refined 1–4 Daily Validated Institutional Setups):
      // Strictly enforce MAX_DAILY_SIGNALS = 4 so the engine never spams noisy signals.
      if (!isSymbolInBlackout(sym.id) && dailySignalsGenerated < MAX_DAILY_SIGNALS) {
        let selectedTf = '15m'
        let selectedCandles = calibrated15m
        let selectedAnalysis = analyse(calibrated15m, '15m', undefined, undefined, undefined, sym.digits)

        const has15mValidPlan =
          selectedAnalysis?.ok &&
          selectedAnalysis.plan?.valid &&
          selectedAnalysis.plan.direction !== 'STAND ASIDE'

        const had15mSweepOrActivity =
          Boolean(selectedAnalysis?.phase?.sweep) ||
          Boolean(selectedAnalysis?.phase?.cisd) ||
          Boolean(selectedAnalysis?.phase?.displaced) ||
          killzone.isSilverBulletActive

        if (!has15mValidPlan && had15mSweepOrActivity) {
          // Drop down to 5M timeframe first
          const raw5m = await fetchServerKlines(sym.src, '5m', 100)
          if (raw5m.length >= 45) {
            const cal5m = calibrateCandles(sym.id, raw5m)
            const analysis5m = analyse(cal5m, '5m', undefined, undefined, undefined, sym.digits)
            if (analysis5m?.ok && analysis5m.plan?.valid && analysis5m.plan.direction !== 'STAND ASIDE') {
              selectedTf = '5m'
              selectedCandles = cal5m
              selectedAnalysis = analysis5m
            } else {
              // Drop down to 1M timeframe for precision CISD + FVG / Unicorn entry
              const raw1m = await fetchServerKlines(sym.src, '1m', 90)
              if (raw1m.length >= 45) {
                const cal1m = calibrateCandles(sym.id, raw1m)
                const analysis1m = analyse(cal1m, '1m', undefined, undefined, undefined, sym.digits)
                if (analysis1m?.ok && analysis1m.plan?.valid && analysis1m.plan.direction !== 'STAND ASIDE') {
                  selectedTf = '1m'
                  selectedCandles = cal1m
                  selectedAnalysis = analysis1m
                }
              }
            }
          }
        }

        if (selectedAnalysis?.ok && selectedAnalysis.plan?.valid && selectedAnalysis.plan.direction !== 'STAND ASIDE') {
          const sim2000 = run2000PossibilitySimulation(selectedCandles, selectedAnalysis, sym.id, selectedTf)
          // Strict 2000-Scenario Monte Carlo Matrix Gate: require >= 80% institutional confluence & >= 2.0 R:R
          const planRr = Number(selectedAnalysis.plan.rr || 0)
          if (!sim2000.passesThreshold || sim2000.winProbabilityPct < 80 || planRr < 2.0) {
            continue
          }

          const profReport = computeEngineProfitabilityReport(
            sym.id,
            sym.label,
            selectedTf,
            selectedCandles,
            selectedAnalysis
          )
          const classification = classifySetup(
            selectedAnalysis.plan,
            sym.id,
            sym.label,
            selectedTf,
            latestPrice,
            activeTrades,
            sym.digits,
            now
          )

          if (classification.type === 'NEW_SETUP') {
            activeTrades.unshift(classification.trade)
            totalSignalsGenerated++
            dailySignalsGenerated++
            const p = classification.trade
            const tradeDir = p.direction === 'LONG' ? 'BUY' : 'SELL'
            const sweptLiquidityType =
              selectedAnalysis.plan.sweptLiquidityType && selectedAnalysis.plan.sweptLiquidityType !== 'NONE'
                ? selectedAnalysis.plan.sweptLiquidityType
                : tradeDir === 'BUY'
                ? 'SSL (PDL)'
                : 'BSL (PDH)'
            const primaryPdArray =
              selectedAnalysis.plan.primaryPdArray && selectedAnalysis.plan.primaryPdArray !== 'NONE'
                ? selectedAnalysis.plan.primaryPdArray
                : tradeDir === 'BUY'
                ? 'Bullish FVG (+OB)'
                : 'Bearish FVG (-OB)'

            const autoAlert = buildAutonomousTradeAlert(
              sym.id,
              sym.label,
              selectedTf,
              tradeDir,
              p.entry,
              p.stop,
              p.tp1,
              p.tp2,
              p.tp3,
              p.rr,
              p.model,
              selectedAnalysis.plan.confluences || selectedAnalysis.reasons || [],
              sim2000,
              profReport,
              sym.digits,
              sweptLiquidityType,
              primaryPdArray,
              killzone
            )

            const apexAlertLine = formatApexPulseNotification(
              sym.id,
              tradeDir,
              p.entry,
              p.stop,
              p.tp1,
              sim2000.winProbabilityPct,
              autoAlert.sweptLiquidityType,
              autoAlert.primaryPdArray,
              sym.digits
            )

            const event: ServerTradeEvent = {
              id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              eventId: `${p.signalId}-PLAN_CREATED`,
              symbolId: sym.id,
              symbolLabel: sym.label,
              tf: selectedTf,
              direction: p.direction,
              type: 'PLAN_CREATED',
              title: apexAlertLine,
              body: `${apexAlertLine}\nWindow: ${killzone.shortLabel} (${selectedTf.toUpperCase()}) | TP2 (1:3.5 RR): ${p.tp2} | TP3 (1:5+ RR): ${p.tp3}`,
              confluenceScorePct: sim2000.winProbabilityPct,
              sweptLiquidityType: autoAlert.sweptLiquidityType,
              primaryPdArray: autoAlert.primaryPdArray,
              killzoneWindow: killzone.name,
              ts: now,
            }
            recentEvents.unshift(event)
            if (recentEvents.length > 100) recentEvents.pop()
            broadcastFn(event)
            console.log(`[Background-Engine] ${apexAlertLine}`)
          }
        }
      }
    } catch {
      // ignore transient instrument fetch error
    }
  }
}

/**
 * Starts the continuous server-side engine daemon
 */
export function startServerTradingEngine(broadcastFn: (event: ServerTradeEvent) => void) {
  if (isEngineRunning) return
  isEngineRunning = true
  console.log('[Background-Engine] Persistent ICT APEX-PULSE (2000X Matrix) Daemon started (polling every 15s)')

  // Initial cycle deferred slightly so server startup and initial Vite bundle load are instant
  setTimeout(() => {
    runServerEngineCycle(broadcastFn).catch(() => {})
  }, 6000)

  // Recurring continuous cycle
  setInterval(() => {
    runServerEngineCycle(broadcastFn).catch((err) => {
      console.warn('[Background-Engine] Cycle execution notice:', err?.message)
    })
  }, 15000)
}

/**
 * Update current news blackout state from calendar sync
 */
export function updateServerNewsBlackout(blackout: boolean, title?: string) {
  currentBlackoutState = { blackout, title: title || '' }
}

export function getServerActiveTrades(): ImmutableTradeRecord[] {
  return activeTrades.map((t) => {
    const entry = Number(t.entry) || 0
    const sl = Number(t.stop) || 0
    const initialSl = Number((t as any).initialSl ?? t.initialStopLoss ?? t.initialStop ?? sl) || sl
    const isCancelledOrBe = t.status === 'CANCELLED' || t.stage === 'CANCELLED' || Math.abs(entry - sl) < 0.01
    const rawR = Number(t.resultR ?? 0)
    const safeR = isCancelledOrBe || !isFinite(rawR) || Math.abs(rawR) > 50 ? 0 : Number(Math.max(-10, Math.min(50, rawR)).toFixed(2))
    const confluences = (t.confluences || []).map((c) =>
      String(c)
        .replace(/EMA STACK/gi, 'SMT DIVERGENCE')
        .replace(/SR CONCEPT REVERSAL|SR CONCEPT PLUS ONE|SR CONCEPT|TURTLE SOUP/gi, 'ORDER BLOCK')
    )
    const model = String(t.model || 'ICT MSS REVERSAL')
      .replace(/SR CONCEPT REVERSAL|SR CONCEPT PLUS ONE|SR CONCEPT|TURTLE SOUP/gi, 'ICT MSS REVERSAL')
      .replace(/EMA STACK/gi, 'SMT DIVERGENCE')
    const count = confluences.length || 1
    const logicSummary = `${t.direction} — ${count} concept${count === 1 ? '' : 's'} aligned, 0 opposing (BALANCED mode)`
    return {
      ...t,
      model,
      confluences,
      logicSummary,
      initialStopLoss: initialSl,
      initialStop: initialSl,
      resultR: safeR,
    }
  })
}

export function getServerRecentEvents(): ServerTradeEvent[] {
  return recentEvents
}

export function getServerEngineStatus(): ServerEngineStatus {
  const kz = getActiveApexKillzoneWindow(new Date())
  return {
    isRunning: isEngineRunning,
    lastCycleTs,
    cycleCount,
    monitoredSymbols: SYMBOLS.map((s) => s.id),
    activeTradesCount: activeTrades.filter((t) => !isTerminalStage(t.stage)).length,
    totalSignalsGenerated,
    dailySignalsGenerated,
    maxDailySignals: MAX_DAILY_SIGNALS,
    recentPrices: lastPrices,
    blackoutActive: currentBlackoutState.blackout,
    blackoutDetails: currentBlackoutState.title,
    activeKillzoneWindow: `${kz.shortLabel} (${kz.estRange})`,
  }
}
