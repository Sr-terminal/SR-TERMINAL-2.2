import { safeStorage } from './storage'

export interface ConceptDef {
  key: string
  label: string
  directional: boolean
  desc: string
}

export interface ConceptSelection {
  mode: 'STRICT' | 'BALANCED'
  keys: Record<string, boolean>
}

export const CONCEPTS: ConceptDef[] = [
  {
    key: 'apexPulse',
    label: 'ICT APEX-PULSE (2000X Matrix)',
    directional: true,
    desc: 'Unicorn Model (Breaker+FVG), IFVG, Volume Imbalance, Session Killzone & >=78% Matrix Gate',
  },
  {
    key: 'liquidity',
    label: 'Hidden Liquidity and Draw on Liquidity',
    directional: true,
    desc: 'BSL/SSL pools, sweep + raid, swing high/low hierarchy draws',
  },
  {
    key: 'turtleSoup',
    label: 'Liquidity Sweep & CISD Reversal',
    directional: true,
    desc: '20-bar BSL/SSL liquidity raid, displacement & CISD reclaim',
  },
  {
    key: 'adxTrend',
    label: 'Order Block & PD Array Pullback',
    directional: true,
    desc: 'Institutional expansion trend, Order Block / FVG mitigation & resume close',
  },
  {
    key: 'orderFlow',
    label: 'Institutional Order Flow — Candle and Volume Proxy',
    directional: true,
    desc: 'Displacement, body efficiency, volume surge, CISD',
  },
  {
    key: 'pdArrays',
    label: 'Premium–Discount Arrays and Entry Models',
    directional: true,
    desc: 'PD arrays, FVG/OB/OTE in correct half of dealing range',
  },
  {
    key: 'fractal',
    label: 'Multi-Timeframe Fractal Alignment',
    directional: true,
    desc: 'HTF bias alignment (15m/1h/4h/1d map)',
  },
  {
    key: 'news',
    label: 'High-Impact News and Market Response',
    directional: true,
    desc: 'Red folder blackout + surprise direction',
  },
  {
    key: 'risk',
    label: 'Risk and Trade Management',
    directional: false,
    desc: 'Non-directional safety filter: stop efficiency, RR space, no chase',
  },
]

const KEY = 'sr.engine.concepts.v2'

export function defaultSelection(): ConceptSelection {
  return {
    mode: 'BALANCED',
    keys: {
      apexPulse: true,
      liquidity: true,
      pdArrays: true,
      news: true,
      risk: true,
      turtleSoup: false,
      adxTrend: false,
      orderFlow: false,
      fractal: false,
    },
  }
}

export function allOnSelection(mode: 'STRICT' | 'BALANCED' = 'BALANCED'): ConceptSelection {
  const keys: Record<string, boolean> = {}
  for (const c of CONCEPTS) keys[c.key] = true
  return { mode, keys }
}

export function loadSelection(): ConceptSelection {
  try {
    const raw = safeStorage.getItem(KEY)
    if (!raw) return defaultSelection()
    const parsed = JSON.parse(raw)
    const base = defaultSelection()
    const keys: Record<string, boolean> = {}
    for (const c of CONCEPTS) {
      keys[c.key] = parsed.keys?.[c.key] ?? base.keys[c.key]
    }
    return {
      mode: parsed.mode === 'STRICT' ? 'STRICT' : 'BALANCED',
      keys,
    }
  } catch {
    return defaultSelection()
  }
}

export function saveSelection(sel: ConceptSelection) {
  try {
    safeStorage.setItem(KEY, JSON.stringify(sel))
  } catch {}
}
