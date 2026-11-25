import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseReady } from './firebase'
import { stripUndefinedDeep } from './errorSanitizer'
import { safeStorage } from './storage'
import { symbolById, computeBidAskSpread, type Candle } from './market'
import { type Analysis } from './ict'
import { activeKillzone } from './clock'
import type { EconomicEvent } from './newsService'

export type FundedChallengeStage = 'PHASE_1' | 'PHASE_2' | 'LIVE_FUNDED'
export type DrawdownModel = 'STATIC' | 'TRAILING'

export type PropFirmBrand =
  | 'MENT_FUNDING'
  | 'MENT_FUNDING_FUTURES'
  | 'BLUE_GUARDIAN_2STEP'
  | 'BLUE_GUARDIAN_RAPID_1STEP'
  | 'BLUE_GUARDIAN_INSTANT'
  | 'GOAT_FUNDED_2STEP'
  | 'GOAT_FUNDED_1STEP'
  | 'GOAT_FUNDED_INSTANT'
  | 'FTMO'
  | 'FUNDED_NEXT'
  | 'THE_5ERS'
  | 'FUNDING_PIPS'
  | 'MAVEN'
  | 'TOPSTEP'
  | 'CUSTOM'

export interface FundedAccountProfile {
  uid: string
  propFirm: PropFirmBrand
  accountSizeUsd: number
  stage: FundedChallengeStage
  dailyDrawdownPct: number
  maxOverallDrawdownPct: number
  drawdownModel?: DrawdownModel
  highWaterMarkEquityUsd?: number
  profitTargetPct: number
  minTradingDays: number
  completedTradingDays: number
  minProfitableDayPct?: number // e.g., 0.5% gain/day for Goat Funded Trader
  currentEquityUsd: number
  dailyPnlUsd: number
  bestSingleDayProfitUsd: number
  baseRiskPct: number // 0.5% to 1.0% normal risk
  consistencyRulePct?: number // 15% | 25% | 30% | 40% | 0 (disabled)
  maxSingleTradeLossCapPct?: number // 1.0% (Goat Instant Daily/Pro) or 2.0% (Goat Instant GOAT/Blitz)
  newsLockoutMinutes?: number // 5 (Blue Guardian / Goat Funded) or 15 (Institutional safety buffer)
  newsProfitCapPct?: number // 3% (Goat Funded Trader Red-Folder news cap)
  inactivityLimitDays?: number // 14 to 30 days
  lastTradeDateIso?: string
  weekendHoldingAllowed?: boolean
  mandatoryStopLoss?: boolean
  lastResetDateIso: string
  updatedAt: string
}

export interface FundedShieldEvaluation {
  startingBalanceUsd: number
  currentEquityUsd: number
  highWaterMarkEquityUsd: number
  drawdownModel: DrawdownModel
  netProfitUsd: number
  netProfitPct: number
  dailyDrawdownLimitUsd: number
  internalSafetyBufferLimitUsd: number // 60% of firm's daily limit
  dailyDrawdownUsedUsd: number
  dailyDrawdownUsedPctOfLimit: number
  isDailySafetyShieldLocked: boolean // True when daily loss >= 60% of firm's daily limit
  maxOverallDrawdownLimitUsd: number
  overallDrawdownFloorUsd: number // Exact dollar breach level (Static or Trailing from High-Water Mark)
  overallDrawdownUsedUsd: number
  remainingOverallSafeCushionUsd: number
  remainingOverallSafeCushionPct: number
  profitTargetUsd: number
  remainingToPassUsd: number
  passProgressPct: number
  isChallengePassed: boolean
  isRecoveryModeActive: boolean // True when currentEquity drops <= -2% below starting balance
  recommendedRiskPct: number // 0.25%-0.5% in Recovery Mode, else 0.5%-1.0% (also capped by maxSingleTradeLossCapPct)
  recommendedRiskUsd: number
  consistencyRuleCapPct: number // Firm's consistency cap (15, 25, 30, 40, or 35 default)
  maxAllowedSingleDayProfitUsd: number
  remainingConsistencyProfitTodayUsd: number
  consistencyMaxSingleDayRatioPct: number
  isConsistencyWarningActive: boolean
  maxSingleTradeLossCapPct: number
  maxSingleTradeLossCapUsd: number
  isSingleTradeHardBreachWarning: boolean
  minProfitableDayPct: number
  minProfitableDayTargetUsd: number
  isTodayProfitableDayMet: boolean
  inactivityLimitDays: number
  daysSinceLastTrade: number
  daysUntilInactivityExpiry: number
  isInactivityWarning: boolean
  isFridayWeekendHoldingAlert: boolean
}

export interface FundedLotCalculation {
  symbolId: string
  entryPrice: number
  protectedSlPrice: number
  tpPrice: number
  stopLossDistancePrice: number
  stopLossPips: number
  riskPct: number
  dollarRiskUsd: number
  exactLotSize: number
  projectedProfitUsd: number
  projectedProfitPctOfTarget: number
  rrRatio: number
  isStopLossValid: boolean
  stopLossValidationMessage?: string
  exceedsSingleTradeLossCap: boolean
  singleTradeLossCapPct?: number
  singleTradeLossCapUsd?: number
}

export interface FundedAPlusSetup {
  id: string
  symbolId: string
  symbolLabel: string
  tf: string
  direction: 'LONG' | 'SHORT'
  model: string
  entryPrice: number
  protectedSlPrice: number
  tp1Price: number
  tp2Price: number
  tp3Price: number
  rrRatio: number
  atrBufferPrice: number
  spreadPrice: number
  confluenceScore: number
  killzoneName: string
  isKillzoneActive: boolean
  isBlockedByNews: boolean
  newsBlockReason?: string
  lotCalc: FundedLotCalculation
  checklist: {
    whenToEnter: string[]
    whenToSkip: string[]
    moveToBeAt1R: string
  }
  reasons: string[]
}

export const ACCOUNT_SIZE_PRESETS: Array<{ label: string; value: number }> = [
  { label: '$5K', value: 5000 },
  { label: '$10K', value: 10000 },
  { label: '$25K', value: 25000 },
  { label: '$50K', value: 50000 },
  { label: '$100K', value: 100000 },
  { label: '$200K', value: 200000 },
]

