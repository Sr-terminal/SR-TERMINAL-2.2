import { X, ShieldAlert, Target, Crosshair } from 'lucide-react'
import type { Analysis } from '../lib/ict'
import type { SymbolDef } from '../lib/market'
import { fmtPrice } from '../lib/market'
import { sanitizeIctString, sanitizeConfluenceTags, normalizeEntryZone } from '../lib/journal'

export default function TradePlanModal({
  analysis, sym, account, riskPct, onClose,
}: {
  analysis: Analysis
  sym: SymbolDef
  account: number
  riskPct: number
  onClose: () => void
}) {
  const p = analysis?.plan || ({} as any)
  const d = sym?.digits ?? 2
  const riskAmount = account * (riskPct / 100)
  const stopDist = Math.abs((p.entry || 0) - (p.stop || 0))
  const units = stopDist > 0 ? riskAmount / stopDist : 0
  const safeEntryZone = normalizeEntryZone(p.entryZone, p.entry)
  const cleanConfluences = sanitizeConfluenceTags(p.confluences)
  const safeAligned: string[] = Array.isArray(p.logic?.aligned) ? p.logic.aligned : []
  const safeOpposing: string[] = Array.isArray(p.logic?.opposing) ? p.logic.opposing : []
  const safeNeutral: string[] = Array.isArray(p.logic?.neutral) ? p.logic.neutral : []
  const safeBlockers: string[] = Array.isArray(p.blockers) ? p.blockers : []
  const cleanModel = (str?: string) => {
    if (!str) return '—'
    const base = sanitizeIctString(str)
    if (cleanConfluences.length > 0 && /\b\d+\s+concepts?\s+aligned/i.test(base)) {
      return base.replace(
        /\b\d+\s+concepts?\s+aligned/gi,
        `${cleanConfluences.length} concept${cleanConfluences.length === 1 ? '' : 's'} aligned`
      )
    }
    return base
  }
  const isLong = p.direction === 'LONG'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 fadein" onClick={onClose}>
      <div
        className="card w-full sm:max-w-md max-h-[88vh] overflow-y-auto scroll-touch p-4 space-y-3 rounded-t-[16px] sm:rounded-[12px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1E222D]">
          <div>
            <div className="label">Institutional Trade Plan</div>
            <div className="text-sm font-semibold text-[#FFFFFF] mt-0.5 tabular-nums">{sym.label} · {(analysis?.interval || '15m').toUpperCase()}</div>
          </div>
          <button onClick={onClose} className="text-[#787B86] hover:text-[#FFFFFF] p-1.5 rounded-[8px] cursor-pointer active:scale-98"><X size={18} /></button>
        </div>

        <div className="flex flex-wrap items-baseline gap-2.5 tabular-nums">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: isLong ? '#089981' : p.direction === 'SHORT' ? '#F23645' : '#787B86' }}
          >
            {p.direction || 'STAND ASIDE'}
          </span>
          <span className="text-[#787B86]">·</span>
          <span className={`text-xs font-bold tracking-wide uppercase ${p.valid ? 'text-[#FFFFFF]' : 'text-[#F23645]'}`}>
            {p.valid ? `Grade ${p.grade || 'A'}` : 'Stand Aside'}
          </span>
          <span className="text-[#787B86]">·</span>
          <span className="text-xs text-[#787B86] font-medium">{cleanModel(p.model)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 tabular-nums">
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label mb-1">Entry Zone</div>
            <div className="text-sm text-[#FFFFFF] font-semibold">{fmtPrice(safeEntryZone[0], d)} — {fmtPrice(safeEntryZone[1], d)}</div>
          </div>
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label mb-1">Stop Loss (SL)</div>
            <div className="text-sm text-[#F23645] font-semibold">{fmtPrice(p.stop || 0, d)}</div>
          </div>
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label mb-1">TP1 · Partial + BE</div>
            <div className="text-sm text-[#089981] font-semibold">{fmtPrice(p.tp1 || 0, d)} · {Number(p.rr1 || 1).toFixed(2)}R</div>
          </div>
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label mb-1">TP2</div>
            <div className="text-sm text-[#089981] font-semibold">{fmtPrice(p.tp2 || 0, d)} · {Number(p.rr || 2).toFixed(2)}R</div>
          </div>
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label mb-1">TP3 · Runner</div>
            <div className="text-sm text-[#089981] font-semibold">{fmtPrice(p.tp3 || 0, d)}</div>
          </div>
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label mb-1">Risk Width</div>
            <div className="text-sm text-[#FFFFFF] font-semibold">{(p.riskATR || 0) > 0 ? `${Number(p.riskATR).toFixed(2)} ATR` : '—'}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="flex items-center gap-2 mb-1.5"><Crosshair size={13} className="text-[#787B86]" /><span className="label">Engine Logic</span></div>
          <p className="text-[12px] text-[#FFFFFF] leading-relaxed">{cleanModel(p.logic?.summary)}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 pt-2 border-t border-[#1E222D] text-[11px]">
            {safeAligned.map(k => <span key={k} className="text-[#089981] font-medium">+ {k}</span>)}
            {safeOpposing.map(k => <span key={k} className="text-[#F23645] font-medium">− {k}</span>)}
            {safeNeutral.map(k => <span key={k} className="text-[#787B86]">· {k}</span>)}
          </div>
        </div>

        {cleanConfluences.length > 0 && (
          <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="label mb-1.5">Active Confluences ({cleanConfluences.length})</div>
            <div className="text-[11.5px] text-[#FFFFFF] leading-relaxed">
              {cleanConfluences.map(c => cleanModel(c)).join(' · ')}
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
          <div className="flex items-center gap-2 mb-2"><Target size={13} className="text-[#787B86]" /><span className="label">Risk & Position Sizing</span></div>
          <div className="text-[12px] space-y-1.5 text-[#787B86] tabular-nums">
            <div className="flex justify-between"><span>Account Equity</span><span className="text-[#FFFFFF]">${account.toLocaleString('en-US')}</span></div>
            <div className="flex justify-between"><span>Risk Allocation ({riskPct}%)</span><span className="text-[#FFFFFF]">${riskAmount.toLocaleString('en-US')}</span></div>
            <div className="flex justify-between"><span>Stop Distance</span><span className="text-[#FFFFFF]">{fmtPrice(stopDist, d)}</span></div>
            <div className="flex justify-between text-[#FFFFFF] font-semibold pt-1.5 border-t border-[#1E222D]"><span>Calculated Size</span><span>{units.toFixed(units < 10 ? 3 : 2)} units</span></div>
          </div>
        </div>

        {safeBlockers.length > 0 && (
          <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-[#F23645]">
            <div className="flex items-center gap-2 mb-1.5"><ShieldAlert size={13} className="text-[#F23645]" /><span className="label text-[#F23645]">Invalidation & Blockers</span></div>
            <ul className="text-[11.5px] text-[#FFFFFF] space-y-1">
              {safeBlockers.map((b, i) => <li key={i}>· {cleanModel(b)}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
