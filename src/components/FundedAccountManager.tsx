import { useState, useEffect } from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Award,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sliders,
  RefreshCw,
  Calendar,
  ArrowRight,
  Compass,
  Clock,
  Activity,
} from 'lucide-react'
import {
  ACCOUNT_SIZE_PRESETS,
  PROP_FIRM_PRESETS,
  getPropFirmPreset,
  subscribeFundedProfile,
  saveFundedProfileToCloud,
  evaluateFundedProtectionShield,
  calculateFundedLotAndRisk,
  buildFundedSafeSetupFromAnalysis,
  checkPropFirmNewsLockout,
  type FundedAccountProfile,
  type FundedChallengeStage,
  type PropFirmBrand,
  type DrawdownModel,
} from '../lib/fundedAccountService'
import { useMarket } from '../hooks/useMarket'
import { defaultSelection } from '../lib/concepts'
import { symbolById, fmtPrice } from '../lib/market'
import { fetchEconomicCalendar, type EconomicEvent } from '../lib/newsService'
import { evaluateEntitlement } from '../lib/subscriptionService'
import type { UserProfile } from '../lib/authService'
import TerminalLockedScreen from './TerminalLockedScreen'

const FUNDED_INSTRUMENTS = ['XAUUSD', 'BTCUSD', 'EURUSD', 'GBPUSD', 'NAS100', 'US30'] as const

interface FundedAccountManagerProps {
  userProfile: UserProfile | null
  onOpenSubscription: () => void
  onOpenTerminalSymbol?: (symbolId: string) => void
}

