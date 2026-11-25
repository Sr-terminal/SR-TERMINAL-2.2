/**
 * SR TERMINAL — TRADE LIFECYCLE STATE MACHINE & DEDUPLICATION ENGINE
 *
 * Formal state transitions:
 *   SETUP_FORMING (Pre-trade warning)
 *     ↓
 *   ENTRY_CONFIRMED (Trade entered notification)
 *     ↓
 *   RUNNING (Active trade monitoring)
 *     ↓
 *   TP1 HIT / TP2 HIT / TP3 HIT (Partial/Full profit)
 *     OR
 *   STOP LOSS HIT (Trade closed with loss)
 *     OR
 *   BREAKEVEN (Stop hit after TP1/TP2 partials)
 *     OR
 *   INVALIDATED (Setup broke before entry)
 *     OR
 *   EXPIRED (Entry was never reached within time limit)
 *     OR
 *   CANCELLED (Manually closed)
 *
 * Guarantees:
 * 1. Strictly at most ONE active open trade per symbol at any time across all timeframes
 * 2. Minimum 15-minute cooldown per symbol after any trade closes before a new setup can be auto-logged
 * 3. Deterministic setupId deduplication so identical setups are never logged twice
 * 4. 2 consecutive valid ticks (spaced >= 1s apart) AND >= 15 seconds after entry before SL_HIT / TP_HIT
 * 5. Every notification event fired at most once
 */

import { safeStorage } from './storage'

export type TradeStage =
  | 'SETUP_FORMING'
  | 'ENTRY_CONFIRMED'
  | 'RUNNING'
  | 'TP1'
  | 'TP2'
  | 'TP3'
  | 'BREAKEVEN'
  | 'CLOSED (BE)'
  | 'CLOSED'
  | 'STOPPED'
  | 'INVALIDATED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface TradeEventLog {
  ts: number
  stage: TradeStage
  price?: number
  note: string
}

export interface ImmutableTradeRecord {
  id: string
  signalId: string
  setupId?: string
  symbolId: string
  symbolLabel: string
  tf: string
  direction: 'LONG' | 'SHORT'
  model: string
  modelKind?: string
  entry: number
  entryZone: [number, number]
  stop: number
  initialStopLoss: number
  initialStop?: number
  beProtected?: boolean
  tp1: number
  tp2: number
  tp3: number
  rr: number
  rr1?: number
  rr3?: number
  grade: string
  confidence?: number
  confluences: string[]
  logicSummary?: string
  createdTs: number
  statusTs: number
  entryConfirmedTs?: number
  lastLifecycleTickTs?: number
  slBreachTicks?: number
  tpBreachTicks?: number
  invalidationBreachTicks?: number
  stage: TradeStage
  status: TradeStage
  risky: boolean
  maxAdverseR?: number
  resultR?: number
  events: TradeEventLog[]
  priceAtCreate: number
  preWarningFired?: boolean
  entryConfirmedFired?: boolean
  digits?: number
}

export type SetupClassification =
  | { type: 'NEW_SETUP'; trade: ImmutableTradeRecord }
  | { type: 'UPDATE_EXISTING'; trade: ImmutableTradeRecord }
  | { type: 'TRADE_ALREADY_ACTIVE'; trade: ImmutableTradeRecord }
  | { type: 'NO_TRADE'; reason: string }

const NOTIF_EVENT_KEY = 'sr_processed_notification_events'
const SYMBOL_COOLDOWN_STORAGE_KEY = 'sr_symbol_close_cooldown_v2'
const LOGGED_SETUP_IDS_STORAGE_KEY = 'sr_logged_setup_ids_v2'

export const SYMBOL_POST_CLOSE_COOLDOWN_MS = 15 * 60 * 1000 // Strict 15-minute cooldown per symbol after trade close
export const MIN_HOLD_AFTER_ENTRY_MS = 15 * 1000 // Minimum 15 seconds after entry before SL/TP can trigger
export const REQUIRED_CONSECUTIVE_BREACH_TICKS = 2 // Must hold past SL/TP on 2 consecutive valid ticks
export const MIN_DISTINCT_TICK_GAP_MS = 1000 // Minimum 1 second between consecutive breach tick counts

const inMemorySymbolCooldowns = new Map<string, number>()
const inMemoryLoggedSetups = new Map<string, number>()

