import type { Candle, SymbolDef } from './market'
import { symbolById, SYMBOLS } from './market'
import { calibrateCandles } from './brokerCalibration'
import { analyse, type Analysis } from './ict'
import { CONCEPTS, type ConceptSelection, allOnSelection } from './concepts'

export interface ReplayIntervalDef {
  id: string
  label: string
  role: string
}

export const REPLAY_INTERVALS: ReplayIntervalDef[] = [
  { id: '1m', label: '1M', role: 'MICRO SCALP' },
  { id: '5m', label: '5M', role: 'EXECUTION' },
  { id: '15m', label: '15M', role: 'CONFIRMATION' },
  { id: '1h', label: '1H', role: 'INTRADAY BIAS' },
  { id: '4h', label: '4H', role: 'SWING MAP' },
  { id: '1d', label: '1D', role: 'DAILY NARRATIVE' },
  { id: '1w', label: '1W', role: 'MACRO WEEKLY' },
]

export interface ReplayTrade {
  id: string
  candleIndex: number
  entryTimestamp: number
  dateStrIST: string
  timeStrIST: string
  symbol: string
  timeframe: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  stopLoss: number
  takeProfit1: number
  takeProfit2?: number
  conceptKey: string
  conceptLabel: string
  grade: string
  status: 'OPEN' | 'CLOSED'
  outcome?: 'WIN' | 'LOSS'
  exitPrice?: number
  exitTimestamp?: number
  exitDateStrIST?: string
  exitReason?: 'TP' | 'SL' | 'MANUAL'
  pnlR: number
  pnlPoints: number
  barsHeld: number
  tradeType?: 'AUTOMATED' | 'MANUAL'
  selectedConcepts?: string[]
}

export interface ConceptBacktestStats {
  conceptKey: string
  conceptLabel: string
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalR: number
  avgRR: number
}

export interface BacktestSummaryStats {
  totalSetups: number
  closedTrades: number
  openTrades: number
  wins: number
  losses: number
  winRate: number
  profitFactor: number
  totalR: number
  grossProfitR: number
  grossLossR: number
  grossProfitPoints: number
  grossLossPoints: number
  netPoints: number
  avgRR: number
  maxDrawdownR: number
  manualTradesCount: number
  autoTradesCount: number
  conceptStats: Record<string, ConceptBacktestStats>
  timeframeStats: Record<string, { trades: number; wins: number; losses: number; winRate: number; totalR: number }>
}

const BINANCE_HOSTS = [
  'https://data-api.binance.vision',
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com',
]

/**
 * Convert Date or timestamp to IST format string
 */
export function formatToISTString(ts: number | Date): { date: string; time: string; full: string } {
  const d = typeof ts === 'number' ? new Date(ts) : ts
  const date = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)

  const time = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d)

  return { date, time, full: `${date} · ${time} IST` }
}

/**
 * Parse an IST date (YYYY-MM-DD) and time (HH:mm) into a UTC millisecond timestamp
 */
export function parseISTToTimestamp(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  // IST is UTC + 5:30 -> UTC is IST - 5:30
  return Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0, 0)
}

/**
 * Fetch historical OHLCV data centered around a historical starting point
 * Fetches warmup candles before the point + future replay candles.
 */