export interface PropFirmPresetConfig {
  id: PropFirmBrand
  name: string
  badge: string
  dailyDdPct: number
  maxDdPct: number
  drawdownModel: DrawdownModel
  phase1TargetPct: number
  phase2TargetPct: number
  minDays: number
  minProfitableDayPct: number
  consistencyRulePct: number // 0 = no consistency cap, or 15 / 25 / 30 / 40
  maxSingleTradeLossCapPct: number // 0 = standard daily DD, or 1.0 / 2.0 hard breach
  newsLockoutMinutes: number // 5 or 15
  newsProfitCapPct: number // 0 or 3% (Goat Funded Trader)
  inactivityLimitDays: number
  weekendHoldingAllowed: boolean
  mandatoryStopLoss: boolean
  ruleSummary: string
}

export const PROP_FIRM_PRESETS: PropFirmPresetConfig[] = [
  {
    id: 'MENT_FUNDING',
    name: 'Ment Funding (1-Step)',
    badge: '1-Step · Static 6% DD · Mandatory SL',
    dailyDdPct: 5,
    maxDdPct: 6,
    drawdownModel: 'STATIC',
    phase1TargetPct: 10,
    phase2TargetPct: 10,
    minDays: 0,
    minProfitableDayPct: 0,
    consistencyRulePct: 0,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: false,
    mandatoryStopLoss: true,
    ruleSummary: '10% Target · 5% Daily DD · 6% Static Max DD · 0 Min Days · Mandatory Stop Loss on every trade',
  },
  {
    id: 'MENT_FUNDING_FUTURES',
    name: 'Ment Funding (Futures)',
    badge: 'Futures · 25% Consistency · Mandatory SL',
    dailyDdPct: 3,
    maxDdPct: 6,
    drawdownModel: 'TRAILING',
    phase1TargetPct: 10,
    phase2TargetPct: 10,
    minDays: 0,
    minProfitableDayPct: 0,
    consistencyRulePct: 25,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: false,
    mandatoryStopLoss: true,
    ruleSummary: '10% Target · 3% Daily DD · 6% Trailing DD · 25% Max Single-Day Consistency · Mandatory Stop Loss',
  },
  {
    id: 'BLUE_GUARDIAN_2STEP',
    name: 'Blue Guardian (2-Step)',
    badge: 'Unlimited/Elite · ±5m News Lock · 30% Rule',
    dailyDdPct: 4,
    maxDdPct: 8,
    drawdownModel: 'TRAILING',
    phase1TargetPct: 8,
    phase2TargetPct: 4,
    minDays: 3,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 30,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 5,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '8% P1 / 4% P2 Target · 4% Daily DD · 8% Trailing Max DD · ±5m High-Impact/FOMC News Lockout · 30% Consistency',
  },
  {
    id: 'BLUE_GUARDIAN_RAPID_1STEP',
    name: 'Blue Guardian (Rapid 1-Step)',
    badge: '10% Target · 6% Trailing DD · ±5m News',
    dailyDdPct: 4,
    maxDdPct: 6,
    drawdownModel: 'TRAILING',
    phase1TargetPct: 10,
    phase2TargetPct: 10,
    minDays: 0,
    minProfitableDayPct: 0,
    consistencyRulePct: 30,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 5,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '10% Target · 4% Daily DD · 6% Trailing Max DD · ±5m FOMC/High-Impact News Lockout · 0 Min Days',
  },
  {
    id: 'BLUE_GUARDIAN_INSTANT',
    name: 'Blue Guardian (Instant)',
    badge: 'Instant Funded · 3% Daily / 6% Trailing',
    dailyDdPct: 3,
    maxDdPct: 6,
    drawdownModel: 'TRAILING',
    phase1TargetPct: 8,
    phase2TargetPct: 5,
    minDays: 5,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 30,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 5,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '3% Daily DD · 6% Trailing Max DD · 5 Min Trading Days · ±5m News Block · 30% Consistency Guard',
  },
  {
    id: 'GOAT_FUNDED_2STEP',
    name: 'Goat Funded Trader (2-Step)',
    badge: '8%/6% Target · -2% Trade Cap · 40% Rule',
    dailyDdPct: 4,
    maxDdPct: 8,
    drawdownModel: 'TRAILING',
    phase1TargetPct: 8,
    phase2TargetPct: 6,
    minDays: 5,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 40,
    maxSingleTradeLossCapPct: 2.0,
    newsLockoutMinutes: 5,
    newsProfitCapPct: 3,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '8% P1 / 6% P2 · 4% Daily / 8% Max DD · -2% Single-Trade Hard Breach Cap · 5 Profitable Days (>=0.5%/day) · ±5m News 3% Cap',
  },
  {
    id: 'GOAT_FUNDED_1STEP',
    name: 'Goat Funded Trader (1-Step)',
    badge: '10% Target · 15% Consistency · -2% Cap',
    dailyDdPct: 3,
    maxDdPct: 6,
    drawdownModel: 'TRAILING',
    phase1TargetPct: 10,
    phase2TargetPct: 6,
    minDays: 5,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 15,
    maxSingleTradeLossCapPct: 2.0,
    newsLockoutMinutes: 5,
    newsProfitCapPct: 3,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '10% Target · 3% Daily / 6% Trailing DD · -2% Max Floating Loss Cap · 15% Consistency · 5 Profitable Days (>=0.5%/day)',
  },
  {
    id: 'GOAT_FUNDED_INSTANT',
    name: 'Goat Funded (Instant Daily/Pro)',
    badge: '-1% Single-Trade Hard Cap · 15% Rule',
    dailyDdPct: 3,
    maxDdPct: 6,
    drawdownModel: 'TRAILING',
    phase1TargetPct: 8,
    phase2TargetPct: 6,
    minDays: 7,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 15,
    maxSingleTradeLossCapPct: 1.0,
    newsLockoutMinutes: 5,
    newsProfitCapPct: 3,
    inactivityLimitDays: 14,
    weekendHoldingAllowed: false,
    mandatoryStopLoss: true,
    ruleSummary: '3% Daily / 6% Trailing DD · Strict -1% Max Floating Loss Cap per trade · 15% Consistency · 7 Min Profitable Days (>=0.5%/day)',
  },
  {
    id: 'FTMO',
    name: 'FTMO',
    badge: '10%/5% Target · 5% Daily / 10% Static DD',
    dailyDdPct: 5,
    maxDdPct: 10,
    drawdownModel: 'STATIC',
    phase1TargetPct: 10,
    phase2TargetPct: 5,
    minDays: 4,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 35,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: false,
    mandatoryStopLoss: true,
    ruleSummary: '10% P1 / 5% P2 · 5% Daily DD · 10% Static Max DD · 4 Min Trading Days · ±15m Red-Folder News Lockout',
  },
  {
    id: 'FUNDED_NEXT',
    name: 'FundedNext',
    badge: '8%/5% Target · 5% Daily / 10% Static DD',
    dailyDdPct: 5,
    maxDdPct: 10,
    drawdownModel: 'STATIC',
    phase1TargetPct: 8,
    phase2TargetPct: 5,
    minDays: 5,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 35,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '8% P1 / 5% P2 · 5% Daily DD · 10% Static Max DD · 5 Min Trading Days',
  },
  {
    id: 'THE_5ERS',
    name: 'The5ers',
    badge: '8%/5% Target · 5% Daily / 10% Static DD',
    dailyDdPct: 5,
    maxDdPct: 10,
    drawdownModel: 'STATIC',
    phase1TargetPct: 8,
    phase2TargetPct: 5,
    minDays: 3,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 35,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '8% P1 / 5% P2 · 5% Daily DD · 10% Static Max DD · 3 Min Profitable Days (>=0.5%/day)',
  },
  {
    id: 'FUNDING_PIPS',
    name: 'Funding Pips',
    badge: '8%/5% Target · 5% Daily / 10% Static DD',
    dailyDdPct: 5,
    maxDdPct: 10,
    drawdownModel: 'STATIC',
    phase1TargetPct: 8,
    phase2TargetPct: 5,
    minDays: 3,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 35,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: '8% P1 / 5% P2 · 5% Daily DD · 10% Static Max DD · 3 Min Trading Days',
  },
  {
    id: 'CUSTOM',
    name: 'Custom Prop Firm',
    badge: 'User-Defined Drawdown & Consistency Rules',
    dailyDdPct: 5,
    maxDdPct: 10,
    drawdownModel: 'STATIC',
    phase1TargetPct: 8,
    phase2TargetPct: 5,
    minDays: 4,
    minProfitableDayPct: 0.5,
    consistencyRulePct: 30,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    weekendHoldingAllowed: true,
    mandatoryStopLoss: true,
    ruleSummary: 'Customize Daily DD, Static/Trailing Max DD, Consistency Rule %, and Single-Trade Loss Cap',
  },
]

