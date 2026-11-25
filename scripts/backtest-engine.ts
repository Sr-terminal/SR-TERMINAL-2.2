/**
 * SR TERMINAL — CHRONOLOGICAL BACKTEST ENGINE
 * 
 * Validates the core ICT trading concepts without lookahead bias,
 * and verifies that the TradeLifecycleEngine prevents duplicate entries,
 * properly manages setup transitions, and produces accurate metrics.
 */

import { analyse } from '../src/lib/ict'
import {
  classifySetup,
  updateTradeLifecycleOnTick,
  isTerminalStage,
  type ImmutableTradeRecord,
} from '../src/lib/tradeLifecycleEngine'
import { fetchKlines, type Candle } from '../src/lib/market'
import type { ConceptSelection } from '../src/lib/concepts'

interface BacktestTrade {
  id: string
  signalId: string
  symbol: string
  tf: string
  direction: 'LONG' | 'SHORT'
  model: string
  session: string
  marketCondition: string
  entry: number
  stop: number
  tp1: number
  tp2: number
  tp3: number
  resultR: number
  outcome: 'TP1' | 'TP2' | 'TP3' | 'BREAKEVEN' | 'STOPPED' | 'INVALIDATED' | 'EXPIRED'
  entryTs: number
  closeTs: number
  maxAdverseR: number
}

const DEFAULT_CONCEPTS: ConceptSelection = {
  mode: 'BALANCED',
  keys: {
    liquidity: true,
    turtleSoup: true,
    adxTrend: true,
    orderFlow: true,
    pdArrays: true,
    fractal: true,
    news: false,
    risk: true,
  },
}

function getSessionName(ts: number): string {
  const date = new Date(ts)
  const utcHour = date.getUTCHours()
  if (utcHour >= 7 && utcHour < 11) return 'London Killzone'
  if (utcHour >= 12 && utcHour < 16) return 'NY AM Killzone'
  if (utcHour >= 18 && utcHour < 21) return 'NY PM Killzone'
  if (utcHour >= 0 && utcHour < 6) return 'Asian Range'
  return 'Off-Session'
}

function estimateMarketCondition(candles: Candle[]): 'TREND_UP' | 'TREND_DOWN' | 'RANGE' | 'VOLATILITY' {
  if (candles.length < 20) return 'RANGE'
  const first = candles[0].c
  const last = candles[candles.length - 1].c
  const diffPct = ((last - first) / first) * 100

  let totalRange = 0
  for (const c of candles) {
    totalRange += (c.h - c.l) / c.c
  }
  const avgRange = totalRange / candles.length

  if (avgRange > 0.015) return 'VOLATILITY'
  if (diffPct > 1.0) return 'TREND_UP'
  if (diffPct < -1.0) return 'TREND_DOWN'
  return 'RANGE'
}

