import type { Candle } from './market'

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach(fn => {
    try { fn() } catch {}
  })
}

export function onCalibrationChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getBrokerOffset(symbolId: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(`sr.broker_offset.${symbolId}`)
    const parsed = raw ? parseFloat(raw) : 0
    return isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

export function setBrokerOffset(symbolId: string, offset: number): void {
  if (typeof window === 'undefined') return
  try {
    const safeOffset = isFinite(offset) ? Number(offset.toFixed(5)) : 0
    localStorage.setItem(`sr.broker_offset.${symbolId}`, safeOffset.toString())
    notify()
  } catch {}
}

export function resetBrokerOffset(symbolId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`sr.broker_offset.${symbolId}`)
    notify()
  } catch {}
}

export function syncToBrokerPrice(symbolId: string, currentDisplayPrice: number, targetBrokerPrice: number): void {
  if (!isFinite(currentDisplayPrice) || !isFinite(targetBrokerPrice) || targetBrokerPrice <= 0) return
  const currentOffset = getBrokerOffset(symbolId)
  const diff = targetBrokerPrice - currentDisplayPrice
  setBrokerOffset(symbolId, currentOffset + diff)
}

/**
 * No-op benchmark sync: external floating ratio multipliers have been removed
 * so prices never flicker or jump between competing benchmark feeds.
 * Only the user's explicit Broker Offset Calibration (+/- points, default 0.0) is applied.
 */
export async function syncBenchmarks(_currentRawPrices?: Record<string, number>): Promise<void> {
  return
}

export function getCalibrationMultiplier(_symbolId: string, _rawPrice?: number): number {
  return 1.0
}

export function calibratePrice(symbolId: string, rawPrice: number): number {
  if (!isFinite(rawPrice) || rawPrice <= 0) return rawPrice
  const offset = getBrokerOffset(symbolId)
  return rawPrice + offset
}

export function calibrateCandle(symbolId: string, candle: Candle): Candle {
  const offset = getBrokerOffset(symbolId)
  if (offset === 0) return candle
  const out: Candle = {
    t: candle.t,
    o: candle.o + offset,
    h: candle.h + offset,
    l: candle.l + offset,
    c: candle.c + offset,
    v: candle.v,
    final: candle.final,
  }
  if (candle._meta) {
    Object.defineProperty(out, '_meta', {
      value: candle._meta,
      enumerable: false,
      configurable: true,
      writable: true,
    })
  }
  return out
}

export function calibrateCandles(symbolId: string, candles: Candle[]): Candle[] {
  if (!candles || candles.length === 0) return []
  const offset = getBrokerOffset(symbolId)
  if (offset === 0) {
    return candles
  }
  return candles.map(c => {
    const out: Candle = {
      t: c.t,
      o: c.o + offset,
      h: c.h + offset,
      l: c.l + offset,
      c: c.c + offset,
      v: c.v,
      final: c.final,
    }
    if (c._meta) {
      Object.defineProperty(out, '_meta', {
        value: c._meta,
        enumerable: false,
        configurable: true,
        writable: true,
      })
    }
    return out
  })
}