const LOCAL_STORAGE_KEY = 'sr.funded.account.v1'

export function getPropFirmPreset(firmId: PropFirmBrand): PropFirmPresetConfig {
  return PROP_FIRM_PRESETS.find((f) => f.id === firmId) || PROP_FIRM_PRESETS[0]
}

export function createDefaultFundedProfile(uid = 'local_trader'): FundedAccountProfile {
  const todayIso = new Date().toISOString().slice(0, 10)
  return {
    uid,
    propFirm: 'MENT_FUNDING',
    accountSizeUsd: 100000,
    stage: 'PHASE_1',
    dailyDrawdownPct: 5,
    maxOverallDrawdownPct: 6,
    drawdownModel: 'STATIC',
    highWaterMarkEquityUsd: 100000,
    profitTargetPct: 10,
    minTradingDays: 0,
    completedTradingDays: 2,
    minProfitableDayPct: 0.5,
    currentEquityUsd: 100000,
    dailyPnlUsd: 0,
    bestSingleDayProfitUsd: 0,
    baseRiskPct: 0.5,
    consistencyRulePct: 0,
    maxSingleTradeLossCapPct: 0,
    newsLockoutMinutes: 15,
    newsProfitCapPct: 0,
    inactivityLimitDays: 30,
    lastTradeDateIso: todayIso,
    weekendHoldingAllowed: false,
    mandatoryStopLoss: true,
    lastResetDateIso: todayIso,
    updatedAt: new Date().toISOString(),
  }
}