function loadSymbolCooldownMap(): Record<string, number> {
  try {
    const raw = safeStorage.getItem(SYMBOL_COOLDOWN_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function recordSymbolCloseCooldown(symbolId: string, closedAtTs = Date.now()): void {
  const cleanSym = (symbolId || '').toUpperCase()
  if (!cleanSym) return
  inMemorySymbolCooldowns.set(cleanSym, closedAtTs)
  try {
    const map = loadSymbolCooldownMap()
    map[cleanSym] = Math.max(map[cleanSym] || 0, closedAtTs)
    safeStorage.setItem(SYMBOL_COOLDOWN_STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

export function getSymbolLastClosedTs(symbolId: string, existingRecords: ImmutableTradeRecord[] = []): number {
  const cleanSym = (symbolId || '').toUpperCase()
  let latest = inMemorySymbolCooldowns.get(cleanSym) || 0
  try {
    const map = loadSymbolCooldownMap()
    if (map[cleanSym] && map[cleanSym] > latest) {
      latest = map[cleanSym]
      inMemorySymbolCooldowns.set(cleanSym, latest)
    }
  } catch {}

  for (const r of existingRecords) {
    if (r.symbolId === cleanSym && isTerminalStage(r.stage)) {
      const closeTs = Number(r.statusTs || r.createdTs || 0)
      if (closeTs > latest && closeTs <= Date.now() + 60_000) {
        latest = closeTs
      }
    }
  }
  return latest
}

export function isSymbolInPostCloseCooldown(
  symbolId: string,
  existingRecords: ImmutableTradeRecord[] = [],
  now = Date.now()
): { inCooldown: boolean; remainingMs: number } {
  const lastCloseTs = getSymbolLastClosedTs(symbolId, existingRecords)
  if (!lastCloseTs || lastCloseTs <= 0) {
    return { inCooldown: false, remainingMs: 0 }
  }
  const elapsed = now - lastCloseTs
  if (elapsed >= 0 && elapsed < SYMBOL_POST_CLOSE_COOLDOWN_MS) {
    return {
      inCooldown: true,
      remainingMs: SYMBOL_POST_CLOSE_COOLDOWN_MS - elapsed,
    }
  }
  return { inCooldown: false, remainingMs: 0 }
}

/**
 * Generates a deterministic setupId so the same setup level/direction is never duplicated
 */
export function computeDeterministicSetupId(
  symbolId: string,
  tf: string,
  direction: 'LONG' | 'SHORT',
  entry: number,
  stop: number
): string {
  const cleanSym = (symbolId || 'XAUUSD').toUpperCase()
  const cleanTf = (tf || '15m').toLowerCase()
  const safeEntry = Number(entry) || 0
  const safeStop = Number(stop) || 0

  // Price bucket quantum based on asset price scale
  const quantum =
    safeEntry >= 10000
      ? 25 // BTC, US30, NAS100
      : safeEntry >= 500
      ? 2.5 // XAUUSD, ETHUSD
      : safeEntry >= 50
      ? 0.1 // USDJPY
      : 0.001 // EURUSD, GBPUSD

  const entryBucket = Math.round(safeEntry / quantum)
  const stopBucket = Math.round(safeStop / quantum)
  return `setup_${cleanSym}_${cleanTf}_${direction}_e${entryBucket}_s${stopBucket}`
}

function isSetupIdRecentlyLogged(setupId: string, now = Date.now()): boolean {
  const memTs = inMemoryLoggedSetups.get(setupId)
  if (memTs && now - memTs < 2 * 3600 * 1000) return true
  try {
    const raw = safeStorage.getItem(LOGGED_SETUP_IDS_STORAGE_KEY)
    if (!raw) return false
    const map = JSON.parse(raw)
    if (map && typeof map[setupId] === 'number' && now - map[setupId] < 2 * 3600 * 1000) {
      inMemoryLoggedSetups.set(setupId, map[setupId])
      return true
    }
  } catch {}
  return false
}

export function markSetupIdLogged(setupId: string, now = Date.now()): void {
  if (!setupId) return
  inMemoryLoggedSetups.set(setupId, now)
  try {
    const raw = safeStorage.getItem(LOGGED_SETUP_IDS_STORAGE_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[setupId] = now
    // Prune entries older than 6 hours
    const cutoff = now - 6 * 3600 * 1000
    for (const k of Object.keys(map)) {
      if (map[k] < cutoff) delete map[k]
    }
    safeStorage.setItem(LOGGED_SETUP_IDS_STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

/**
 * Safely normalizes any `entryZone` value (tuple, array, `{ min, max }`, `{ low, high }`, number, or undefined/null)
 * into a guaranteed 2-element numeric tuple `[low, high]`.
 */
export function normalizeEntryZone(rawZone: any, fallbackEntry = 0): [number, number] {
  const safeEntry =
    typeof fallbackEntry === 'number' && isFinite(fallbackEntry)
      ? fallbackEntry
      : Number(fallbackEntry) || 0

  if (Array.isArray(rawZone) && rawZone.length > 0) {
    const a = Number(rawZone[0])
    const b = Number(rawZone.length > 1 ? rawZone[1] : rawZone[0])
    const low = isFinite(a) ? a : safeEntry
    const high = isFinite(b) ? b : low
    return [Math.min(low, high), Math.max(low, high)]
  }

  if (rawZone && typeof rawZone === 'object') {
    const a = Number(rawZone.min ?? rawZone.low ?? rawZone.start ?? rawZone[0] ?? safeEntry)
    const b = Number(rawZone.max ?? rawZone.high ?? rawZone.end ?? rawZone[1] ?? a)
    const low = isFinite(a) ? a : safeEntry
    const high = isFinite(b) ? b : low
    return [Math.min(low, high), Math.max(low, high)]
  }

  if (typeof rawZone === 'number' && isFinite(rawZone)) {
    return [rawZone, rawZone]
  }

  return [safeEntry, safeEntry]
}

/**
 * Loads processed event keys from persistent storage
 */
export function getProcessedNotificationEvents(): Set<string> {
  try {
    const raw = safeStorage.getItem(NOTIF_EVENT_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

/**
 * Marks a notification event as processed permanently so it never re-fires
 */
export function markNotificationEventProcessed(eventId: string) {
  try {
    const set = getProcessedNotificationEvents()
    set.add(eventId)
    const arr = Array.from(set).slice(-1000)
    safeStorage.setItem(NOTIF_EVENT_KEY, JSON.stringify(arr))
  } catch {}
}

/**
 * Checks if a notification event was already fired
 */
export function isNotificationEventProcessed(eventId: string): boolean {
  const set = getProcessedNotificationEvents()
  return set.has(eventId)
}

/**
 * Checks if a trade stage is terminal (completed)
 */
export function isTerminalStage(stage: TradeStage | string): boolean {
  return (
    stage === 'TP3' ||
    stage === 'BREAKEVEN' ||
    stage === 'CLOSED (BE)' ||
    stage === 'CLOSED' ||
    stage === 'STOPPED' ||
    stage === 'INVALIDATED' ||
    stage === 'EXPIRED' ||
    stage === 'CANCELLED'
  )
}

/**
 * Generates a stable unique signal ID for a setup based on symbol, timeframe, direction, model & swing
 */
export function generateSignalId(
  symbolId: string,
  tf: string,
  direction: 'LONG' | 'SHORT',
  model: string,
  entry: number,
  ts: number
): string {
  const windowMs =
    tf === '1m'
      ? 30 * 60 * 1000
      : tf === '5m'
      ? 2 * 60 * 60 * 1000
      : tf === '15m'
      ? 6 * 60 * 60 * 1000
      : tf === '1h'
      ? 24 * 60 * 60 * 1000
      : tf === '4h'
      ? 72 * 60 * 60 * 1000
      : tf === '1d'
      ? 7 * 24 * 60 * 60 * 1000
      : 14 * 24 * 60 * 60 * 1000

  const windowBucket = Math.floor(ts / windowMs)
  const cleanModel = (model || 'ICT').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
  const cleanEntry = Math.round(entry * 100) / 100
  return `${symbolId}_${tf}_${direction}_${cleanModel}_w${windowBucket}_e${cleanEntry}`
}

/**
 * Evaluates an incoming plan against the existing trade records.
 * Enforces:
 * 1. Strictly AT MOST ONE active open trade per symbol at any time.
 * 2. Minimum 15-minute cooldown per symbol after any trade closes.
 * 3. Deterministic setupId deduplication.
 * 4. Sanity check that livePrice hasn't already violated stop loss on creation.
 */
export function classifySetup(
  plan: any,
  symbolId: string,
  symbolLabel: string,
  tf: string,
  livePrice: number,
  existingRecords: ImmutableTradeRecord[],
  digits: number = 2,
  customTimestamp?: number
): SetupClassification {
  if (!plan || !plan.valid || plan.direction === 'STAND ASIDE') {
    return { type: 'NO_TRADE', reason: 'Engine plan invalid or standing aside' }
  }

  const direction: 'LONG' | 'SHORT' = plan.direction
  // Always use real wall-clock timestamp (never plan.createdTs which is the candle open time)
  const now = customTimestamp || Date.now()

  // 0. Sanity validation on entry/stop vs livePrice:
  // Never log a setup whose Stop Loss is already breached at the moment of creation
  const candidateEntry = Number(plan.entry) || 0
  const candidateStop = Number(plan.stop) || 0
  const candidateTp1 = Number(plan.tp1) || 0
  if (candidateEntry <= 0 || candidateStop <= 0 || Math.abs(candidateEntry - candidateStop) <= 0.00001) {
    return { type: 'NO_TRADE', reason: 'Invalid entry or stop loss distance' }
  }
  if (livePrice > 0) {
    const alreadyStopped = direction === 'LONG' ? livePrice <= candidateStop : livePrice >= candidateStop
    const alreadyPastTp1 = candidateTp1 > 0 && (direction === 'LONG' ? livePrice >= candidateTp1 : livePrice <= candidateTp1)
    if (alreadyStopped || alreadyPastTp1) {
      return { type: 'NO_TRADE', reason: 'Live price already past Stop Loss or TP1' }
    }
  }

  // 1. STRICT SINGLE ACTIVE OPEN TRADE PER SYMBOL GUARD:
  // If ANY non-terminal trade exists for this symbol across ANY timeframe, never open a second trade.
  const activeTradeForSymbol = existingRecords.find(
    (t) => t.symbolId === symbolId && !isTerminalStage(t.stage)
  )

  if (activeTradeForSymbol) {
    return { type: 'TRADE_ALREADY_ACTIVE', trade: activeTradeForSymbol }
  }

  // 2. STRICT 15-MINUTE COOLDOWN PER SYMBOL AFTER ANY TRADE CLOSES:
  const cooldownCheck = isSymbolInPostCloseCooldown(symbolId, existingRecords, now)
  if (cooldownCheck.inCooldown) {
    const minsLeft = Math.ceil(cooldownCheck.remainingMs / 60000)
    return {
      type: 'NO_TRADE',
      reason: `15-minute post-trade cooldown active for ${symbolId} (${minsLeft}m remaining)`,
    }
  }

  // 3. DETERMINISTIC setupId DEDUPLICATION:
  const setupId = computeDeterministicSetupId(symbolId, tf, direction, candidateEntry, candidateStop)
  const signalId = generateSignalId(symbolId, tf, direction, plan.model, candidateEntry, now)

  const duplicateInRecords = existingRecords.find(
    (t) =>
      t.symbolId === symbolId &&
      (t.setupId === setupId ||
        t.signalId === signalId ||
        (t.direction === direction &&
          Math.abs(t.entry - candidateEntry) / (t.entry || 1) < 0.0025 &&
          now - Math.max(t.statusTs || 0, t.createdTs || 0) < 60 * 60 * 1000))
  )
  if (duplicateInRecords || isSetupIdRecentlyLogged(setupId, now)) {
    return { type: 'NO_TRADE', reason: `Duplicate setup (${setupId}) already logged` }
  }

  // 4. Brand New Setup Creation
  markSetupIdLogged(setupId, now)
  const id = `trade_${setupId}_${now}`
  const confluencesList: string[] = Array.isArray(plan.confluences) ? plan.confluences : []
  const rawLogicSummary = plan.logic?.summary || plan.model || 'ICT Model'
  const syncedLogicSummary =
    confluencesList.length > 0
      ? String(rawLogicSummary).replace(
          /\b\d+\s+concepts?\s+aligned/i,
          `${confluencesList.length} concept${confluencesList.length === 1 ? '' : 's'} aligned`
        )
      : rawLogicSummary
  const initRisk = Math.abs(candidateEntry - candidateStop)
  const safeRr3 =
    plan.tp3 && candidateEntry && initRisk > 0.0001
      ? Number(Math.min(50, Math.max(0, Math.abs(plan.tp3 - candidateEntry) / initRisk)).toFixed(2))
      : 3

  // Determine if price is already inside the entry zone at creation
  const normalizedZone = normalizeEntryZone(plan.entryZone, candidateEntry)
  const minZone = Math.min(normalizedZone[0], normalizedZone[1])
  const maxZone = Math.max(normalizedZone[0], normalizedZone[1])
  const tolerance = initRisk * 0.1
  const startsInEntryZone =
    livePrice > 0 && livePrice >= minZone - tolerance && livePrice <= maxZone + tolerance

  const initialStage: TradeStage = startsInEntryZone ? 'RUNNING' : 'SETUP_FORMING'

  const newTrade: ImmutableTradeRecord = {
    id,
    signalId,
    setupId,
    symbolId,
    symbolLabel: symbolLabel || symbolId,
    tf,
    direction,
    model: plan.model || 'ICT Model',
    modelKind: plan.modelKind,
    entry: candidateEntry,
    entryZone: normalizedZone,
    stop: candidateStop,
    initialStopLoss: candidateStop,
    initialStop: candidateStop,
    beProtected: false,
    tp1: plan.tp1,
    tp2: plan.tp2,
    tp3: plan.tp3,
    rr: plan.rr || 2,
    rr1: plan.rr1 || 1,
    rr3: safeRr3,
    grade: plan.grade || 'A',
    confidence: plan.confidence || 80,
    confluences: confluencesList,
    logicSummary: syncedLogicSummary,
    createdTs: now,
    statusTs: now,
    entryConfirmedTs: startsInEntryZone ? now : undefined,
    lastLifecycleTickTs: now,
    slBreachTicks: 0,
    tpBreachTicks: 0,
    invalidationBreachTicks: 0,
    stage: initialStage,
    status: initialStage,
    risky: false,
    maxAdverseR: 0,
    resultR: undefined,
    events: startsInEntryZone
      ? [
          { ts: now, stage: 'SETUP_FORMING', price: livePrice, note: `Setup identified: ${plan.model}` },
          { ts: now, stage: 'RUNNING', price: livePrice, note: `Entry active at ${livePrice}` },
        ]
      : [{ ts: now, stage: 'SETUP_FORMING', price: livePrice, note: `Setup identified: ${plan.model}` }],
    priceAtCreate: livePrice,
    preWarningFired: startsInEntryZone,
    entryConfirmedFired: startsInEntryZone,
    digits,
  }

  return { type: 'NEW_SETUP', trade: newTrade }
}

export interface LifecycleEvaluationResult {
  records: ImmutableTradeRecord[]
  notificationsToSend: {
    eventId: string
    type:
      | 'PRE_TRADE_APPROACHING'
      | 'ENTRY_CONFIRMED'
      | 'MOVE_BREAKEVEN'
      | 'TP1_HIT'
      | 'TP2_HIT'
      | 'TP3_HIT'
      | 'STOP_HIT'
      | 'BREAKEVEN'
      | 'INVALIDATED'
      | 'EXPIRED'
    title: string
    body: string
    trade: ImmutableTradeRecord
  }[]
}

/**
 * Ticks active trades against current live price.
 * Requires price to hold past SL/TP on 2 consecutive valid ticks (spaced >= 1s apart)
 * AND at least 15 seconds after entry before marking SL_HIT / TP_HIT.
 */
export function updateTradeLifecycleOnTick(
  records: ImmutableTradeRecord[],
  symbolId: string,
  livePrice: number,
  now: number = Date.now()
): LifecycleEvaluationResult {
  if (!isFinite(livePrice) || livePrice <= 0) {
    return { records, notificationsToSend: [] }
  }

  const notificationsToSend: LifecycleEvaluationResult['notificationsToSend'] = []
  let hasChanges = false

  const updatedRecords = records.map((trade) => {
    if (trade.symbolId !== symbolId || isTerminalStage(trade.stage)) {
      return trade
    }

    // Outlier price spike protection: ignore any tick deviating > 5% from trade entry on intraday feeds
    const pctDeviationFromEntry = Math.abs(livePrice - trade.entry) / (trade.entry || 1)
    if (pctDeviationFromEntry > 0.08) {
      return trade
    }

    const t: ImmutableTradeRecord = {
      ...trade,
      entryZone: normalizeEntryZone(trade.entryZone, trade.entry),
      confluences: Array.isArray(trade.confluences) ? trade.confluences : [],
      events: Array.isArray(trade.events) ? trade.events : [],
    }

    // Distinct tick gate: ensure duplicate calls in the same second don't double-increment consecutive tick counters
    const lastTickTs = Number(t.lastLifecycleTickTs || t.statusTs || t.createdTs || 0)
    const isDistinctTick = now - lastTickTs >= MIN_DISTINCT_TICK_GAP_MS

    const isLong = t.direction === 'LONG'
    const originalStop = t.initialStopLoss ?? t.initialStop ?? t.stop
    const riskDist = Math.abs(t.entry - originalStop)
    if (t.stage === 'SETUP_FORMING' && riskDist <= 0.0001) return trade
    const safeRiskDist = riskDist > 0.0001 ? riskDist : 0

    const minEntryZone = Math.min(t.entryZone[0], t.entryZone[1])
    const maxEntryZone = Math.max(t.entryZone[0], t.entryZone[1])
    const tolerance = safeRiskDist > 0 ? safeRiskDist * 0.1 : Math.abs(t.entry) * 0.0005

    // Expiry check for un-filled setups (> 24 hours)
    if (t.stage === 'SETUP_FORMING' && now - t.createdTs > 24 * 3600 * 1000) {
      t.stage = 'EXPIRED'
      t.status = 'EXPIRED'
      t.statusTs = now
      t.resultR = 0
      t.events = [...t.events, { ts: now, stage: 'EXPIRED', price: livePrice, note: 'Setup expired without fill' }]
      recordSymbolCloseCooldown(symbolId, now)
      hasChanges = true
      return t
    }

    // -------------------------------------------------------------
    // 1. SETUP_FORMING STAGE:
    // Check for Pre-Trade Warning vs Invalidation vs Fill
    // -------------------------------------------------------------
    if (t.stage === 'SETUP_FORMING') {
      const elapsedSinceCreate = now - (t.createdTs || now)
      const invalidatedByStop = isLong ? livePrice <= t.stop : livePrice >= t.stop
      const invalidatedByTp = isLong ? livePrice >= t.tp1 : livePrice <= t.tp1

      if (invalidatedByStop || invalidatedByTp) {
        if (elapsedSinceCreate < MIN_HOLD_AFTER_ENTRY_MS) {
          return trade
        }
        if (!isDistinctTick) {
          return trade
        }
        const nextBreachCount = (t.invalidationBreachTicks || 0) + 1
        t.invalidationBreachTicks = nextBreachCount
        t.lastLifecycleTickTs = now
        hasChanges = true

        if (nextBreachCount < REQUIRED_CONSECUTIVE_BREACH_TICKS) {
          return t
        }

        t.stage = 'INVALIDATED'
        t.status = 'INVALIDATED'
        t.statusTs = now
        t.resultR = 0
        t.events = [
          ...t.events,
          {
            ts: now,
            stage: 'INVALIDATED',
            price: livePrice,
            note: invalidatedByStop ? 'Stop swept before fill (2 consecutive ticks)' : 'TP swept before fill (2 consecutive ticks)',
          },
        ]
        recordSymbolCloseCooldown(symbolId, now)
        return t
      } else if ((t.invalidationBreachTicks || 0) > 0) {
        t.invalidationBreachTicks = 0
        t.lastLifecycleTickTs = now
        hasChanges = true
      }

      // Check Fill: Price touches entry zone
      const isFilled =
        livePrice >= minEntryZone - tolerance &&
        livePrice <= maxEntryZone + tolerance

      if (isFilled) {
        t.stage = 'RUNNING'
        t.status = 'RUNNING'
        t.statusTs = now
        t.entryConfirmedTs = now
        t.lastLifecycleTickTs = now
        t.slBreachTicks = 0
        t.tpBreachTicks = 0
        t.entryConfirmedFired = true
        t.events = [
          ...t.events,
          { ts: now, stage: 'ENTRY_CONFIRMED', price: livePrice, note: `Entry filled at ${livePrice}` },
          { ts: now, stage: 'RUNNING', price: livePrice, note: `Trade active` },
        ]
        hasChanges = true

        const eventId = `${t.signalId}-ENTRY_CONFIRMED`
        if (!isNotificationEventProcessed(eventId)) {
          markNotificationEventProcessed(eventId)
          notificationsToSend.push({
            eventId,
            type: 'ENTRY_CONFIRMED',
            title: `SR TERMINAL — TRADE CONFIRMED`,
            body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nEntry: ${t.entry} | SL: ${t.stop}\nTP1: ${t.tp1} | TP2: ${t.tp2} | TP3: ${t.tp3}\nRR: 1:${t.rr} | Grade: ${t.grade}`,
            trade: t,
          })
        }
        return t
      }

      // Pre-Trade Warning Check
      const distance = Math.abs(livePrice - t.entry)
      const distancePct = (distance / (t.entry || 1)) * 100
      const isApproaching = distancePct <= 0.45 && !t.preWarningFired

      if (isApproaching) {
        t.preWarningFired = true
        hasChanges = true
        const eventId = `${t.signalId}-PRE_TRADE_APPROACHING`
        if (!isNotificationEventProcessed(eventId)) {
          markNotificationEventProcessed(eventId)
          notificationsToSend.push({
            eventId,
            type: 'PRE_TRADE_APPROACHING',
            title: `SR TERMINAL — Trade Setup Approaching`,
            body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nEntry: ${t.entry} | Current: ${livePrice}\nDistance: ${distance.toFixed(t.digits ?? 2)} (${distancePct.toFixed(2)}%)\nModel: ${t.model}\nStatus: ACTIVE SETUP`,
            trade: t,
          })
        }
      }

      return t
    }

    // -------------------------------------------------------------
    // 2. ACTIVE RUNNING TRADE MONITORING (RUNNING, TP1, TP2)
    // Require >= 15 seconds after entry AND 2 consecutive valid ticks
    // -------------------------------------------------------------
    if (t.stage === 'RUNNING' || t.stage === 'TP1' || t.stage === 'TP2') {
      const entryAnchorTs = Number(t.entryConfirmedTs || t.createdTs || now)
      const elapsedSinceEntryMs = now - entryAnchorTs

      const stopHit = isLong ? livePrice <= t.stop : livePrice >= t.stop
      const tp1Hit = isLong ? livePrice >= t.tp1 : livePrice <= t.tp1
      const tp2Hit = isLong ? livePrice >= t.tp2 : livePrice <= t.tp2
      const tp3Hit = isLong ? livePrice >= t.tp3 : livePrice <= t.tp3

      // A. STOP LOSS BREACH CHECK (Requires >= 15s since entry AND 2 consecutive valid ticks)
      if (stopHit) {
        if (elapsedSinceEntryMs < MIN_HOLD_AFTER_ENTRY_MS || !isDistinctTick) {
          return trade
        }

        const nextSlTicks = (t.slBreachTicks || 0) + 1
        t.slBreachTicks = nextSlTicks
        t.tpBreachTicks = 0
        t.lastLifecycleTickTs = now
        hasChanges = true

        if (nextSlTicks < REQUIRED_CONSECUTIVE_BREACH_TICKS) {
          return t
        }

        recordSymbolCloseCooldown(symbolId, now)

        const isBeProtected =
          Boolean(t.beProtected) ||
          Math.abs(t.stop - t.entry) <= Math.max(0.0001, Math.abs(t.entry) * 0.00005)

        if (t.stage === 'RUNNING' && !isBeProtected) {
          t.stage = 'STOPPED'
          t.status = 'STOPPED'
          t.statusTs = now
          t.resultR = -1.0
          t.events = [
            ...t.events,
            { ts: now, stage: 'STOPPED', price: livePrice, note: `Stopped at ${livePrice} (confirmed on 2 consecutive ticks)` },
          ]

          const eventId = `${t.signalId}-STOP_HIT`
          if (!isNotificationEventProcessed(eventId)) {
            markNotificationEventProcessed(eventId)
            notificationsToSend.push({
              eventId,
              type: 'STOP_HIT',
              title: `SR TERMINAL — Stop Loss Hit`,
              body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nClosed at Stop Loss (${livePrice}) · -1.0R`,
              trade: t,
            })
          }
          return t
        } else {
          const hitFromStage = t.stage
          t.stage = 'CLOSED (BE)'
          t.status = 'CLOSED (BE)'
          t.statusTs = now
          t.resultR = hitFromStage === 'TP2' ? 1.5 : hitFromStage === 'TP1' ? 0.8 : 0.0
          t.events = [
            ...t.events,
            {
              ts: now,
              stage: 'CLOSED (BE)',
              price: livePrice,
              note: `Break-Even stop filled at ${livePrice} (${t.resultR.toFixed(2)}R)`,
            },
          ]

          const eventId = `${t.signalId}-BREAKEVEN`
          if (!isNotificationEventProcessed(eventId)) {
            markNotificationEventProcessed(eventId)
            notificationsToSend.push({
              eventId,
              type: 'BREAKEVEN',
              title: `SR TERMINAL — Closed at Break-Even`,
              body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nClosed at Break-Even (${t.resultR >= 0 ? '+' : ''}${t.resultR.toFixed(2)}R).`,
              trade: t,
            })
          }
          return t
        }
      } else if ((t.slBreachTicks || 0) > 0) {
        // Price recovered inside Stop Loss before 2nd consecutive tick -> reset breach counter
        t.slBreachTicks = 0
        t.lastLifecycleTickTs = now
        hasChanges = true
      }

      // B. TAKE PROFIT BREACH CHECK (Requires >= 15s since entry AND 2 consecutive valid ticks)
      const relevantTpHit =
        tp3Hit ||
        (tp2Hit && (t.stage === 'TP1' || t.stage === 'RUNNING')) ||
        (tp1Hit && t.stage === 'RUNNING')

      if (relevantTpHit) {
        if (elapsedSinceEntryMs < MIN_HOLD_AFTER_ENTRY_MS || !isDistinctTick) {
          return hasChanges ? t : trade
        }

        const nextTpTicks = (t.tpBreachTicks || 0) + 1
        t.tpBreachTicks = nextTpTicks
        t.lastLifecycleTickTs = now
        hasChanges = true

        if (nextTpTicks < REQUIRED_CONSECUTIVE_BREACH_TICKS) {
          return t
        }

        // Reset counter once confirmed for this TP level
        t.tpBreachTicks = 0

        // TP3 Runner Hit (Full Target Achieved)
        if (tp3Hit) {
          t.stage = 'TP3'
          t.status = 'TP3'
          t.statusTs = now
          t.resultR = Number(Math.min(50, Math.max(-10, t.rr3 || t.rr || 3.0)).toFixed(2))
          t.events = [...t.events, { ts: now, stage: 'TP3', price: livePrice, note: `TP3 runner hit at ${livePrice}` }]
          recordSymbolCloseCooldown(symbolId, now)

          const eventId = `${t.signalId}-TP3_HIT`
          if (!isNotificationEventProcessed(eventId)) {
            markNotificationEventProcessed(eventId)
            notificationsToSend.push({
              eventId,
              type: 'TP3_HIT',
              title: `SR TERMINAL — TP3 RUNNER HIT!`,
              body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nFull target reached at ${t.tp3} · +${t.resultR.toFixed(2)}R Profit Locked!`,
              trade: t,
            })
          }
          return t
        }

        // TP2 Hit
        if (tp2Hit && (t.stage === 'TP1' || t.stage === 'RUNNING')) {
          t.initialStopLoss = t.initialStopLoss ?? t.initialStop ?? t.stop
          t.initialStop = t.initialStopLoss
          t.stage = 'TP2'
          t.status = 'TP2'
          t.statusTs = now
          t.stop = t.tp1
          t.events = [
            ...t.events,
            { ts: now, stage: 'TP2', price: livePrice, note: `TP2 hit at ${livePrice}. Trailed stop to TP1 (${t.tp1})` },
          ]

          const eventId = `${t.signalId}-TP2_HIT`
          if (!isNotificationEventProcessed(eventId)) {
            markNotificationEventProcessed(eventId)
            notificationsToSend.push({
              eventId,
              type: 'TP2_HIT',
              title: `SR TERMINAL — TP2 HIT (+2.0R)`,
              body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nSecond partial secured at ${t.tp2}. Letting final runner ride to TP3!`,
              trade: t,
            })
          }
          return t
        }

        // TP1 Hit
        if (tp1Hit && t.stage === 'RUNNING') {
          t.initialStopLoss = t.initialStopLoss ?? t.initialStop ?? t.stop
          t.initialStop = t.initialStopLoss
          t.beProtected = true
          t.stage = 'TP1'
          t.status = 'TP1'
          t.statusTs = now
          t.stop = t.entry
          t.events = [
            ...t.events,
            { ts: now, stage: 'TP1', price: livePrice, note: `TP1 hit at ${livePrice}. Stop moved to breakeven.` },
          ]

          const eventId = `${t.signalId}-TP1_HIT`
          if (!isNotificationEventProcessed(eventId)) {
            markNotificationEventProcessed(eventId)
            notificationsToSend.push({
              eventId,
              type: 'TP1_HIT',
              title: `SR TERMINAL — TP1 HIT (+${t.rr1 || 1.0}R)`,
              body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nFirst partial banked at ${t.tp1}! Stop moved to Breakeven (${t.entry}).`,
              trade: t,
            })
          }
          return t
        }
      } else if ((t.tpBreachTicks || 0) > 0) {
        t.tpBreachTicks = 0
        t.lastLifecycleTickTs = now
        hasChanges = true
      }

      // +1R Reached -> Move Stop Loss to Break-Even (BE) Lifecycle Trigger (requires >= 15s after entry)
      if (elapsedSinceEntryMs >= MIN_HOLD_AFTER_ENTRY_MS && t.stage === 'RUNNING' && !t.beProtected && safeRiskDist > 0.0001) {
        const favorablePoints = isLong ? livePrice - t.entry : t.entry - livePrice
        const currentFavorableR = favorablePoints / safeRiskDist
        if (isFinite(currentFavorableR) && currentFavorableR >= 1.0) {
          hasChanges = true
          t.initialStopLoss = t.initialStopLoss ?? t.initialStop ?? t.stop
          t.initialStop = t.initialStopLoss
          t.beProtected = true
          t.stop = t.entry
          t.events = [
            ...t.events,
            {
              ts: now,
              stage: 'RUNNING',
              price: livePrice,
              note: `+1.0R reached at ${livePrice}. Stop Loss moved to Break-Even (${t.entry}).`,
            },
          ]
          const beEventId = `${t.signalId}-MOVE_BREAKEVEN`
          if (!isNotificationEventProcessed(beEventId)) {
            markNotificationEventProcessed(beEventId)
            notificationsToSend.push({
              eventId: beEventId,
              type: 'MOVE_BREAKEVEN',
              title: `SR TERMINAL — MOVE SL TO BREAK-EVEN (+1.0R)`,
              body: `${t.symbolLabel} ${t.tf} · ${t.direction}\nPrice reached +1.0R (${livePrice})! Stop Loss automatically moved to Break-Even (${t.entry}). Risk is now 0.00R.`,
              trade: t,
            })
          }
        }
      }

      // Update adverse drawdown strictly using safeRiskDist (initialStopLoss)
      if (safeRiskDist > 0.0001) {
        const adversePoints = isLong ? t.entry - livePrice : livePrice - t.entry
        const rawAdverseR = adversePoints / safeRiskDist
        if (isFinite(rawAdverseR)) {
          const clampedAdv = Math.min(10, Math.max(t.maxAdverseR || 0, rawAdverseR))
          const roundedAdv = Number(clampedAdv.toFixed(2))
          if (roundedAdv !== t.maxAdverseR) {
            t.maxAdverseR = roundedAdv
            hasChanges = true
          }
        }
      }
    }

    return t
  })

  return {
    records: hasChanges ? updatedRecords : records,
    notificationsToSend,
  }
}

/**
 * Revalidates any pending SETUP_FORMING trades when market conditions change
 * (e.g., high-impact news blackout triggers, or market structure/bias flips strongly against the setup).
 */
export function revalidateFormingSetups(
  records: ImmutableTradeRecord[],
  symbolId: string,
  tf: string,
  analysis: any,
  now: number = Date.now()
): { records: ImmutableTradeRecord[]; changed: boolean } {
  if (!analysis || !Array.isArray(records) || records.length === 0) {
    return { records, changed: false }
  }

  let changed = false
  const next = records.map((t) => {
    if (t.symbolId !== symbolId || t.tf !== tf || t.stage !== 'SETUP_FORMING') {
      return t
    }
    // Require setup to be at least 30 seconds old before structure-flip invalidation
    if (now - (t.createdTs || now) < 30_000) {
      return t
    }

    const isLong = t.direction === 'LONG'
    const score = typeof analysis.score === 'number' ? analysis.score : 0
    const blackout = Boolean(analysis.plan?.logic?.blackout)
    const oppositeStructureFlip =
      (isLong && score <= -35) ||
      (!isLong && score >= 35) ||
      (analysis.plan?.valid &&
        analysis.plan?.direction &&
        analysis.plan.direction !== 'STAND ASIDE' &&
        analysis.plan.direction !== t.direction)

    if (blackout || oppositeStructureFlip) {
      changed = true
      recordSymbolCloseCooldown(symbolId, now)
      const reason = blackout
        ? 'Invalidated due to high-impact news blackout window'
        : `Invalidated: market structure flipped (${analysis.bias || score})`
      return {
        ...t,
        stage: 'INVALIDATED' as TradeStage,
        status: 'INVALIDATED' as TradeStage,
        statusTs: now,
        resultR: 0,
        events: [...(t.events || []), { ts: now, stage: 'INVALIDATED' as TradeStage, price: analysis.price, note: reason }],
      }
    }
    return t
  })

  return { records: changed ? next : records, changed }
}