export async function runBacktest() {
  console.log('======================================================================')
  console.log('       SR TERMINAL — CHRONOLOGICAL REAL-MARKET BACKTEST AUDIT        ')
  console.log('======================================================================\n')

  const symbols = [
    { id: 'BTCUSD', src: 'BTCUSDT', label: 'BTC', digits: 2 },
    { id: 'EURUSD', src: 'EURUSDT', label: 'EURO', digits: 5 },
    { id: 'GBPUSD', src: 'GBPUSDT', label: 'GBP', digits: 5 },
    { id: 'ETHUSD', src: 'ETHUSDT', label: 'ETH', digits: 2 },
    { id: 'XAUUSD', src: 'PAXGUSDT', label: 'GOLD', digits: 2 },
  ]

  const timeframes = [
    { tf: '5m', htf: '1h' },
    { tf: '15m', htf: '4h' },
    { tf: '1h', htf: '1d' },
  ]

  const allCompletedTrades: BacktestTrade[] = []
  let duplicatePreventedCount = 0

  for (const sym of symbols) {
    for (const tfPair of timeframes) {
      process.stdout.write(`Fetching ${sym.label} (${sym.id}) ${tfPair.tf} & ${tfPair.htf}... `)
      let candles: Candle[] = []
      let htfCandles: Candle[] = []
      try {
        const [c, hc] = await Promise.all([
          fetchKlines(sym.src, tfPair.tf, 800),
          fetchKlines(sym.src, tfPair.htf, 400),
        ])
        candles = c
        htfCandles = hc
        console.log(`[OK] loaded ${candles.length} candles + ${htfCandles.length} HTF`)
      } catch (err: any) {
        console.log(`[Failed: ${err.message}]`)
        continue
      }

      if (candles.length < 120) continue

      let activeTrades: ImmutableTradeRecord[] = []
      const lookbackWindow = 85

      for (let i = lookbackWindow; i < candles.length; i++) {
        const windowSlice = candles.slice(i - lookbackWindow, i + 1)
        const currentCandle = candles[i]
        const currentTs = currentCandle.t

        // Get HTF candles strictly up to current timestamp (no lookahead)
        const currentHtfSlice = htfCandles.filter((hc) => hc.t <= currentTs).slice(-60)

        // 1. Tick active trades against current candle price with realistic intrabar path
        const isBull = currentCandle.c >= currentCandle.o
        const intrabarPath = isBull
          ? [currentCandle.o, currentCandle.l, currentCandle.h, currentCandle.c]
          : [currentCandle.o, currentCandle.h, currentCandle.l, currentCandle.c]

        for (const pricePoint of intrabarPath) {
          const tickRes = updateTradeLifecycleOnTick(activeTrades, sym.id, pricePoint, currentTs)
          activeTrades = tickRes.records
        }

        // Harvest terminal trades
        const remainingActive: ImmutableTradeRecord[] = []
        for (const t of activeTrades) {
          if (isTerminalStage(t.stage)) {
            if (t.stage !== 'INVALIDATED' && t.stage !== 'EXPIRED') {
              const barsHeld = Math.round((t.statusTs - t.createdTs) / (tfPair.tf === '5m' ? 300000 : tfPair.tf === '15m' ? 900000 : 3600000))
              console.log(`[TRADE ${t.stage}] ${sym.id} ${tfPair.tf} ${t.direction} ${t.model} | BarsHeld: ${barsHeld} | Entry: ${t.entry} SL: ${t.stop} TP1: ${t.tp1} TP2: ${t.tp2} | Events: ${t.events.map(e => `${e.stage}@${e.price}`).join(' -> ')}`)
              allCompletedTrades.push({
                id: t.id,
                signalId: t.signalId,
                symbol: sym.id,
                tf: tfPair.tf,
                direction: t.direction,
                model: t.model,
                session: getSessionName(t.createdTs),
                marketCondition: estimateMarketCondition(windowSlice.slice(-20)),
                entry: t.entry,
                stop: t.stop,
                tp1: t.tp1,
                tp2: t.tp2,
                tp3: t.tp3,
                resultR: t.resultR ?? (t.stage === 'STOPPED' ? -1 : 1),
                outcome: t.stage as any,
                entryTs: t.createdTs,
                closeTs: t.statusTs,
                maxAdverseR: t.maxAdverseR || 0,
              })
            }
          } else {
            remainingActive.push(t)
          }
        }
        activeTrades = remainingActive

        // 2. ICT Setup Scan on historical window with HTF context & concepts
        const analysis = analyse(windowSlice, tfPair.tf, currentHtfSlice, DEFAULT_CONCEPTS, undefined, sym.digits)
        if (analysis?.plan?.valid && analysis.plan.direction !== 'STAND ASIDE') {
          const classification = classifySetup(
            analysis.plan,
            sym.id,
            sym.label,
            tfPair.tf,
            currentCandle.c,
            activeTrades,
            sym.digits,
            currentTs
          )

          if (classification.type === 'NEW_SETUP') {
            activeTrades.push(classification.trade)
          } else if (classification.type === 'UPDATE_EXISTING') {
            activeTrades = activeTrades.map((t) =>
              t.id === classification.trade.id ? classification.trade : t
            )
          } else if (classification.type === 'TRADE_ALREADY_ACTIVE') {
            duplicatePreventedCount++
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------
  // Metric Calculations
  // ---------------------------------------------------------------
  const total = allCompletedTrades.length
  if (total === 0) {
    console.log('\nNo completed trades generated in backtest period.')
    return
  }

  const wins = allCompletedTrades.filter((t) => t.resultR > 0)
  const losses = allCompletedTrades.filter((t) => t.resultR < 0)
  const breakevens = allCompletedTrades.filter((t) => Math.abs(t.resultR) <= 0.05)

  const winRate = (wins.length / total) * 100
  const lossRate = (losses.length / total) * 100
  const beRate = (breakevens.length / total) * 100

  const totalGrossGain = wins.reduce((sum, t) => sum + t.resultR, 0)
  const totalGrossLoss = Math.abs(losses.reduce((sum, t) => sum + t.resultR, 0))
  const profitFactor = totalGrossLoss > 0 ? totalGrossGain / totalGrossLoss : totalGrossGain
  const netR = totalGrossGain - totalGrossLoss
  const expectancy = netR / total
  const avgWinR = wins.length > 0 ? totalGrossGain / wins.length : 0

  // Target Hit Rates
  const tp1Count = allCompletedTrades.filter((t) => t.outcome === 'TP1' || t.outcome === 'TP2' || t.outcome === 'TP3' || t.resultR >= 0.8).length
  const tp2Count = allCompletedTrades.filter((t) => t.outcome === 'TP2' || t.outcome === 'TP3' || t.resultR >= 1.8).length
  const tp3Count = allCompletedTrades.filter((t) => t.outcome === 'TP3' || t.resultR >= 2.5).length
  const slCount = losses.length

  const tp1Rate = (tp1Count / total) * 100
  const tp2Rate = (tp2Count / total) * 100
  const tp3Rate = (tp3Count / total) * 100
  const slRate = (slCount / total) * 100

  // Drawdown & Consecutive Losses
  let runningR = 0
  let peakR = 0
  let maxDrawdownR = 0
  let currentConsecutiveLosses = 0
  let maxConsecutiveLosses = 0

  for (const t of allCompletedTrades) {
    runningR += t.resultR
    if (runningR > peakR) peakR = runningR
    const dd = peakR - runningR
    if (dd > maxDrawdownR) maxDrawdownR = dd

    if (t.resultR < 0) {
      currentConsecutiveLosses++
      if (currentConsecutiveLosses > maxConsecutiveLosses) {
        maxConsecutiveLosses = currentConsecutiveLosses
      }
    } else {
      currentConsecutiveLosses = 0
    }
  }

  // Print Overall Performance
  console.log('\n--- 1. OVERALL BACKTEST PERFORMANCE METRICS ---')
  console.log(`Total Trades Executed:      ${total}`)
  console.log(`Duplicate Entries Blocked:  ${duplicatePreventedCount} (State Machine Locked)`)
  console.log(`Win Rate:                   ${winRate.toFixed(1)}% (${wins.length} wins)`)
  console.log(`Loss Rate:                  ${lossRate.toFixed(1)}% (${losses.length} losses)`)
  console.log(`Breakeven Rate:             ${beRate.toFixed(1)}% (${breakevens.length} BEs)`)
  console.log(`Profit Factor:              ${profitFactor.toFixed(2)}`)
  console.log(`Expectancy (EV per trade):  ${expectancy >= 0 ? '+' : ''}${expectancy.toFixed(2)}R`)
  console.log(`Average Win:                +${avgWinR.toFixed(2)}R`)
  console.log(`Net Return (Net R):         ${netR >= 0 ? '+' : ''}${netR.toFixed(1)}R`)
  console.log(`Max Drawdown:               -${maxDrawdownR.toFixed(2)}R`)
  console.log(`Max Consecutive Losses:     ${maxConsecutiveLosses}`)
  console.log(`TP1 Hit Rate:               ${tp1Rate.toFixed(1)}%`)
  console.log(`TP2 Hit Rate:               ${tp2Rate.toFixed(1)}%`)
  console.log(`TP3 Runner Hit Rate:        ${tp3Rate.toFixed(1)}%`)
  console.log(`Stop Loss Hit Rate:         ${slRate.toFixed(1)}%\n`)

  // Breakdowns
  function printBreakdown(title: string, keyExtractor: (t: BacktestTrade) => string) {
    console.log(`--- ${title} ---`)
    const groups = new Map<string, BacktestTrade[]>()
    for (const t of allCompletedTrades) {
      const k = keyExtractor(t)
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k)!.push(t)
    }

    console.log(
      'Category'.padEnd(20) +
      'Trades'.padEnd(10) +
      'Win Rate'.padEnd(12) +
      'Profit Factor'.padEnd(16) +
      'Net R'.padEnd(10)
    )
    console.log(''.padEnd(68, '-'))

    for (const [cat, trs] of groups.entries()) {
      const gTotal = trs.length
      const gWins = trs.filter((t) => t.resultR > 0).length
      const gLosses = trs.filter((t) => t.resultR < 0).length
      const gGain = trs.filter((t) => t.resultR > 0).reduce((sum, t) => sum + t.resultR, 0)
      const gLoss = Math.abs(trs.filter((t) => t.resultR < 0).reduce((sum, t) => sum + t.resultR, 0))
      const gPF = gLoss > 0 ? (gGain / gLoss).toFixed(2) : gGain.toFixed(2)
      const gNetR = (gGain - gLoss).toFixed(1)
      const gWR = ((gWins / gTotal) * 100).toFixed(1) + '%'

      console.log(
        cat.padEnd(20) +
        String(gTotal).padEnd(10) +
        gWR.padEnd(12) +
        String(gPF).padEnd(16) +
        (`${Number(gNetR) >= 0 ? '+' : ''}${gNetR}R`).padEnd(10)
      )
    }
    console.log('\n')
  }

  printBreakdown('2. BREAKDOWN BY SYMBOL', (t) => t.symbol)
  printBreakdown('3. BREAKDOWN BY TIMEFRAME', (t) => t.tf)
  printBreakdown('4. BREAKDOWN BY SESSION', (t) => t.session)
  printBreakdown('5. BREAKDOWN BY MARKET CONDITION', (t) => t.marketCondition)
  printBreakdown('6. BREAKDOWN BY SETUP / MODEL', (t) => t.model.slice(0, 18))

  console.log('======================================================================')
  console.log('                    BACKTEST AUDIT COMPLETED                         ')
  console.log('======================================================================')
}

runBacktest().catch((err) => {
  console.error('Backtest error:', err)
})