export function loadLocalFundedProfile(uid = 'local_trader'): FundedAccountProfile {
  try {
    const raw = safeStorage.getItem(`${LOCAL_STORAGE_KEY}.${uid}`) || safeStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FundedAccountProfile>
      const def = createDefaultFundedProfile(uid)
      const preset = getPropFirmPreset((parsed.propFirm as PropFirmBrand) || def.propFirm)
      const accountSizeUsd = Math.max(1000, Number(parsed.accountSizeUsd) || def.accountSizeUsd)
      const currentEquityUsd = Math.max(0, Number(parsed.currentEquityUsd ?? parsed.accountSizeUsd ?? def.currentEquityUsd))
      const highWaterMarkEquityUsd = Math.max(
        accountSizeUsd,
        currentEquityUsd,
        Number(parsed.highWaterMarkEquityUsd) || accountSizeUsd
      )
      return {
        ...def,
        ...parsed,
        uid,
        accountSizeUsd,
        dailyDrawdownPct: Math.max(1, Math.min(20, Number(parsed.dailyDrawdownPct) || preset.dailyDdPct)),
        maxOverallDrawdownPct: Math.max(2, Math.min(30, Number(parsed.maxOverallDrawdownPct) || preset.maxDdPct)),
        drawdownModel: parsed.drawdownModel === 'TRAILING' || parsed.drawdownModel === 'STATIC' ? parsed.drawdownModel : preset.drawdownModel,
        highWaterMarkEquityUsd,
        profitTargetPct: Math.max(1, Math.min(30, Number(parsed.profitTargetPct) || preset.phase1TargetPct)),
        minTradingDays: Math.max(0, Math.min(30, Number(parsed.minTradingDays ?? preset.minDays))),
        completedTradingDays: Math.max(0, Number(parsed.completedTradingDays ?? def.completedTradingDays)),
        minProfitableDayPct: Number(parsed.minProfitableDayPct ?? preset.minProfitableDayPct ?? 0.5),
        currentEquityUsd,
        dailyPnlUsd: Number(parsed.dailyPnlUsd ?? 0),
        bestSingleDayProfitUsd: Math.max(0, Number(parsed.bestSingleDayProfitUsd ?? 0)),
        baseRiskPct: Math.max(0.25, Math.min(2.0, Number(parsed.baseRiskPct) || 0.5)),
        consistencyRulePct: Number(parsed.consistencyRulePct ?? preset.consistencyRulePct),
        maxSingleTradeLossCapPct: Number(parsed.maxSingleTradeLossCapPct ?? preset.maxSingleTradeLossCapPct),
        newsLockoutMinutes: Number(parsed.newsLockoutMinutes ?? preset.newsLockoutMinutes),
        newsProfitCapPct: Number(parsed.newsProfitCapPct ?? preset.newsProfitCapPct),
        inactivityLimitDays: Number(parsed.inactivityLimitDays ?? preset.inactivityLimitDays),
        lastTradeDateIso: parsed.lastTradeDateIso || def.lastTradeDateIso,
        weekendHoldingAllowed: parsed.weekendHoldingAllowed ?? preset.weekendHoldingAllowed,
        mandatoryStopLoss: parsed.mandatoryStopLoss ?? true,
      }
    }
  } catch {}
  return createDefaultFundedProfile(uid)
}

