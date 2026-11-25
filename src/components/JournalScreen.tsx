import { memo, useEffect, useMemo, useState } from 'react'
import {
  Download,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  BarChart3,
  NotebookPen,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useJournal } from '../hooks/useJournal'
import {
  isClosed,
  assessTradeRisk,
  sanitizeTradeRecord,
  sanitizeIctString,
  sanitizeConfluenceTags,
  formatTradeReason,
  formatRMultiple,
  type JournalRecord,
} from '../lib/journal'
import { SYMBOLS, symbolById, fmtPrice, fetchKlines } from '../lib/market'
import { calibrateCandles } from '../lib/brokerCalibration'
import { analyse } from '../lib/ict'
import { loadSelection } from '../lib/concepts'
import { istTimeLabel } from '../lib/clock'
import { evaluateEntitlement } from '../lib/subscriptionService'
import type { UserProfile } from '../lib/authService'
import TerminalLockedScreen from './TerminalLockedScreen'

const STATUS_COLOR: Record<string, string> = {
  PLANNED: '#787B86',
  SETUP_FORMING: '#FFD740',
  ENTRY_CONFIRMED: '#00E676',
  RUNNING: '#FFFFFF',
  TP1: '#00E676',
  TP2: '#00E676',
  TP3: '#00E676',
  BREAKEVEN: '#9CA3AF',
  'CLOSED (BE)': '#9CA3AF',
  CLOSED: '#FFFFFF',
  STOPPED: '#F23645',
  EXPIRED: '#787B86',
  INVALIDATED: '#787B86',
  CANCELLED: '#787B86',
}

function StatusLabel({ status, risky }: { status: string; risky?: boolean }) {
  const displayStatus = status === 'BREAKEVEN' ? 'CLOSED (BE)' : status
  const color = STATUS_COLOR[displayStatus] ?? STATUS_COLOR.PLANNED
  return (
    <span className="text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap tabular-nums" style={{ color }}>
      {displayStatus}
      {risky && !isClosed({ stage: status, status } as never) ? ' · Risk' : ''}
    </span>
  )
}

function classifyKillzoneSession(ts: number): 'London Killzone' | 'NY AM Killzone' | 'NY PM Macro' | 'Asian Session' {
  // Convert UTC timestamp to New York (ET) approximate hour (UTC - 5)
  const d = new Date(ts - 5 * 3600 * 1000)
  const h = d.getUTCHours()
  if (h >= 2 && h < 6) return 'London Killzone'
  if (h >= 7 && h < 12) return 'NY AM Killzone'
  if (h >= 12 && h < 17) return 'NY PM Macro'
  return 'Asian Session'
}

