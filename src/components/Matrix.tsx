import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SYMBOLS, INTERVALS, fetchKlines } from '../lib/market'
import { analyse, type Analysis } from '../lib/ict'
import { calibrateCandles } from '../lib/brokerCalibration'

interface Cell {
  score: number
  bias: string
  dir: 'LONG' | 'SHORT' | 'STAND ASIDE'
  grade: string
}

function cellStyle(c: Cell | undefined): { bg: string; border: string; text: string } {
  if (!c) return { bg: '#0B0E14', border: '#1E222D', text: '#787B86' }
  if (c.score >= 45) return { bg: 'rgba(8, 153, 129, 0.14)', border: 'rgba(8, 153, 129, 0.45)', text: '#089981' }
  if (c.score >= 18) return { bg: 'rgba(8, 153, 129, 0.08)', border: 'rgba(8, 153, 129, 0.28)', text: '#089981' }
  if (c.score <= -45) return { bg: 'rgba(242, 54, 69, 0.14)', border: 'rgba(242, 54, 69, 0.45)', text: '#F23645' }
  if (c.score <= -18) return { bg: 'rgba(242, 54, 69, 0.08)', border: 'rgba(242, 54, 69, 0.28)', text: '#F23645' }
  return { bg: '#0B0E14', border: '#1E222D', text: '#787B86' }
}

export default function Matrix({ onOpenCell }: { onOpenCell?: (symbolId: string, tf: string) => void }) {
  const [cells, setCells] = useState<Record<string, Cell>>({})
  const [loading, setLoading] = useState(false)
  const [lastTs, setLastTs] = useState(0)

  const load = async () => {
    setLoading(true)
    const jobs: Array<{ sym: string; src: string; tf: string; digits: number }> = []
    for (const s of SYMBOLS) {
      for (const tf of INTERVALS) {
        jobs.push({ sym: s.id, src: s.src, tf: tf.id, digits: s.digits })
      }
    }
    const out: Record<string, Cell> = {}
    for (let i = 0; i < jobs.length; i += 5) {
      const batch = jobs.slice(i, i + 5)
      await Promise.all(
        batch.map(async (j) => {
          try {
            const rawK = await fetchKlines(j.src, j.tf, 140)
            const kc = calibrateCandles(j.sym, rawK)
            const a: Analysis = analyse(kc, j.tf, undefined, undefined, undefined, j.digits)
            out[`${j.sym}|${j.tf}`] = {
              score: a.score,
              bias: a.bias,
              dir: a.plan.valid ? a.plan.direction : 'STAND ASIDE',
              grade: a.plan.grade,
            }
          } catch {
            /* cell stays empty */
          }
        })
      )
      setCells({ ...out })
    }
    setLoading(false)
    setLastTs(Date.now())
  }

  useEffect(() => {
    void load()
    const t = setInterval(() => {
      void load()
    }, 180000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4 pb-8 max-w-xl mx-auto space-y-3 fadein">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-lg font-bold tracking-tight text-[#FFFFFF]">Multi-Timeframe Matrix</h1>
          <p className="text-[11px] text-[#787B86] mt-0.5 tabular-nums">
            {lastTs
              ? `Live Sync: ${new Date(lastTs).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`
              : 'Synchronizing market depth…'} · 5×7 algorithmic bias map
          </p>
        </div>
        <button
          onClick={() => { void load() }}
          disabled={loading}
          className="h-9 px-3 rounded-[10px] bg-[#131722] hover:border-[#2A2E39] text-[#FFFFFF] border border-[#1E222D] text-[11px] font-semibold flex items-center gap-1.5 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className="text-[#787B86]" />
          <span>{loading ? 'Syncing' : 'Refresh'}</span>
        </button>
      </div>

      {/* Grid Container */}
      <div className="card p-3 overflow-x-auto scroll-touch">
        <table className="w-full border-collapse min-w-[400px] tabular-nums">
          <thead>
            <tr>
              <th className="text-left pb-2.5 pl-1.5 label">Asset</th>
              {INTERVALS.map((tf) => (
                <th key={tf.id} className="pb-2.5 text-center label">
                  {tf.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SYMBOLS.map((s) => (
              <tr key={s.id} className="border-t border-[#1E222D]">
                <td className="py-2.5 pl-1.5 pr-2 whitespace-nowrap">
                  <div className="text-[12.5px] font-bold text-[#FFFFFF]">{s.label}</div>
                  <div className="text-[10px] text-[#787B86]">{s.id}</div>
                </td>
                {INTERVALS.map((tf) => {
                  const c = cells[`${s.id}|${tf.id}`]
                  const style = cellStyle(c)
                  if (!c && loading) {
                    return (
                      <td key={tf.id} className="p-1">
                        <div className="w-full min-h-[46px] rounded-[8px] shimmer" />
                      </td>
                    )
                  }
                  return (
                    <td key={tf.id} className="p-1">
                      <button
                        onClick={() => onOpenCell?.(s.id, tf.id)}
                        className="w-full min-h-[46px] rounded-[8px] py-1.5 px-1 flex flex-col items-center justify-center cursor-pointer active:scale-98 border tabular-nums"
                        style={{
                          backgroundColor: style.bg,
                          borderColor: style.border,
                        }}
                      >
                        <span className="text-[12px] font-bold leading-none tabular-nums" style={{ color: style.text }}>
                          {c ? (c.score > 0 ? `+${c.score}` : `${c.score}`) : '—'}
                        </span>
                        <div className="flex items-center gap-0.5 mt-1">
                          {c?.dir === 'LONG' ? (
                            <TrendingUp size={10} className="text-[#089981]" />
                          ) : c?.dir === 'SHORT' ? (
                            <TrendingDown size={10} className="text-[#F23645]" />
                          ) : (
                            <Minus size={9} className="text-[#787B86]" />
                          )}
                          <span className="text-[8.5px] font-bold uppercase" style={{ color: style.text }}>
                            {c ? (c.dir === 'STAND ASIDE' ? 'WAIT' : c.dir) : 'WAIT'}
                          </span>
                        </div>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[10.5px]">
        <span className="flex items-center gap-1.5 text-[#089981] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#089981]" /> Bullish Bias
        </span>
        <span className="flex items-center gap-1.5 text-[#787B86] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#787B86]" /> Neutral
        </span>
        <span className="flex items-center gap-1.5 text-[#F23645] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#F23645]" /> Bearish Bias
        </span>
      </div>

      <p className="text-[11px] text-[#787B86] leading-relaxed">
        Tap any grid cell to open that instrument and timeframe directly in the Execution Terminal.
      </p>
    </div>
  )
}