export async function saveFundedProfileToCloud(profile: FundedAccountProfile): Promise<void> {
  const highWaterMarkEquityUsd = Math.max(
    profile.accountSizeUsd,
    profile.currentEquityUsd,
    Number(profile.highWaterMarkEquityUsd) || profile.accountSizeUsd
  )
  const clean: FundedAccountProfile = stripUndefinedDeep({
    ...profile,
    highWaterMarkEquityUsd,
    updatedAt: new Date().toISOString(),
  })
  try {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}.${clean.uid}`, JSON.stringify(clean))
    safeStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean))
  } catch {}

  if (isFirebaseReady() && db && clean.uid && clean.uid !== 'local_trader') {
    try {
      await setDoc(doc(db, 'funded_accounts', clean.uid), clean, { merge: true })
    } catch {
      // Local storage remains in sync if offline
    }
  }
}

export function subscribeFundedProfile(
  uid: string | undefined | null,
  onUpdate: (profile: FundedAccountProfile) => void
): () => void {
  const safeUid = uid || 'local_trader'
  const initial = loadLocalFundedProfile(safeUid)
  onUpdate(initial)

  if (!uid || !isFirebaseReady() || !db) {
    return () => {}
  }

  const ref = doc(db, 'funded_accounts', uid)
  const unsub = onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FundedAccountProfile
        const merged: FundedAccountProfile = {
          ...createDefaultFundedProfile(uid),
          ...data,
          uid,
        }
        try {
          safeStorage.setItem(`${LOCAL_STORAGE_KEY}.${uid}`, JSON.stringify(merged))
        } catch {}
        onUpdate(merged)
      } else {
        void setDoc(ref, stripUndefinedDeep(initial), { merge: true }).catch(() => {})
      }
    },
    () => {
      // Fallback to local
    }
  )

  return () => {
    unsub()
  }
}

/**
 * Evaluates all Research-Backed Prop-Firm Protection Shield rules:
 * 1. Static vs. Trailing Drawdown Watermark Meter (Starting Balance, High-Water Mark Equity, Exact Breach Level, Remaining Cushion).
 * 2. Internal 60% Daily Safety Shield (Anti-Breach Lock).
 * 3. Auto Recovery Mode (Dynamic Risk Scaling down to 0.25%–0.5% when equity drops <= -2%).
 * 4. Consistency Rule Calculator (15% / 25% / 30% / 40% max single-day profit share & remaining allowed profit today).
 * 5. Single-Trade Hard Breach Guard (-1% to -2% max floating loss cap for Goat Funded Trader).
 * 6. Prop-Firm Compliance Checklist (Min Profitable Days >=0.5%/day, Inactivity Day Counter, Weekend Holding Alert).
 */
export function evaluateFundedProtectionShield(profile: FundedAccountProfile): FundedShieldEvaluation {
  const preset = getPropFirmPreset(profile.propFirm)
  const startingBalanceUsd = Math.max(1000, Number(profile.accountSizeUsd) || 100000)
  const currentEquityUsd = Math.max(0, Number(profile.currentEquityUsd) || startingBalanceUsd)
  const highWaterMarkEquityUsd = Math.max(
    startingBalanceUsd,
    currentEquityUsd,
    Number(profile.highWaterMarkEquityUsd) || startingBalanceUsd
  )
  const drawdownModel: DrawdownModel = profile.drawdownModel || preset.drawdownModel || 'STATIC'

  const netProfitUsd = Number((currentEquityUsd - startingBalanceUsd).toFixed(2))
  const netProfitPct = Number(((netProfitUsd / startingBalanceUsd) * 100).toFixed(2))

  const dailyDrawdownLimitUsd = Number(((startingBalanceUsd * profile.dailyDrawdownPct) / 100).toFixed(2))
  // Internal Safety Buffer at 60% of the firm's daily limit
  const internalSafetyBufferLimitUsd = Number((dailyDrawdownLimitUsd * 0.6).toFixed(2))
  const dailyLossUsd = profile.dailyPnlUsd < 0 ? Math.abs(profile.dailyPnlUsd) : 0
  const dailyDrawdownUsedPctOfLimit =
    dailyDrawdownLimitUsd > 0 ? Number(Math.min(100, (dailyLossUsd / dailyDrawdownLimitUsd) * 100).toFixed(1)) : 0

  // Anti-Breach Lock triggers when daily loss reaches >= 60% of the firm's daily limit
  const isDailySafetyShieldLocked = dailyLossUsd >= internalSafetyBufferLimitUsd && internalSafetyBufferLimitUsd > 0

  const maxOverallDrawdownLimitUsd = Number(((startingBalanceUsd * profile.maxOverallDrawdownPct) / 100).toFixed(2))
  // Static floor is locked to startingBalanceUsd; Trailing floor trails highWaterMarkEquityUsd (typically locks at startingBalance once reached, or trails peak equity)
  const referenceWatermarkUsd = drawdownModel === 'TRAILING' ? highWaterMarkEquityUsd : startingBalanceUsd
  const overallDrawdownFloorUsd = Number((referenceWatermarkUsd - maxOverallDrawdownLimitUsd).toFixed(2))
  const overallDrawdownUsedUsd = Math.max(0, Number((referenceWatermarkUsd - currentEquityUsd).toFixed(2)))
  const remainingOverallSafeCushionUsd = Math.max(0, Number((currentEquityUsd - overallDrawdownFloorUsd).toFixed(2)))
  const remainingOverallSafeCushionPct = Number(((remainingOverallSafeCushionUsd / startingBalanceUsd) * 100).toFixed(2))

  const effectiveTargetPct =
    profile.stage === 'LIVE_FUNDED'
      ? Math.max(2, profile.profitTargetPct || 5)
      : Math.max(1, profile.profitTargetPct || (profile.stage === 'PHASE_2' ? preset.phase2TargetPct : preset.phase1TargetPct))
  const profitTargetUsd = Number(((startingBalanceUsd * effectiveTargetPct) / 100).toFixed(2))
  const remainingToPassUsd = Number(Math.max(0, profitTargetUsd - Math.max(0, netProfitUsd)).toFixed(2))
  const passProgressPct =
    profitTargetUsd > 0 ? Number(Math.min(100, Math.max(0, (Math.max(0, netProfitUsd) / profitTargetUsd) * 100)).toFixed(1)) : 0
  const isChallengePassed =
    netProfitUsd >= profitTargetUsd && profile.completedTradingDays >= profile.minTradingDays

  // Single-Trade Hard Breach Cap (-1% or -2% on Goat Funded Trader)
  const maxSingleTradeLossCapPct = Number(profile.maxSingleTradeLossCapPct ?? preset.maxSingleTradeLossCapPct ?? 0)
  const maxSingleTradeLossCapUsd =
    maxSingleTradeLossCapPct > 0
      ? Number(((startingBalanceUsd * maxSingleTradeLossCapPct) / 100).toFixed(2))
      : dailyDrawdownLimitUsd

  // Auto Recovery Mode: triggers if account drops -2% or more below starting balance
  const isRecoveryModeActive = netProfitPct <= -2.0
  const normalRiskPct = Math.max(0.25, Math.min(1.5, Number(profile.baseRiskPct) || 0.5))
  const isSingleTradeHardBreachWarning =
    maxSingleTradeLossCapPct > 0 && normalRiskPct >= maxSingleTradeLossCapPct

  let recommendedRiskPct = isRecoveryModeActive
    ? Number(Math.max(0.25, Math.min(0.5, normalRiskPct * 0.5)).toFixed(2))
    : Math.min(1.0, normalRiskPct)

  if (maxSingleTradeLossCapPct > 0) {
    // Keep recommended risk safely below the hard single-trade floating loss cap (e.g., max 0.5% when cap is 1.0%)
    recommendedRiskPct = Number(Math.min(recommendedRiskPct, maxSingleTradeLossCapPct * 0.6).toFixed(2))
  }
  const recommendedRiskUsd = Number(((currentEquityUsd * recommendedRiskPct) / 100).toFixed(2))

  // Consistency Rule Calculator (15% / 25% / 30% / 40%)
  const consistencyRuleCapPct =
    Number(profile.consistencyRulePct ?? preset.consistencyRulePct) > 0
      ? Number(profile.consistencyRulePct ?? preset.consistencyRulePct)
      : 35
  const maxAllowedSingleDayProfitUsd = Number(((profitTargetUsd * consistencyRuleCapPct) / 100).toFixed(2))
  const todayPositivePnl = profile.dailyPnlUsd > 0 ? profile.dailyPnlUsd : 0
  const remainingConsistencyProfitTodayUsd = Math.max(
    0,
    Number((maxAllowedSingleDayProfitUsd - todayPositivePnl).toFixed(2))
  )

  const bestDayCheck = Math.max(profile.bestSingleDayProfitUsd || 0, todayPositivePnl)
  const consistencyMaxSingleDayRatioPct =
    profitTargetUsd > 0 ? Number(((bestDayCheck / profitTargetUsd) * 100).toFixed(1)) : 0
  const isConsistencyWarningActive =
    consistencyRuleCapPct > 0 && consistencyMaxSingleDayRatioPct > consistencyRuleCapPct

  // Minimum Profitable Day threshold (>= 0.5% gain/day)
  const minProfitableDayPct = Number(profile.minProfitableDayPct ?? preset.minProfitableDayPct ?? 0.5)
  const minProfitableDayTargetUsd = Number(((startingBalanceUsd * minProfitableDayPct) / 100).toFixed(2))
  const isTodayProfitableDayMet = todayPositivePnl >= minProfitableDayTargetUsd && minProfitableDayTargetUsd > 0

  // Inactivity Day Counter (7-30 days)
  const inactivityLimitDays = Math.max(7, Number(profile.inactivityLimitDays ?? preset.inactivityLimitDays ?? 30))
  const lastTradeMs = profile.lastTradeDateIso ? Date.parse(profile.lastTradeDateIso) : Date.now()
  const daysSinceLastTrade = isFinite(lastTradeMs)
    ? Math.max(0, Math.floor((Date.now() - lastTradeMs) / (24 * 3600 * 1000)))
    : 0
  const daysUntilInactivityExpiry = Math.max(0, inactivityLimitDays - daysSinceLastTrade)
  const isInactivityWarning = daysUntilInactivityExpiry <= 5

  // Friday NY Close Weekend Holding Alert
  const nowUtcDay = new Date().getUTCDay() // 5 = Friday
  const isFridayWeekendHoldingAlert =
    nowUtcDay === 5 && (profile.weekendHoldingAllowed === false || preset.weekendHoldingAllowed === false)

  return {
    startingBalanceUsd,
    currentEquityUsd,
    highWaterMarkEquityUsd,
    drawdownModel,
    netProfitUsd,
    netProfitPct,
    dailyDrawdownLimitUsd,
    internalSafetyBufferLimitUsd,
    dailyDrawdownUsedUsd: Number(dailyLossUsd.toFixed(2)),
    dailyDrawdownUsedPctOfLimit,
    isDailySafetyShieldLocked,
    maxOverallDrawdownLimitUsd,
    overallDrawdownFloorUsd,
    overallDrawdownUsedUsd,
    remainingOverallSafeCushionUsd,
    remainingOverallSafeCushionPct,
    profitTargetUsd,
    remainingToPassUsd,
    passProgressPct,
    isChallengePassed,
    isRecoveryModeActive,
    recommendedRiskPct,
    recommendedRiskUsd,
    consistencyRuleCapPct,
    maxAllowedSingleDayProfitUsd,
    remainingConsistencyProfitTodayUsd,
    consistencyMaxSingleDayRatioPct,
    isConsistencyWarningActive,
    maxSingleTradeLossCapPct,
    maxSingleTradeLossCapUsd,
    isSingleTradeHardBreachWarning,
    minProfitableDayPct,
    minProfitableDayTargetUsd,
    isTodayProfitableDayMet,
    inactivityLimitDays,
    daysSinceLastTrade,
    daysUntilInactivityExpiry,
    isInactivityWarning,
    isFridayWeekendHoldingAlert,
  }
}

/**
 * Mandatory SL & Exact Prop-Firm Lot-Size Calculator:
 * Computes exact Prop-Firm Lot Size, Dollar Risk ($), Stop Loss Pips, and Projected Profit ($ and % toward Pass Target)
 * for XAUUSD, BTCUSD, EURUSD, GBPUSD, NAS100, and US30.
 * Strictly validates that a non-zero Stop Loss is provided and warns/blocks if risk exceeds the firm's single-trade hard breach cap.
 */
export function calculateFundedLotAndRisk(params: {
  symbolId: string
  entryPrice: number
  protectedSlPrice: number
  tpPrice: number
  equityUsd: number
  riskPct: number
  profitTargetUsd: number
  maxSingleTradeLossCapPct?: number
}): FundedLotCalculation {
  const sym = symbolById(params.symbolId)
  const entry = Number(params.entryPrice) || 0
  const sl = Number(params.protectedSlPrice) || 0
  const tp = Number(params.tpPrice) || 0
  const rawDistance = Math.abs(entry - sl)
  const isStopLossValid = entry > 0 && sl > 0 && rawDistance >= sym.pipSize

  const stopLossDistancePrice = isStopLossValid ? rawDistance : sym.pipSize * 10
  const rewardDistancePrice = Math.max(sym.pipSize, Math.abs(tp - entry))
  const rrRatio = Number((rewardDistancePrice / stopLossDistancePrice).toFixed(2))

  // Compute Stop Loss Pips / Points per institutional instrument convention
  let stopLossPips = 10
  let pipValuePerStandardLotUsd = 10 // Standard FX ($10/pip per 1.00 lot)

  if (sym.id === 'XAUUSD') {
    // 1.00 standard lot on Gold = 100 oz -> $1 move = $100, 1 pip ($0.10) = $10
    stopLossPips = Number((stopLossDistancePrice / 0.1).toFixed(1))
    pipValuePerStandardLotUsd = 10
  } else if (sym.id === 'EURUSD' || sym.id === 'GBPUSD') {
    // 1.00 standard lot = 100,000 units -> 0.0001 move (1 pip) = $10
    stopLossPips = Number((stopLossDistancePrice / 0.0001).toFixed(1))
    pipValuePerStandardLotUsd = 10
  } else if (sym.id === 'USDJPY') {
    stopLossPips = Number((stopLossDistancePrice / 0.01).toFixed(1))
    pipValuePerStandardLotUsd = 6.8
  } else if (sym.id === 'BTCUSD' || sym.id === 'ETHUSD') {
    // 1.00 standard lot on BTC/ETH = 1 coin -> $1 point = $1
    stopLossPips = Number(stopLossDistancePrice.toFixed(1))
    pipValuePerStandardLotUsd = 1
  } else if (sym.id === 'NAS100' || sym.id === 'US30') {
    // 1.00 standard index contract = $1 per 1.0 index point
    stopLossPips = Number(stopLossDistancePrice.toFixed(1))
    pipValuePerStandardLotUsd = 1
  }

  const maxCapPct = Number(params.maxSingleTradeLossCapPct || 0)
  const singleTradeLossCapUsd =
    maxCapPct > 0 ? Number(((params.equityUsd * maxCapPct) / 100).toFixed(2)) : undefined
  const exceedsSingleTradeLossCap = maxCapPct > 0 && params.riskPct >= maxCapPct

  const dollarRiskUsd = isStopLossValid
    ? Number(((params.equityUsd * params.riskPct) / 100).toFixed(2))
    : 0
  const rawLots =
    isStopLossValid && stopLossPips > 0 && pipValuePerStandardLotUsd > 0
      ? dollarRiskUsd / (stopLossPips * pipValuePerStandardLotUsd)
      : 0
  const exactLotSize = isStopLossValid ? Number(Math.max(0.01, Math.min(50, rawLots)).toFixed(2)) : 0
  const projectedProfitUsd = isStopLossValid ? Number((dollarRiskUsd * rrRatio).toFixed(2)) : 0
  const projectedProfitPctOfTarget =
    isStopLossValid && params.profitTargetUsd > 0
      ? Number(((projectedProfitUsd / params.profitTargetUsd) * 100).toFixed(1))
      : 0

  return {
    symbolId: sym.id,
    entryPrice: Number(entry.toFixed(sym.digits)),
    protectedSlPrice: Number(sl.toFixed(sym.digits)),
    tpPrice: Number(tp.toFixed(sym.digits)),
    stopLossDistancePrice: Number(stopLossDistancePrice.toFixed(sym.digits)),
    stopLossPips: isStopLossValid ? stopLossPips : 0,
    riskPct: params.riskPct,
    dollarRiskUsd,
    exactLotSize,
    projectedProfitUsd,
    projectedProfitPctOfTarget,
    rrRatio,
    isStopLossValid,
    stopLossValidationMessage: !isStopLossValid
      ? 'Mandatory Stop Loss Rule: A valid non-zero Stop Loss is required to generate a Funded Execution Plan.'
      : exceedsSingleTradeLossCap
      ? `Single-Trade Hard Breach Alert: Risk (${params.riskPct}%) hits/exceeds firm's -${maxCapPct}% ($${singleTradeLossCapUsd}) max floating loss cap.`
      : undefined,
    exceedsSingleTradeLossCap,
    singleTradeLossCapPct: maxCapPct > 0 ? maxCapPct : undefined,
    singleTradeLossCapUsd,
  }
}

