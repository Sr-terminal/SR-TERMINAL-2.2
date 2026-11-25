import { memo } from 'react'
import { SYMBOLS, fmtPrice } from '../lib/market'
import type { Ticker } from '../lib/market'

const MarketStrip = memo(function MarketStrip({
  tickers, activeId, onSelect,
}: {
  tickers: Record<string, Ticker>
  activeId?: string
  onSelect?: (id: string) => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scroll-touch">
      {SYMBOLS.map(s => {
        const t = tickers[s.src]
        const chg = t?.changePct ?? 0
        const up = chg >= 0
        const active = activeId === s.id
        return (
          <button
            key={s.id}
            onClick={() => onSelect?.(s.id)}
            className={`card shrink-0 px-3.5 py-3 text-left min-w-[132px] cursor-pointer active:scale-98 ${
              active
                ? 'border-[#FFFFFF] bg-[#181C27]'
                : 'border-[#1E222D] bg-[#131722] hover:border-[#2A2E39]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-semibold tracking-tight ${active ? 'text-[#FFFFFF]' : 'text-[#787B86]'}`}>
                {s.label}
              </span>
              <span
                className="text-[10.5px] font-semibold tabular-nums"
                style={{ color: up ? '#089981' : '#F23645' }}
              >
                {up ? '+' : ''}{chg.toFixed(2)}%
              </span>
            </div>
            <div className="mt-1.5 text-[15px] font-semibold text-[#FFFFFF] tabular-nums tracking-tight">
              {t ? fmtPrice(t.price, s.digits) : (
                <span className="inline-block w-16 h-4 rounded shimmer align-middle" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
})

export default MarketStrip