const RecordRow = memo(function RecordRow({
  r: rawTrade,
  onClose,
  onMoveBE,
}: {
  r: JournalRecord
  onClose: (id: string) => void
  onMoveBE: (id: string, entry: number) => void
}) {
  const [open, setOpen] = useState(false)
  const r = sanitizeTradeRecord(rawTrade)
  const sym = symbolById(r.symbolId)
  const closed = isClosed(r)
  const entryEqualsSl = Math.abs((r.entry || 0) - (r.stop || 0)) < 0.01
  const rawR = Number(r.resultR ?? 0)
  const hideRBadge =
    r.status === 'CANCELLED' ||
    r.stage === 'CANCELLED' ||
    r.status === 'INVALIDATED' ||
    r.status === 'EXPIRED' ||
    entryEqualsSl ||
    !isFinite(rawR) ||
    Math.abs(rawR) > 50 ||
    Math.abs(rawR) < 0.005
  const safeR = hideRBadge ? 0 : rawR
  const win = !hideRBadge && safeR > 0.05
  const loss = !hideRBadge && safeR < -0.05
  const risk = assessTradeRisk(r)
  const isActive = !closed && r.stage !== 'SETUP_FORMING'
  const isBeProtected = Boolean(r.beProtected) || entryEqualsSl || r.stage === 'TP1' || r.stage === 'TP2'
  const cleanConfluences = sanitizeConfluenceTags(r.confluences)
  const tradeReasonText = formatTradeReason(r)

  return (
    <div className={`card p-3.5 space-y-2.5 ${risk.level === 'HIGH' && !closed ? 'border-[#F23645]' : ''}`}>
      <button className="w-full text-left cursor-pointer active:scale-98" onClick={() => setOpen(o => !o)}>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className="text-[11.5px] font-bold shrink-0"
              style={{ color: r.direction === 'LONG' ? '#00E676' : '#F23645' }}
            >
              {r.direction === 'LONG' ? 'LONG' : 'SHORT'}
            </span>
            <span className="text-[13px] font-semibold text-[#FFFFFF] shrink-0">{r.symbolLabel}</span>
            <span className="text-[11px] text-[#787B86] uppercase shrink-0">{r.tf}</span>
            <span className="text-[11px] text-[#787B86] truncate min-w-0" style={{ textOverflow: 'ellipsis' }}>
              · {sanitizeIctString(r.model)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 tabular-nums ml-auto">
            {!closed && risk.level === 'HIGH' && (
              <span className="text-[10px] font-bold text-[#F23645]">
                High Risk
              </span>
            )}
            {!closed && isBeProtected && (
              <span className="text-[10px] font-semibold text-[#00E676]">
                BE
              </span>
            )}
            <StatusLabel status={r.status} risky={risk.level === 'HIGH'} />
            {closed && !hideRBadge && (
              <span
                className="text-[12px] font-semibold tabular-nums"
                style={{ color: win ? '#00E676' : loss ? '#F23645' : '#9CA3AF' }}
              >
                {formatRMultiple(safeR)}
              </span>
            )}
            {open ? <ChevronUp size={14} className="text-[#787B86]" /> : <ChevronDown size={14} className="text-[#787B86]" />}
          </div>
        </div>
      </button>

      {/* Always-Visible Price Levels (Entry, SL, TP1, TP2, TP3, Grade) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11.5px] tabular-nums">
        <div className="p-2 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="label mb-0.5">Entry</div>
          <div className="text-[#FFFFFF] font-semibold">{fmtPrice(r.entry, sym.digits)}</div>
        </div>
        <div className="p-2 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="label mb-0.5">Stop (SL)</div>
          <div className="text-[#F23645] font-semibold">{fmtPrice(r.stop, sym.digits)}</div>
        </div>
        <div className="p-2 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="label mb-0.5">TP1</div>
          <div className="text-[#00E676] font-semibold">{fmtPrice(r.tp1, sym.digits)}</div>
        </div>
        <div className="p-2 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="label mb-0.5">TP2</div>
          <div className="text-[#00E676] font-semibold">{fmtPrice(r.tp2, sym.digits)}</div>
        </div>
        <div className="p-2 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="label mb-0.5">TP3</div>
          <div className="text-[#00E676] font-semibold">{r.tp3 ? fmtPrice(r.tp3, sym.digits) : '—'}</div>
        </div>
        <div className="p-2 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="label mb-0.5">Grade / RR</div>
          <div className="text-[#FFFFFF] font-semibold">{r.grade} · 1:{Number(r.rr || 2).toFixed(2)}</div>
        </div>
      </div>

      {/* Always-Visible Trade Reason & Confluences */}
      <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
        <div className="text-[11.5px] text-[#D1D4DC] leading-relaxed">
          <span className="text-[#787B86] font-semibold">Trade Reason: </span>
          <span>{tradeReasonText}</span>
        </div>
        {cleanConfluences.length > 0 && (
          <div className="text-[10.5px] text-[#787B86] pt-1 border-t border-[#1E222D]">
            Confluences ({cleanConfluences.length}): <span className="text-[#FFFFFF]">{cleanConfluences.join(' · ')}</span>
          </div>
        )}
      </div>

      {/* Quick Actions & Timestamp Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-[#787B86] tabular-nums">
        <span>Logged {istTimeLabel(r.createdTs)} · {classifyKillzoneSession(r.createdTs)}</span>
        {!closed && (
          <div className="flex items-center gap-2">
            {!isBeProtected && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveBE(r.id, r.entry)
                }}
                className="px-2.5 py-1 bg-[#FFFFFF] text-[#0B0E14] font-semibold rounded-[6px] text-[10px] cursor-pointer active:scale-98"
              >
                Move SL to BE
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose(r.id)
              }}
              className="px-2.5 py-1 bg-[#131722] border border-[#F23645] text-[#F23645] font-semibold rounded-[6px] text-[10px] cursor-pointer active:scale-98"
            >
              {r.stage === 'SETUP_FORMING' ? 'Cancel Setup' : isBeProtected ? 'Close (BE)' : 'Close Trade'}
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="pt-2.5 border-t border-[#1E222D] space-y-3 fadein">
          {!closed && (
            <div className={`p-3 rounded-[10px] bg-[#0B0E14] border ${risk.level === 'HIGH' ? 'border-[#F23645]' : 'border-[#1E222D]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {risk.level === 'HIGH' ? (
                    <ShieldAlert size={14} className="text-[#F23645]" />
                  ) : (
                    <AlertTriangle size={14} className="text-[#787B86]" />
                  )}
                  <span className="text-[11px] font-semibold text-[#FFFFFF]">
                    Risk Analysis & Protection
                  </span>
                </div>
                <span
                  className="text-[10.5px] font-bold tabular-nums"
                  style={{
                    color: risk.level === 'HIGH' ? '#F23645' : '#089981',
                  }}
                >
                  Score: {risk.score}/100
                </span>
              </div>

              <div className="space-y-1 my-1.5">
                {(Array.isArray(risk.reasons) ? risk.reasons : []).map((reason, idx) => (
                  <div key={idx} className="text-[11px] text-[#787B86] flex items-start gap-1.5">
                    <span className="text-[#FFFFFF]">·</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] mt-2">
                <div className="text-[11px] font-semibold text-[#FFFFFF] mb-0.5">
                  {risk.recommendedAction}
                </div>
                <p className="text-[10.5px] text-[#787B86] leading-relaxed">
                  When price moves adversely toward the stop, lock Stop Loss at Entry Price (Break-Even).
                </p>
              </div>

              {isActive && (
                <div className="flex gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={() => onMoveBE(r.id, r.entry)}
                    className="flex-1 min-h-[42px] px-3 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] font-semibold text-[11.5px] flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <ShieldCheck size={15} /> Move SL to Break-Even
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose(r.id)}
                    className="min-h-[42px] px-4 rounded-[8px] border border-[#F23645] bg-[#131722] text-[#F23645] font-semibold text-[11.5px] flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <X size={14} /> Close
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1 pt-1">
            <div className="label mb-1">Trade Lifecycle History</div>
            {(Array.isArray(r.events) ? r.events : []).map((e, i) => (
              <div key={i} className="flex justify-between text-[10.5px] text-[#787B86] tabular-nums py-0.5 border-b border-[#1E222D]/60 last:border-b-0">
                <span className="text-[#D1D4DC]">{e.stage}{e.note ? ` — ${e.note}` : ''}</span>
                <span className="shrink-0 ml-2">{istTimeLabel(e.ts)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

type DateRangeFilter = 'TODAY' | '7D' | '30D' | 'ALL'
type ViewTab = 'JOURNAL' | 'ANALYTICS'

export default function JournalScreen({
  userProfile,
  onOpenSubscription,
}: {
  userProfile?: UserProfile | null
  onOpenSubscription?: () => void
}) {
  const entitlement = evaluateEntitlement(userProfile ?? null)
  const journal = useJournal()
  const [viewTab, setViewTab] = useState<ViewTab>('ANALYTICS')
  const [dateRange, setDateRange] = useState<DateRangeFilter>('ALL')
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RISKY' | 'CLOSED'>('ALL')
  const [scanningPairs, setScanningPairs] = useState(false)

  const scanAllPairsForAutoJournal = async () => {
    if (scanningPairs) return
    setScanningPairs(true)
    try {
      const sel = loadSelection()
      for (const s of SYMBOLS) {
        for (const tf of ['15m', '5m']) {
          try {
            const raw = await fetchKlines(s.src, tf, 150)
            if (Array.isArray(raw) && raw.length >= 80) {
              const cal = calibrateCandles(s.id, raw)
              const livePrice = cal[cal.length - 1].c
              const a = analyse(cal, tf, [], sel, { loaded: false, events: [] }, s.digits)
              if (a.ok && a.plan.valid) {
                journal.maybeRecord(a, s.id, s.label, tf, livePrice)
              }
              journal.tick(s.id, livePrice)
            }
          } catch {}
        }
      }
    } finally {
      setScanningPairs(false)
    }
  }

  useEffect(() => {
    if (entitlement.isActive) {
      void scanAllPairsForAutoJournal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitlement.isActive])

  const dateFilteredRecords = useMemo(() => {
    const now = Date.now()
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const minTs =
      dateRange === 'TODAY'
        ? startOfToday.getTime()
        : dateRange === '7D'
        ? now - 7 * 86400 * 1000
        : dateRange === '30D'
        ? now - 30 * 86400 * 1000
        : 0

    return journal.records
      .map(r => sanitizeTradeRecord(r))
      .filter(r => r.createdTs >= minTs)
  }, [journal.records, dateRange])

  // Complete Analytics & Win/Loss Report calculations from Firestore-synced trades_journal
  const report = useMemo(() => {
    const closedValid = dateFilteredRecords.filter(r => {
      if (!isClosed(r)) return false
      if (r.status === 'CANCELLED' || r.stage === 'CANCELLED' || r.status === 'INVALIDATED' || r.status === 'EXPIRED') {
        return false
      }
      return true
    })

    let wins = 0
    let losses = 0
    let breakevens = 0
    let grossWinR = 0
    let grossLossR = 0
    let netR = 0
    let peakR = 0
    let maxDrawdownR = 0

    // Chronological order for drawdown calculation
    const sortedChrono = [...closedValid].sort((a, b) => a.createdTs - b.createdTs)
    for (const r of sortedChrono) {
      const valR = isFinite(Number(r.resultR)) && Math.abs(Number(r.resultR)) <= 50 ? Number(r.resultR) : 0
      if (valR > 0.05) {
        wins++
        grossWinR += valR
      } else if (valR < -0.05) {
        losses++
        grossLossR += Math.abs(valR)
      } else {
        breakevens++
      }
      netR += valR
      if (netR > peakR) peakR = netR
      const dd = peakR - netR
      if (dd > maxDrawdownR) maxDrawdownR = dd
    }

    const totalClosed = wins + losses + breakevens
    const winRatePct = totalClosed > 0 ? Math.round((wins / totalClosed) * 1000) / 10 : 0
    const lossRatePct = totalClosed > 0 ? Math.round((losses / totalClosed) * 1000) / 10 : 0
    const beRatePct = totalClosed > 0 ? Math.round((breakevens / totalClosed) * 1000) / 10 : 0
    const profitFactor =
      grossLossR > 0
        ? Math.round((grossWinR / grossLossR) * 100) / 100
        : grossWinR > 0
        ? Number(grossWinR.toFixed(2))
        : 0

    // Symbol-by-Symbol Breakdown across all 8 instruments
    const symbolBreakdown = SYMBOLS.map(sym => {
      const symTrades = closedValid.filter(r => r.symbolId === sym.id)
      let sWins = 0
      let sLosses = 0
      let sBe = 0
      let sNetR = 0
      for (const r of symTrades) {
        const valR = isFinite(Number(r.resultR)) && Math.abs(Number(r.resultR)) <= 50 ? Number(r.resultR) : 0
        if (valR > 0.05) sWins++
        else if (valR < -0.05) sLosses++
        else sBe++
        sNetR += valR
      }
      const sTotal = sWins + sLosses + sBe
      return {
        symbolId: sym.id,
        label: sym.label,
        total: sTotal,
        wins: sWins,
        losses: sLosses,
        be: sBe,
        winRatePct: sTotal > 0 ? Math.round((sWins / sTotal) * 1000) / 10 : 0,
        netR: Math.round(sNetR * 100) / 100,
      }
    })

    // Killzone Session Performance Breakdown
    const sessions: Array<'London Killzone' | 'NY AM Killzone' | 'NY PM Macro' | 'Asian Session'> = [
      'London Killzone',
      'NY AM Killzone',
      'NY PM Macro',
      'Asian Session',
    ]
    const killzoneBreakdown = sessions.map(sess => {
      const sessTrades = closedValid.filter(r => classifyKillzoneSession(r.createdTs) === sess)
      let kWins = 0
      let kLosses = 0
      let kBe = 0
      let kNetR = 0
      for (const r of sessTrades) {
        const valR = isFinite(Number(r.resultR)) && Math.abs(Number(r.resultR)) <= 50 ? Number(r.resultR) : 0
        if (valR > 0.05) kWins++
        else if (valR < -0.05) kLosses++
        else kBe++
        kNetR += valR
      }
      const kTotal = kWins + kLosses + kBe
      return {
        session: sess,
        total: kTotal,
        wins: kWins,
        losses: kLosses,
        be: kBe,
        winRatePct: kTotal > 0 ? Math.round((kWins / kTotal) * 1000) / 10 : 0,
        netR: Math.round(kNetR * 100) / 100,
      }
    })

    return {
      totalRecords: dateFilteredRecords.length,
      openCount: dateFilteredRecords.filter(r => !isClosed(r)).length,
      totalClosed,
      wins,
      losses,
      breakevens,
      winRatePct,
      lossRatePct,
      beRatePct,
      netR: Math.round(netR * 100) / 100,
      profitFactor,
      maxDrawdownR: Math.round(maxDrawdownR * 100) / 100,
      symbolBreakdown,
      killzoneBreakdown,
    }
  }, [dateFilteredRecords])

  if (!entitlement.isActive) {
    return (
      <TerminalLockedScreen
        userProfile={userProfile ?? null}
        featureTitle="Full Win/Loss Analytics Report & Cloud Trade Journal"
        allowRewardedAd={false}
        onViewPlans={() => onOpenSubscription?.()}
        onSubscribeNow={() => onOpenSubscription?.()}
      />
    )
  }

  const records = dateFilteredRecords.filter(r => {
    if (filter === 'ALL') return true
    if (filter === 'OPEN') return !isClosed(r)
    if (filter === 'CLOSED') return isClosed(r)
    if (filter === 'RISKY') {
      const risk = assessTradeRisk(r)
      return !isClosed(r) && (risk.level === 'HIGH' || risk.level === 'MODERATE' || r.risky)
    }
    return true
  })

  const openRiskyCount = dateFilteredRecords.filter(r => {
    if (isClosed(r)) return false
    const risk = assessTradeRisk(r)
    return risk.level === 'HIGH'
  }).length

  const handleManualCloseWithLivePrice = async (rec: JournalRecord) => {
    let exitPrice = rec.priceAtCreate || rec.entry
    try {
      const symDef = symbolById(rec.symbolId)
      const raw = await fetchKlines(symDef.src, rec.tf || '15m', 5)
      if (Array.isArray(raw) && raw.length > 0) {
        const cal = calibrateCandles(rec.symbolId, raw)
        exitPrice = cal[cal.length - 1].c
      }
    } catch {
      const lastEvWithPrice = [...(rec.events || [])].reverse().find(e => typeof e.price === 'number' && e.price > 0)
      if (lastEvWithPrice?.price) exitPrice = lastEvWithPrice.price
    }
    journal.closeManual(rec.id, exitPrice)
  }

  const doExport = () => {
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), records: journal.records }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sr-journal-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 pb-8 max-w-xl mx-auto space-y-3 fadein tabular-nums">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="display text-lg font-bold tracking-tight text-[#FFFFFF]">Analytics, Win/Loss Report & Journal</h1>
          <p className="text-[11px] text-[#787B86] mt-0.5">Cloud-synced ICT trade history, Win/Loss metrics, Symbol & Killzone breakdown</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={scanningPairs}
            onClick={() => void scanAllPairsForAutoJournal()}
            className="chip flex items-center gap-1 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <RefreshCw size={11} className={scanningPairs ? 'animate-spin' : ''} />
            <span>{scanningPairs ? 'Scanning…' : 'Scan 8 Pairs'}</span>
          </button>
          <button className="chip flex items-center gap-1 cursor-pointer active:scale-98" onClick={doExport}><Download size={11} /> Export</button>
          <button className="chip flex items-center gap-1 cursor-pointer active:scale-98" onClick={() => { if (confirm('Clear all journal records?')) journal.clear() }}><Trash2 size={11} /> Clear</button>
        </div>
      </div>

      {/* Primary View Switcher: Analytics & Win/Loss Report vs Trade Journal */}
      <div className="seg-tab-group grid-cols-2">
        <button
          type="button"
          onClick={() => setViewTab('ANALYTICS')}
          className={`seg-tab active:scale-98 ${viewTab === 'ANALYTICS' ? 'seg-tab-active' : ''}`}
        >
          <BarChart3 size={13} />
          <span>Analytics & Win/Loss Report</span>
        </button>
        <button
          type="button"
          onClick={() => setViewTab('JOURNAL')}
          className={`seg-tab active:scale-98 ${viewTab === 'JOURNAL' ? 'seg-tab-active' : ''}`}
        >
          <NotebookPen size={13} />
          <span>Trade Journal ({dateFilteredRecords.length})</span>
        </button>
      </div>

      {/* Date Range Filters: Today, 7D, 30D, All Time */}
      <div className="flex items-center justify-between gap-2 bg-[#131722] border border-[#1E222D] p-1.5 rounded-[10px]">
        <span className="text-[10.5px] text-[#787B86] font-semibold px-2">Period:</span>
        <div className="grid grid-cols-4 gap-1 flex-1">
          {([
            ['TODAY', 'Today'],
            ['7D', '7D'],
            ['30D', '30D'],
            ['ALL', 'All Time'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDateRange(id)}
              className={`py-1 rounded-[6px] text-[10.5px] font-semibold cursor-pointer active:scale-98 ${
                dateRange === id
                  ? 'bg-[#FFFFFF] text-[#0B0E14] font-bold'
                  : 'text-[#787B86] hover:text-[#FFFFFF]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {openRiskyCount > 0 && (
        <div className="p-3.5 rounded-[12px] bg-[#131722] border border-[#F23645] flex items-start gap-2.5 text-[#FFFFFF]">
          <ShieldAlert size={17} className="text-[#F23645] shrink-0 mt-0.5" />
          <div className="text-[11.5px]">
            <strong className="text-[#F23645]">Risk Alert: {openRiskyCount} Active Setup Near Invalidation</strong>
            <p className="text-[#787B86] text-[11px] mt-0.5 leading-relaxed">
              Adverse excursion is approaching Stop Loss. Use Move SL to Break-Even on the active trade row to protect capital.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 1: COMPLETE ANALYTICS & WIN/LOSS REPORT DASHBOARD */}
      {viewTab === 'ANALYTICS' && (
        <div className="space-y-3 fadein">
          {/* Primary Win/Loss/BE Rate & Cumulative R Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="card p-3">
              <div className="label">Win Rate (TP Hit)</div>
              <div className="text-[18px] font-bold text-[#26A69A] mt-1">
                {report.totalClosed > 0 ? `${report.winRatePct}%` : '0.0%'}
              </div>
              <div className="text-[10px] text-[#787B86] mt-0.5">{report.wins} Total Wins</div>
            </div>

            <div className="card p-3">
              <div className="label">Loss Rate (SL Hit)</div>
              <div className="text-[18px] font-bold text-[#EF5350] mt-1">
                {report.totalClosed > 0 ? `${report.lossRatePct}%` : '0.0%'}
              </div>
              <div className="text-[10px] text-[#787B86] mt-0.5">{report.losses} Total Losses</div>
            </div>

            <div className="card p-3">
              <div className="label">Break-Even Rate</div>
              <div className="text-[18px] font-bold text-[#FFFFFF] mt-1">
                {report.totalClosed > 0 ? `${report.beRatePct}%` : '0.0%'}
              </div>
              <div className="text-[10px] text-[#787B86] mt-0.5">{report.breakevens} Closed (BE)</div>
            </div>

            <div className="card p-3">
              <div className="label">Net Cumulative R</div>
              <div
                className="text-[18px] font-bold mt-1"
                style={{ color: report.netR >= 0 ? '#26A69A' : '#EF5350' }}
              >
                {report.netR >= 0 ? '+' : ''}{report.netR.toFixed(2)}R
              </div>
              <div className="text-[10px] text-[#787B86] mt-0.5">{report.totalClosed} Closed · {report.openCount} Open</div>
            </div>
          </div>

          {/* Secondary Institutional Metrics: Profit Factor, Max Drawdown, Win/Loss Visual Bar */}
          <div className="card p-3.5 space-y-3">
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                <div className="label">Profit Factor</div>
                <div className="text-[15px] font-bold text-[#FFFFFF] mt-0.5">{report.profitFactor.toFixed(2)}</div>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                <div className="label">Max Drawdown</div>
                <div className="text-[15px] font-bold text-[#EF5350] mt-0.5">-{report.maxDrawdownR.toFixed(2)}R</div>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
                <div className="label">Total Logged</div>
                <div className="text-[15px] font-bold text-[#FFFFFF] mt-0.5">{report.totalRecords}</div>
              </div>
            </div>

            {/* Win / BE / Loss Distribution Bar */}
            <div>
              <div className="flex justify-between text-[10px] text-[#787B86] mb-1">
                <span className="text-[#26A69A] font-semibold">Wins {report.winRatePct}% ({report.wins})</span>
                <span className="text-[#9CA3AF] font-semibold">BE {report.beRatePct}% ({report.breakevens})</span>
                <span className="text-[#EF5350] font-semibold">Losses {report.lossRatePct}% ({report.losses})</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#0B0E14] border border-[#1E222D] overflow-hidden flex">
                {report.totalClosed > 0 ? (
                  <>
                    <div style={{ width: `${report.winRatePct}%`, backgroundColor: '#26A69A' }} />
                    <div style={{ width: `${report.beRatePct}%`, backgroundColor: '#787B86' }} />
                    <div style={{ width: `${report.lossRatePct}%`, backgroundColor: '#EF5350' }} />
                  </>
                ) : (
                  <div className="w-full h-full bg-[#1E222D]" />
                )}
              </div>
            </div>
          </div>

          {/* Symbol-by-Symbol Performance Breakdown */}
          <div className="card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1E222D] pb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#26A69A]" />
                <span className="text-[12px] font-bold text-[#FFFFFF]">Symbol-by-Symbol Breakdown</span>
              </div>
              <span className="text-[10px] text-[#787B86]">8 Institutional Pairs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] tabular-nums">
                <thead>
                  <tr className="text-[#787B86] border-b border-[#1E222D]">
                    <th className="py-1.5 font-semibold">Symbol</th>
                    <th className="py-1.5 font-semibold text-center">Trades</th>
                    <th className="py-1.5 font-semibold text-center">W / L / BE</th>
                    <th className="py-1.5 font-semibold text-right">Win Rate</th>
                    <th className="py-1.5 font-semibold text-right">Net R</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E222D]/60">
                  {report.symbolBreakdown.map(row => (
                    <tr key={row.symbolId} className="hover:bg-[#0B0E14]/60">
                      <td className="py-2 font-semibold text-[#FFFFFF]">
                        {row.label} <span className="text-[9.5px] text-[#787B86] font-mono">({row.symbolId})</span>
                      </td>
                      <td className="py-2 text-center text-[#B2B5BE]">{row.total}</td>
                      <td className="py-2 text-center">
                        <span className="text-[#26A69A] font-semibold">{row.wins}</span>
                        <span className="text-[#787B86]"> / </span>
                        <span className="text-[#EF5350] font-semibold">{row.losses}</span>
                        <span className="text-[#787B86]"> / </span>
                        <span className="text-[#9CA3AF]">{row.be}</span>
                      </td>
                      <td className="py-2 text-right font-semibold text-[#FFFFFF]">
                        {row.total > 0 ? `${row.winRatePct}%` : '—'}
                      </td>
                      <td
                        className="py-2 text-right font-bold"
                        style={{ color: row.netR > 0 ? '#26A69A' : row.netR < 0 ? '#EF5350' : '#9CA3AF' }}
                      >
                        {row.netR > 0 ? '+' : ''}{row.netR.toFixed(2)}R
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Killzone Session Performance Breakdown */}
          <div className="card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1E222D] pb-2">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#FFD740]" />
                <span className="text-[12px] font-bold text-[#FFFFFF]">Killzone Session Performance</span>
              </div>
              <span className="text-[10px] text-[#787B86]">ICT Time & Price</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.killzoneBreakdown.map(kz => (
                <div key={kz.session} className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-between">
                  <div>
                    <div className="text-[11.5px] font-semibold text-[#FFFFFF]">{kz.session}</div>
                    <div className="text-[10px] text-[#787B86] mt-0.5">
                      {kz.total} Trades · <span className="text-[#26A69A]">{kz.wins}W</span> / <span className="text-[#EF5350]">{kz.losses}L</span> / {kz.be}BE
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-bold text-[#FFFFFF]">
                      {kz.total > 0 ? `${kz.winRatePct}%` : '—'}
                    </div>
                    <div
                      className="text-[10.5px] font-bold"
                      style={{ color: kz.netR > 0 ? '#26A69A' : kz.netR < 0 ? '#EF5350' : '#9CA3AF' }}
                    >
                      {kz.netR > 0 ? '+' : ''}{kz.netR.toFixed(2)}R
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TRADE JOURNAL & LIFECYCLE HISTORY */}
      {viewTab === 'JOURNAL' && (
        <div className="space-y-3 fadein">
          <div className="seg-tab-group grid-cols-4">
            {(['ALL', 'OPEN', 'RISKY', 'CLOSED'] as const).map(f => (
              <button
                key={f}
                className={`seg-tab active:scale-98 ${filter === f ? 'seg-tab-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'RISKY' ? `Risky ${openRiskyCount > 0 ? `(${openRiskyCount})` : ''}` : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {records.length === 0 && (
              <div className="card p-7 text-center space-y-2">
                <p className="text-[12.5px] text-[#787B86]">
                  {filter === 'RISKY' ? 'No active trades currently flagged as high risk.' : 'No trades logged for this filter window yet. Scan live pairs or log a setup from the Chart Drawing Toolbar.'}
                </p>
                <button
                  type="button"
                  onClick={() => void scanAllPairsForAutoJournal()}
                  className="px-3.5 py-2 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] font-semibold text-[11.5px] cursor-pointer active:scale-98"
                >
                  Scan All 8 Pairs Now
                </button>
              </div>
            )}
            {records.map(r => (
              <RecordRow
                key={r.id}
                r={r}
                onClose={() => { void handleManualCloseWithLivePrice(r) }}
                onMoveBE={(id, entry) => journal.moveToBE(id, entry)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
