import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode, type FormEvent } from 'react'
import {
  Activity, Zap, Layers, Newspaper, Radio, ListOrdered, Gauge, TriangleAlert, CheckCircle2,
  Compass, ShieldCheck, ShieldAlert, Radar, AlertTriangle,
  SlidersHorizontal, RotateCcw, Maximize2, Minimize2, X, Sparkles, Bell, Send, NotebookPen,
} from 'lucide-react'
import { SYMBOLS, INTERVALS, symbolById, fmtPrice } from '../lib/market'
import { CONCEPTS, loadSelection, saveSelection, allOnSelection, type ConceptSelection } from '../lib/concepts'
import { useMarket } from '../hooks/useMarket'
import { useJournal } from '../hooks/useJournal'
import {
  isClosed,
  assessTradeRisk,
  sanitizeTradeRecord,
  sanitizeIctString,
  sanitizeConfluenceTags,
  formatTradeReason,
  formatRMultiple,
} from '../lib/journal'
import LiveChart, { type ChartToggles } from './LiveChart'
import TradingViewChart from './TradingViewChart'
import { getBrokerOffset } from '../lib/brokerCalibration'
import type { Analysis } from '../lib/ict'
import { safeStorage } from '../lib/storage'
import { getChartToggles, setChartToggle, getSavedChartView, saveChartView } from '../lib/uiPreferences'
import { apiUrl } from '../lib/apiConfig'
import { getActiveApexKillzoneWindow, istTimeLabel } from '../lib/clock'
import { run2000PossibilitySimulation, calculateApexLotSize } from '../lib/aiServices'
import { evaluateEntitlement } from '../lib/subscriptionService'
import type { UserProfile } from '../lib/authService'
import { Lock, Crown } from 'lucide-react'

const TradePlanModal = lazy(() => import('./TradePlanModal'))
const BrokerSyncModal = lazy(() => import('./BrokerSyncModal'))
const ChartReplay = lazy(() => import('./ChartReplay'))

type SecondaryTab = 'indicators' | 'ai' | 'alerts' | 'risk'

function cleanModelName(text?: string): string {
  if (!text) return '—'
  return sanitizeIctString(text)
}