export async function fetchHistoricalReplayFeed(
  symbolId: string,
  interval: string,
  targetTimestamp: number
): Promise<{ candles: Candle[]; startIndex: number; symbolDef: SymbolDef }> {
  const sym = symbolById(symbolId)
  const binanceSymbol = sym.src

  let warmupRaw: any[] = []
  let forwardRaw: any[] = []
  let lastErr: any = null

  // Fetch warmup candles up to targetTimestamp (limit 250)
  for (const host of BINANCE_HOSTS) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      const url = `${host}/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&endTime=${targetTimestamp}&limit=250`
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok) {
        warmupRaw = await res.json()
        if (Array.isArray(warmupRaw) && warmupRaw.length > 0) break
      }
    } catch (e) {
      lastErr = e
    }
  }

  // Fetch forward candles starting from targetTimestamp (limit 600)
  for (const host of BINANCE_HOSTS) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      const url = `${host}/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&startTime=${targetTimestamp}&limit=600`
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok) {
        forwardRaw = await res.json()
        if (Array.isArray(forwardRaw) && forwardRaw.length > 0) break
      }
    } catch (e) {
      lastErr = e
    }
  }

  if ((!warmupRaw || warmupRaw.length === 0) && (!forwardRaw || forwardRaw.length === 0)) {
    throw new Error(
      `Historical market feed unavailable for ${sym.label} (${interval.toUpperCase()}) at this historical point. Please select a date within the exchange archive range.`
    )
  }

  // Merge and deduplicate
  const rawMerged = [...warmupRaw, ...forwardRaw]
  const map = new Map<number, Candle>()
  for (const k of rawMerged) {
    const t = Number(k[0])
    if (!map.has(t)) {
      map.set(t, {
        t,
        o: Number(k[1]),
        h: Number(k[2]),
        l: Number(k[3]),
        c: Number(k[4]),
        v: Number(k[5]),
      })
    }
  }

  const sortedCandles = Array.from(map.values()).sort((a, b) => a.t - b.t)

  if (sortedCandles.length < 30) {
    throw new Error(
      `Insufficient historical candles (${sortedCandles.length} returned) for ${sym.label} ${interval.toUpperCase()}. Please choose a different date or higher timeframe.`
    )
  }

  // Determine startIndex: the first candle on or immediately after targetTimestamp
  let startIndex = sortedCandles.findIndex((c) => c.t >= targetTimestamp)
  if (startIndex === -1) {
    // If all candles are before targetTimestamp, point to the last 1/3
    startIndex = Math.max(0, sortedCandles.length - 80)
  }

  // To ensure the SR Terminal engine has sufficient historical bars to compute
  // swings, ADX, ATR, liquidity pools, and EMA (which require >= 80 bars),
  // we clamp startIndex so there are at least 80 bars before it when available.
  if (startIndex < 80 && sortedCandles.length >= 100) {
    startIndex = Math.min(80, sortedCandles.length - 1)
  }

  const calibratedCandles = calibrateCandles(sym.id, sortedCandles)

  return {
    candles: calibratedCandles,
    startIndex,
    symbolDef: sym,
  }
}

/**
 * Clean model name for display
 */
export function cleanReplayModelName(text?: string): string {
  if (!text) return 'LIQUIDITY SWEEP'
  return text
    .replace(/SR CONCEPT PLUS ONE/gi, 'LIQUIDITY SWEEP + CISD')
    .replace(/SR CONCEPT REVERSAL/gi, 'LIQUIDITY SWEEP')
    .replace(/SR CONCEPT/gi, 'LIQUIDITY SWEEP')
    .replace(/TURTLE SOUP PLUS ONE/gi, 'LIQUIDITY SWEEP + CISD')
    .replace(/TURTLE SOUP REVERSAL/gi, 'LIQUIDITY SWEEP')
    .replace(/TURTLE SOUP/gi, 'LIQUIDITY SWEEP')
    .replace(/Turtle Soup/gi, 'Liquidity Sweep')
}

/**
 * Step replay forward: update open trades and check for new SR Terminal setups
 * Strictly evaluates only visibleCandles without looking ahead into future bars!
 */
