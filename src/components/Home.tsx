import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Grid3x3,
  NotebookPen,
  Clock,
  GraduationCap,
  ShieldCheck,
  Crown,
  User,
  Sparkles,
  RotateCcw,
  Bell,
  Layers,
} from 'lucide-react'
import MarketStrip from './MarketStrip'
import { useMarket } from '../hooks/useMarket'
import { useJournal } from '../hooks/useJournal'
import { isClosed, sanitizeTradeRecord, sanitizeIctString, formatTradeReason, formatRMultiple } from '../lib/journal'
import { symbolById, fmtPrice } from '../lib/market'
import { defaultSelection } from '../lib/concepts'
import { istDateLabel, istTimeLabel, activeKillzone, fmtClock } from '../lib/clock'
import { safeStorage } from '../lib/storage'
import { subscribeUserProfile, type UserProfile } from '../lib/authService'
import { evaluateEntitlement, formatTrialCountdownHhMmSs } from '../lib/subscriptionService'
import type { Route } from './NativeAppShell'

type HomeToolTab = 'indicators' | 'ai' | 'alerts'

export default function Home({ go }: { go: (r: Route) => void }) {
  const [symbol, setSymbol] = useState(() => safeStorage.getItem('sr.symbol') ?? 'XAUUSD')
  const [now, setNow] = useState(new Date())
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [toolTab, setToolTab] = useState<HomeToolTab>('indicators')
  const sym = symbolById(symbol)
  const { tickers, analysis, livePrice, dataStatus } = useMarket(symbol, '15m', defaultSelection())
  const journal = useJournal()

  useEffect(() => {
    const unsub = subscribeUserProfile(setProfile)
    return unsub
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Auto-record valid plans on Home screen too
  useEffect(() => {
    if (analysis?.ok && analysis.plan.valid) {
      journal.maybeRecord(analysis, symbol, sym.label, '15m', livePrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis?.plan?.createdTs, analysis?.plan?.valid, symbol])

  useEffect(() => {
    if (dataStatus === 'LIVE' && livePrice > 0) {
      journal.tick(symbol, livePrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrice, symbol, dataStatus])

  useEffect(() => {
    try {
      safeStorage.setItem('sr.symbol', symbol)
    } catch {
      /* noop */
    }
  }, [symbol])

  const openMoreSection = (sectionId: string) => {
    try {
      safeStorage.setItem('sr.more.tab', sectionId)
    } catch {
      /* noop */
    }
    go('more')
  }

  const kz = activeKillzone(now)
  const entitlement = evaluateEntitlement(profile)

  return (
    <div className="p-4 pb-8 max-w-xl mx-auto space-y-3 fadein">
      {/* Top Institutional Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="display text-lg font-bold tracking-tight text-[#FFFFFF]">SR Terminal</h1>
            <span className="text-[11px] font-medium text-[#787B86]">· Institutional ICT</span>
          </div>
          <p className="text-[11.5px] text-[#787B86] mt-0.5 tabular-nums">
            {istDateLabel(now)} · {fmtClock(now, 'IST', true)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={() => openMoreSection('subscription')}
            className={`min-h-[30px] px-3 py-1 rounded-[8px] text-[10.5px] font-semibold flex items-center gap-1.5 border cursor-pointer active:scale-98 tabular-nums ${
              entitlement.isActive
                ? entitlement.isTrial
                  ? 'bg-[#2962FF]/15 text-[#90BFF9] border-[#2962FF]/40'
                  : 'bg-[#131722] text-[#26A69A] border-[#26A69A]/40'
                : 'bg-[#131722] text-[#FFFFFF] border-[#1E222D] hover:border-[#2A2E39]'
            }`}
          >
            {entitlement.isActive ? (
              entitlement.isTrial ? (
                <>
                  <Clock size={11} className="text-[#90BFF9]" />
                  <span>24H Trial · {entitlement.trialCountdownHhMmSs}</span>
                </>
              ) : (
                <>
                  <Crown size={11} className="text-[#26A69A]" />
                  <span>{entitlement.tierBadge}</span>
                </>
              )
            ) : profile ? (
              <>
                <User size={11} className="text-[#F59E0B]" />
                <span>Free · Ad-Supported</span>
              </>
            ) : (
              <>
                <Crown size={11} className="text-[#787B86]" />
                <span>Upgrade</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Session Killzone Window Banner */}
      <div className="card px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="status-dot" />
          <span className="text-[11.5px] text-[#FFFFFF] font-medium">
            ICT Execution Desk · 1–4 Validated Setups/Day
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#787B86] tabular-nums">
          {kz ? (
            <span className="text-[#26A69A] font-semibold">
              {kz.name} Live ({kz.istLabel})
            </span>
          ) : (
            <span>6 Institutional Instruments Monitored</span>
          )}
        </div>
      </div>

      {/* Primary Execution Workspace CTA */}
      <button
        onClick={() => go('terminal')}
        className="card group w-full p-4 flex items-center justify-between active:scale-98 hover:border-[#2A2E39] cursor-pointer"
      >
        <div className="text-left">
          <div className="label">Primary Execution Workspace</div>
          <div className="display font-bold text-[17px] mt-1 text-[#FFFFFF] flex items-center gap-2">
            <span>Open {symbol} Terminal</span>
          </div>
          <div className="text-[11.5px] text-[#787B86] mt-0.5">
            Pure ICT Models · Killzone Matrix · Auto-Journaling & Live Trade Reasons
          </div>
        </div>
        <div className="w-10 h-10 rounded-[10px] bg-[#FFFFFF] text-[#0B0E14] flex items-center justify-center shrink-0">
          <ArrowRight size={18} />
        </div>
      </button>

      {/* Dedicated Funded Account / Prop Firm Pass Manager CTA */}
      <button
        onClick={() => go('funded')}
        className="card group w-full p-4 flex items-center justify-between active:scale-98 border-[#26A69A]/35 hover:border-[#26A69A]/60 bg-[#131722] cursor-pointer"
      >
        <div className="text-left min-w-0 pr-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#26A69A] shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#26A69A]">
              Prop Firm Pass Engine · $5K to $200K Shield
            </span>
          </div>
          <div className="display font-bold text-[15.5px] mt-1 text-[#FFFFFF]">
            Funded Account Pass Manager
          </div>
          <div className="text-[11px] text-[#787B86] mt-0.5 leading-snug">
            60% Anti-Breach Daily Shield · Auto Recovery Risk Scaling · Exact Lot Calculator & A+ Funded Setups
          </div>
        </div>
        <div className="w-9 h-9 rounded-[10px] bg-[#26A69A]/15 border border-[#26A69A]/40 text-[#26A69A] flex items-center justify-center shrink-0">
          <ArrowRight size={16} />
        </div>
      </button>

      {/* Market Watch Strip */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="label">Market Watch</span>
          <span className="text-[11px] text-[#787B86]">Tap instrument to focus</span>
        </div>
        <MarketStrip tickers={tickers} activeId={symbol} onSelect={setSymbol} />
      </div>

      {/* Live Auto-Journaling, Trade History & Trade Reason Card */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotebookPen size={15} className="text-[#26A69A]" />
            <div>
              <div className="text-[13px] font-bold text-[#FFFFFF]">Auto-Journaling & Trade History</div>
              <div className="text-[10.5px] text-[#787B86]">
                Every valid ICT setup is automatically logged with full Trade Reason & Lifecycle
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => go('journal')}
            className="px-3 py-1.5 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] font-semibold text-[11px] cursor-pointer active:scale-98 shrink-0"
          >
            Open Journal
          </button>
        </div>

        {/* Live Journal Summary Metrics */}
        <div className="grid grid-cols-4 gap-2 tabular-nums">
          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label">Total</div>
            <div className="text-[14px] font-bold text-[#FFFFFF] mt-0.5">{journal.stats.total}</div>
          </div>
          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label">Active</div>
            <div className="text-[14px] font-bold text-[#26A69A] mt-0.5">{journal.stats.open}</div>
          </div>
          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label">Win Rate</div>
            <div className="text-[14px] font-bold text-[#FFFFFF] mt-0.5">
              {journal.stats.closed ? `${journal.stats.winRate}%` : '—'}
            </div>
          </div>
          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label">Net R</div>
            <div
              className="text-[14px] font-bold mt-0.5"
              style={{ color: journal.stats.totalR >= 0 ? '#26A69A' : '#EF5350' }}
            >
              {journal.stats.totalR >= 0 ? '+' : ''}
              {journal.stats.totalR}R
            </div>
          </div>
        </div>

        {/* Active Symbol Trade Reason & Recent Auto-Journaled Trades */}
        {analysis?.ok && (
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] tabular-nums">
              <span className="font-semibold text-[#FFFFFF]">
                {sym.label} (15M) Live Trade Reason:
              </span>
              <span
                className="font-bold"
                style={{ color: analysis.plan.valid ? '#26A69A' : '#787B86' }}
              >
                {analysis.plan.valid ? `${analysis.plan.direction} · ${sanitizeIctString(analysis.plan.model)}` : 'STAND ASIDE'}
              </span>
            </div>
            <p className="text-[11.5px] text-[#D1D4DC] leading-relaxed">
              {analysis.plan?.valid
                ? sanitizeIctString(analysis.plan?.logic?.summary)
                : sanitizeIctString(analysis.plan?.invalidation || analysis.plan?.blockers?.[0] || analysis.plan?.logic?.summary)}
            </p>
            {Array.isArray(analysis.reasons) && analysis.reasons.length > 0 && (
              <div className="text-[10.5px] text-[#787B86] pt-1 border-t border-[#1E222D]">
                Confluence: <span className="text-[#FFFFFF]">{analysis.reasons.slice(0, 3).map(r => sanitizeIctString(r)).join(' · ')}</span>
              </div>
            )}
          </div>
        )}

        {journal.records.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#787B86]">
              <span>Recent Auto-Journaled Trade History</span>
              <button
                type="button"
                onClick={() => go('journal')}
                className="text-[#FFFFFF] hover:underline cursor-pointer"
              >
                View All ({journal.records.length}) →
              </button>
            </div>
            {journal.records.slice(0, 3).map((rawR) => {
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
              const displayStatus = r.status === 'BREAKEVEN' ? 'CLOSED (BE)' : r.status

              return (
                <div
                  key={r.id}
                  onClick={() => go('journal')}
                  className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] hover:border-[#2A2E39] cursor-pointer space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11.5px] tabular-nums">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className="font-bold shrink-0"
                        style={{ color: r.direction === 'LONG' ? '#26A69A' : '#EF5350' }}
                      >
                        {r.direction}
                      </span>
                      <span className="font-semibold text-[#FFFFFF] shrink-0">{r.symbolLabel}</span>
                      <span className="text-[10.5px] text-[#787B86] uppercase shrink-0">{r.tf}</span>
                      <span className="text-[10.5px] text-[#787B86] truncate min-w-0" style={{ textOverflow: 'ellipsis' }}>
                        · {sanitizeIctString(r.model)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <span
                        className="text-[10px] font-semibold uppercase whitespace-nowrap"
                        style={{ color: isCancelledOrAborted ? '#787B86' : isClosedBe ? '#9CA3AF' : '#FFFFFF' }}
                      >
                        {displayStatus}
                      </span>
                      {closed && !hideRBadge && (
                        <span
                          className="font-bold"
                          style={{ color: win ? '#26A69A' : loss ? '#EF5350' : '#9CA3AF' }}
                        >
                          {formatRMultiple(safeR)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-[#787B86] tabular-nums">
                    <span>Entry: <strong className="text-[#FFFFFF]">{fmtPrice(r.entry, rSym.digits)}</strong></span>
                    <span>SL: <strong className="text-[#EF5350]">{fmtPrice(r.stop, rSym.digits)}</strong></span>
                    <span>TP1: <strong className="text-[#26A69A]">{fmtPrice(r.tp1, rSym.digits)}</strong></span>
                    {r.tp2 ? <span>TP2: <strong className="text-[#26A69A]">{fmtPrice(r.tp2, rSym.digits)}</strong></span> : null}
                    <span className="ml-auto">{istTimeLabel(r.createdTs)}</span>
                  </div>
                  <div className="text-[11px] text-[#D1D4DC] leading-snug pt-1 border-t border-[#1E222D]">
                    <span className="text-[#787B86]">Reason: </span>
                    {formatTradeReason(r)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Segmented Secondary Tools (Indicators, AI Assistant, Alerts) */}
      <div className="pt-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label">Workspace Tools</span>
          <span className="text-[11px] text-[#787B86]">Single-tap access</span>
        </div>

        <div className="seg-tab-group grid-cols-3">
          <button
            type="button"
            onClick={() => setToolTab('indicators')}
            className={`seg-tab active:scale-98 ${toolTab === 'indicators' ? 'seg-tab-active' : ''}`}
          >
            <Layers size={13} />
            <span>Indicators</span>
          </button>
          <button
            type="button"
            onClick={() => setToolTab('ai')}
            className={`seg-tab active:scale-98 ${toolTab === 'ai' ? 'seg-tab-active' : ''}`}
          >
            <Sparkles size={13} />
            <span>AI Assistant</span>
          </button>
          <button
            type="button"
            onClick={() => setToolTab('alerts')}
            className={`seg-tab active:scale-98 ${toolTab === 'alerts' ? 'seg-tab-active' : ''}`}
          >
            <Bell size={13} />
            <span>Alerts & Tools</span>
          </button>
        </div>

        {toolTab === 'indicators' && (
          <div className="grid grid-cols-2 gap-3 fadein">
            <button
              onClick={() => go('matrix')}
              className="card min-h-[64px] p-3.5 flex items-center gap-3 text-left hover:border-[#2A2E39] active:scale-98 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center shrink-0">
                <Grid3x3 size={16} className="text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#FFFFFF] truncate">MTF Matrix</div>
                <div className="text-[11px] text-[#787B86] truncate">5 × 7 Bias Map</div>
              </div>
            </button>

            <button
              onClick={() => openMoreSection('replay')}
              className="card min-h-[64px] p-3.5 flex items-center gap-3 text-left hover:border-[#2A2E39] active:scale-98 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center shrink-0">
                <RotateCcw size={16} className="text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#FFFFFF] truncate">Chart Replay</div>
                <div className="text-[11px] text-[#787B86] truncate">Bar-by-Bar Sim</div>
              </div>
            </button>

            <button
              onClick={() => openMoreSection('killzones')}
              className="card min-h-[64px] p-3.5 flex items-center gap-3 text-left hover:border-[#2A2E39] active:scale-98 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center shrink-0">
                <Clock size={16} className="text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#FFFFFF] truncate">Killzones</div>
                <div className="text-[11px] text-[#787B86] truncate">London · NY Clocks</div>
              </div>
            </button>

            <button
              onClick={() => openMoreSection('academy')}
              className="card min-h-[64px] p-3.5 flex items-center gap-3 text-left hover:border-[#2A2E39] active:scale-98 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center shrink-0">
                <GraduationCap size={16} className="text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#FFFFFF] truncate">ICT Academy</div>
                <div className="text-[11px] text-[#787B86] truncate">28 Core Lessons</div>
              </div>
            </button>
          </div>
        )}

        {toolTab === 'ai' && (
          <div className="grid grid-cols-1 gap-3 fadein">
            <button
              onClick={() => go('ai-agent')}
              className="card p-4 flex items-center justify-between text-left hover:border-[#2A2E39] active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center shrink-0">
                  <Sparkles size={17} className="text-[#FFFFFF]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-[#FFFFFF] truncate">
                    {entitlement.isTrial || entitlement.tierLevel >= 2 ? 'AI Trading Agent' : 'Basic AI Agent'}
                  </div>
                  <div className="text-[11.5px] text-[#787B86] truncate">
                    Live ICT confluence analysis, risk sizing & interactive desk assistant
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-[#787B86] shrink-0 ml-2" />
            </button>
          </div>
        )}

        {toolTab === 'alerts' && (
          <div className="grid grid-cols-2 gap-3 fadein">
            <button
              onClick={() => go('journal')}
              className="card min-h-[64px] p-3.5 flex items-center gap-3 text-left hover:border-[#2A2E39] active:scale-98 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center shrink-0">
                <NotebookPen size={16} className="text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#FFFFFF] truncate">Trade Journal</div>
                <div className="text-[11px] text-[#787B86] truncate">Risk Radar & Logs</div>
              </div>
            </button>

            <button
              onClick={() => openMoreSection('notifications')}
              className="card min-h-[64px] p-3.5 flex items-center gap-3 text-left hover:border-[#2A2E39] active:scale-98 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center shrink-0">
                <Bell size={16} className="text-[#FFFFFF]" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#FFFFFF] truncate">Push Alerts</div>
                <div className="text-[11px] text-[#787B86] truncate">TP · SL · Sound</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Discipline Assurance Footer */}
      <div className="pt-3 border-t border-[#1E222D] flex gap-2.5 items-start">
        <ShieldCheck size={15} className="text-[#787B86] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#787B86] leading-relaxed">
          Capital protection is enforced by strict multi-pillar confirmation, Red-Folder macro blackout gating,
          and automated Breakeven trailing. Never chase overextended markets.
        </p>
      </div>
    </div>
  )
}