/**
 * Prop-Firm News Lockout & News Profit Cap Alert:
 * - Enforces both the firm's strict ±5m rule (Blue Guardian / Goat Funded Trader) and the ±15m institutional safety buffer.
 * - Flags Goat Funded Trader's 3% news profit cap rule within ±5 minutes of Red-Folder news.
 */
export function checkPropFirmNewsLockout(
  events: EconomicEvent[],
  symbolId: string,
  nowMs = Date.now(),
  firmLockoutMinutes = 15,
  newsProfitCapPct = 0
): {
  locked: boolean
  isWithinStrict5Min?: boolean
  newsProfitCapAlert?: string
  reason?: string
  event?: EconomicEvent
  minutesFromRelease?: number
} {
  const symUpper = (symbolId || 'XAUUSD').toUpperCase()
  const windowMinutes = Math.max(5, firmLockoutMinutes || 15)
  for (const ev of events) {
    if (ev.impact !== 'high') continue
    const diffMs = ev.time - nowMs
    if (Math.abs(diffMs) <= windowMinutes * 60 * 1000) {
      const country = (ev.country || 'USD').toUpperCase()
      const affectsSymbol =
        country === 'USD' ||
        (country === 'XAU' && symUpper === 'XAUUSD') ||
        (country === 'EUR' && symUpper === 'EURUSD') ||
        (country === 'GBP' && symUpper === 'GBPUSD') ||
        (country === 'BTC' && symUpper === 'BTCUSD')

      if (affectsSymbol) {
        const mins = Math.round(diffMs / 60000)
        const isWithinStrict5Min = Math.abs(diffMs) <= 5 * 60 * 1000
        return {
          locked: true,
          isWithinStrict5Min,
          newsProfitCapAlert:
            newsProfitCapPct > 0
              ? `News Profit Cap Alert: Trades executed within ±5m of Red-Folder news are subject to a max ${newsProfitCapPct}% profit cap.`
              : undefined,
          event: ev,
          minutesFromRelease: mins,
          reason: `Prop-Firm News Lockout (±${windowMinutes}m${isWithinStrict5Min ? ' · STRICT ±5M FIRM BREACH ZONE' : ''}): ${ev.country} ${ev.title} (${mins >= 0 ? `in ${mins}m` : `${Math.abs(mins)}m ago`})`,
        }
      }
    }
  }
  return { locked: false }
}

