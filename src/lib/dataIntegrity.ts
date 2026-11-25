export type LiveDataStatus = 'LIVE' | 'SYNCING' | 'STALE' | 'RECONNECTING' | 'OFFLINE'

export interface TickMetadata {
  exchangeTs: number
  serverReceiveTs: number
  processingTs: number
  displayTs: number
  latencyMs: number
  executionTimeMs?: number
  isStale: boolean
  source: string
}

export interface CandleExecutionMeta {
  executionTimeMs: number
  latencyMs: number
  exchangeTs: number
  receiveTs: number
  source: string
}

export interface ExecutionMetadataStream {
  symbol: string
  interval: string
  executionTimeMs: number
  latencyMs: number
  avgExecutionTimeMs: number
  avgLatencyMs: number
  executionEfficiencyPct: number
  samplesCount: number
  lastUpdatedTs: number
}

/**
 * Computes institutional Execution Efficiency (0 - 100%) from execution time (ms) and feed latency (ms).
 */
export function computeExecutionEfficiencyPct(avgExecutionTimeMs: number, avgLatencyMs: number): number {
  const execMs = Math.max(0.1, Number.isFinite(avgExecutionTimeMs) ? avgExecutionTimeMs : 2.5)
  const latMs = Math.max(1, Number.isFinite(avgLatencyMs) ? avgLatencyMs : 42)
  // Penalty model: sub-5ms execution & sub-80ms latency -> ~98-99.6% efficiency
  const execPenalty = Math.min(8, execMs * 0.18)
  const latencyPenalty = Math.min(12, (latMs / 100) * 1.4)
  const rawEfficiency = 99.8 - execPenalty - latencyPenalty
  return Math.round(Math.max(82.0, Math.min(99.9, rawEfficiency)) * 10) / 10
}

export interface TickValidationResult {
  valid: boolean
  isStale: boolean
  ageMs: number
  reason?: string
}

// Max allowable age for a live tick before flagging STALE (in ms)
export const MAX_LIVE_TICK_AGE_MS = 15000

// If no tick received for 15000ms, feed is considered stale/silent
export const SILENT_FEED_THRESHOLD_MS = 15000

/**
 * Validates incoming tick timestamps and calculates latency.
 * Protects downstream engines from stale, duplicate, or out-of-order prices.
 * Note: tickTs must be the stream event timestamp (msg.data.E or receive time), NOT k.T (candle close time).
 */
export function validateTickFreshness(
  tickTs: number,
  lastValidTs: number,
  maxAgeMs = MAX_LIVE_TICK_AGE_MS
): TickValidationResult {
  const now = Date.now()

  // Invalid timestamp or future clock skew > 30s
  if (!tickTs || isNaN(tickTs) || tickTs <= 0 || tickTs > now + 30000) {
    return { valid: false, isStale: true, ageMs: Infinity, reason: 'Invalid or skewed timestamp' }
  }

  // Age of the tick compared to current device clock
  const ageMs = Math.max(0, now - tickTs)

  // Stale check
  if (ageMs > maxAgeMs) {
    return { valid: false, isStale: true, ageMs, reason: `Tick too old (${ageMs}ms > ${maxAgeMs}ms)` }
  }

  // Out of order / duplicate check: tick time must not be strictly older than last seen timestamp by more than 2 seconds
  if (lastValidTs > 0 && tickTs < lastValidTs - 2000) {
    return { valid: false, isStale: true, ageMs, reason: 'Out-of-order tick' }
  }

  return { valid: true, isStale: false, ageMs }
}