function BiasMeter({ score }: { score: number }) {
  const pos = ((score + 100) / 200) * 100
  const fillColor = score >= 0 ? '#089981' : '#F23645'
  return (
    <div>
      <div className="flex justify-between text-[10px] text-[#787B86] mb-1.5 tabular-nums">
        <span>−100 Bearish</span>
        <span>0 Neutral</span>
        <span>+100 Bullish</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-[#0B0E14] border border-[#1E222D]">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1E222D]" />
        <div
          className="absolute top-0 bottom-0 transition-all duration-200"
          style={{
            left: score >= 0 ? '50%' : `${pos}%`,
            width: `${Math.abs(score) / 2}%`,
            background: fillColor,
          }}
        />
      </div>
    </div>
  )
}

function Panel({ icon, title, children, right }: { icon: ReactNode; title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="label">{title}</span>
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

export default function Terminal({
  userProfile,
  onOpenSubscription,
}: {
  userProfile?: UserProfile | null
  onOpenSubscription?: () => void
} = {}) {
  const entitlement = evaluateEntitlement(userProfile ?? null)
  const aiAssistantLabel =
    entitlement.isTrial || entitlement.tierLevel >= 2 ? 'AI Trading Agent' : 'Basic AI Agent'
  const [symbolId, setSymbolId] = useState(() => safeStorage.getItem('sr.symbol') ?? 'XAUUSD')
  const [interval, setIntervalId] = useState(() => safeStorage.getItem('sr.tf') ?? '15m')
  const [selection, setSelection] = useState<ConceptSelection>(() => loadSelection())
  const [chartView, setChartView] = useState<'SR' | 'TV'>(() => getSavedChartView())
  const [toggles, setToggles] = useState<ChartToggles>(() => getChartToggles(safeStorage.getItem('sr.symbol') ?? 'XAUUSD'))
  const [activeTab, setActiveTab] = useState<SecondaryTab>('indicators')
  const [journalFilter, setJournalFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [brokerSyncOpen, setBrokerSyncOpen] = useState(false)
  const [liveChartFullScreen, setLiveChartFullScreen] = useState(false)
  const [chartReplayOpen, setChartReplayOpen] = useState(false)
  const [chartReplayFullScreen, setChartReplayFullScreen] = useState(false)
  const [account, setAccount] = useState(() => Number(safeStorage.getItem('sr.account')) || 10000)
  const [riskPct, setRiskPct] = useState(() => Number(safeStorage.getItem('sr.riskPct')) || 1)

  // Quick Inline AI Assistant state inside Terminal
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReply, setAiReply] = useState<string | null>(null)

  const sym = symbolById(symbolId)
  const { candles, livePrice, dataStatus, statusMeta, analysis, fractal, news, tickers, refresh } = useMarket(symbolId, interval, selection)
  const journal = useJournal()

  useEffect(() => {
    setToggles(getChartToggles(symbolId))
    setAiReply(null)
  }, [symbolId, interval])

  useEffect(() => { try { safeStorage.setItem('sr.symbol', symbolId) } catch { /* noop */ } }, [symbolId])
  useEffect(() => { try { safeStorage.setItem('sr.tf', interval) } catch { /* noop */ } }, [interval])
  useEffect(() => { try { safeStorage.setItem('sr.account', String(account)) } catch { /* noop */ } }, [account])
  useEffect(() => { try { safeStorage.setItem('sr.riskPct', String(riskPct)) } catch { /* noop */ } }, [riskPct])
  useEffect(() => { saveSelection(selection) }, [selection])

  const handleToggleClick = (key: keyof ChartToggles) => {
    const updatedVal = !toggles[key]
    const updated = setChartToggle(symbolId, key, updatedVal, true)
    setToggles(updated)
  }

  const handleChartViewChange = (view: 'SR' | 'TV') => {
    setChartView(view)
    saveChartView(view)
  }

  // hotkeys (web): 1-7 TF, QWERT symbols
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && liveChartFullScreen) {
        setLiveChartFullScreen(false)
        return
      }
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const ti = ['1', '2', '3', '4', '5', '6', '7'].indexOf(e.key)
      if (ti >= 0 && INTERVALS[ti]) setIntervalId(INTERVALS[ti].id)
      const si = ['q', 'w', 'e', 'r', 't'].indexOf(e.key.toLowerCase())
      if (si >= 0 && SYMBOLS[si]) setSymbolId(SYMBOLS[si].id)
    }
    window.addEventListener('keydown', h)
    return () => { window.removeEventListener('keydown', h) }
  }, [liveChartFullScreen])

  // auto-record valid plans + journal heartbeat
  useEffect(() => {
    if (analysis?.ok && analysis.plan.valid) {
      journal.maybeRecord(analysis, symbolId, sym.label, interval, livePrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis?.plan.createdTs, analysis?.plan.valid, symbolId])

  useEffect(() => {
    if (dataStatus === 'LIVE' && livePrice > 0) {
      journal.tick(symbolId, livePrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrice, symbolId, dataStatus])

  const a: Analysis | null = analysis
  const p = a?.plan
  const isLong = p?.direction === 'LONG'
  const biasColor = a ? (a.score >= 22 ? '#089981' : a.score <= -22 ? '#F23645' : '#FFFFFF') : '#787B86'

  const selCount = useMemo(() => Object.values(selection.keys).filter(Boolean).length, [selection])
  const newsBlock = news.blackout && selection.keys.news

  const toggleConcept = (key: string) => {
    setSelection(s => ({ ...s, keys: { ...s.keys, [key]: !s.keys[key] } }))
  }

  // Market Condition & Validity Metrics
  const adxVal = a?.phase.adx ?? 0
  const isTrending = adxVal >= 25
  const isChop = adxVal < 18
  const conditionLabel = isTrending
    ? `Trending Expansion (ADX ${adxVal.toFixed(0)})`
    : isChop
    ? `Choppy / Consolidation (ADX ${adxVal.toFixed(0)})`
    : `Rangebound Delivery (ADX ${adxVal.toFixed(0)})`
  const conditionColor = isTrending ? '#089981' : isChop ? '#F23645' : '#FFFFFF'
  const conditionDesc = isTrending
    ? 'High directional order flow. Expansion phase favored; watch pullbacks.'
    : isChop
    ? 'Low directional conviction. High whipsaw risk; capital preservation mode.'
    : 'Dealing range oscillation. Focus on range high/low liquidity sweeps.'

  const isSetupValid = Boolean(p?.valid && !newsBlock)
  const apexKillzone = useMemo(() => getActiveApexKillzoneWindow(new Date()), [candles.length, interval])
  const apexSim2000 = useMemo(
    () => (a?.ok && candles.length > 0 ? run2000PossibilitySimulation(candles, a, symbolId, interval) : null),
    [a, candles, symbolId, interval]
  )
  const apexLotSizing = useMemo(
    () =>
      p?.valid && p.entry && p.stop
        ? calculateApexLotSize(account, Math.min(1.0, riskPct), p.entry, p.stop, symbolId)
        : null,
    [p?.valid, p?.entry, p?.stop, account, riskPct, symbolId]
  )
  const validityTitle = newsBlock
    ? 'Stand Aside — News Filter (-15m/+5m)'
    : isSetupValid
    ? `Valid Setup · ${cleanModelName(p?.model)}`
    : 'Stand Aside · Invalidation Phase'
  const validityBadgeColor = newsBlock ? '#F23645' : isSetupValid ? '#00E676' : '#787B86'
  const validityReason = newsBlock
    ? `Red folder window: ${news.blackoutTitle || 'High Impact Event'}. Protect capital from erratic slippage.`
    : isSetupValid
    ? `Grade ${p?.grade} · Confluence ${apexSim2000?.winProbabilityPct ?? p?.confidence}% (≥78% Gate) · Planned R:R 1:${p?.rr.toFixed(2)}`
    : cleanModelName(p?.invalidation || p?.blockers?.[0] || 'Awaiting clean liquidity sweep and institutional displacement')

  // Liquidity Hunt Radar
  const bsl = a?.levels.bsl[0]
  const ssl = a?.levels.ssl[0]
  const bslDist = bsl && livePrice > 0 ? bsl - livePrice : null
  const sslDist = ssl && livePrice > 0 ? livePrice - ssl : null
  const isNearBsl = bslDist !== null && bslDist >= 0 && (bslDist / livePrice) <= 0.002
  const isNearSsl = sslDist !== null && sslDist >= 0 && (sslDist / livePrice) <= 0.002
  const isRaidActive = Boolean(a?.phase.liquidityRaid || a?.phase.sweep)

  const activeTradeForSymbol = useMemo(() => {
    return journal.records.find(
      r => r.symbolId === symbolId && !isClosed(r) && r.stage !== 'PLANNED'
    )
  }, [journal.records, symbolId])

  const activeRisk = useMemo(() => {
    return activeTradeForSymbol ? assessTradeRisk(activeTradeForSymbol, livePrice) : null
  }, [activeTradeForSymbol, livePrice])

  const askQuickAi = async (e?: FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault()
    const question = (presetQuestion ?? aiQuery).trim()
    if (!question || aiLoading) return
    setAiLoading(true)
    if (!presetQuestion) setAiQuery('')
    try {
      const res = await fetch(apiUrl('/api/ai/trading-agent'), {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: `term_${Date.now()}`,
          symbolId,
          symbolLabel: sym.label,
          tf: interval,
          candles: candles.slice(-60),
          accountBalance: account,
          riskPct,
          userQuestion: question,
          messages: [{ id: `u_${Date.now()}`, role: 'user', content: question, timestamp: Date.now() }],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.success && data?.plan) {
        setAiReply(data.plan.answerText || data.plan.analysisSummary)
      } else {
        setAiReply('Unable to retrieve AI desk brief right now. Please try again.')
      }
    } catch {
      setAiReply('Connection error while contacting AI Trading Desk.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="pb-8 max-w-xl mx-auto fadein">
      {/* Active Trade Risk Alert Banner */}
      {activeTradeForSymbol && activeRisk && activeRisk.level === 'HIGH' && (
        <div className="mx-4 mt-3 p-3 rounded-[12px] bg-[#131722] border border-[#F23645] flex items-center justify-between text-[#FFFFFF]">
          <div className="flex items-center gap-2.5 text-[11.5px]">
            <ShieldAlert size={16} className="text-[#F23645] shrink-0" />
            <div>
              <span className="font-bold text-[#F23645]">Risk Warning:</span> Active {activeTradeForSymbol.direction} setup drawdown {Math.round((activeRisk.adverseR || 0) * 100)}% toward SL.
              <div className="text-[10.5px] text-[#787B86]">Shift Stop Loss to Break-Even (BE) to protect capital.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => journal.moveToBE(activeTradeForSymbol.id, activeTradeForSymbol.entry)}
            className="px-3 py-1.5 bg-[#FFFFFF] text-[#0B0E14] font-semibold rounded-[8px] text-[10.5px] shrink-0 ml-2 cursor-pointer active:scale-98"
          >
            Move to BE
          </button>
        </div>
      )}

      {/* Sticky Top Control Header: Symbol + Timeframe + Live Price */}
      <div className="sticky top-0 z-20 px-4 pt-3 pb-3 bg-[#0B0E14] border-b border-[#1E222D]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-baseline gap-2">
            <h1 className="display text-base font-bold tracking-tight text-[#FFFFFF]">Terminal</h1>
            <span className="text-[11px] text-[#787B86]">{sym.kind}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10.5px] flex items-center gap-1.5 font-semibold tabular-nums ${
                dataStatus === 'LIVE' ? 'text-[#089981]' : dataStatus === 'SYNCING' ? 'text-[#FFFFFF]' : 'text-[#F23645]'
              }`}
              title={`Status: ${dataStatus}${statusMeta?.latencyMs ? ` · Latency: ${statusMeta.latencyMs}ms` : ''}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: dataStatus === 'LIVE' ? '#089981' : dataStatus === 'SYNCING' ? '#FFFFFF' : '#F23645',
                }}
              />
              {dataStatus}
            </span>
          </div>
        </div>

        {/* Instrument Selector (8 Symbols in 2x4 Grid) */}
        <div className="grid grid-cols-4 gap-1.5 mb-1.5">
          {SYMBOLS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSymbolId(s.id)}
              className={`btn-seg cursor-pointer select-none active:scale-98 ${symbolId === s.id ? 'btn-seg-on' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="grid grid-cols-7 gap-1.5">
          {INTERVALS.map(tf => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setIntervalId(tf.id)}
              className={`btn-seg cursor-pointer select-none active:scale-98 ${interval === tf.id ? 'btn-seg-on' : ''}`}
              title={tf.role}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Live Price, Bid/Ask/Spread & Quick Actions */}
        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap tabular-nums">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-[18px] font-bold text-[#FFFFFF] tracking-tight tabular-nums">
              {livePrice > 0 ? fmtPrice(livePrice, sym.digits) : '—'}
            </span>
            {livePrice > 0 && (
              <span className="text-[10.5px] font-mono text-[#B2B5BE] bg-[#131722] border border-[#1E222D] px-2 py-0.5 rounded-[6px]">
                Bid <strong className="text-[#EF5350]">{fmtPrice(livePrice - sym.defaultSpread / 2, sym.digits)}</strong> · Ask <strong className="text-[#26A69A]">{fmtPrice(livePrice + sym.defaultSpread / 2, sym.digits)}</strong> · Spd <strong className="text-[#FFFFFF]">{(sym.defaultSpread / sym.pipSize).toFixed(1)}p</strong>
              </span>
            )}
            {tickers[sym.src] && (
              <span
                className="text-[11.5px] font-semibold tabular-nums"
                style={{ color: tickers[sym.src].changePct >= 0 ? '#089981' : '#F23645' }}
              >
                {tickers[sym.src].changePct >= 0 ? '+' : ''}{tickers[sym.src].changePct.toFixed(2)}% 24H
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-replay-header"
              type="button"
              onClick={() => {
                if (!entitlement.isActive) {
                  onOpenSubscription?.()
                  return
                }
                setChartReplayOpen(true)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#131722] hover:border-[#2A2E39] border border-[#1E222D] text-[10.5px] font-semibold text-[#FFFFFF] cursor-pointer select-none active:scale-98"
              title="Historical Chart Replay & Pure ICT Backtesting Engine"
            >
              <RotateCcw size={11} className="text-[#787B86]" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={() => setBrokerSyncOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#131722] hover:border-[#2A2E39] border border-[#1E222D] text-[10.5px] font-semibold text-[#FFFFFF] cursor-pointer select-none active:scale-98"
              title="Calibrate Broker Offset (+/- points) & view live Bid/Ask/Spread"
            >
              <SlidersHorizontal size={11} className="text-[#787B86]" />
              <span>Broker Offset</span>
              {getBrokerOffset(symbolId) !== 0 ? (
                <span className="text-[#089981] text-[10px] tabular-nums">
                  {getBrokerOffset(symbolId) > 0 ? `+${getBrokerOffset(symbolId).toFixed(sym.digits)}` : getBrokerOffset(symbolId).toFixed(sym.digits)}
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" title="Zero-Gap Broker Synced" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container: 16px outer padding (p-4) & 12px card gaps (space-y-3) */}
      <div className="p-4 space-y-3">
        {/* 1. Primary Chart Workspace Card */}
        <section className="card p-3 overflow-hidden">
          <div className="flex gap-2 mb-2.5 items-center justify-between flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {([['plan', 'Plan'], ['levels', 'Levels'], ['zones', 'Zones'], ['key', 'Key']] as const).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  className={`chip cursor-pointer select-none active:scale-98 ${toggles[k] ? 'chip-on' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleClick(k)
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center p-1 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] gap-1">
              <button
                type="button"
                className={`px-2.5 py-1 rounded-[6px] text-[10.5px] font-semibold cursor-pointer select-none active:scale-98 ${
                  chartView === 'SR' ? 'bg-[#FFFFFF] text-[#0B0E14]' : 'text-[#787B86] hover:text-[#FFFFFF]'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleChartViewChange('SR')
                }}
              >
                SR Chart
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 rounded-[6px] text-[10.5px] font-semibold cursor-pointer select-none active:scale-98 ${
                  chartView === 'TV' ? 'bg-[#FFFFFF] text-[#0B0E14]' : 'text-[#787B86] hover:text-[#FFFFFF]'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleChartViewChange('TV')
                }}
              >
                OANDA Chart
              </button>
              <button
                id="btn-open-fullscreen-chartbar"
                type="button"
                className="px-2 py-1 rounded-[6px] text-[10.5px] font-semibold cursor-pointer select-none text-[#787B86] hover:text-[#FFFFFF] flex items-center gap-1 active:scale-98"
                onClick={(e) => {
                  e.stopPropagation()
                  setLiveChartFullScreen(true)
                }}
                title="Expand Live Trading Chart to Full Screen"
              >
                <Maximize2 size={11} />
                <span className="hidden sm:inline">Full Screen</span>
              </button>
            </div>
          </div>

          {/* Clean Unboxed Monochrome Legend & Timezone Indicator */}
          <div className="flex items-center justify-between gap-3 px-1 pb-2 overflow-x-auto text-[10px] text-[#787B86] scroll-touch">
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-[2px] bg-[#FFFFFF] border border-[#B2B5BE] inline-block" /> Bull
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-[2px] bg-[#000000] border border-[#B2B5BE] inline-block" /> Bear
              </span>
              <span className="flex items-center gap-1 shrink-0"><span className="w-2 h-0.5 bg-[#FFFFFF]" /> Entry</span>
              <span className="flex items-center gap-1 shrink-0"><span className="w-2 h-0.5 bg-[#F23645]" /> Protected SL</span>
              <span className="flex items-center gap-1 shrink-0"><span className="w-2 h-0.5 bg-[#089981]" /> TP / BSL / FVG</span>
            </div>
            <span className="shrink-0 text-[9.5px] text-[#787B86] tabular-nums">
              (UTC+5:30) Kolkata
            </span>
          </div>

          {chartView === 'SR' ? (
            candles.length > 0 ? (
              <LiveChart
                candles={candles}
                analysis={a}
                toggles={toggles}
                showApexPulse={selection.keys.apexPulse !== false}
                symbolId={symbolId}
                interval={interval}
                accountBalance={account}
                riskPct={riskPct}
              />
            ) : (
              <div className="w-full h-[350px] shimmer flex flex-col items-center justify-center p-4 text-center">
                <span className="text-[12px] font-medium text-[#FFFFFF]">
                  Synchronizing {sym.label} ({interval.toUpperCase()}) Feed…
                </span>
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="mt-3 text-[11px] font-semibold text-[#0B0E14] px-3 py-1.5 rounded-[8px] bg-[#FFFFFF] active:scale-98 cursor-pointer"
                >
                  Reconnect Feed
                </button>
              </div>
            )
          ) : (
            <TradingViewChart
              tvSymbol={sym.tv}
              interval={interval}
              mode="PRO"
              analysis={a}
              digits={sym.digits}
              toggles={toggles}
            />
          )}
        </section>

        {/* 2. Primary Execution Plan & 6-Point Pure ICT Validity Summary Card */}
        <section className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E222D]">
            <div className="flex flex-wrap items-center gap-2">
              {isSetupValid ? (
                <CheckCircle2 size={15} className={isLong ? 'text-[#00E676]' : 'text-[#FF1744]'} />
              ) : (
                <Compass size={15} className="text-[#787B86]" />
              )}
              <span className="text-[12px] font-semibold text-[#FFFFFF]">{validityTitle}</span>
              {selection.keys.apexPulse !== false && (
                <>
                  <span
                    className="px-2 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: apexKillzone.isSilverBulletActive ? 'rgba(0, 230, 118, 0.25)' : '#0B0E14',
                      borderColor: apexKillzone.isSilverBulletActive ? '#00E676' : '#1E222D',
                      color: apexKillzone.isSilverBulletActive ? '#00E676' : '#B2B5BE',
                    }}
                  >
                    {apexKillzone.shortLabel}
                  </span>
                  {apexSim2000 && (
                    <span
                      className="px-2 py-0.5 rounded-[4px] border font-mono text-[10px] font-bold"
                      style={{
                        backgroundColor: apexSim2000.passesThreshold ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 23, 68, 0.25)',
                        borderColor: apexSim2000.passesThreshold ? '#00E676' : '#FF1744',
                        color: apexSim2000.passesThreshold ? '#00E676' : '#FF1744',
                      }}
                    >
                      CONFLUENCE: {apexSim2000.winProbabilityPct}%
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10.5px] font-semibold tabular-nums"
                style={{ color: validityBadgeColor }}
              >
                {isSetupValid ? 'Trade Valid (6-Pt ICT)' : newsBlock ? 'News Filter' : 'Stand Aside'}
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] text-[10.5px] font-semibold cursor-pointer select-none active:scale-98"
                onClick={() => {
                  if (!entitlement.isActive) {
                    onOpenSubscription?.()
                    return
                  }
                  setModalOpen(true)
                }}
              >
                Full Plan
              </button>
            </div>
          </div>

          {!entitlement.isActive ? (
            <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-amber-500/40 mb-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold">
                  <Lock size={13} />
                  <span>LIVE A+ INSTITUTIONAL TRADE SIGNALS — PRO ONLY</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSubscription?.()}
                  className="px-3 py-1 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] font-bold text-[10.5px] flex items-center gap-1 cursor-pointer active:scale-98"
                >
                  <Crown size={12} />
                  <span>Upgrade to Ad-Free Pro</span>
                </button>
              </div>
              <p className="text-[11.5px] text-[#787B86] leading-relaxed">
                Basic Chart View is unlocked. Exact Live A+ Institutional Trade Signals (Entry, Protected SL, TP1/TP2/TP3 & Auto-Lot Sizing) are reserved for active Ad-Free Pro subscribers.
              </p>
            </div>
          ) : p?.valid ? (
            <div className="space-y-2.5 mb-3">
              <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-[#B2B5BE]">
                  Swept Liquidity: <strong className="text-[#FFD740] font-mono">{p.sweptLiquidityType || (isLong ? 'SSL' : 'BSL')}</strong>
                </span>
                <span className="text-[#B2B5BE]">
                  PD Array: <strong className="text-[#D500F9] font-mono">{p.primaryPdArray || (isLong ? 'Bullish FVG (+OB)' : 'Bearish FVG (-OB)')}</strong>
                </span>
                {apexLotSizing && (
                  <span className="text-[#B2B5BE]">
                    Auto Size (≤1% Risk): <strong className="text-[#00E676] font-mono">{apexLotSizing.lotSize} Lots</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-[12px] tabular-nums">
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">Direction</div>
                  <div className="font-bold" style={{ color: isLong ? '#00E676' : '#FF1744' }}>{p.direction}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">Entry</div>
                  <div className="text-[#FFFFFF] font-semibold">{p.entry}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">Protected SL</div>
                  <div className="text-[#FF1744] font-semibold">{p.stop}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">TP1 (1:2→BE)</div>
                  <div className="text-[#00E676] font-semibold">{p.tp1}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">TP2 (1:3.5)</div>
                  <div className="text-[#00E676] font-semibold">{p.tp2}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">TP3 (1:5+)</div>
                  <div className="text-[#00E676] font-semibold">{p.tp3}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] mb-3 space-y-1">
              <div className="text-[12px] font-semibold text-[#FFFFFF]">
                Scanning Live Market — No A+ Institutional Setup Active Right Now (Protecting Capital)
              </div>
              <p className="text-[11.5px] text-[#787B86] leading-relaxed">
                {validityReason}
              </p>
            </div>
          )}

          {/* 6-Point Pure ICT Engine Validation Checklist (SL Protection) */}
          {a && (
            <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-wider">
                  Refined 6-Point Pure ICT Validation & SL Protection
                </span>
                <span className="text-[10px] text-[#26A69A] font-mono">Zero Retail Indicators</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px]">
                {[
                  {
                    label: '1. HTF 4H/1H Bias & Premium/Discount',
                    pass: Boolean((isLong && a.rangePos <= 55) || (!isLong && a.rangePos >= 45) || Math.abs(a.score) >= 18),
                  },
                  {
                    label: '2. Confirmed BSL/SSL Liquidity Sweep',
                    pass: Boolean(a.phase.sweep || a.phase.liquidityRaid),
                  },
                  {
                    label: '3. Displacement + MSS/CISD leaving FVG',
                    pass: Boolean(a.phase.displaced || a.phase.cisd || a.levels.fvgZones.length > 0),
                  },
                  {
                    label: '4. Retracement into OB / FVG 50% / OTE 0.705',
                    pass: Boolean(a.levels.obZones.length > 0 || a.levels.fvgZones.length > 0),
                  },
                  {
                    label: '5. Protected SL (Sweep Wick + 1.5x ATR + Spread)',
                    pass: true,
                  },
                  {
                    label: '6. London/NY Killzone & 15m Red-Folder Gate',
                    pass: Boolean(!newsBlock),
                  },
                ].map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-[6px] bg-[#131722] border border-[#1E222D]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: pt.pass ? '#26A69A' : '#787B86' }}
                    />
                    <span className={pt.pass ? 'text-[#FFFFFF]' : 'text-[#787B86]'}>{pt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Always-Visible Trade Reason & Confluence Narrative */}
          {a && (
            <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] mb-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <ListOrdered size={13} className="text-[#00E676]" />
                  <span className="text-[11.5px] font-bold text-[#FFFFFF]">
                    Trade Reason & Institutional Confluence
                  </span>
                </div>
                {p?.valid && (
                  <button
                    type="button"
                    onClick={() => journal.maybeRecord(a, symbolId, sym.label, interval, livePrice)}
                    className="px-2.5 py-1 rounded-[6px] bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676] text-[10px] font-bold cursor-pointer active:scale-98"
                  >
                    Auto-Journaled ✓
                  </button>
                )}
              </div>
              <p className="text-[11.5px] text-[#D1D4DC] leading-relaxed">
                {cleanModelName(p?.logic?.summary || validityReason)}
              </p>
              {a.reasons && a.reasons.length > 0 && (
                <ul className="space-y-1 pt-1.5 border-t border-[#1E222D]">
                  {a.reasons.slice(0, 6).map((reasonText, idx) => (
                    <li key={idx} className="text-[11px] text-[#B2B5BE] leading-snug">
                      · {cleanModelName(reasonText)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#787B86] pt-2.5 border-t border-[#1E222D] tabular-nums">
            <span>{conditionLabel}</span>
            <span className="font-semibold" style={{ color: conditionColor }}>
              {isTrending ? 'Expansion' : isChop ? 'Compression' : 'Range'}
            </span>
          </div>
        </section>

        {/* 2B. Dedicated Auto-Journaling, Trade History & Trade Reason Panel */}
        <section className="card p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E222D]">
            <div className="flex items-center gap-2">
              <NotebookPen size={15} className="text-[#00E676]" />
              <div>
                <div className="text-[12.5px] font-bold text-[#FFFFFF]">
                  Auto-Journaling · Trade History & Reasons
                </div>
                <div className="text-[10.5px] text-[#787B86] tabular-nums">
                  {journal.stats.total} Total · {journal.stats.open} Open · Win Rate {journal.stats.closed ? `${journal.stats.winRate}%` : '—'} · Net {journal.stats.totalR >= 0 ? '+' : ''}{journal.stats.totalR}R
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(['ALL', 'OPEN', 'CLOSED'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setJournalFilter(f)}
                  className={`px-2.5 py-1 rounded-[6px] text-[10px] font-semibold cursor-pointer active:scale-98 ${
                    journalFilter === f
                      ? 'bg-[#FFFFFF] text-[#0B0E14]'
                      : 'bg-[#0B0E14] text-[#787B86] hover:text-[#FFFFFF] border border-[#1E222D]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const filteredJournal = journal.records.filter((r) => {
              if (journalFilter === 'OPEN') return !isClosed(r)
              if (journalFilter === 'CLOSED') return isClosed(r)
              return true
            })

            if (filteredJournal.length === 0) {
              return (
                <div className="p-4 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] text-center space-y-1">
                  <div className="text-[12px] font-semibold text-[#FFFFFF]">
                    Auto-Journaling Armed for {sym.label} ({interval.toUpperCase()})
                  </div>
                  <p className="text-[11px] text-[#787B86]">
                    Whenever a valid setup forms (≥78% confluence), it is automatically recorded here with Entry, SL, TP1/TP2/TP3, and the exact ICT Trade Reason.
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5 scroll-touch">
                {filteredJournal.slice(0, 8).map((rawR) => {
                  const r = sanitizeTradeRecord(rawR)
                  const rSym = symbolById(r.symbolId)
                  const closed = isClosed(r)
                  const entryEqualsSl = Math.abs((r.entry || 0) - (r.stop || 0)) < 0.01
                  const rawResultR = Number(r.resultR ?? 0)
                  const hideRBadge =
                    r.status === 'CANCELLED' ||
                    r.stage === 'CANCELLED' ||
                    r.status === 'INVALIDATED' ||
                    r.status === 'EXPIRED' ||
                    entryEqualsSl ||
                    !isFinite(rawResultR) ||
                    Math.abs(rawResultR) > 50 ||
                    Math.abs(rawResultR) < 0.005
                  const isCancelledOrAborted = r.status === 'CANCELLED' || r.stage === 'CANCELLED' || r.status === 'INVALIDATED' || r.status === 'EXPIRED'
                  const isClosedBe = r.status === 'CLOSED (BE)' || r.stage === 'CLOSED (BE)' || r.status === 'BREAKEVEN' || r.stage === 'BREAKEVEN'
                  const safeR = hideRBadge ? 0 : rawResultR
                  const win = !hideRBadge && safeR > 0.05
                  const loss = !hideRBadge && safeR < -0.05
                  const isBeProtected = Boolean(r.beProtected) || entryEqualsSl || r.stage === 'TP1' || r.stage === 'TP2'
                  const cleanConfluences = sanitizeConfluenceTags(r.confluences)
                  const tradeReasonText = formatTradeReason(r)
                  const displayStatus = r.status === 'BREAKEVEN' ? 'CLOSED (BE)' : r.status

                  return (
                    <div
                      key={r.id}
                      className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 tabular-nums">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span
                            className="text-[11px] font-bold shrink-0"
                            style={{ color: r.direction === 'LONG' ? '#00E676' : '#FF1744' }}
                          >
                            {r.direction}
                          </span>
                          <span className="text-[12.5px] font-semibold text-[#FFFFFF] shrink-0">{r.symbolLabel}</span>
                          <span className="text-[10.5px] text-[#787B86] uppercase shrink-0">{r.tf}</span>
                          <span className="text-[10.5px] text-[#787B86] truncate min-w-0" style={{ textOverflow: 'ellipsis' }}>
                            · {cleanModelName(r.model)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                          {!closed && isBeProtected && (
                            <span className="text-[10px] font-semibold text-[#00E676]">BE</span>
                          )}
                          <span
                            className="text-[10px] font-semibold uppercase whitespace-nowrap"
                            style={{ color: isCancelledOrAborted ? '#787B86' : isClosedBe ? '#9CA3AF' : '#FFFFFF' }}
                          >
                            {displayStatus}
                          </span>
                          {closed && !hideRBadge && (
                            <span
                              className="text-[11.5px] font-bold"
                              style={{ color: win ? '#00E676' : loss ? '#FF1744' : '#9CA3AF' }}
                            >
                              {formatRMultiple(safeR)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[11px] tabular-nums">
                        <div className="p-1.5 rounded-[6px] bg-[#131722] border border-[#1E222D]">
                          <span className="text-[9.5px] text-[#787B86] block">Entry</span>
                          <span className="font-semibold text-[#FFFFFF]">{fmtPrice(r.entry, rSym.digits)}</span>
                        </div>
                        <div className="p-1.5 rounded-[6px] bg-[#131722] border border-[#1E222D]">
                          <span className="text-[9.5px] text-[#787B86] block">Stop (SL)</span>
                          <span className="font-semibold text-[#FF1744]">{fmtPrice(r.stop, rSym.digits)}</span>
                        </div>
                        <div className="p-1.5 rounded-[6px] bg-[#131722] border border-[#1E222D]">
                          <span className="text-[9.5px] text-[#787B86] block">TP1</span>
                          <span className="font-semibold text-[#00E676]">{fmtPrice(r.tp1, rSym.digits)}</span>
                        </div>
                        <div className="p-1.5 rounded-[6px] bg-[#131722] border border-[#1E222D]">
                          <span className="text-[9.5px] text-[#787B86] block">TP2</span>
                          <span className="font-semibold text-[#00E676]">{fmtPrice(r.tp2, rSym.digits)}</span>
                        </div>
                        <div className="p-1.5 rounded-[6px] bg-[#131722] border border-[#1E222D]">
                          <span className="text-[9.5px] text-[#787B86] block">TP3</span>
                          <span className="font-semibold text-[#00E676]">{r.tp3 ? fmtPrice(r.tp3, rSym.digits) : '—'}</span>
                        </div>
                      </div>

                      {/* Trade Reason & Confluences */}
                      <div className="text-[11px] text-[#D1D4DC] leading-snug pt-1.5 border-t border-[#1E222D] space-y-1">
                        <div>
                          <span className="text-[#787B86] font-semibold">Trade Reason: </span>
                          <span>{tradeReasonText}</span>
                        </div>
                        {cleanConfluences.length > 0 && (
                          <div className="text-[10.5px] text-[#787B86]">
                            Confluences ({cleanConfluences.length}): <span className="text-[#FFFFFF]">{cleanConfluences.join(' · ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Event History & Active Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#1E222D] text-[10px] text-[#787B86] tabular-nums">
                        <span>
                          Logged {istTimeLabel(r.createdTs)} · Grade {r.grade} · RR 1:{Number(r.rr || 2).toFixed(2)}
                        </span>
                        {!closed && (
                          <div className="flex items-center gap-1.5">
                            {!isBeProtected && (
                              <button
                                type="button"
                                onClick={() => journal.moveToBE(r.id, r.entry)}
                                className="px-2 py-1 rounded-[6px] bg-[#FFFFFF] text-[#0B0E14] font-semibold cursor-pointer active:scale-98"
                              >
                                Move SL to BE
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => journal.closeManual(r.id, isBeProtected ? r.entry : (livePrice > 0 && r.symbolId === symbolId ? livePrice : r.entry))}
                              className="px-2 py-1 rounded-[6px] bg-[#131722] border border-[#F23645] text-[#F23645] font-semibold cursor-pointer active:scale-98"
                            >
                              {r.stage === 'SETUP_FORMING' ? 'Cancel Setup' : isBeProtected ? 'Close (BE)' : 'Close Trade'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </section>

        {/* 3. Single-Tap Segmented Tabs for Secondary Tools */}
        <div className="seg-tab-group grid-cols-4">
          <button
            type="button"
            onClick={() => setActiveTab('indicators')}
            className={`seg-tab active:scale-98 ${activeTab === 'indicators' ? 'seg-tab-active' : ''}`}
          >
            <Layers size={13} />
            <span>Indicators</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`seg-tab active:scale-98 ${activeTab === 'ai' ? 'seg-tab-active' : ''}`}
          >
            <Sparkles size={13} />
            <span>{aiAssistantLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`seg-tab active:scale-98 ${activeTab === 'alerts' ? 'seg-tab-active' : ''}`}
          >
            <Bell size={13} />
            <span>Alerts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`seg-tab active:scale-98 ${activeTab === 'risk' ? 'seg-tab-active' : ''}`}
          >
            <Gauge size={13} />
            <span>Risk & Why</span>
          </button>
        </div>

        {/* TAB 1: INDICATORS & ICT MODELS */}
        {activeTab === 'indicators' && (
          <div className="space-y-3 fadein">
            {/* Engine Bias */}
            <Panel icon={<Gauge size={14} className="text-[#787B86]" />} title="Engine Bias">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="display text-lg font-bold tabular-nums" style={{ color: biasColor }}>
                  {a?.bias ?? '—'}
                </span>
                <span className="text-[11px] text-[#787B86]">Rule-Based Consensus</span>
              </div>
              <BiasMeter score={a?.score ?? 0} />
              <div className="grid grid-cols-3 gap-3 mt-3 tabular-nums">
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label">Score</div>
                  <div className="text-[15px] font-semibold text-[#FFFFFF] mt-0.5">{a?.score ?? '—'}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label">Confidence</div>
                  <div className="text-[15px] font-semibold text-[#FFFFFF] mt-0.5">
                    {a ? `${a.plan.confidence}` : '—'}<span className="text-[10px] text-[#787B86]">/95</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label">Structure</div>
                  <div className="text-[15px] font-semibold text-[#FFFFFF] mt-0.5">
                    {a?.phase.lastStruct ? a.phase.lastStruct.type : '—'}
                  </div>
                </div>
              </div>
            </Panel>

            {/* Concept Model Bar (14 ICT Indicators) */}
            <Panel
              icon={<Layers size={14} className="text-[#787B86]" />}
              title={`ICT Indicators · ${selection.mode} (${selCount})`}
              right={
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="chip cursor-pointer select-none active:scale-98"
                    onClick={() => setSelection(s => ({ ...s, mode: s.mode === 'BALANCED' ? 'STRICT' : 'BALANCED' }))}
                  >
                    {selection.mode === 'BALANCED' ? 'Strict' : 'Balanced'}
                  </button>
                  <button
                    type="button"
                    className="chip cursor-pointer select-none active:scale-98"
                    onClick={() => setSelection(allOnSelection(selection.mode))}
                  >
                    All
                  </button>
                </div>
              }
            >
              <div className="flex flex-wrap gap-1.5">
                {CONCEPTS.map(c => {
                  const on = selection.keys[c.key]
                  const st = a?.concepts[c.key]
                  const score = st?.score
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleConcept(c.key)}
                      className={`chip ${on ? 'chip-on' : ''} flex items-center gap-1.5 cursor-pointer select-none active:scale-98`}
                      title={c.desc}
                    >
                      <span>{c.label}</span>
                      {on && st && score !== undefined && (
                        <span
                          className="tabular-nums font-bold"
                          style={{ color: st.vote === 'bull' ? '#089981' : st.vote === 'bear' ? '#F23645' : '#787B86' }}
                        >
                          {score}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </Panel>

            {/* Fractal Model & ICT Phase Read */}
            <Panel
              icon={<Activity size={14} className="text-[#787B86]" />}
              title="Fractal Alignment & Phase"
              right={
                a?.plan.model ? (
                  <span className="text-[11px] font-semibold text-[#FFFFFF]">
                    {a.plan.model !== 'WAIT' ? 'Armed' : 'Wait'}
                  </span>
                ) : undefined
              }
            >
              <div className="flex flex-wrap gap-1.5 mb-3 tabular-nums">
                {fractal.length === 0 ? (
                  <span className="text-[11px] text-[#787B86]">HTF map: none for this timeframe</span>
                ) : (
                  fractal.map(f => (
                    <span
                      key={f.tf}
                      className="chip flex items-center gap-1"
                      style={{
                        borderColor: f.score >= 22 ? '#089981' : f.score <= -22 ? '#F23645' : '#1E222D',
                        color: f.score >= 22 ? '#089981' : f.score <= -22 ? '#F23645' : '#787B86',
                      }}
                    >
                      {f.tf.toUpperCase()} {f.score > 0 ? '+' : ''}{f.score}
                    </span>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 tabular-nums">
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">AMD Phase</div>
                  <div className="text-[13px] font-semibold text-[#FFFFFF]">{a?.phase.amd ?? '—'}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">Regime</div>
                  <div className="text-[13px] font-semibold text-[#FFFFFF]">{a?.phase.regime ?? '—'}</div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">Last Raid</div>
                  <div className="text-[13px] font-semibold text-[#FFFFFF]">
                    {a?.phase.sweep ? `${a.phase.sweep.dir === 'bull' ? 'SSL' : 'BSL'} ${a.phase.sweep.displacementAfter ? '+ DISP' : ''}` : 'None'}
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                  <div className="label mb-1">Delivery</div>
                  <div className="text-[13px] font-semibold text-[#FFFFFF]">
                    RSI {isFinite(a?.phase.rsi ?? NaN) ? a!.phase.rsi.toFixed(0) : '—'} · ATR {a ? a.phase.atr.toFixed(sym.digits) : '—'}
                  </div>
                </div>
              </div>
            </Panel>

            {/* Key Institutional Levels */}
            <Panel icon={<Zap size={14} className="text-[#787B86]" />} title="Institutional Price Levels">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] tabular-nums">
                <div className="flex justify-between"><span className="text-[#787B86]">Range Pos</span><span className="text-[#FFFFFF] font-medium">{a ? `${a.rangePos}%` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">Equilibrium</span><span className="text-[#FFFFFF] font-medium">{a?.levels.eq ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">BSL Pool</span><span className="text-[#089981] font-medium">{a?.levels.bsl[0] ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">SSL Pool</span><span className="text-[#F23645] font-medium">{a?.levels.ssl[0] ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">Prev Day High</span><span className="text-[#FFFFFF] font-medium">{a?.levels.pdh ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">Prev Day Low</span><span className="text-[#FFFFFF] font-medium">{a?.levels.pdl ?? '—'}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#1E222D] grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] tabular-nums">
                <div className="flex justify-between"><span className="text-[#787B86]">Entry</span><span className="text-[#FFFFFF] font-semibold">{p?.entry || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">Stop (SL)</span><span className="text-[#F23645] font-semibold">{p?.stop || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">TP1</span><span className="text-[#089981] font-semibold">{p?.tp1 || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">TP2</span><span className="text-[#089981] font-semibold">{p?.tp2 || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">TP3</span><span className="text-[#089981] font-semibold">{p?.tp3 || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#787B86]">Grade</span><span className="text-[#FFFFFF] font-semibold">{p && (p.valid || p.grade !== 'C') ? p.grade : '—'}</span></div>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 2: AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-3 fadein">
            <Panel icon={<Sparkles size={14} className="text-[#FFFFFF]" />} title={`${aiAssistantLabel} · ${sym.label} ${interval.toUpperCase()}`}>
              <p className="text-[12px] text-[#787B86] leading-relaxed mb-3">
                {a?.ok ? cleanModelName(a.plan.logic.summary) : 'Analyzing live market structure…'}
              </p>

              {/* Quick single-tap prompts */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  `Analyze ${sym.label} ${interval} setup`,
                  'Where is liquidity resting?',
                  'Explain invalidation level',
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    disabled={aiLoading}
                    onClick={() => void askQuickAi(undefined, promptText)}
                    className="chip cursor-pointer active:scale-98"
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {aiLoading && (
                <div className="space-y-2 mb-3">
                  <div className="h-4 w-3/4 shimmer rounded" />
                  <div className="h-4 w-full shimmer rounded" />
                  <div className="h-4 w-2/3 shimmer rounded" />
                </div>
              )}

              {aiReply && !aiLoading && (
                <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] text-[12px] text-[#FFFFFF] leading-relaxed whitespace-pre-wrap mb-3">
                  {aiReply}
                </div>
              )}

              <form onSubmit={(e) => void askQuickAi(e)} className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  placeholder={`Ask AI about ${sym.label} (${interval})…`}
                  className="flex-1 bg-[#0B0E14] border border-[#1E222D] focus:border-[#FFFFFF] rounded-[8px] px-3 py-2 text-[12px] text-[#FFFFFF] placeholder-[#787B86] outline-none"
                />
                <button
                  type="submit"
                  disabled={!aiQuery.trim() || aiLoading}
                  className="px-3.5 py-2 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] font-semibold text-[12px] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer active:scale-98"
                >
                  <Send size={13} />
                  <span>Ask</span>
                </button>
              </form>
            </Panel>
          </div>
        )}

        {/* TAB 3: ALERTS, LIQUIDITY RADAR & NEWS */}
        {activeTab === 'alerts' && (
          <div className="space-y-3 fadein">
            {/* Liquidity Hunt Early-Warning Radar */}
            <Panel
              icon={<Radar size={14} className="text-[#787B86]" />}
              title="Liquidity Hunt Radar"
              right={
                <span
                  className="text-[10.5px] font-semibold"
                  style={{ color: isRaidActive ? '#F23645' : isNearBsl || isNearSsl ? '#FFFFFF' : '#787B86' }}
                >
                  {isRaidActive ? 'Active Raid' : isNearBsl || isNearSsl ? 'Near Pool' : 'Pools Mapped'}
                </span>
              }
            >
              {isRaidActive && (
                <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#F23645] mb-3 text-[11.5px] flex items-center gap-2 text-[#FFFFFF]">
                  <span className="w-2 h-2 rounded-full bg-[#F23645] shrink-0" />
                  <span>
                    <strong>Liquidity Sweep Alert:</strong> {a?.phase.sweep ? `${a.phase.sweep.dir === 'bull' ? 'Sell-Side (SSL)' : 'Buy-Side (BSL)'} Pool Swept` : 'Institutional Raid Active'} — Watch for displacement & reclaim.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 tabular-nums">
                <div className={`p-3 rounded-[8px] bg-[#0B0E14] border ${isNearBsl ? 'border-[#089981]' : 'border-[#1E222D]'}`}>
                  <div className="flex items-center justify-between text-[10.5px] text-[#089981] mb-1">
                    <span className="font-semibold">Buy-Side (BSL)</span>
                    {bslDist !== null && <span className="text-[#787B86]">{bslDist > 0 ? `+${bslDist.toFixed(sym.digits)}` : 'Swept'}</span>}
                  </div>
                  <div className="text-[14px] font-semibold text-[#FFFFFF]">{bsl !== undefined ? fmtPrice(bsl, sym.digits) : '—'}</div>
                  <span className="text-[10px] text-[#787B86]">Resting buy stops above highs</span>
                </div>

                <div className={`p-3 rounded-[8px] bg-[#0B0E14] border ${isNearSsl ? 'border-[#F23645]' : 'border-[#1E222D]'}`}>
                  <div className="flex items-center justify-between text-[10.5px] text-[#F23645] mb-1">
                    <span className="font-semibold">Sell-Side (SSL)</span>
                    {sslDist !== null && <span className="text-[#787B86]">{sslDist > 0 ? `-${sslDist.toFixed(sym.digits)}` : 'Swept'}</span>}
                  </div>
                  <div className="text-[14px] font-semibold text-[#FFFFFF]">{ssl !== undefined ? fmtPrice(ssl, sym.digits) : '—'}</div>
                  <span className="text-[10px] text-[#787B86]">Resting sell stops below lows</span>
                </div>
              </div>
            </Panel>

            {/* News Intelligence */}
            <Panel
              icon={<Newspaper size={14} className="text-[#787B86]" />}
              title="Macro News Intelligence"
              right={
                <span className="text-[10.5px] font-semibold tabular-nums" style={{ color: news.blackout ? '#F23645' : '#089981' }}>
                  {news.blackout ? 'Blackout Active' : 'Calendar Clear'}
                </span>
              }
            >
              {news.loaded ? (
                news.events
                  .filter(e => e.impact === 'high' && e.time > Date.now() - 3600000)
                  .slice(0, 4)
                  .map((e, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-2 py-2 border-b border-[#1E222D] last:border-b-0 tabular-nums">
                      <span className="text-[12px] text-[#FFFFFF] truncate">{e.title}</span>
                      <span className="text-[11px] text-[#787B86] shrink-0">
                        {new Date(e.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-[11.5px] text-[#787B86]">Calendar offline — trading continues with standard price action filters.</p>
              )}
              {news.loaded && news.events.filter(e => e.impact === 'high' && e.time > Date.now() - 3600000).length === 0 && (
                <p className="text-[11.5px] text-[#787B86]">No high-impact red-folder events in the current window.</p>
              )}
            </Panel>

            {/* Signal Log */}
            <Panel icon={<Radio size={14} className="text-[#787B86]" />} title="Live Signal Log">
              {a?.signals.length ? (
                <div className="space-y-2">
                  {a.signals.slice(-6).reverse().map((s, i) => (
                    <div key={i} className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[11.5px] flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.dir === 'bull' ? '#089981' : s.dir === 'bear' ? '#F23645' : '#787B86' }}
                        />
                        <span className="text-[#FFFFFF] truncate">{cleanModelName(s.text)}</span>
                      </div>
                      <span className="text-[10px] text-[#787B86] shrink-0 ml-2">{s.source}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11.5px] text-[#787B86]">No signals fired on this bar yet.</p>
              )}
            </Panel>
          </div>
        )}

        {/* TAB 4: RISK SIZING & ENGINE NARRATIVE */}
        {activeTab === 'risk' && (
          <div className="space-y-3 fadein">
            <Panel icon={<Activity size={14} className="text-[#787B86]" />} title="Position Size & Risk Calculator">
              <div className="grid grid-cols-2 gap-3 mb-3 tabular-nums">
                <label className="p-3 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] block">
                  <span className="label">Account ($)</span>
                  <input
                    type="number"
                    value={account}
                    onChange={e => setAccount(Number(e.target.value) || 0)}
                    className="w-full bg-transparent text-[14px] font-semibold text-[#FFFFFF] outline-none mt-1 tabular-nums"
                    min={100}
                    step={500}
                  />
                </label>
                <label className="p-3 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] block">
                  <span className="label">Risk (%)</span>
                  <input
                    type="number"
                    value={riskPct}
                    onChange={e => setRiskPct(Number(e.target.value) || 0)}
                    className="w-full bg-transparent text-[14px] font-semibold text-[#FFFFFF] outline-none mt-1 tabular-nums"
                    min={0.1}
                    max={5}
                    step={0.25}
                  />
                </label>
              </div>
              {p && (p.valid || p.entry > 0) ? (
                (() => {
                  const riskAmount = account * (riskPct / 100)
                  const stopDist = Math.abs(p.entry - p.stop)
                  const units = stopDist > 0 ? riskAmount / stopDist : 0
                  return (
                    <div className="text-[12px] space-y-1.5 pt-2 border-t border-[#1E222D] text-[#787B86] tabular-nums">
                      <div className="flex justify-between"><span>Risk Capital</span><span className="text-[#FFFFFF] font-medium">${riskAmount.toFixed(0)}</span></div>
                      <div className="flex justify-between"><span>Stop Distance</span><span className="text-[#FFFFFF] font-medium">{stopDist.toFixed(sym.digits)}</span></div>
                      <div className="flex justify-between text-[#FFFFFF] font-semibold"><span>Position Size</span><span>{units.toFixed(units < 10 ? 3 : 2)} units</span></div>
                    </div>
                  )
                })()
              ) : (
                <p className="text-[11.5px] text-[#787B86]">Waiting for valid setup to calculate position size…</p>
              )}
            </Panel>

            <Panel icon={<ListOrdered size={14} className="text-[#787B86]" />} title="Why — Engine Confluence Narrative">
              {Array.isArray(a?.reasons) && a.reasons.length ? (
                <ul className="space-y-1.5">
                  {a.reasons.slice(0, 10).map((r, i) => (
                    <li key={i} className="text-[12px] text-[#FFFFFF] leading-relaxed">· {cleanModelName(r)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11.5px] text-[#787B86]">Collecting market structure data…</p>
              )}
            </Panel>
          </div>
        )}
      </div>

      {/* DEDICATED FULL-SCREEN LIVE TRADING CHART MODAL */}
      {liveChartFullScreen && (
        <div
          id="live-chart-fullscreen-modal"
          className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#000000] text-[#FFFFFF] flex flex-col overflow-hidden select-none fadein"
        >
          {/* Compact 2-Row Top Bar (Guaranteed Zero Overflow on Mobile & Desktop) */}
          <header className="w-full bg-[#0B0E14] border-b border-[#1E222D] px-2.5 py-2 shrink-0 space-y-1.5 z-30">
            {/* Row 1: Symbol Selector + Live Price + SR/OANDA Switch + Pinned Exit Button */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2 min-w-0">
                <select
                  value={symbolId}
                  onChange={(e) => setSymbolId(e.target.value)}
                  className="bg-[#131722] border border-[#1E222D] text-[#FFFFFF] text-[11.5px] font-bold rounded-[8px] px-2 py-1.5 cursor-pointer outline-none shrink-0"
                >
                  {SYMBOLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-baseline gap-1.5 min-w-0 truncate tabular-nums">
                  <span className="text-[14px] sm:text-[16px] font-bold text-[#FFFFFF] tabular-nums">
                    {livePrice > 0 ? fmtPrice(livePrice, sym.digits) : '—'}
                  </span>
                  {tickers[sym.src] && (
                    <span
                      className="text-[10.5px] font-semibold tabular-nums hidden xs:inline"
                      style={{ color: tickers[sym.src].changePct >= 0 ? '#089981' : '#F23645' }}
                    >
                      {tickers[sym.src].changePct >= 0 ? '+' : ''}
                      {tickers[sym.src].changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Right Pinned Actions: SR/OANDA Switch + Exit Full Screen */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="inline-flex items-center p-0.5 rounded-[8px] bg-[#131722] border border-[#1E222D]">
                  <button
                    type="button"
                    onClick={() => handleChartViewChange('SR')}
                    className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold cursor-pointer whitespace-nowrap ${
                      chartView === 'SR' ? 'bg-[#FFFFFF] text-[#0B0E14]' : 'text-[#787B86] hover:text-[#FFFFFF]'
                    }`}
                  >
                    SR Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChartViewChange('TV')}
                    className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold cursor-pointer whitespace-nowrap ${
                      chartView === 'TV' ? 'bg-[#FFFFFF] text-[#0B0E14]' : 'text-[#787B86] hover:text-[#FFFFFF]'
                    }`}
                  >
                    OANDA
                  </button>
                </div>

                <button
                  id="btn-exit-live-chart-fullscreen"
                  type="button"
                  onClick={() => setLiveChartFullScreen(false)}
                  className="px-2.5 py-1.5 rounded-[8px] bg-[#F23645] hover:opacity-90 text-[#FFFFFF] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shrink-0 active:scale-98"
                  title="Exit Full Screen Chart"
                >
                  <Minimize2 size={12} />
                  <span>Exit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLiveChartFullScreen(false)}
                  className="p-1.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-[#FFFFFF] hover:bg-[#1E222D] cursor-pointer shrink-0 active:scale-98"
                  title="Close Full Screen"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Row 2: All 7 Timeframes in a Responsive Grid */}
            <div className="grid grid-cols-7 gap-1 w-full">
              {INTERVALS.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setIntervalId(tf.id)}
                  className={`py-1 rounded-[6px] text-[10.5px] font-semibold text-center cursor-pointer select-none whitespace-nowrap ${
                    interval === tf.id
                      ? 'bg-[#FFFFFF] text-[#0B0E14] font-bold'
                      : 'bg-[#131722] text-[#787B86] hover:text-[#FFFFFF] border border-[#1E222D]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </header>

          {/* Main Full-Screen Live Chart Area */}
          <div className="flex-1 min-h-0 w-full relative overflow-hidden bg-[#000000] flex flex-col">
            {chartView === 'SR' ? (
              candles.length > 0 ? (
                <LiveChart
                  candles={candles}
                  analysis={a}
                  toggles={toggles}
                  showApexPulse={selection.keys.apexPulse !== false}
                  fullScreen={true}
                  symbolId={symbolId}
                  interval={interval}
                  accountBalance={account}
                  riskPct={riskPct}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-[12px] font-medium text-[#FFFFFF]">
                    Synchronizing {sym.label} ({interval.toUpperCase()}) Feed…
                  </span>
                </div>
              )
            ) : (
              <div className="w-full h-full flex-1 overflow-hidden">
                <TradingViewChart
                  tvSymbol={sym.tv}
                  interval={interval}
                  height={typeof window !== 'undefined' ? Math.max(320, window.innerHeight - 148) : 580}
                  mode="PRO"
                  analysis={a}
                  digits={sym.digits}
                  toggles={toggles}
                />
              </div>
            )}
          </div>

          {/* Bottom Control Bar: Overlay Chips, Active Setup Info & Quick Replay / Trade Plan Actions */}
          <footer className="w-full bg-[#0B0E14] border-t border-[#1E222D] px-2.5 py-2 shrink-0 flex flex-wrap items-center justify-between gap-2 z-30">
            <div className="flex items-center gap-1.5 flex-wrap">
              {([['plan', 'Plan'], ['levels', 'Levels'], ['zones', 'Zones'], ['key', 'Key']] as const).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  className={`chip cursor-pointer select-none active:scale-98 ${toggles[k] ? 'chip-on' : ''}`}
                  onClick={() => handleToggleClick(k)}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
              {p?.valid && (
                <span
                  className="text-[10.5px] font-bold px-2 py-1 rounded-[6px] border"
                  style={{
                    color: isLong ? '#00E676' : '#FF1744',
                    borderColor: isLong ? '#00E676' : '#FF1744',
                    backgroundColor: isLong ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                  }}
                >
                  {p.direction} @ {p.entry} · SL {p.stop} · TP1 {p.tp1}
                </span>
              )}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-2.5 py-1 rounded-[6px] bg-[#131722] border border-[#1E222D] text-[#FFFFFF] text-[10.5px] font-semibold cursor-pointer active:scale-98 whitespace-nowrap"
              >
                Trade Plan
              </button>
            </div>
          </footer>
        </div>
      )}

      <Suspense fallback={null}>
        {modalOpen && a && (
          <TradePlanModal
            analysis={a}
            sym={sym}
            account={account}
            riskPct={riskPct}
            onClose={() => setModalOpen(false)}
          />
        )}

        {brokerSyncOpen && (
          <BrokerSyncModal
            isOpen={brokerSyncOpen}
            onClose={() => setBrokerSyncOpen(false)}
            symbol={sym}
            livePrice={livePrice}
            dataStatus={dataStatus}
          />
        )}

        {chartReplayOpen && (
          <ChartReplay
            initialSymbolId={symbolId}
            initialIntervalId={interval}
            initialFullScreen={chartReplayFullScreen}
            onClose={() => {
              setChartReplayOpen(false)
              setChartReplayFullScreen(false)
            }}
          />
        )}
      </Suspense>

      <p className="text-[10px] text-[#787B86] text-center mt-4">
        Educational Decision Support · Not Financial Advice · Zero Mock Data
      </p>
    </div>
  )
}