export default function FundedAccountManager({
  userProfile,
  onOpenSubscription,
  onOpenTerminalSymbol,
}: FundedAccountManagerProps) {
  const uid = userProfile?.uid || 'local_trader'
  const [profile, setProfile] = useState<FundedAccountProfile | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<string>('XAUUSD')
  const [customSizeInput, setCustomSizeInput] = useState<string>('')
  const [showRulesEditor, setShowRulesEditor] = useState<boolean>(false)
  const [calendarEvents, setCalendarEvents] = useState<EconomicEvent[]>([])
  const [saveToast, setSaveToast] = useState<string | null>(null)

  // Interactive Mandatory SL & Lot Calculator state
  const [calcStopPipsOverride, setCalcStopPipsOverride] = useState<string>('25')
  const [calcRiskPctOverride, setCalcRiskPctOverride] = useState<string>('')
  const [calcRrOverride, setCalcRrOverride] = useState<number>(2.5)

  const { candles, analysis, livePrice } = useMarket(selectedSymbol, '15m', defaultSelection())
  const sym = symbolById(selectedSymbol)

  useEffect(() => {
    const unsub = subscribeFundedProfile(uid, (loaded) => {
      setProfile(loaded)
    })
    return unsub
  }, [uid])

  useEffect(() => {
    fetchEconomicCalendar()
      .then((res) => setCalendarEvents(res.events || []))
      .catch(() => {})
  }, [])

  // UPGRADE 4: Pro Features NEVER Unlock via Ads (Funded Account Prop-Firm Pass Manager is strictly locked to Ad-Free Pro or active 24H Trial)
  const entitlement = evaluateEntitlement(userProfile)
  if (!entitlement.isActive) {
    return (
      <TerminalLockedScreen
        userProfile={userProfile}
        featureKey="basic_chart_view"
        featureTitle="Funded Account / Prop Firm Pass Manager"
        allowRewardedAd={false}
        onViewPlans={onOpenSubscription}
        onSubscribeNow={onOpenSubscription}
      />
    )
  }

  if (!profile) {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-3">
        <div className="h-24 shimmer rounded-[12px]" />
        <div className="h-48 shimmer rounded-[12px]" />
      </div>
    )
  }

  const activePreset = getPropFirmPreset(profile.propFirm)
  const shield = evaluateFundedProtectionShield(profile)
  const newsLockout = checkPropFirmNewsLockout(
    calendarEvents,
    selectedSymbol,
    Date.now(),
    profile.newsLockoutMinutes ?? activePreset.newsLockoutMinutes,
    profile.newsProfitCapPct ?? activePreset.newsProfitCapPct
  )

  const fundedSetup = buildFundedSafeSetupFromAnalysis({
    symbolId: selectedSymbol,
    tf: '15m',
    candles,
    analysis,
    profile,
    shield,
    calendarEvents,
  })

  const updateAndPersist = (patch: Partial<FundedAccountProfile>, toastMessage?: string) => {
    const nextEq = patch.currentEquityUsd ?? profile.currentEquityUsd
    const nextSize = patch.accountSizeUsd ?? profile.accountSizeUsd
    const nextHwm = Math.max(
      nextSize,
      nextEq,
      patch.highWaterMarkEquityUsd ?? profile.highWaterMarkEquityUsd ?? nextSize
    )
    const updated: FundedAccountProfile = {
      ...profile,
      ...patch,
      highWaterMarkEquityUsd: nextHwm,
      updatedAt: new Date().toISOString(),
    }
    setProfile(updated)
    void saveFundedProfileToCloud(updated)
    if (toastMessage) {
      setSaveToast(toastMessage)
      setTimeout(() => setSaveToast(null), 2800)
    }
  }

  const handleSelectAccountSize = (sizeUsd: number) => {
    const prevNetProfit = profile.currentEquityUsd - profile.accountSizeUsd
    const nextEq = Math.max(0, sizeUsd + prevNetProfit)
    updateAndPersist(
      {
        accountSizeUsd: sizeUsd,
        currentEquityUsd: nextEq,
        highWaterMarkEquityUsd: Math.max(sizeUsd, nextEq),
      },
      `Funded Account Size set to $${sizeUsd.toLocaleString()} (Synced to Cloud)`
    )
  }

  const handleSelectStage = (stage: FundedChallengeStage) => {
    const defaultTarget =
      stage === 'PHASE_1'
        ? activePreset.phase1TargetPct
        : stage === 'PHASE_2'
        ? activePreset.phase2TargetPct
        : 5
    updateAndPersist(
      {
        stage,
        profitTargetPct: defaultTarget,
      },
      `Challenge Stage switched to ${stage.replace('_', ' ')} (${defaultTarget}% Target)`
    )
  }

  const handleSelectPropFirm = (firmId: PropFirmBrand) => {
    const preset = getPropFirmPreset(firmId)
    const targetPct =
      profile.stage === 'PHASE_2' ? preset.phase2TargetPct : preset.phase1TargetPct
    const safeRisk =
      preset.maxSingleTradeLossCapPct > 0
        ? Math.min(profile.baseRiskPct, Number((preset.maxSingleTradeLossCapPct * 0.5).toFixed(2)))
        : profile.baseRiskPct
    updateAndPersist(
      {
        propFirm: firmId,
        dailyDrawdownPct: preset.dailyDdPct,
        maxOverallDrawdownPct: preset.maxDdPct,
        drawdownModel: preset.drawdownModel,
        profitTargetPct: targetPct,
        minTradingDays: preset.minDays,
        minProfitableDayPct: preset.minProfitableDayPct,
        consistencyRulePct: preset.consistencyRulePct,
        maxSingleTradeLossCapPct: preset.maxSingleTradeLossCapPct,
        newsLockoutMinutes: preset.newsLockoutMinutes,
        newsProfitCapPct: preset.newsProfitCapPct,
        inactivityLimitDays: preset.inactivityLimitDays,
        weekendHoldingAllowed: preset.weekendHoldingAllowed,
        mandatoryStopLoss: preset.mandatoryStopLoss,
        baseRiskPct: safeRisk,
      },
      `Loaded ${preset.name} Real-World Rules (${preset.badge})`
    )
  }

  // Interactive Mandatory SL & Lot-Size Calculator computation
  const activeEntry = fundedSetup?.entryPrice || livePrice || (selectedSymbol === 'XAUUSD' ? 2910 : 1.085)
  const rawPipsText = calcStopPipsOverride.trim()
  const parsedPips = rawPipsText === '' ? NaN : Number(rawPipsText)
  const hasValidSlInput = !isNaN(parsedPips) && parsedPips > 0

  const effectiveSlPrice = hasValidSlInput
    ? selectedSymbol === 'XAUUSD'
      ? activeEntry - parsedPips * 0.1
      : selectedSymbol === 'EURUSD' || selectedSymbol === 'GBPUSD'
      ? activeEntry - parsedPips * 0.0001
      : selectedSymbol === 'USDJPY'
      ? activeEntry - parsedPips * 0.01
      : activeEntry - parsedPips
    : fundedSetup?.protectedSlPrice || 0

  const slDist = effectiveSlPrice > 0 ? Math.max(sym.pipSize, Math.abs(activeEntry - effectiveSlPrice)) : 0
  const effectiveTpPrice = effectiveSlPrice > 0 ? activeEntry + slDist * calcRrOverride : 0

  const effectiveCalcRiskPct =
    calcRiskPctOverride.trim() !== '' && !isNaN(Number(calcRiskPctOverride)) && Number(calcRiskPctOverride) > 0
      ? Number(calcRiskPctOverride)
      : shield.recommendedRiskPct

  const customLotCalc = calculateFundedLotAndRisk({
    symbolId: selectedSymbol,
    entryPrice: activeEntry,
    protectedSlPrice: hasValidSlInput ? effectiveSlPrice : 0,
    tpPrice: effectiveTpPrice,
    equityUsd: shield.currentEquityUsd,
    riskPct: effectiveCalcRiskPct,
    profitTargetUsd: shield.profitTargetUsd,
    maxSingleTradeLossCapPct: shield.maxSingleTradeLossCapPct,
  })

  return (
    <div className="p-4 pb-12 max-w-2xl mx-auto space-y-4 font-sans text-[#FFFFFF] fadein tabular-nums">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#1E222D] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#26A69A]" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#FFFFFF]">
              Funded Account / Prop Firm Pass Manager
            </h1>
          </div>
          <p className="text-[11px] text-[#787B86] mt-0.5">
            Ment Funding · Blue Guardian · Goat Funded Trader · FTMO · FundedNext · The5ers · Funding Pips
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRulesEditor(!showRulesEditor)}
            className="px-3 py-1.5 rounded-[8px] bg-[#131722] border border-[#1E222D] hover:border-[#2A2E39] text-xs font-semibold text-[#D1D4DC] flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Sliders size={13} className="text-[#26A69A]" />
            <span>{showRulesEditor ? 'Hide Rules' : 'Customize Rules'}</span>
          </button>
        </div>
      </div>

      {/* Save Toast */}
      {saveToast && (
        <div className="p-3 rounded-[10px] bg-[#26A69A]/15 border border-[#26A69A]/40 text-[#26A69A] text-xs flex items-center gap-2 fadein">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* BUILT-IN PROTECTION BANNERS: 60% DAILY SHIELD, RECOVERY & HARD BREACH */}
      {/* ===================================================================== */}
      {shield.isDailySafetyShieldLocked && (
        <div className="p-4 rounded-[12px] bg-[#EF5350]/15 border-2 border-[#EF5350] text-[#EF5350] space-y-1.5 fadein">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wide">
            <ShieldAlert size={18} className="shrink-0 text-[#EF5350]" />
            <span>60% Internal Daily Safety Shield Active — Capital Protected Until Next Server Reset</span>
          </div>
          <p className="text-[11.5px] text-[#D1D4DC] leading-relaxed">
            Your daily loss (<strong className="text-[#EF5350]">-${shield.dailyDrawdownUsedUsd.toLocaleString()}</strong>) has
            reached <strong className="text-[#FFFFFF]">60% of {activePreset.name}&apos;s Daily Drawdown Limit</strong> ($
            {shield.internalSafetyBufferLimitUsd.toLocaleString()} of $
            {shield.dailyDrawdownLimitUsd.toLocaleString()}). New Funded Signals are locked for the day to prevent an accidental daily breach.
          </p>
        </div>
      )}

      {shield.isRecoveryModeActive && !shield.isDailySafetyShieldLocked && (
        <div className="p-3.5 rounded-[12px] bg-amber-500/15 border border-amber-500/40 text-amber-300 space-y-1 fadein">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono">
              <Shield size={15} className="text-amber-400 shrink-0" />
              <span>AUTO RECOVERY MODE ACTIVE ({shield.recommendedRiskPct}% DYNAMIC RISK SCALING)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#0B0E14] text-amber-400 font-mono text-[10px] font-bold">
              EQUITY: {shield.netProfitPct}%
            </span>
          </div>
          <p className="text-[11px] text-[#D1D4DC] leading-relaxed">
            Account equity is currently <strong className="text-amber-400">{shield.netProfitPct}%</strong> below starting balance
            ($-{Math.abs(shield.netProfitUsd).toLocaleString()}). Recommended risk per trade is automatically reduced to{' '}
            <strong className="text-[#26A69A]">{shield.recommendedRiskPct}% (${shield.recommendedRiskUsd})</strong> until
            drawdown recovers.
          </p>
        </div>
      )}

      {shield.maxSingleTradeLossCapPct > 0 && (
        <div
          className={`p-3.5 rounded-[12px] border flex items-start gap-2.5 text-xs ${
            shield.isSingleTradeHardBreachWarning || customLotCalc.exceedsSingleTradeLossCap
              ? 'bg-[#EF5350]/15 border-[#EF5350] text-[#EF5350]'
              : 'bg-[#131722] border-amber-500/40 text-amber-300'
          }`}
        >
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">
              Single-Trade Hard Breach / Max Floating Loss Guard (-{shield.maxSingleTradeLossCapPct}% = -$
              {shield.maxSingleTradeLossCapUsd.toLocaleString()} Cap)
            </div>
            <p className="text-[11px] text-[#D1D4DC] mt-0.5">
              {activePreset.name} enforces a hard breach if any single open trade&apos;s floating loss reaches{' '}
              <strong className="text-[#FFFFFF]">-{shield.maxSingleTradeLossCapPct}%</strong>. SR Terminal caps your
              recommended trade risk at <strong className="text-[#26A69A]">{shield.recommendedRiskPct}%</strong> and blocks
              lot sizes whose SL risk exceeds -{shield.maxSingleTradeLossCapPct}%.
            </p>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. PROP FIRM PRESET, ACCOUNT SIZE ($5K-$200K+) & STAGE SELECTOR       */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            1. Select Prop Firm Preset, Account Size & Stage
          </div>
          <span className="text-[10.5px] font-mono text-[#26A69A]">
            {activePreset.name} · {shield.drawdownModel} DD
          </span>
        </div>

        {/* Prop Firm Brand Selector Grid (Ment Funding, Blue Guardian, Goat Funded Trader, FTMO, FundedNext, The5ers, Funding Pips, Custom) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PROP_FIRM_PRESETS.map((firm) => {
            const active = profile.propFirm === firm.id
            return (
              <button
                key={firm.id}
                type="button"
                onClick={() => handleSelectPropFirm(firm.id)}
                className={`p-2 rounded-[8px] text-left border transition cursor-pointer active:scale-98 ${
                  active
                    ? 'bg-[#1E222D] text-[#FFFFFF] border-[#26A69A]'
                    : 'bg-[#0B0E14] text-[#D1D4DC] border-[#1E222D] hover:border-[#2A2E39]'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{firm.name}</div>
                <div className="text-[9.5px] text-[#787B86] font-mono truncate mt-0.5">{firm.badge}</div>
              </button>
            )
          })}
        </div>

        {/* Active Prop Firm Rule Summary Banner */}
        <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[11px] text-[#D1D4DC] flex items-center justify-between gap-2 flex-wrap">
          <span>
            <strong className="text-[#26A69A] font-mono">{activePreset.name} Rules: </strong>
            {activePreset.ruleSummary}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#131722] border border-[#26A69A]/40 text-[#26A69A] font-mono text-[10px] font-bold">
            MANDATORY SL ENFORCED
          </span>
        </div>

        {/* Account Size Presets: $5K, $10K, $25K, $50K, $100K, $200K */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ACCOUNT_SIZE_PRESETS.map((preset) => {
            const active = profile.accountSizeUsd === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleSelectAccountSize(preset.value)}
                className={`py-2.5 px-2 rounded-[10px] font-mono text-xs font-bold border transition cursor-pointer active:scale-98 ${
                  active
                    ? 'bg-[#FFFFFF] text-[#0B0E14] border-[#FFFFFF]'
                    : 'bg-[#0B0E14] text-[#D1D4DC] border-[#1E222D] hover:border-[#2A2E39]'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        {/* Challenge Stage Selector: Phase 1, Phase 2, Live Funded */}
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'PHASE_1', label: `Phase 1 (${activePreset.phase1TargetPct}% Target)` },
              { id: 'PHASE_2', label: `Phase 2 (${activePreset.phase2TargetPct}% Target)` },
              { id: 'LIVE_FUNDED', label: 'Live Funded (Payout)' },
            ] as Array<{ id: FundedChallengeStage; label: string }>
          ).map((st) => {
            const active = profile.stage === st.id
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStage(st.id)}
                className={`py-2 px-2.5 rounded-[10px] text-[11px] font-semibold border transition cursor-pointer active:scale-98 ${
                  active
                    ? 'bg-[#26A69A]/20 text-[#26A69A] border-[#26A69A]'
                    : 'bg-[#0B0E14] text-[#787B86] border-[#1E222D] hover:text-[#FFFFFF]'
                }`}
              >
                {st.label}
              </button>
            )
          })}
        </div>

        {/* Expandable Custom Prop Rules & Equity Editor */}
        {showRulesEditor && (
          <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-3 fadein">
            <div className="text-[11px] font-semibold text-[#26A69A] uppercase font-mono">
              Custom Prop Firm Challenge Rules & Live Equity Sync
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">Custom Size ($ USD)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder={String(profile.accountSizeUsd)}
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = Number(customSizeInput)
                      if (val >= 1000) {
                        handleSelectAccountSize(val)
                        setCustomSizeInput('')
                      }
                    }}
                    className="px-2.5 rounded-[8px] bg-[#26A69A] text-[#0B0E14] font-bold text-[10px] cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">Daily Drawdown (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.dailyDrawdownPct}
                  onChange={(e) =>
                    updateAndPersist({ dailyDrawdownPct: Math.max(1, Math.min(20, Number(e.target.value) || 5)) })
                  }
                  className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">Max Overall DD (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.maxOverallDrawdownPct}
                  onChange={(e) =>
                    updateAndPersist({ maxOverallDrawdownPct: Math.max(2, Math.min(30, Number(e.target.value) || 10)) })
                  }
                  className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">Profit Target (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.profitTargetPct}
                  onChange={(e) =>
                    updateAndPersist({ profitTargetPct: Math.max(1, Math.min(30, Number(e.target.value) || 8)) })
                  }
                  className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">Current Equity ($)</label>
                <input
                  type="number"
                  value={profile.currentEquityUsd}
                  onChange={(e) =>
                    updateAndPersist({ currentEquityUsd: Math.max(0, Number(e.target.value) || profile.accountSizeUsd) })
                  }
                  className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">High-Water Mark ($)</label>
                <input
                  type="number"
                  value={shield.highWaterMarkEquityUsd}
                  onChange={(e) =>
                    updateAndPersist({
                      highWaterMarkEquityUsd: Math.max(
                        profile.accountSizeUsd,
                        Number(e.target.value) || profile.accountSizeUsd
                      ),
                    })
                  }
                  className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">Today&apos;s PnL ($)</label>
                <input
                  type="number"
                  value={profile.dailyPnlUsd}
                  onChange={(e) => {
                    const newDaily = Number(e.target.value) || 0
                    updateAndPersist({
                      dailyPnlUsd: newDaily,
                      currentEquityUsd: Math.max(0, profile.accountSizeUsd + newDaily),
                      bestSingleDayProfitUsd: Math.max(profile.bestSingleDayProfitUsd || 0, newDaily > 0 ? newDaily : 0),
                    })
                  }}
                  className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#787B86] mb-1">Profitable Days Done</label>
                <input
                  type="number"
                  value={profile.completedTradingDays}
                  onChange={(e) =>
                    updateAndPersist({ completedTradingDays: Math.max(0, Number(e.target.value) || 0) })
                  }
                  className="w-full h-9 px-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
                />
              </div>
            </div>

            {/* Quick PnL Sync / Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E222D]">
              <span className="text-[10.5px] text-[#787B86]">Update Live Account Balance:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const winDelta = Number(((profile.accountSizeUsd * 1.0) / 100).toFixed(2))
                    const nextEq = profile.currentEquityUsd + winDelta
                    const nextDaily = profile.dailyPnlUsd + winDelta
                    updateAndPersist(
                      {
                        currentEquityUsd: nextEq,
                        dailyPnlUsd: nextDaily,
                        completedTradingDays: profile.completedTradingDays + 1,
                        bestSingleDayProfitUsd: Math.max(profile.bestSingleDayProfitUsd || 0, nextDaily),
                        lastTradeDateIso: new Date().toISOString().slice(0, 10),
                      },
                      `Recorded +1.0% Realized Gain (+$${winDelta.toLocaleString()})`
                    )
                  }}
                  className="px-2.5 py-1 rounded bg-[#26A69A]/15 border border-[#26A69A]/40 text-[#26A69A] text-[10.5px] font-mono font-semibold cursor-pointer"
                >
                  + Record +1.0% Gain
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const lossDelta = Number(((profile.accountSizeUsd * 0.5) / 100).toFixed(2))
                    updateAndPersist(
                      {
                        currentEquityUsd: Math.max(0, profile.currentEquityUsd - lossDelta),
                        dailyPnlUsd: profile.dailyPnlUsd - lossDelta,
                        lastTradeDateIso: new Date().toISOString().slice(0, 10),
                      },
                      `Recorded -0.5% Realized Loss (-$${lossDelta.toLocaleString()})`
                    )
                  }}
                  className="px-2.5 py-1 rounded bg-[#EF5350]/15 border border-[#EF5350]/40 text-[#EF5350] text-[10.5px] font-mono font-semibold cursor-pointer"
                >
                  - Record -0.5% Loss
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateAndPersist(
                      {
                        currentEquityUsd: profile.accountSizeUsd,
                        highWaterMarkEquityUsd: profile.accountSizeUsd,
                        dailyPnlUsd: 0,
                        bestSingleDayProfitUsd: 0,
                      },
                      'Reset Daily PnL & Watermark Balance'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-[#131722] border border-[#1E222D] text-[#D1D4DC] text-[10.5px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} />
                  <span>Reset Balance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pass Target Progress Bar */}
        <div className="p-3.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#D1D4DC]">
              {profile.stage.replace('_', ' ')} Pass Target ({profile.profitTargetPct}% = $
              {shield.profitTargetUsd.toLocaleString()})
            </span>
            <span className="font-mono font-bold text-[#26A69A]">
              {shield.isChallengePassed
                ? 'CHALLENGE PASSED ✓'
                : `$${shield.remainingToPassUsd.toLocaleString()} remaining (${shield.passProgressPct}%)`}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#131722] border border-[#1E222D] overflow-hidden">
            <div
              className="h-full bg-[#26A69A] transition-all duration-500"
              style={{ width: `${shield.passProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. STATIC VS. TRAILING DRAWDOWN WATERMARK METER & CONSISTENCY GUARD   */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#26A69A]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[#FFFFFF]">
              2. Static vs. Trailing Drawdown Watermark Meter
            </h2>
          </div>

          <div className="inline-flex items-center p-0.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
            {(['STATIC', 'TRAILING'] as DrawdownModel[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => updateAndPersist({ drawdownModel: m }, `Drawdown model set to ${m}`)}
                className={`px-2.5 py-1 rounded-[6px] text-[10px] font-mono font-bold cursor-pointer ${
                  shield.drawdownModel === m ? 'bg-[#26A69A] text-[#0B0E14]' : 'text-[#787B86] hover:text-[#FFFFFF]'
                }`}
              >
                {m} DD
              </button>
            ))}
          </div>
        </div>

        {/* 4 Watermark KPIs: Starting Balance, High-Water Mark Equity, Exact Breach Level, Remaining Safe Cushion */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="text-[10px] text-[#787B86] uppercase font-mono">Starting Balance</div>
            <div className="text-sm font-bold text-[#FFFFFF] mt-0.5">
              ${shield.startingBalanceUsd.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-[#787B86]">Initial Baseline</div>
          </div>

          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="text-[10px] text-[#787B86] uppercase font-mono">High-Water Mark</div>
            <div className="text-sm font-bold text-[#26A69A] mt-0.5">
              ${shield.highWaterMarkEquityUsd.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-[#787B86]">
              {shield.drawdownModel === 'TRAILING' ? 'Trailing Peak Lock' : 'Static Reference'}
            </div>
          </div>

          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#EF5350]/40">
            <div className="text-[10px] text-[#EF5350] uppercase font-mono">Exact Breach Level</div>
            <div className="text-sm font-bold text-[#EF5350] mt-0.5">
              ${shield.overallDrawdownFloorUsd.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-[#787B86]">
              Max DD {profile.maxOverallDrawdownPct}% (${shield.maxOverallDrawdownLimitUsd.toLocaleString()})
            </div>
          </div>

          <div className="p-2.5 rounded-[8px] bg-[#0B0E14] border border-[#26A69A]/40">
            <div className="text-[10px] text-[#26A69A] uppercase font-mono">Remaining Safe Cushion</div>
            <div className="text-sm font-bold text-[#FFFFFF] mt-0.5">
              ${shield.remainingOverallSafeCushionUsd.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-[#26A69A]">
              {shield.remainingOverallSafeCushionPct}% Cushion Left
            </div>
          </div>
        </div>

        {/* Consistency Rule Calculator & 60% Daily Safety Shield Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#FFFFFF] font-mono">
                60% Daily Safety Shield ({profile.dailyDrawdownPct}% Daily Limit)
              </span>
              <span className="font-mono text-amber-400">
                Lock @ -${shield.internalSafetyBufferLimitUsd.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-[#787B86]">
              Used Today: <strong className="text-[#FFFFFF]">${shield.dailyDrawdownUsedUsd.toLocaleString()}</strong> /
              Firm Max <strong className="text-[#EF5350]">${shield.dailyDrawdownLimitUsd.toLocaleString()}</strong> (
              {shield.dailyDrawdownUsedPctOfLimit}%)
            </div>
          </div>

          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#FFFFFF] font-mono">
                Consistency Rule Calculator ({shield.consistencyRuleCapPct}% Cap)
              </span>
              <span
                className={`font-mono font-bold ${
                  shield.isConsistencyWarningActive ? 'text-amber-400' : 'text-[#26A69A]'
                }`}
              >
                Max/Day: ${shield.maxAllowedSingleDayProfitUsd.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-[#787B86]">
              Remaining Safe Profit Allowed Today:{' '}
              <strong className="text-[#26A69A]">
                ${shield.remainingConsistencyProfitTodayUsd.toLocaleString()}
              </strong>{' '}
              (Peak Day: {shield.consistencyMaxSingleDayRatioPct}%)
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MANDATORY SL & EXACT PROP-FIRM LOT-SIZE CALCULATOR                 */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-[#26A69A]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[#FFFFFF]">
              3. Mandatory SL & Exact Lot-Size Calculator
            </h2>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
              shield.isRecoveryModeActive
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'bg-[#26A69A]/15 text-[#26A69A] border-[#26A69A]/40'
            }`}
          >
            {shield.isRecoveryModeActive
              ? `RECOVERY MODE · ${shield.recommendedRiskPct}% RISK`
              : `RECOMMENDED · ${shield.recommendedRiskPct}% RISK`}
          </span>
        </div>

        {/* Instrument Tabs: XAUUSD, BTCUSD, EURUSD, GBPUSD, NAS100, US30 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {FUNDED_INSTRUMENTS.map((inst) => {
            const active = selectedSymbol === inst
            return (
              <button
                key={inst}
                type="button"
                onClick={() => setSelectedSymbol(inst)}
                className={`py-2 rounded-[8px] font-mono text-xs font-bold border transition cursor-pointer active:scale-98 ${
                  active
                    ? 'bg-[#FFFFFF] text-[#0B0E14] border-[#FFFFFF]'
                    : 'bg-[#0B0E14] text-[#787B86] border-[#1E222D] hover:text-[#FFFFFF]'
                }`}
              >
                {inst}
              </button>
            )
          })}
        </div>

        {/* Mandatory Stop Loss Pips, Risk % & Target R:R Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] text-[#787B86] mb-1">
              Mandatory Stop Loss Pips / Points ({selectedSymbol}) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter SL Pips (Required)"
              value={calcStopPipsOverride}
              onChange={(e) => setCalcStopPipsOverride(e.target.value)}
              className={`w-full h-9 px-3 rounded-[8px] bg-[#0B0E14] border text-xs text-[#FFFFFF] font-mono ${
                !customLotCalc.isStopLossValid ? 'border-[#EF5350]' : 'border-[#1E222D]'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#787B86] mb-1">
              Risk Per Trade % {shield.maxSingleTradeLossCapPct > 0 ? `(Max <${shield.maxSingleTradeLossCapPct}%)` : ''}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3.0"
              placeholder={`Auto (${shield.recommendedRiskPct}%)`}
              value={calcRiskPctOverride}
              onChange={(e) => setCalcRiskPctOverride(e.target.value)}
              className={`w-full h-9 px-3 rounded-[8px] bg-[#0B0E14] border text-xs text-[#FFFFFF] font-mono ${
                customLotCalc.exceedsSingleTradeLossCap ? 'border-[#EF5350]' : 'border-[#1E222D]'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#787B86] mb-1">
              Target R:R Ratio (Min 1:2.5 Funded-Safe)
            </label>
            <select
              value={calcRrOverride}
              onChange={(e) => setCalcRrOverride(Number(e.target.value) || 2.5)}
              className="w-full h-9 px-3 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-xs text-[#FFFFFF] font-mono"
            >
              <option value={2.5}>1 : 2.5 R:R (Funded Minimum)</option>
              <option value={3.0}>1 : 3.0 R:R (Institutional Standard)</option>
              <option value={4.0}>1 : 4.0 R:R (Killzone Expansion)</option>
            </select>
          </div>
        </div>

        {/* Mandatory SL / Hard Breach Validation Error Box */}
        {customLotCalc.stopLossValidationMessage && (
          <div className="p-3 rounded-[10px] bg-[#EF5350]/15 border border-[#EF5350] text-[#EF5350] text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{customLotCalc.stopLossValidationMessage}</span>
          </div>
        )}

        {/* 4 Computed Output Boxes: Exact Lot Size, Dollar Risk ($), Stop Loss Pips, Projected Profit */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#26A69A]/50">
            <div className="text-[10px] text-[#787B86] uppercase font-mono">Exact Lot Size</div>
            <div className="text-lg font-bold text-[#26A69A] font-mono mt-0.5">
              {customLotCalc.isStopLossValid && !customLotCalc.exceedsSingleTradeLossCap
                ? `${customLotCalc.exactLotSize} Lots`
                : 'BLOCKED'}
            </div>
            <div className="text-[10px] text-[#787B86] font-mono">{selectedSymbol} Standard</div>
          </div>

          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="text-[10px] text-[#787B86] uppercase font-mono">Dollar Risk ($)</div>
            <div className="text-lg font-bold text-[#FFFFFF] font-mono mt-0.5">
              ${customLotCalc.dollarRiskUsd.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#787B86] font-mono">
              {customLotCalc.riskPct}% of ${shield.currentEquityUsd.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="text-[10px] text-[#787B86] uppercase font-mono">Mandatory SL Pips</div>
            <div className="text-lg font-bold text-[#EF5350] font-mono mt-0.5">
              {customLotCalc.isStopLossValid ? customLotCalc.stopLossPips : 'REQUIRED'}
            </div>
            <div className="text-[10px] text-[#787B86] font-mono">
              Wick + 1.5x ATR + Spread
            </div>
          </div>

          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <div className="text-[10px] text-[#787B86] uppercase font-mono">Projected Profit</div>
            <div className="text-lg font-bold text-[#26A69A] font-mono mt-0.5">
              +${customLotCalc.projectedProfitUsd.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#26A69A] font-mono">
              {customLotCalc.projectedProfitPctOfTarget}% of Pass Target
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. PROP-FIRM COMPLIANCE CHECKLIST                                     */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#26A69A]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[#FFFFFF]">
              4. Prop-Firm Compliance Checklist ({activePreset.name})
            </h2>
          </div>
          <span className="text-[10.5px] font-mono text-[#787B86]">Real-Time Rule Audit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Minimum Profitable Days (0.5%+ gain/day) */}
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FFFFFF] flex items-center gap-1.5">
                <Calendar size={13} className="text-[#26A69A]" />
                <span>Min Profitable Days ({shield.minProfitableDayPct}%+/day)</span>
              </span>
              <span
                className={`font-mono font-bold ${
                  profile.completedTradingDays >= profile.minTradingDays ? 'text-[#26A69A]' : 'text-amber-400'
                }`}
              >
                {profile.completedTradingDays} / {profile.minTradingDays} Days
              </span>
            </div>
            <p className="text-[11px] text-[#787B86]">
              Qualifying Day Target: <strong className="text-[#FFFFFF]">+${shield.minProfitableDayTargetUsd.toLocaleString()}</strong>{' '}
              ({shield.isTodayProfitableDayMet ? 'Today Qualified ✓' : 'In Progress'})
            </p>
          </div>

          {/* Red-Folder News Lockout & News Profit Cap */}
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FFFFFF] flex items-center gap-1.5">
                <Clock size={13} className={newsLockout.locked ? 'text-[#EF5350]' : 'text-[#26A69A]'} />
                <span>Red-Folder News Lock (±{profile.newsLockoutMinutes || 15}m)</span>
              </span>
              <span className={`font-mono font-bold ${newsLockout.locked ? 'text-[#EF5350]' : 'text-[#26A69A]'}`}>
                {newsLockout.locked ? 'LOCKED' : 'CLEAR ✓'}
              </span>
            </div>
            <p className="text-[11px] text-[#787B86]">
              {newsLockout.locked
                ? newsLockout.reason
                : activePreset.newsProfitCapPct > 0
                ? `No Red-Folder event nearby (±5m trades capped at ${activePreset.newsProfitCapPct}% profit)`
                : 'No High-Impact / FOMC news within lockout window'}
            </p>
          </div>

          {/* Friday NY Close Weekend Holding Alert */}
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FFFFFF]">Weekend Holding Policy</span>
              <span
                className={`font-mono font-bold ${
                  shield.isFridayWeekendHoldingAlert
                    ? 'text-amber-400'
                    : profile.weekendHoldingAllowed
                    ? 'text-[#26A69A]'
                    : 'text-[#D1D4DC]'
                }`}
              >
                {profile.weekendHoldingAllowed ? 'ALLOWED ✓' : 'CLOSE BEFORE FRI NY'}
              </span>
            </div>
            <p className="text-[11px] text-[#787B86]">
              {shield.isFridayWeekendHoldingAlert
                ? 'Friday NY Close Alert: Close all open trades before 16:45 EST today.'
                : profile.weekendHoldingAllowed
                ? `${activePreset.name} permits holding swing positions over the weekend.`
                : `${activePreset.name} requires flat positions before Friday NY close.`}
            </p>
          </div>

          {/* Inactivity Day Counter */}
          <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FFFFFF]">Inactivity Expiry Guard</span>
              <span
                className={`font-mono font-bold ${
                  shield.isInactivityWarning ? 'text-[#EF5350]' : 'text-[#26A69A]'
                }`}
              >
                {shield.daysUntilInactivityExpiry}d Remaining
              </span>
            </div>
            <p className="text-[11px] text-[#787B86]">
              Last Trade: <strong className="text-[#FFFFFF]">{shield.daysSinceLastTrade}d ago</strong> (Max{' '}
              {shield.inactivityLimitDays}-day inactivity limit)
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. FUNDED-ONLY A+ LIVE TRADE FEED (HONEST LIVE MARKET RULE)           */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-[12px] bg-[#131722] border border-[#1E222D] space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#26A69A]" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[#FFFFFF]">
                5. Funded-Only A+ Live Trade Feed ({selectedSymbol} · 15M)
              </h2>
            </div>
            <p className="text-[11px] text-[#787B86] mt-0.5">
              6-Point Pure ICT Live Candle Verification · Min 1:2.5 R:R · Protected SL Buffer · Zero Synthetic Setups
            </p>
          </div>

          {newsLockout.locked ? (
            <span className="px-2.5 py-1 rounded bg-[#EF5350]/15 border border-[#EF5350]/40 text-[#EF5350] font-mono text-[10px] font-bold">
              🔴 PROP NEWS LOCKOUT ACTIVE
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-[#26A69A]/15 border border-[#26A69A]/40 text-[#26A69A] font-mono text-[10px] font-bold">
              ● LIVE FEED ACTIVE
            </span>
          )}
        </div>

        {newsLockout.locked && (
          <div className="p-3 rounded-[10px] bg-[#EF5350]/10 border border-[#EF5350]/30 text-[#EF5350] text-xs space-y-1">
            <div>
              <strong>{newsLockout.reason}</strong> — Do not open or close funded positions until the window clears.
            </div>
            {newsLockout.newsProfitCapAlert && (
              <div className="text-amber-300 font-semibold">{newsLockout.newsProfitCapAlert}</div>
            )}
          </div>
        )}

        {shield.isDailySafetyShieldLocked ? (
          <div className="p-4 rounded-[10px] bg-[#0B0E14] border border-[#EF5350]/40 text-center text-xs text-[#787B86]">
            Funded-Only A+ Signals are paused for today because your{' '}
            <strong className="text-[#EF5350]">60% Internal Daily Safety Shield</strong> is active.
          </div>
        ) : fundedSetup ? (
          <div className="p-4 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${
                    fundedSetup.direction === 'LONG'
                      ? 'bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/40'
                      : 'bg-[#EF5350]/20 text-[#EF5350] border border-[#EF5350]/40'
                  }`}
                >
                  {fundedSetup.direction === 'LONG' ? 'BUY / LONG' : 'SELL / SHORT'}
                </span>
                <span className="font-bold text-sm text-[#FFFFFF]">{fundedSetup.symbolId}</span>
                <span className="text-xs font-mono text-[#787B86]">· {fundedSetup.model}</span>
              </div>

              <span className="px-2 py-0.5 rounded bg-[#131722] border border-[#26A69A]/40 text-[#26A69A] font-mono text-[10.5px] font-bold">
                A+ FUNDED-SAFE · 1:{fundedSetup.rrRatio} R:R
              </span>
            </div>

            {/* Price Levels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D]">
                <div className="text-[10px] text-[#787B86]">Entry Zone (OTE/FVG)</div>
                <div className="text-sm font-bold text-[#FFFFFF] mt-0.5">
                  {fmtPrice(fundedSetup.entryPrice, sym.digits)}
                </div>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#131722] border border-[#EF5350]/30">
                <div className="text-[10px] text-[#EF5350]">Protected SL (+1.5x ATR)</div>
                <div className="text-sm font-bold text-[#EF5350] mt-0.5">
                  {fmtPrice(fundedSetup.protectedSlPrice, sym.digits)}
                </div>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#131722] border border-[#1E222D]">
                <div className="text-[10px] text-[#26A69A]">TP1 (+1.5R · Move to BE)</div>
                <div className="text-sm font-bold text-[#26A69A] mt-0.5">
                  {fmtPrice(fundedSetup.tp1Price, sym.digits)}
                </div>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#131722] border border-[#26A69A]/30">
                <div className="text-[10px] text-[#26A69A]">Funded Target TP2 (1:{fundedSetup.rrRatio}R)</div>
                <div className="text-sm font-bold text-[#26A69A] mt-0.5">
                  {fmtPrice(fundedSetup.tp2Price, sym.digits)}
                </div>
              </div>
            </div>

            {/* Execution Checklist: When to Enter / When to Skip / Move to BE at +1R */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-[11px]">
              <div className="p-3 rounded-[8px] bg-[#131722] border border-[#1E222D] space-y-1.5">
                <div className="text-[#26A69A] font-bold uppercase font-mono text-[10.5px] flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  <span>When to Enter (Funded Checklist)</span>
                </div>
                <ul className="space-y-1 text-[#D1D4DC]">
                  {fundedSetup.checklist.whenToEnter.map((item, i) => (
                    <li key={i}>· {item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-[8px] bg-[#131722] border border-[#1E222D] space-y-1.5">
                <div className="text-[#EF5350] font-bold uppercase font-mono text-[10.5px] flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  <span>When to Skip (Capital Protection)</span>
                </div>
                <ul className="space-y-1 text-[#D1D4DC]">
                  {fundedSetup.checklist.whenToSkip.map((item, i) => (
                    <li key={i}>· {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-[8px] bg-[#26A69A]/10 border border-[#26A69A]/30 text-[11px] text-[#D1D4DC] flex items-start gap-2">
              <TrendingUp size={14} className="text-[#26A69A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#26A69A]">Move to Break-Even (BE) at +1R Rule: </strong>
                {fundedSetup.checklist.moveToBeAt1R}
              </div>
            </div>

            {onOpenTerminalSymbol && (
              <button
                type="button"
                onClick={() => onOpenTerminalSymbol(selectedSymbol)}
                className="w-full py-2.5 px-4 rounded-[10px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Open {selectedSymbol} Live Execution Chart</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF]">
              <Compass size={15} className="text-[#26A69A] shrink-0" />
              <span>Scanning Live Market — No A+ Institutional Setup Active Right Now (Protecting Capital)</span>
            </div>
            <p className="text-[11.5px] text-[#787B86] leading-relaxed">
              Live {selectedSymbol} (15M) candles are being monitored in real time. A Funded-Safe execution signal is generated
              strictly when all 6 Pure ICT institutional conditions align (HTF 4H/1H Bias, Confirmed Liquidity Sweep,
              Displacement MSS/CISD + FVG, OB/OTE Retracement, Protected SL beyond Sweep Wick + 1.5x ATR + Spread, and
              Clear News/Killzone Window).
            </p>
            {onOpenTerminalSymbol && (
              <button
                type="button"
                onClick={() => onOpenTerminalSymbol(selectedSymbol)}
                className="mt-1 px-3.5 py-2 rounded-[8px] bg-[#131722] border border-[#1E222D] hover:border-[#2A2E39] text-[#FFFFFF] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Inspect {selectedSymbol} Live Structure on Chart</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