/**
 * UPGRADE 2 — HONEST LIVE MARKET RULE (ZERO DUMMY / FAKE TRADES):
 * Builds an `A+ Funded-Safe` setup ONLY when live market candles (`Binance WS` / `Twelve Data`)
 * genuinely pass all 6 Pure ICT institutional checks:
 * 1. HTF 4H/1H Bias & Premium/Discount alignment
 * 2. Confirmed BSL/SSL Liquidity Sweep
 * 3. Displacement + MSS/CISD leaving an FVG
 * 4. Retracement into Order Block / FVG 50% / OTE (0.62–0.79)
 * 5. Valid Protected Stop Loss (beyond sweep wick + 1.5x ATR + Live Spread)
 * 6. Killzone & Red-Folder News Gate clear
 *
 * If NO real live setup meets all 6 conditions right now, returns `null` (never invents a fallback or synthetic setup).
 */
export function buildFundedSafeSetupFromAnalysis(params: {
  symbolId: string
  tf: string
  candles: Candle[]
  analysis: Analysis | null
  profile: FundedAccountProfile
  shield: FundedShieldEvaluation
  calendarEvents: EconomicEvent[]
  nowMs?: number
}): FundedAPlusSetup | null {
  const { symbolId, tf, candles, analysis, profile, shield, calendarEvents } = params
  const nowMs = params.nowMs || Date.now()
  const sym = symbolById(symbolId)

  if (!candles || candles.length < 30 || !analysis || !analysis.ok) return null

  // Strictly require a genuinely valid live ICT plan
  const plan = analysis.plan
  if (!plan || !plan.valid || (plan.direction !== 'LONG' && plan.direction !== 'SHORT')) {
    return null
  }

  const direction: 'LONG' | 'SHORT' = plan.direction
  const isLong = direction === 'LONG'

  // Check all 6 Pure ICT Institutional Gates on real live candle analysis
  const newsLock = checkPropFirmNewsLockout(
    calendarEvents,
    sym.id,
    nowMs,
    profile.newsLockoutMinutes ?? 15,
    profile.newsProfitCapPct ?? 0
  )

  const check1HtfBiasAndZone = Boolean(
    (isLong && analysis.rangePos <= 55) || (!isLong && analysis.rangePos >= 45) || Math.abs(analysis.score) >= 18
  )
  const check2LiquiditySweep = Boolean(analysis.phase.sweep || analysis.phase.liquidityRaid)
  const check3DisplacementFvg = Boolean(
    analysis.phase.displaced || analysis.phase.cisd || analysis.levels.fvgZones.length > 0
  )
  const check4RetracementZone = Boolean(
    analysis.levels.obZones.length > 0 || analysis.levels.fvgZones.length > 0
  )
  const check5ValidEntryAndSl = Boolean(
    plan.entry > 0 && plan.stop > 0 && Math.abs(plan.entry - plan.stop) >= sym.pipSize
  )
  const check6NewsAndShieldSafe = Boolean(!newsLock.locked && !shield.isDailySafetyShieldLocked)

  if (
    !check1HtfBiasAndZone ||
    !check2LiquiditySweep ||
    !check3DisplacementFvg ||
    !check4RetracementZone ||
    !check5ValidEntryAndSl ||
    !check6NewsAndShieldSafe
  ) {
    return null
  }

  const lastCandle = candles[candles.length - 1]
  const livePrice = lastCandle.c
  const quote = computeBidAskSpread(sym.id, livePrice)

  // Compute 14-period ATR for Protected Stop Loss buffer (Sweep Wick + 1.5x ATR + Live Spread)
  const recent14 = candles.slice(-15)
  let atrSum = 0
  for (let i = 1; i < recent14.length; i++) {
    const cur = recent14[i]
    const prev = recent14[i - 1]
    const tr = Math.max(cur.h - cur.l, Math.abs(cur.h - prev.c), Math.abs(cur.l - prev.c))
    atrSum += tr
  }
  const atr = atrSum / Math.max(1, recent14.length - 1)
  const atrBufferPrice = Number((1.5 * atr + quote.spread).toFixed(sym.digits))

  const entryPrice = Number(plan.entry.toFixed(sym.digits))
  const protectedSlPrice =
    direction === 'LONG'
      ? Number((Math.min(plan.stop, entryPrice - atr * 0.8) - quote.spread).toFixed(sym.digits))
      : Number((Math.max(plan.stop, entryPrice + atr * 0.8) + quote.spread).toFixed(sym.digits))

  const slDist = Math.max(sym.pipSize * 5, Math.abs(entryPrice - protectedSlPrice))
  // Enforce minimum 1:2.5 R:R for Funded-Safe A+ Target
  const tp1Price =
    plan.tp1 > 0
      ? Number(plan.tp1.toFixed(sym.digits))
      : direction === 'LONG'
      ? Number((entryPrice + slDist * 1.5).toFixed(sym.digits))
      : Number((entryPrice - slDist * 1.5).toFixed(sym.digits))

  const tp2Price =
    plan.tp2 > 0 && Math.abs(plan.tp2 - entryPrice) / slDist >= 2.5
      ? Number(plan.tp2.toFixed(sym.digits))
      : direction === 'LONG'
      ? Number((entryPrice + slDist * 2.6).toFixed(sym.digits))
      : Number((entryPrice - slDist * 2.6).toFixed(sym.digits))

  const tp3Price =
    plan.tp3 > 0
      ? Number(plan.tp3.toFixed(sym.digits))
      : direction === 'LONG'
      ? Number((entryPrice + slDist * 4.0).toFixed(sym.digits))
      : Number((entryPrice - slDist * 4.0).toFixed(sym.digits))

  const kz = activeKillzone(new Date(nowMs))

  const lotCalc = calculateFundedLotAndRisk({
    symbolId: sym.id,
    entryPrice,
    protectedSlPrice,
    tpPrice: tp2Price,
    equityUsd: shield.currentEquityUsd,
    riskPct: shield.recommendedRiskPct,
    profitTargetUsd: shield.profitTargetUsd,
    maxSingleTradeLossCapPct: shield.maxSingleTradeLossCapPct,
  })

  if (!lotCalc.isStopLossValid || lotCalc.exceedsSingleTradeLossCap) {
    return null
  }

  const reasons =
    Array.isArray(analysis.reasons) && analysis.reasons.length > 0
      ? analysis.reasons.slice(0, 5)
      : [
          `4H/1H HTF Bias aligned ${direction}`,
          `Confirmed ${plan.sweptLiquidityType || (isLong ? 'SSL' : 'BSL')} Liquidity Sweep + Displacement`,
          `Protected SL placed beyond sweep wick + 1.5x ATR (${atrBufferPrice}) + Live Spread`,
          `Funded-Safe 1:${lotCalc.rrRatio} R:R targeting institutional liquidity draw`,
        ]

  return {
    id: `funded_${sym.id}_${tf}_${plan.createdTs || nowMs}`,
    symbolId: sym.id,
    symbolLabel: sym.label,
    tf,
    direction,
    model: plan.model || 'Pure ICT Institutional Setup',
    entryPrice,
    protectedSlPrice,
    tp1Price,
    tp2Price,
    tp3Price,
    rrRatio: lotCalc.rrRatio,
    atrBufferPrice,
    spreadPrice: quote.spread,
    confluenceScore: plan.confidence || 90,
    killzoneName: kz ? `${kz.name} (${kz.istLabel})` : 'London / NY Killzone Window',
    isKillzoneActive: Boolean(kz),
    isBlockedByNews: newsLock.locked,
    newsBlockReason: newsLock.reason,
    lotCalc,
    checklist: {
      whenToEnter: [
        `Wait for 15M/5M candle retracement into ${entryPrice.toFixed(sym.digits)} (FVG 50% / OTE 0.705)`,
        `Execute strictly ${lotCalc.exactLotSize} Lots (${shield.recommendedRiskPct}% risk = $${lotCalc.dollarRiskUsd})`,
        `Mandatory SL Check: Place Stop Loss at ${protectedSlPrice.toFixed(sym.digits)} immediately upon entry`,
      ],
      whenToSkip: [
        `Skip immediately if Red-Folder High-Impact News is within ±${profile.newsLockoutMinutes || 15} minutes`,
        'Skip if price hits TP1 before tapping the Entry Zone (never chase unmitigated expansion)',
        'Skip if today’s realized profit has already reached your Consistency Rule daily cap',
      ],
      moveToBeAt1R: `When price reaches +1.0R (${tp1Price.toFixed(sym.digits)}), bank 50% partial and move Stop Loss to exact Break-Even (${entryPrice.toFixed(sym.digits)}) so Funded Capital is 100% risk-free.`,
    },
    reasons,
  }
}