export function evaluateReplayStep(
  visibleCandles: Candle[],
  currentIndex: number,
  interval: string,
  symbolDef: SymbolDef,
  conceptSelection: ConceptSelection,
  existingTrades: ReplayTrade[],
  backtestEnabled: boolean
): {
  analysis: Analysis
  updatedTrades: ReplayTrade[]
  newTrade: ReplayTrade | null
} {
  // 1. Run EXISTING SR Terminal analyse engine strictly on visibleCandles
  const analysis = analyse(visibleCandles, interval, [], conceptSelection, undefined, symbolDef.digits)

  if (!backtestEnabled || visibleCandles.length < 80) {
    return {
      analysis,
      updatedTrades: existingTrades,
      newTrade: null,
    }
  }

  const currentCandle = visibleCandles[currentIndex]
  let trades = [...existingTrades]
  let newTrade: ReplayTrade | null = null

  // 2. Update existing OPEN trades with the current candle
  trades = trades.map((t) => {
    if (t.status !== 'OPEN') return t

    const barsHeld = t.barsHeld + 1
    const d = symbolDef.digits

    if (t.direction === 'LONG') {
      // Check SL hit
      if (currentCandle.l <= t.stopLoss) {
        const ist = formatToISTString(currentCandle.t)
        return {
          ...t,
          status: 'CLOSED' as const,
          outcome: 'LOSS' as const,
          exitPrice: t.stopLoss,
          exitTimestamp: currentCandle.t,
          exitDateStrIST: ist.full,
          exitReason: 'SL' as const,
          pnlR: -1.0,
          pnlPoints: -(t.entryPrice - t.stopLoss),
          barsHeld,
        }
      }
      // Check TP1 hit
      if (currentCandle.h >= t.takeProfit1) {
        const ist = formatToISTString(currentCandle.t)
        const riskDist = Math.max(0.00001, t.entryPrice - t.stopLoss)
        const rewardDist = t.takeProfit1 - t.entryPrice
        const rMultiple = Number((rewardDist / riskDist).toFixed(2))
        return {
          ...t,
          status: 'CLOSED' as const,
          outcome: 'WIN' as const,
          exitPrice: t.takeProfit1,
          exitTimestamp: currentCandle.t,
          exitDateStrIST: ist.full,
          exitReason: 'TP' as const,
          pnlR: rMultiple,
          pnlPoints: rewardDist,
          barsHeld,
        }
      }
    } else {
      // SHORT trade
      // Check SL hit
      if (currentCandle.h >= t.stopLoss) {
        const ist = formatToISTString(currentCandle.t)
        return {
          ...t,
          status: 'CLOSED' as const,
          outcome: 'LOSS' as const,
          exitPrice: t.stopLoss,
          exitTimestamp: currentCandle.t,
          exitDateStrIST: ist.full,
          exitReason: 'SL' as const,
          pnlR: -1.0,
          pnlPoints: -(t.stopLoss - t.entryPrice),
          barsHeld,
        }
      }
      // Check TP1 hit
      if (currentCandle.l <= t.takeProfit1) {
        const ist = formatToISTString(currentCandle.t)
        const riskDist = Math.max(0.00001, t.stopLoss - t.entryPrice)
        const rewardDist = t.entryPrice - t.takeProfit1
        const rMultiple = Number((rewardDist / riskDist).toFixed(2))
        return {
          ...t,
          status: 'CLOSED' as const,
          outcome: 'WIN' as const,
          exitPrice: t.takeProfit1,
          exitTimestamp: currentCandle.t,
          exitDateStrIST: ist.full,
          exitReason: 'TP' as const,
          pnlR: rMultiple,
          pnlPoints: rewardDist,
          barsHeld,
        }
      }
    }

    return { ...t, barsHeld }
  })

  // 3. Detect if a new valid trade setup is triggered at this candle
  const plan = analysis?.plan
  if (analysis?.ok && plan && plan.valid && plan.entry > 0 && plan.stop > 0 && plan.tp1 > 0) {
    const hasOpenTradeInSameDir = trades.some((t) => t.status === 'OPEN' && t.direction === plan.direction)
    const tradeOnThisCandle = trades.some((t) => t.candleIndex === currentIndex)

    if (!hasOpenTradeInSameDir && !tradeOnThisCandle) {
      const ist = formatToISTString(currentCandle.t)
      const modelClean = cleanReplayModelName(plan.model)

      // Map model to concept key if possible
      let matchedConceptKey = 'liquidity'
      for (const c of CONCEPTS) {
        if (modelClean.toLowerCase().includes(c.key.toLowerCase()) || plan.model?.toLowerCase().includes(c.key.toLowerCase())) {
          matchedConceptKey = c.key
          break
        }
      }

      newTrade = {
        id: `replay_trade_${currentIndex}_${currentCandle.t}`,
        candleIndex: currentIndex,
        entryTimestamp: currentCandle.t,
        dateStrIST: ist.date,
        timeStrIST: ist.time,
        symbol: symbolDef.id,
        timeframe: interval.toUpperCase(),
        direction: plan.direction as 'LONG' | 'SHORT',
        entryPrice: plan.entry,
        stopLoss: plan.stop,
        takeProfit1: plan.tp1,
        takeProfit2: plan.tp2,
        conceptKey: matchedConceptKey,
        conceptLabel: modelClean,
        grade: plan.grade || 'A',
        status: 'OPEN',
        pnlR: 0,
        pnlPoints: 0,
        barsHeld: 0,
      }

      trades.push(newTrade)
    }
  }

  return {
    analysis,
    updatedTrades: trades,
    newTrade,
  }
}

/**
 * Compute factual backtest statistics from actual simulated trades
 */
