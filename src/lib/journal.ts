// @ts-nocheck
import { safeStorage } from "./storage";
import {
  classifySetup,
  updateTradeLifecycleOnTick,
  revalidateFormingSetups,
  isTerminalStage,
  normalizeEntryZone,
  computeDeterministicSetupId,
  recordSymbolCloseCooldown,
  isSymbolInPostCloseCooldown,
  type ImmutableTradeRecord,
  type TradeStage,
} from "./tradeLifecycleEngine";

export { normalizeEntryZone, computeDeterministicSetupId, recordSymbolCloseCooldown, isSymbolInPostCloseCooldown };

const lg = "sr.journal.v1",
  ag = 500;

/**
 * Hard-replaces "SR CONCEPT", "SR CONCEPT REVERSAL", "EMA STACK", etc.
 * in all strategy titles, models, and summaries.
 */
export function sanitizeIctString(text?: string, isConfluence = false): string {
  if (!text) return isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL";
  return String(text)
    .replace(/SR CONCEPT PLUS ONE/gi, isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL")
    .replace(/SR CONCEPT \+1/gi, isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL")
    .replace(/SR CONCEPT REVERSAL/gi, isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL")
    .replace(/SR CONCEPT/gi, isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL")
    .replace(/TURTLE SOUP PLUS ONE/gi, isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL")
    .replace(/TURTLE SOUP REVERSAL/gi, isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL")
    .replace(/TURTLE SOUP/gi, isConfluence ? "ORDER BLOCK" : "ICT MSS REVERSAL")
    .replace(/EMA STACK/gi, "SMT DIVERGENCE")
    .replace(/EMA20/gi, "PD ARRAY")
    .replace(/ADX TREND PULLBACK/gi, "ICT MSS REVERSAL");
}

export function sanitizeConfluenceTags(tags?: string[]): string[] {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  const mapped = tags
    .map((raw) => {
      const t = String(raw || "").trim().toUpperCase();
      if (!t) return null;
      if (t.includes("EMA STACK")) return "SMT DIVERGENCE";
      if (t.includes("SR CONCEPT") || t.includes("TURTLE")) return "ORDER BLOCK";
      if (t === "OB" || t.includes("ORDER BLOCK") || t.includes("BREAKER")) return "ORDER BLOCK";
      if (t === "SWEEP" || t.includes("SSL SWEEP") || t.includes("BSL SWEEP") || t.includes("LIQUIDITY SWEEP")) {
        return "LIQUIDITY SWEEP";
      }
      if (t === "EMA20" || t === "PD-CORRECT" || t === "HTF ALIGN" || t.includes("PD ARRAY")) {
        return "PD ARRAY";
      }
      if (t === "FVG" || t === "IFVG" || t === "BPR" || t.includes("VOLUME IMBALANCE") || t.includes("FVG / IFVG")) {
        return "FVG / IFVG";
      }
      if (t === "CHoCH" || t === "CHOCH" || t === "BOS" || t === "DISPLACEMENT" || t === "MSS") {
        return "MSS";
      }
      if (t.includes("ITL") || t.includes("ITH")) {
        return "ITL/ITH RAID";
      }
      if (t === "CISD") return "CISD";
      if (t === "OTE") return "OTE";
      if (t === "KILLZONE") return "KILLZONE";
      if (t === "SMT DIVERGENCE") return "SMT DIVERGENCE";
      return sanitizeIctString(t, true);
    })
    .filter(Boolean) as string[];
  return [...new Set(mapped)];
}

/**
 * Formats Trade Reason so it ALWAYS dynamically displays the exact count of confluences:
 * "${direction} — ${confluences.length} concepts aligned, 0 opposing"
 */
export function formatTradeReason(r: any): string {
  if (!r) return "—";
  const confluences = sanitizeConfluenceTags(r.confluences);
  const count = confluences.length;
  const dir = r.direction === "SHORT" ? "SHORT" : "LONG";
  const rawSummary = sanitizeIctString(r.logicSummary || r.model || "ICT MSS REVERSAL", false);

  if (count > 0) {
    if (/\b\d+\s+concepts?\s+aligned/i.test(rawSummary)) {
      return rawSummary.replace(
        /\b\d+\s+concepts?\s+aligned/gi,
        `${count} concept${count === 1 ? "" : "s"} aligned`
      );
    }
    return `${dir} — ${count} concept${count === 1 ? "" : "s"} aligned, 0 opposing (BALANCED mode)`;
  }
  return rawSummary;
}

/**
 * Strict R-Multiple Calculation using ONLY initialSl / initialStopLoss.
 */
export function calculateSafeRMultiple(
  entryPrice: number,
  exitOrCurrentPrice: number,
  initialSl: number,
  direction: "LONG" | "SHORT"
): number {
  if (
    typeof entryPrice !== "number" ||
    typeof exitOrCurrentPrice !== "number" ||
    typeof initialSl !== "number" ||
    !isFinite(entryPrice) ||
    !isFinite(exitOrCurrentPrice) ||
    !isFinite(initialSl)
  ) {
    return 0;
  }
  const initialRisk = Math.abs(entryPrice - initialSl);
  if (!isFinite(initialRisk) || initialRisk < 0.01) {
    return 0;
  }
  const isLong = direction === "LONG";
  const rawR = (isLong ? exitOrCurrentPrice - entryPrice : entryPrice - exitOrCurrentPrice) / initialRisk;
  if (!isFinite(rawR) || Math.abs(rawR) > 50) {
    return 0;
  }
  const clamped = Math.max(-10, Math.min(50, rawR));
  const rounded = Number(clamped.toFixed(2));
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function formatRMultiple(resultR?: number): string {
  if (resultR === undefined || resultR === null || !isFinite(resultR) || Math.abs(resultR) > 50) {
    return "0.00R";
  }
  const clamped = Math.max(-10, Math.min(50, resultR));
  if (Math.abs(clamped) < 0.005) {
    return "0.00R";
  }
  return `${clamped > 0 ? "+" : ""}${clamped.toFixed(2)}R`;
}

/**
 * Mandatory Data Sanitizer Function — executed on EVERY trade object on load, save, AND render.
 * Enforces:
 * 1. If status === 'CANCELLED' OR Math.abs(entry - sl) < 0.01 OR Math.abs(rMultiple) > 50 OR !isFinite(rMultiple):
 *    Force sets resultR = 0 and rMultiple = 0.
 * 2. Hard-replaces "SR CONCEPT" / "SR CONCEPT REVERSAL" -> "ICT MSS REVERSAL" / "ORDER BLOCK"
 *    and "EMA STACK" -> "SMT DIVERGENCE".
 * 3. Dynamically sets Trade Reason confluence count to `${confluences.length} concepts aligned, 0 opposing`.
 */
export function sanitizeTradeRecord(rec: any): ImmutableTradeRecord {
  if (!rec || typeof rec !== "object") return rec;
  const entry = Number(rec.entry) || 0;
  const currentSl = Number(rec.stop ?? rec.sl) || 0;

  // Preserve initialSl if valid and distinct from entry
  const rawInitial = Number(rec.initialSl ?? rec.initialStopLoss ?? rec.initialStop ?? currentSl) || currentSl;
  const initialSl = Math.abs(entry - rawInitial) >= 0.01 ? rawInitial : currentSl;

  const confluences = sanitizeConfluenceTags(rec.confluences);
  const model = sanitizeIctString(rec.model, false);

  let stage: TradeStage = rec.stage || rec.status || "SETUP_FORMING";
  let status: TradeStage = rec.status || stage;

  const isEntryEqualSl = Math.abs(entry - currentSl) < 0.01;
  let rawR = Number(rec.resultR ?? rec.rMultiple ?? 0);

  // Strict override per Rule 1:
  // If status === 'CANCELLED' OR Math.abs(entry - sl) < 0.01 OR Math.abs(rMultiple) > 50 OR !isFinite(rMultiple)
  // -> Force set resultR = 0 and rMultiple = 0
  if (
    status === "CANCELLED" ||
    stage === "CANCELLED" ||
    isEntryEqualSl ||
    !isFinite(rawR) ||
    Math.abs(rawR) > 50
  ) {
    rawR = 0;
  } else {
    rawR = Number(Math.max(-10, Math.min(50, rawR)).toFixed(2));
    if (Object.is(rawR, -0)) rawR = 0;
  }

  // If trade was active and closed at Break-Even (Entry === SL), status is CLOSED (BE) with 0.00R
  if ((status === "CANCELLED" || stage === "CANCELLED") && isEntryEqualSl && Boolean(rec.beProtected)) {
    stage = "CLOSED (BE)";
    status = "CLOSED (BE)";
    rawR = 0;
  } else if (stage === "BREAKEVEN" || status === "BREAKEVEN") {
    stage = "CLOSED (BE)";
    status = "CLOSED (BE)";
    rawR = 0;
  }

  const entryZone = normalizeEntryZone(rec.entryZone, entry);
  const events = Array.isArray(rec.events) && rec.events.length > 0
    ? rec.events
    : [
        {
          ts: Number(rec.createdTs || Date.now()),
          stage,
          price: entry,
          note: `Setup logged: ${model}`,
        },
      ];

  const symbolId = String(rec.symbolId || "XAUUSD").toUpperCase();
  const tf = String(rec.tf || "15m").toLowerCase();
  const direction: "LONG" | "SHORT" = rec.direction === "SHORT" ? "SHORT" : "LONG";
  const setupId =
    rec.setupId ||
    computeDeterministicSetupId(symbolId, tf, direction, entry, initialSl);

  const sanitized: any = {
    ...rec,
    symbolId,
    tf,
    direction,
    setupId,
    entry,
    entryZone,
    model,
    confluences,
    events,
    stop: currentSl,
    sl: currentSl,
    currentStopLoss: currentSl,
    initialSl,
    initialStopLoss: initialSl,
    initialStop: initialSl,
    stage,
    status,
    resultR: rawR,
    rMultiple: rawR,
  };
  sanitized.logicSummary = formatTradeReason(sanitized);
  return sanitized as ImmutableTradeRecord;
}

/**
 * Deduplicates trade records by id, signalId, and setupId (within 2 hours)
 * and strictly enforces at most ONE active open trade (!isTerminalStage) per symbol.
 */
export function deduplicateJournalRecords(records: any[]): ImmutableTradeRecord[] {
  if (!Array.isArray(records) || records.length === 0) return [];
  const sanitized = records.map(sanitizeTradeRecord);
  // Sort newest first by createdTs
  sanitized.sort((a, b) => (b.createdTs || 0) - (a.createdTs || 0));

  const seenIds = new Set<string>();
  const seenSignals = new Set<string>();
  const seenSetupTimestamps = new Map<string, number>();
  const activeSymbolSet = new Set<string>();
  const out: ImmutableTradeRecord[] = [];

  for (const r of sanitized) {
    if (!r || !r.id) continue;
    if (seenIds.has(r.id)) continue;
    if (r.signalId && seenSignals.has(r.signalId)) continue;

    const sKey = r.setupId || computeDeterministicSetupId(r.symbolId, r.tf, r.direction, r.entry, r.initialStopLoss || r.stop);
    const prevSetupTs = seenSetupTimestamps.get(sKey);
    if (prevSetupTs !== undefined && Math.abs((r.createdTs || 0) - prevSetupTs) < 2 * 3600 * 1000) {
      continue;
    }

    const isOpen = !isTerminalStage(r.stage || r.status);
    if (isOpen) {
      // Strictly allow at most ONE active open trade per symbol
      if (activeSymbolSet.has(r.symbolId)) {
        continue;
      }
      activeSymbolSet.add(r.symbolId);
    }

    seenIds.add(r.id);
    if (r.signalId) seenSignals.add(r.signalId);
    seenSetupTimestamps.set(sKey, r.createdTs || 0);
    out.push(r);
  }

  return out.slice(0, ag);
}

/**
 * One-time & continuous migration that cleans localStorage ('sr.journal.v1')
 */
export function migrateAndCleanJournalStorage(): ImmutableTradeRecord[] {
  try {
    const raw = safeStorage.getItem(lg);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = deduplicateJournalRecords(parsed);
    safeStorage.setItem(lg, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return [];
  }
}

function Yv(): ImmutableTradeRecord[] {
  return migrateAndCleanJournalStorage();
}

function p2(r: ImmutableTradeRecord[]) {
  try {
    const sanitized = deduplicateJournalRecords(Array.isArray(r) ? r : []);
    safeStorage.setItem(lg, JSON.stringify(sanitized));
  } catch {}
}

function Ki(r: any): boolean {
  if (!r) return true;
  return isTerminalStage(r.stage || r.status);
}

function g2(plan: any, symbolId: string, symbolLabel: string, tf: string, livePrice: number, records: ImmutableTradeRecord[]) {
  const cleanRecords = Array.isArray(records) ? records.map(sanitizeTradeRecord) : [];
  const classification = classifySetup(plan, symbolId, symbolLabel, tf, livePrice, cleanRecords);
  if (classification.type === "NEW_SETUP") {
    const cleanTrade = sanitizeTradeRecord(classification.trade);
    return {
      records: [cleanTrade, ...cleanRecords].slice(0, ag),
      record: cleanTrade,
      classificationType: "NEW_SETUP",
    };
  } else if (classification.type === "UPDATE_EXISTING") {
    const cleanTrade = sanitizeTradeRecord(classification.trade);
    const updated = cleanRecords.map((rec) =>
      rec.id === cleanTrade.id ? cleanTrade : rec
    );
    return {
      records: updated,
      record: cleanTrade,
      classificationType: "UPDATE_EXISTING",
    };
  }
  return null;
}

function y2(records: ImmutableTradeRecord[], symbolId: string, livePrice: number, now = Date.now()) {
  const cleanRecords = Array.isArray(records) ? records.map(sanitizeTradeRecord) : [];
  const result = updateTradeLifecycleOnTick(cleanRecords, symbolId, livePrice, now);
  const fired = result.notificationsToSend.map((n) => {
    const cleanRec = sanitizeTradeRecord(n.trade);
    return {
      rec: cleanRec,
      status: n.type,
      title: sanitizeIctString(n.title, false),
      body: sanitizeIctString(n.body, false),
      resultR: cleanRec.resultR,
    };
  });
  return {
    records: result.records.map(sanitizeTradeRecord),
    fired,
    notificationsToSend: result.notificationsToSend,
  };
}

export function assessTradeRisk(r: any, currentPrice?: number) {
  if (!r) return { level: "LOW", score: 0, badgeLabel: "SAFE", reasons: [], recommendedAction: "Plan on track", actionUrgent: false, adverseR: 0, currentR: 0 };
  const clean = sanitizeTradeRecord(r);
  const isClosedTrade = Ki(clean);
  const isLong = clean.direction === "LONG";
  const initialSl = Number(clean.initialSl ?? clean.initialStopLoss ?? clean.stop) || 0;
  const initialRisk = Math.abs(clean.entry - initialSl);

  let adverseR = typeof clean.maxAdverseR === "number" && isFinite(clean.maxAdverseR) ? Math.min(10, Math.max(0, clean.maxAdverseR)) : 0;
  let currentR = 0;
  if (currentPrice && initialRisk >= 0.01 && (clean.stage === "RUNNING" || clean.stage === "TP1" || clean.stage === "TP2")) {
    const liveAdv = isLong ? (clean.entry - currentPrice) / initialRisk : (currentPrice - clean.entry) / initialRisk;
    currentR = calculateSafeRMultiple(clean.entry, currentPrice, initialSl, clean.direction);
    if (isFinite(liveAdv) && liveAdv > adverseR) {
      adverseR = Number(Math.min(10, Math.max(0, liveAdv)).toFixed(2));
    }
  }

  const reasons = [];
  let score = 15;

  if (clean.grade === "C") {
    score += 25;
    reasons.push("Grade C Setup (Low Confidence model)");
  } else if (clean.grade === "B") {
    score += 10;
  }

  if (clean.rr && clean.rr < 1.7) {
    score += 15;
    reasons.push(`Low R:R Ratio (${Number(clean.rr).toFixed(1)}R)`);
  }

  if (adverseR >= 0.65) {
    score += 55;
    reasons.push(`High Drawdown: ${Math.round(adverseR * 100)}% of initial risk (-${adverseR.toFixed(2)}R)`);
  } else if (adverseR >= 0.4) {
    score += 30;
    reasons.push(`Moderate Drawdown: ${Math.round(adverseR * 100)}% toward SL (-${adverseR.toFixed(2)}R)`);
  }

  const ageHours = (Date.now() - (clean.createdTs || Date.now())) / 36e5;
  if (!isClosedTrade && clean.stage === "RUNNING" && ageHours > 2.5 && Math.abs(currentR) < 0.25) {
    score += 15;
    reasons.push("Trade stagnant in entry zone (> 2.5 hours)");
  }

  let level = "LOW";
  let badgeLabel = "NORMAL / SAFE";
  let recommendedAction = "Trade healthy hai. Rules ke mutabiq TP target ka wait karein.";
  let actionUrgent = false;

  const isBeLocked =
    clean.stage === "BREAKEVEN" ||
    clean.stage === "CLOSED (BE)" ||
    clean.beProtected ||
    Math.abs((clean.entry || 0) - (clean.stop || 0)) < 0.01;

  if (isBeLocked) {
    level = "PROTECTED";
    badgeLabel = "BE PROTECTED 🛡️";
    recommendedAction = "SL Entry par locked hai (Zero loss). Free runner ride karein.";
  } else if (score >= 60 || adverseR >= 0.65) {
    level = "HIGH";
    badgeLabel = "HIGH RISK ⚠️";
    actionUrgent = true;
    recommendedAction = "⚠️ Trade kafi risky zone me hai: Stop Loss ko turant BREAK-EVEN (Entry) par shift karein ya rejection sign dekhein!";
  } else if (score >= 35 || adverseR >= 0.4) {
    level = "MODERATE";
    badgeLabel = "MODERATE RISK ⚡";
    recommendedAction = "⚡ Price opposite move kar raha hai: 1-2 candle wick rejection dekhein, momentum slow ho toh BE shift karein.";
  }

  return {
    level,
    score: Math.min(100, score),
    badgeLabel,
    reasons: reasons.length ? reasons : ["Trade standard boundaries ke andar move kar raha hai"],
    recommendedAction,
    actionUrgent,
    adverseR,
    currentR,
  };
}

export function moveToBreakEven(r: any, currentPrice?: number) {
  const savedInitialSl = r.initialSl || r.initialStopLoss || r.initialStop || r.stop || r.sl;
  const activeStage = r.stage === "SETUP_FORMING" ? "RUNNING" : (r.stage || "RUNNING");
  return sanitizeTradeRecord({
    ...r,
    initialSl: savedInitialSl,
    initialStopLoss: savedInitialSl,
    initialStop: savedInitialSl,
    stop: r.entry,
    sl: r.entry,
    beProtected: true,
    resultR: 0,
    rMultiple: 0,
    stage: activeStage,
    status: activeStage,
    statusTs: Date.now(),
    events: [
      ...(r.events || []),
      { ts: Date.now(), stage: activeStage, price: currentPrice, note: `SL shifted to Break-Even (${r.entry})` },
    ],
  });
}

function b2(r: any, e: number) {
  const savedInitialSl = r.initialSl || r.initialStopLoss || r.initialStop || r.stop || r.sl;
  const wasNeverTriggered = r.stage === "SETUP_FORMING" || r.status === "PLANNED";
  if (r?.symbolId) {
    recordSymbolCloseCooldown(r.symbolId, Date.now());
  }

  if (wasNeverTriggered) {
    return sanitizeTradeRecord({
      ...r,
      initialSl: savedInitialSl,
      initialStopLoss: savedInitialSl,
      initialStop: savedInitialSl,
      stage: "CANCELLED",
      status: "CANCELLED",
      statusTs: Date.now(),
      resultR: 0,
      rMultiple: 0,
      events: [
        ...(r.events || []),
        { ts: Date.now(), stage: "CANCELLED", price: e, note: "Pending setup cancelled before fill" },
      ],
    });
  }

  const isAtBreakEven =
    Boolean(r.beProtected) ||
    Math.abs((r.entry || 0) - (r.stop || 0)) < 0.01 ||
    Math.abs((e || 0) - (r.entry || 0)) < 0.01 ||
    Math.abs((r.entry || 0) - (savedInitialSl || 0)) < 0.01;

  if (isAtBreakEven) {
    return sanitizeTradeRecord({
      ...r,
      initialSl: savedInitialSl,
      initialStopLoss: savedInitialSl,
      initialStop: savedInitialSl,
      stage: "CLOSED (BE)",
      status: "CLOSED (BE)",
      statusTs: Date.now(),
      resultR: 0,
      rMultiple: 0,
      events: [
        ...(r.events || []),
        { ts: Date.now(), stage: "CLOSED (BE)", price: r.entry, note: `Closed at Break-Even (${r.entry})` },
      ],
    });
  }

  const calculatedR = calculateSafeRMultiple(r.entry, e, savedInitialSl, r.direction);
  const finalStage: TradeStage = Math.abs(calculatedR) <= 0.02 ? "CLOSED (BE)" : "CLOSED";
  const finalR = finalStage === "CLOSED (BE)" ? 0 : calculatedR;

  return sanitizeTradeRecord({
    ...r,
    initialSl: savedInitialSl,
    initialStopLoss: savedInitialSl,
    initialStop: savedInitialSl,
    stage: finalStage,
    status: finalStage,
    statusTs: Date.now(),
    resultR: finalR,
    rMultiple: finalR,
    events: [
      ...(r.events || []),
      { ts: Date.now(), stage: finalStage, price: e, note: `Manual close at ${e} (${formatRMultiple(finalR)})` },
    ],
  });
}

function x2(r: any[]) {
  const cleanList = Array.isArray(r) ? r.map(sanitizeTradeRecord) : [];
  const e = cleanList.filter(Ki),
    executed = e.filter((d) => d.status !== "CANCELLED" && d.stage !== "CANCELLED" && d.status !== "INVALIDATED" && d.status !== "EXPIRED"),
    s = executed.filter((d) => (d.resultR ?? 0) > 0.05).length,
    l = executed.filter((d) => (d.resultR ?? 0) < -0.05).length,
    u = executed.length - s - l,
    c = executed.reduce((d, f) => {
      const val = typeof f.resultR === "number" && isFinite(f.resultR) && Math.abs(f.resultR) <= 50 ? f.resultR : 0;
      return d + val;
    }, 0);
  const safeTotalR = Number(c.toFixed(2));
  const safeExpectancy = executed.length ? Number((c / executed.length).toFixed(2)) : 0;
  return {
    total: cleanList.length,
    open: cleanList.length - e.length,
    closed: e.length,
    wins: s,
    losses: l,
    breakeven: u,
    winRate: executed.length ? Math.round((s / executed.length) * 100) : 0,
    totalR: Object.is(safeTotalR, -0) ? 0 : safeTotalR,
    expectancyR: Object.is(safeExpectancy, -0) ? 0 : safeExpectancy,
  };
}

export const isClosed = Ki;
export const loadJournal = Yv;
export const saveJournal = p2;
export const createRecord = g2;
export const updateRecordsOnTick = y2;
export const revalidateSetups = revalidateFormingSetups;
export const manualClose = b2;
export const computeStats = x2;
export type JournalRecord = ImmutableTradeRecord;
export type JournalStats = any;