export function calculateBacktestStats(trades: ReplayTrade[]): BacktestSummaryStats {
  const closed = trades.filter((t) => t.status === 'CLOSED')
  const open = trades.filter((t) => t.status === 'OPEN')
  const wins = closed.filter((t) => t.outcome === 'WIN')
  const losses = closed.filter((t) => t.outcome === 'LOSS')

  const winRate = closed.length > 0 ? Number(((wins.length / closed.length) * 100).toFixed(1)) : 0
  const totalR = Number(closed.reduce((acc, t) => acc + t.pnlR, 0).toFixed(2))

  const grossProfitR = wins.reduce((acc, t) => acc + t.pnlR, 0)
  const grossLossR = Math.abs(losses.reduce((acc, t) => acc + t.pnlR, 0))
  const profitFactor = grossLossR > 0 ? Number((grossProfitR / grossLossR).toFixed(2)) : grossProfitR > 0 ? 99.9 : 0
  const avgRR = wins.length > 0 ? Number((grossProfitR / wins.length).toFixed(2)) : 0

  const grossProfitPoints = wins.reduce((acc, t) => acc + Math.max(0, t.pnlPoints), 0)
  const grossLossPoints = Math.abs(losses.reduce((acc, t) => acc + (t.pnlPoints < 0 ? t.pnlPoints : 0), 0))
  const netPoints = Number((grossProfitPoints - grossLossPoints).toFixed(4))

  const manualTradesCount = trades.filter((t) => t.tradeType === 'MANUAL').length
  const autoTradesCount = trades.filter((t) => t.tradeType !== 'MANUAL').length

  // Calculate maximum drawdown in R
  let peakR = 0
  let currentCumR = 0
  let maxDDR = 0
  for (const t of closed) {
    currentCumR += t.pnlR
    if (currentCumR > peakR) {
      peakR = currentCumR
    }
    const dd = peakR - currentCumR
    if (dd > maxDDR) {
      maxDDR = dd
    }
  }

  // Concept-wise breakdown
  const conceptStats: Record<string, ConceptBacktestStats> = {}
  for (const c of CONCEPTS) {
    const cTrades = closed.filter((t) => t.conceptKey === c.key || t.conceptLabel.toLowerCase().includes(c.key.toLowerCase()))
    const cWins = cTrades.filter((t) => t.outcome === 'WIN').length
    const cLosses = cTrades.filter((t) => t.outcome === 'LOSS').length
    const cTotalR = Number(cTrades.reduce((acc, t) => acc + t.pnlR, 0).toFixed(2))
    const cWinRate = cTrades.length > 0 ? Number(((cWins / cTrades.length) * 100).toFixed(1)) : 0
    const cWinsSum = cTrades.filter((t) => t.outcome === 'WIN').reduce((acc, t) => acc + t.pnlR, 0)
    const cAvgRR = cWins > 0 ? Number((cWinsSum / cWins).toFixed(2)) : 0

    conceptStats[c.key] = {
      conceptKey: c.key,
      conceptLabel: c.label,
      totalTrades: cTrades.length,
      wins: cWins,
      losses: cLosses,
      winRate: cWinRate,
      totalR: cTotalR,
      avgRR: cAvgRR,
    }
  }

  // Timeframe-wise breakdown
  const timeframeStats: Record<string, { trades: number; wins: number; losses: number; winRate: number; totalR: number }> = {}
  for (const t of closed) {
    const tf = t.timeframe
    if (!timeframeStats[tf]) {
      timeframeStats[tf] = { trades: 0, wins: 0, losses: 0, winRate: 0, totalR: 0 }
    }
    timeframeStats[tf].trades += 1
    if (t.outcome === 'WIN') timeframeStats[tf].wins += 1
    if (t.outcome === 'LOSS') timeframeStats[tf].losses += 1
    timeframeStats[tf].totalR = Number((timeframeStats[tf].totalR + t.pnlR).toFixed(2))
  }
  for (const tf in timeframeStats) {
    const item = timeframeStats[tf]
    item.winRate = item.trades > 0 ? Number(((item.wins / item.trades) * 100).toFixed(1)) : 0
  }

  return {
    totalSetups: trades.length,
    closedTrades: closed.length,
    openTrades: open.length,
    wins: wins.length,
    losses: losses.length,
    winRate,
    profitFactor,
    totalR,
    grossProfitR: Number(grossProfitR.toFixed(2)),
    grossLossR: Number(grossLossR.toFixed(2)),
    grossProfitPoints: Number(grossProfitPoints.toFixed(4)),
    grossLossPoints: Number(grossLossPoints.toFixed(4)),
    netPoints,
    avgRR,
    maxDrawdownR: Number(maxDDR.toFixed(2)),
    manualTradesCount,
    autoTradesCount,
    conceptStats,
    timeframeStats,
  }
}
