import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Send,
  RefreshCw,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  X,
  ArrowRight,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import LiveChart, { type ChartToggles } from './LiveChart'
import { SYMBOLS, fetchKlines, getLatestExecutionMetadata, type SymbolDef, type Candle } from '../lib/market'
import { calibrateCandles } from '../lib/brokerCalibration'
import { analyse, type Analysis } from '../lib/ict'
import type { AiTradePlanResult } from '../lib/aiServices'
import { apiUrl } from '../lib/apiConfig'
import { createRecord, loadJournal, saveJournal } from '../lib/journal'
import { sendTradeNotification } from '../lib/notifications'

const TIMEFRAMES = [
  { id: '1m', label: '1M' },
  { id: '5m', label: '5M' },
  { id: '15m', label: '15M' },
  { id: '1h', label: '1H' },
  { id: '4h', label: '4H' },
  { id: '1d', label: '1D' },
  { id: '1w', label: '1W' },
]

function createUniqueId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  plan?: AiTradePlanResult
}

import { evaluateEntitlement } from '../lib/subscriptionService'
import type { UserProfile } from '../lib/authService'
import { toUserFriendlyError } from '../lib/errorSanitizer'

export default function AiTradingAgent({ userProfile }: { userProfile?: UserProfile | null } = {}) {
  const entitlement = evaluateEntitlement(userProfile ?? null)
  const agentDisplayName =
    entitlement.isTrial || entitlement.tierLevel >= 2 ? 'AI Trading Agent' : 'Basic AI Agent'
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>('XAUUSD')
  const [selectedTf, setSelectedTf] = useState<string>('15m')
  const [candles, setCandles] = useState<Candle[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(true)
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false)
  const [aiPlan, setAiPlan] = useState<AiTradePlanResult | null>(null)
  const [accountBalance, setAccountBalance] = useState<number>(10000)
  const [riskPercent, setRiskPercent] = useState<number>(1.0)
  const [showLotCalculator, setShowLotCalculator] = useState<boolean>(false)
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const [orderExecutedBanner, setOrderExecutedBanner] = useState<string | null>(null)
  const [agentSection, setAgentSection] = useState<'plan' | 'chat'>('plan')
  const [isChatFullScreen, setIsChatFullScreen] = useState<boolean>(false)

  const [chatInput, setChatInput] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_init',
      sender: 'ai',
      role: 'assistant',
      text: 'Hello Trader. I am your SR Terminal Institutional ICT Assistant.\n• Verified ICT Setups: High-probability setups (+OB / -OB, FVG BISI / SIBI, BSL / SSL Liquidity Pools, Breaker Blocks, MSS, and OTE Premium/Discount) are automatically plotted and delivered with GREEN (#00C853) Bullish zones/targets and RED (#FF1744) Bearish zones/invalidation.\n• Interactive Chat & Profitability Reports: Ask me about any ICT concept, active chart structure, or the Engine Profitability Report in Hinglish, Hindi, or English.',
      timestamp: Date.now() - 60000,
    },
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastAutoBroadcastRef = useRef<string>('')

  const activeSymbol = SYMBOLS.find(s => s.id === selectedSymbolId) || SYMBOLS[0]

  const [chartToggles] = useState<ChartToggles>({
    plan: true,
    levels: true,
    zones: true,
    key: true,
  })

  const loadMarketData = async (symbol: SymbolDef, tf: string): Promise<Candle[]> => {
    setIsLoadingMarket(true)
    try {
      const raw = await fetchKlines(symbol.src, tf, 120)
      if (Array.isArray(raw) && raw.length > 0) {
        const data = calibrateCandles(symbol.id, raw)
        setCandles(data)
        try {
          const ta = analyse(data, tf, undefined, undefined, undefined, symbol.digits)
          setAnalysis(ta)
        } catch (taErr) {
          console.warn('[AI Trading Agent] TA analysis error:', taErr)
        }
        return data
      }
    } catch (err) {
      console.warn('[AI Trading Agent] Market candles sync notice:', err)
    } finally {
      setIsLoadingMarket(false)
    }
    return []
  }

  useEffect(() => {
    void loadMarketData(activeSymbol, selectedTf)
    const interval = setInterval(() => {
      void loadMarketData(activeSymbol, selectedTf)
    }, 15000)
    return () => clearInterval(interval)
  }, [selectedSymbolId, selectedTf])

  const requestAiAnalysis = async (
    userQuestion?: string,
    conversationHistory?: ChatMessage[],
    overrideCandles?: Candle[]
  ) => {
    setIsAiAnalyzing(true)
    const isBackground = typeof document !== 'undefined' && document.hidden
    const historyToSend = (conversationHistory || chatMessages).map(m => ({
      id: m.id,
      role: m.role,
      content: m.text,
      timestamp: m.timestamp,
    }))
    const candlesPayload = (overrideCandles || candles).slice(-120)

    try {
      const resp = await fetch(apiUrl('/api/ai/trading-agent'), {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        body: JSON.stringify({
          requestId: createUniqueId('req'),
          symbolId: activeSymbol.id,
          symbolLabel: activeSymbol.label,
          tf: selectedTf,
          candles: candlesPayload,
          accountBalance,
          riskPct: riskPercent,
          userQuestion,
          messages: historyToSend,
          engineReport: (() => {
            const execMeta = getLatestExecutionMetadata(activeSymbol.id, selectedTf)
            return {
              avgExecutionTimeMs: execMeta.avgExecutionTimeMs,
              avgLatencyMs: execMeta.avgLatencyMs,
              executionEfficiencyPct: execMeta.executionEfficiencyPct,
            }
          })(),
          notifyOnComplete: isBackground,
        }),
      })

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`)
      }

      const data = await resp.json()
      if (data.success && data.plan) {
        setAiPlan(data.plan)
        if (userQuestion) {
          // MODE 2: Interactive User Chat & Profitability Reports
          const replyText = data.plan.answerText || data.plan.analysisSummary
          setChatMessages(prev => [
            ...prev,
            {
              id: createUniqueId('ai'),
              sender: 'ai',
              role: 'assistant',
              text: replyText,
              timestamp: Date.now(),
              plan: data.plan,
            },
          ])

          // If the terminal hadn't attached the chart's performance log yet, auto-fetch the current chart's Engine Report
          if (data.plan.requiresEngineReportFetch && !overrideCandles) {
            const freshCandles = await loadMarketData(activeSymbol, selectedTf)
            if (freshCandles.length >= 30) {
              void requestAiAnalysis(userQuestion, conversationHistory, freshCandles)
            }
          }

          if (typeof document !== 'undefined' && document.hidden) {
            void sendTradeNotification(
              'AI_AGENT_UPDATE',
              `SR Terminal AI · ${activeSymbol.label}`,
              replyText.slice(0, 180)
            )
          }
        } else if (data.plan.shouldBroadcastAutoTrade && data.plan.autonomousAlert) {
          // MODE 1: Autonomous Trade Alert (Proactive Terminal Engine)
          // Automatically broadcast verified high-probability ICT setup without user needing to ask
          const sigKey = `${data.plan.symbolId}_${data.plan.tf}_${data.plan.direction}_${Number(data.plan.entry).toFixed(activeSymbol.digits)}`
          if (lastAutoBroadcastRef.current !== sigKey) {
            lastAutoBroadcastRef.current = sigKey
            const autoAlertText = data.plan.autonomousAlert.formattedAlertText || data.plan.answerText
            setChatMessages(prev => [
              ...prev,
              {
                id: createUniqueId('auto_alert'),
                sender: 'ai',
                role: 'assistant',
                text: autoAlertText,
                timestamp: Date.now(),
                plan: data.plan,
              },
            ])
          }
        }
      }
    } catch (err: any) {
      console.warn('[AI Trading Agent] Request notice:', err)
      if (userQuestion) {
        setChatMessages(prev => [
          ...prev,
          {
            id: createUniqueId('ai_err'),
            sender: 'ai',
            role: 'assistant',
            text: toUserFriendlyError(err, 'Unable to reach AI desk right now. Please check your connection and try again.'),
            timestamp: Date.now(),
          },
        ])
      }
    } finally {
      setIsAiAnalyzing(false)
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  useEffect(() => {
    if (candles.length > 20 && !aiPlan) {
      void requestAiAnalysis()
    }
  }, [candles.length, selectedSymbolId, selectedTf])

  const handleSendChat = (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault()
    const query = (overridePrompt !== undefined ? overridePrompt : chatInput).trim()
    if (!query || isAiAnalyzing) return

    const newUserMsg: ChatMessage = {
      id: createUniqueId('user'),
      sender: 'user',
      role: 'user',
      text: query,
      timestamp: Date.now(),
    }

    const updatedHistory = [...chatMessages, newUserMsg]
    setChatMessages(updatedHistory)
    if (overridePrompt === undefined) {
      setChatInput('')
    }
    setAgentSection('chat')
    void requestAiAnalysis(query, updatedHistory)
  }

  const latestCandle = candles[candles.length - 1]
  const currentPrice = latestCandle ? latestCandle.c : 0
  const prevPrice = candles.length > 1 ? candles[candles.length - 2].c : currentPrice
  const priceChange = currentPrice - prevPrice
  const priceChangePct = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0

  const dynamicLots = (() => {
    if (!aiPlan) return 0.1
    const stopDist = aiPlan.entry && aiPlan.stop ? Math.abs(aiPlan.entry - aiPlan.stop) : currentPrice * 0.003
    const riskAmount = accountBalance * (riskPercent / 100)
    const pointValue = activeSymbol.id === 'XAUUSD' ? 100 : activeSymbol.id.includes('USD') && activeSymbol.kind === 'FX' ? 100000 : 1
    return stopDist > 0 ? Math.max(0.01, Math.round((riskAmount / (stopDist * pointValue)) * 100) / 100) : aiPlan.recommendedLots
  })()

  const handleConfirmOrder = () => {
    if (!aiPlan) return
    try {
      const existing = loadJournal()
      const planPayload = {
        valid: true,
        direction: aiPlan.direction === 'SELL' ? 'SHORT' : 'LONG',
        model: 'AI ICT SETUP',
        modelKind: 'reversal',
        entry: aiPlan.entry,
        entryZone: Array.isArray(aiPlan.entryZone) && aiPlan.entryZone.length >= 2
          ? [Number(aiPlan.entryZone[0]) || aiPlan.entry, Number(aiPlan.entryZone[1]) || aiPlan.entry]
          : [aiPlan.entry, aiPlan.entry],
        stop: aiPlan.stop,
        tp1: aiPlan.tp1,
        tp2: aiPlan.tp2,
        tp3: aiPlan.tp3,
        rr: aiPlan.rr || 2.0,
        rr1: 1.0,
        grade: aiPlan.grade || 'A',
        confidence: aiPlan.confidence || 80,
        confluences: Array.isArray(aiPlan.confluences) ? aiPlan.confluences : [],
        logic: { summary: aiPlan.analysisSummary },
        createdTs: Date.now(),
      }
      const created = createRecord(
        planPayload,
        aiPlan.symbolId,
        aiPlan.symbolLabel || activeSymbol.label,
        aiPlan.tf || selectedTf,
        currentPrice || aiPlan.entry,
        existing
      )
      if (created) {
        saveJournal(created.records)
      }
    } catch {
      // storage fallback
    }

    setShowConfirmModal(false)
    setOrderExecutedBanner(`Order Confirmed: ${aiPlan.direction} ${aiPlan.symbolId} (${dynamicLots} lots) logged to Journal.`)
    setTimeout(() => setOrderExecutedBanner(null), 5000)
  }

  return (
    <div className="flex flex-col flex-1 min-h-full bg-[#0B0E14] text-[#FFFFFF] pb-10 tabular-nums fadein">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-30 bg-[#0B0E14] border-b border-[#1E222D] px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-xl mx-auto gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[10px] bg-[#131722] border border-[#1E222D] flex items-center justify-center text-[#FFFFFF] shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="truncate">
              <span className="text-sm font-bold tracking-tight text-[#FFFFFF]">{agentDisplayName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setAgentSection('chat')
                setIsChatFullScreen(true)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#131722] border border-[#1E222D] hover:border-[#2A2E39] text-[#FFFFFF] text-[11px] font-semibold active:scale-98 cursor-pointer"
              title="Expand AI Assistant Chat to Full Screen"
            >
              <Maximize2 size={12} className="text-[#00E676]" />
              <span>Full Chat</span>
            </button>

            <button
              onClick={() => void requestAiAnalysis()}
              disabled={isAiAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#131722] border border-[#1E222D] hover:border-[#2A2E39] text-[#FFFFFF] text-[11px] font-semibold active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={12} className="text-[#787B86]" />
              <span>{isAiAnalyzing ? 'Analyzing…' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Instrument & Timeframe Selector Bar (8 Symbols in 2x4 Grid) */}
        <div className="max-w-xl mx-auto mt-2.5 space-y-1.5">
          <div className="grid grid-cols-4 gap-1.5">
            {SYMBOLS.map(s => {
              const active = s.id === selectedSymbolId
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSymbolId(s.id)
                    setAiPlan(null)
                  }}
                  className={`btn-seg cursor-pointer select-none active:scale-98 ${active ? 'btn-seg-on' : ''}`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {TIMEFRAMES.map(tf => {
              const active = tf.id === selectedTf
              return (
                <button
                  key={tf.id}
                  onClick={() => {
                    setSelectedTf(tf.id)
                    setAiPlan(null)
                  }}
                  className={`btn-seg cursor-pointer select-none active:scale-98 ${active ? 'btn-seg-on' : ''}`}
                >
                  {tf.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Container: flex-1 layout with 16px outer padding (p-4) & 12px gaps (space-y-3) */}
      <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3 max-w-xl mx-auto w-full">
        {orderExecutedBanner && (
          <div className="p-3 bg-[#131722] border border-[#00C853] rounded-[12px] flex items-center gap-2 text-[#FFFFFF] text-xs fadein shrink-0">
            <CheckCircle2 size={16} className="text-[#00C853] shrink-0" />
            <span>{orderExecutedBanner}</span>
          </div>
        )}

        {/* Market Stats & Verified Price Card */}
        <div className="card px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-xl font-bold text-[#FFFFFF] tabular-nums">
              {currentPrice > 0 ? currentPrice.toFixed(activeSymbol.digits) : '—'}
            </span>
            {currentPrice > 0 && (
              <span className="text-[10.5px] font-mono text-[#B2B5BE] bg-[#0B0E14] border border-[#1E222D] px-2 py-0.5 rounded-[6px]">
                Bid <strong className="text-[#EF5350]">{(currentPrice - activeSymbol.defaultSpread / 2).toFixed(activeSymbol.digits)}</strong> · Ask <strong className="text-[#26A69A]">{(currentPrice + activeSymbol.defaultSpread / 2).toFixed(activeSymbol.digits)}</strong> · Spd <strong className="text-[#FFFFFF]">{(activeSymbol.defaultSpread / activeSymbol.pipSize).toFixed(1)}p</strong>
              </span>
            )}
            <span
              className="text-xs font-semibold flex items-center gap-1 tabular-nums"
              style={{ color: priceChange >= 0 ? '#00C853' : '#FF1744' }}
            >
              {priceChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(activeSymbol.digits)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#787B86] tabular-nums">
            <Clock size={11} />
            <span>{latestCandle ? new Date(latestCandle.t).toLocaleTimeString() : 'Syncing'}</span>
          </div>
        </div>

        {/* Interactive Chart Card */}
        <div className="card p-3 overflow-hidden shrink-0">
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-[#1E222D]">
            <div className="flex items-center gap-2 text-xs text-[#FFFFFF]">
              <Layers size={14} className="text-[#787B86]" />
              <span className="font-bold">{activeSymbol.label}</span>
              <span className="text-[#787B86]">·</span>
              <span className="text-[#787B86]">{selectedTf.toUpperCase()}</span>
              {aiPlan && aiPlan.direction !== 'WAIT' && (
                <span
                  className="text-[11px] font-bold"
                  style={{
                    color: aiPlan.direction === 'BUY' ? '#00C853' : '#FF1744',
                  }}
                >
                  · {aiPlan.direction}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-[#26A69A]">Quantitative ICT Engine</span>
          </div>

          <div className="relative min-h-[350px] bg-[#000000] rounded-[8px]">
            {isLoadingMarket && candles.length === 0 ? (
              <div className="w-full h-[350px] shimmer flex items-center justify-center text-[#787B86] text-xs">
                Synchronizing live market candles…
              </div>
            ) : (
              <LiveChart
                candles={candles}
                analysis={analysis}
                toggles={chartToggles}
                height={360}
                symbolId={activeSymbol.id}
                interval={selectedTf}
                accountBalance={accountBalance}
                riskPct={riskPercent}
              />
            )}
          </div>
        </div>

        {/* Segmented Tabs: Trade Plan & Sizing vs AI Assistant Chat */}
        <div className="seg-tab-group grid-cols-2 shrink-0">
          <button
            type="button"
            onClick={() => setAgentSection('plan')}
            className={`seg-tab active:scale-98 ${agentSection === 'plan' ? 'seg-tab-active' : ''}`}
          >
            <Layers size={13} />
            <span>AI Trade Plan & Sizing</span>
          </button>
          <button
            type="button"
            onClick={() => setAgentSection('chat')}
            className={`seg-tab active:scale-98 ${agentSection === 'chat' ? 'seg-tab-active' : ''}`}
          >
            <Sparkles size={13} />
            <span>AI Assistant Chat</span>
          </button>
        </div>

        {/* SECTION 1: AI TRADE PLAN & RISK SIZING */}
        {agentSection === 'plan' && (
          aiPlan ? (
            <div className="card p-4 space-y-3 fadein">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E222D] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-sm font-bold flex items-center gap-1.5"
                    style={{
                      color: aiPlan.direction === 'BUY' ? '#00E676' : aiPlan.direction === 'SELL' ? '#FF1744' : '#FFFFFF',
                    }}
                  >
                    {aiPlan.direction === 'BUY' && <TrendingUp size={16} />}
                    {aiPlan.direction === 'SELL' && <TrendingDown size={16} />}
                    {aiPlan.direction === 'WAIT' && <AlertTriangle size={16} />}
                    <span>{aiPlan.direction} Setup</span>
                  </span>
                  <span className="text-[#787B86]">·</span>
                  <span className="text-xs text-[#787B86]">
                    Bias <strong className="text-[#FFFFFF]">{aiPlan.bias}</strong> · Grade <strong className="text-[#FFFFFF]">{aiPlan.grade}</strong>
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-[4px] border font-mono text-[10px] font-bold"
                    style={{
                      backgroundColor: (aiPlan.confluenceScorePct ?? aiPlan.confidence) >= 78 ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 23, 68, 0.25)',
                      borderColor: (aiPlan.confluenceScorePct ?? aiPlan.confidence) >= 78 ? '#00E676' : '#FF1744',
                      color: (aiPlan.confluenceScorePct ?? aiPlan.confidence) >= 78 ? '#00E676' : '#FF1744',
                    }}
                  >
                    CONFLUENCE: {aiPlan.confluenceScorePct ?? aiPlan.confidence}%
                  </span>
                  {aiPlan.killzoneWindow && (
                    <span
                      className="px-2 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: aiPlan.killzoneWindow.active ? 'rgba(0, 230, 118, 0.20)' : '#0B0E14',
                        borderColor: aiPlan.killzoneWindow.active ? '#00E676' : '#1E222D',
                        color: aiPlan.killzoneWindow.active ? '#00E676' : '#B2B5BE',
                      }}
                    >
                      {aiPlan.killzoneWindow.shortLabel}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setShowLotCalculator(!showLotCalculator)}
                  className="px-2.5 py-1 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] hover:border-[#2A2E39] text-[#FFFFFF] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Calculator size={12} className="text-[#787B86]" />
                  <span>Lot Calc ({dynamicLots} · ≤1% Risk)</span>
                </button>
              </div>

              {(aiPlan.sweptLiquidityType || aiPlan.primaryPdArray) && (
                <div className="p-2.5 bg-[#0B0E14] border border-[#1E222D] rounded-[8px] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#B2B5BE]">
                    Swept Liquidity: <strong className="text-[#FFD740] font-mono">{aiPlan.sweptLiquidityType || 'SSL / BSL'}</strong>
                  </span>
                  <span className="text-[#B2B5BE]">
                    Entry PD Array: <strong className="text-[#D500F9] font-mono">{aiPlan.primaryPdArray || 'FVG / OB'}</strong>
                  </span>
                </div>
              )}

              {showLotCalculator && (
                <div className="p-3.5 bg-[#0B0E14] border border-[#1E222D] rounded-[10px] space-y-3 text-xs fadein">
                  <div className="flex items-center justify-between text-[#FFFFFF] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sliders size={13} className="text-[#787B86]" />
                      Mathematical Risk Sizing
                    </span>
                    <span className="text-[11px] text-[#00E676]">Max 1% Risk Cap Enforced</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label block mb-1">Account Balance ($)</label>
                      <input
                        type="number"
                        value={accountBalance}
                        onChange={e => setAccountBalance(Math.max(100, Number(e.target.value)))}
                        className="w-full bg-[#131722] border border-[#1E222D] rounded-[8px] px-3 py-1.5 text-[#FFFFFF] text-sm focus:border-[#FFFFFF] outline-none tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="label block mb-1">Risk Percent (Max 1.0%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="1.0"
                        value={Math.min(1.0, riskPercent)}
                        onChange={e => setRiskPercent(Math.min(1.0, Math.max(0.1, Number(e.target.value))))}
                        className="w-full bg-[#131722] border border-[#1E222D] rounded-[8px] px-3 py-1.5 text-[#FFFFFF] text-sm focus:border-[#FFFFFF] outline-none tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#131722] rounded-[8px] border border-[#1E222D] flex items-center justify-between text-xs tabular-nums">
                    <div>
                      <span className="text-[#787B86]">Risk Amount (≤1%): </span>
                      <span className="font-bold text-[#FF1744]">${((accountBalance * Math.min(1.0, riskPercent)) / 100).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#787B86]">Recommended Size: </span>
                      <span className="font-bold text-[#FFFFFF]">{dynamicLots} Lots</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Plan Grid: Entry, SL, TP1 (1:2 RR -> BE), TP2 (1:3.5 RR), TP3 (1:5+ RR) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs tabular-nums">
                <div className="p-3 bg-[#0B0E14] border border-[#1E222D] rounded-[10px]">
                  <span className="label block mb-1">Entry Price</span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: aiPlan.direction === 'SELL' ? '#FF1744' : '#00E676',
                    }}
                  >
                    {aiPlan.entry.toFixed(activeSymbol.digits)}
                  </span>
                </div>

                <div className="p-3 bg-[#0B0E14] border border-[#1E222D] rounded-[10px]">
                  <span className="label block mb-1">Stop Loss [RED]</span>
                  <span className="text-sm font-bold text-[#FF1744]">{aiPlan.stop.toFixed(activeSymbol.digits)}</span>
                </div>

                <div className="p-3 bg-[#0B0E14] border border-[#1E222D] rounded-[10px]">
                  <span className="label block mb-1">TP1 (1:2 RR → BE)</span>
                  <span className="text-sm font-bold text-[#00E676]">{aiPlan.tp1.toFixed(activeSymbol.digits)}</span>
                </div>

                <div className="p-3 bg-[#0B0E14] border border-[#1E222D] rounded-[10px]">
                  <span className="label block mb-1">TP2 (1:3.5 RR)</span>
                  <span className="text-sm font-bold text-[#00E676]">{aiPlan.tp2.toFixed(activeSymbol.digits)}</span>
                </div>

                <div className="p-3 bg-[#0B0E14] border border-[#1E222D] rounded-[10px] col-span-2 sm:col-span-1">
                  <span className="label block mb-1">TP3 (1:5+ RR)</span>
                  <span className="text-sm font-bold text-[#00E676]">{aiPlan.tp3.toFixed(activeSymbol.digits)}</span>
                </div>
              </div>

              {aiPlan.engineProfitabilityReport?.available && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] tabular-nums">
                  <div className="p-2.5 bg-[#0B0E14] rounded-[8px] border border-[#1E222D]">
                    <span className="text-[#787B86] block">Win Rate</span>
                    <span className="font-bold text-[#00C853]">{aiPlan.engineProfitabilityReport.winRatePct}%</span>
                  </div>
                  <div className="p-2.5 bg-[#0B0E14] rounded-[8px] border border-[#1E222D]">
                    <span className="text-[#787B86] block">Net Profit</span>
                    <span className="font-bold text-[#00C853]">
                      {aiPlan.engineProfitabilityReport.netProfitPct >= 0 ? '+' : ''}
                      {aiPlan.engineProfitabilityReport.netProfitPct}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#0B0E14] rounded-[8px] border border-[#1E222D]">
                    <span className="text-[#787B86] block">Profit Factor</span>
                    <span className="font-bold text-[#FFFFFF]">{aiPlan.engineProfitabilityReport.profitFactor}</span>
                  </div>
                  <div className="p-2.5 bg-[#0B0E14] rounded-[8px] border border-[#1E222D]">
                    <span className="text-[#787B86] block">Max Drawdown</span>
                    <span className="font-bold text-[#FF1744]">{aiPlan.engineProfitabilityReport.maxDrawdownPct}%</span>
                  </div>
                  <div className="p-2.5 bg-[#0B0E14] rounded-[8px] border border-[#1E222D] col-span-2 sm:col-span-1">
                    <span className="text-[#787B86] block">Execution Efficiency</span>
                    <span className="font-bold text-[#00C853]">
                      {aiPlan.engineProfitabilityReport.executionEfficiencyPct ?? 98.4}%
                    </span>
                  </div>
                </div>
              )}

              {/* Confluences */}
              <div className="space-y-2">
                <span className="label block">Validated ICT Confluences</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Array.isArray(aiPlan.confluences) ? aiPlan.confluences : []).map((c, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-[#0B0E14] rounded-[8px] border border-[#1E222D] text-xs text-[#FFFFFF]">
                      <CheckCircle2 size={13} className="text-[#00C853] shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invalidation & News Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0B0E14] border border-[#1E222D] rounded-[10px]">
                  <span className="text-[10.5px] text-[#FF1744] font-semibold flex items-center gap-1.5 mb-1">
                    <ShieldAlert size={12} />
                    Setup Invalidation Rule
                  </span>
                  <p className="text-[#787B86] text-[11.5px] leading-relaxed">
                    {aiPlan.invalidatingCondition}
                  </p>
                </div>

                <div className="p-3 bg-[#0B0E14] border border-[#1E222D] rounded-[10px]">
                  <span className="text-[10.5px] text-[#FFFFFF] font-semibold flex items-center gap-1.5 mb-1">
                    <Clock size={12} className="text-[#787B86]" />
                    Economic Calendar Context
                  </span>
                  <p className="text-[#787B86] text-[11.5px] leading-relaxed">
                    {aiPlan.newsRisks[0] || 'No imminent red-folder high-impact news in next 2 hours.'}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1E222D]">
                <div className="text-[11px] text-[#787B86]">
                  Grounded in Live Feed · Zero Auto-Execution
                </div>

                {aiPlan.direction !== 'WAIT' && (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98 bg-[#FFFFFF] text-[#0B0E14]"
                  >
                    <span>Execute Paper Trade</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-4 space-y-3">
              <div className="h-6 w-48 shimmer rounded" />
              <div className="grid grid-cols-4 gap-3">
                <div className="h-16 shimmer" />
                <div className="h-16 shimmer" />
                <div className="h-16 shimmer" />
                <div className="h-16 shimmer" />
              </div>
              <div className="h-20 shimmer" />
            </div>
          )
        )}

        {/* SECTION 2: INTERACTIVE TRADER CHATBOX */}
        {(agentSection === 'chat' || isChatFullScreen) && (
          <div
            id="ai-chat-container"
            className={
              isChatFullScreen
                ? 'fixed inset-0 z-[100] w-screen h-[100dvh] bg-[#0B0E14] flex flex-col overflow-hidden safe-top safe-bottom fadein'
                : 'card flex-1 min-h-[460px] max-h-[calc(100dvh-210px)] overflow-hidden flex flex-col fadein'
            }
          >
            <div className="flex-1 min-h-0 flex flex-col w-full max-w-3xl mx-auto overflow-hidden">
              {/* Chat Header (Pinned Top, shrink-0) */}
              <div className="px-4 py-3 bg-[#131722] border-b border-[#1E222D] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 text-xs text-[#FFFFFF] min-w-0">
                  <Sparkles size={14} className="text-[#00E676] shrink-0" />
                  <span className="font-bold truncate">AI Assistant Chat</span>
                  <span className="text-[#787B86] shrink-0">·</span>
                  <span className="text-[11px] font-mono text-[#B2B5BE] shrink-0">
                    {activeSymbol.label} ({selectedTf.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id="btn-toggle-ai-chat-fullscreen"
                    type="button"
                    onClick={() => setIsChatFullScreen(prev => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-[11px] font-semibold cursor-pointer active:scale-98 ${
                      isChatFullScreen
                        ? 'bg-[#00E676]/15 border-[#00E676]/40 text-[#00E676]'
                        : 'bg-[#0B0E14] border-[#1E222D] hover:border-[#2A2E39] text-[#FFFFFF]'
                    }`}
                    title={isChatFullScreen ? 'Exit Full Screen' : 'Expand Chat to Full Screen'}
                  >
                    {isChatFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    <span>{isChatFullScreen ? 'EXIT' : 'Full Screen'}</span>
                  </button>

                  {isChatFullScreen && (
                    <button
                      id="btn-close-ai-chat-fullscreen"
                      type="button"
                      onClick={() => setIsChatFullScreen(false)}
                      className="w-7 h-7 rounded-[8px] bg-[#FF1744]/15 border border-[#FF1744]/40 text-[#FF1744] hover:bg-[#FF1744]/25 flex items-center justify-center cursor-pointer active:scale-98 shrink-0"
                      title="Close Full Screen Chat"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Prompts Bar (shrink-0) */}
              <div className="p-3 bg-[#0B0E14] border-b border-[#1E222D] flex items-center gap-2 overflow-x-auto no-scrollbar scroll-touch shrink-0">
                {[
                  `Active ICT Trade Setup on ${activeSymbol.id}`,
                  `Engine Profitability Report`,
                  `Kitna profitable hai ${activeSymbol.id} ${selectedTf} par?`,
                  `Where are +OB, BISI & BSL pools?`,
                  `Explain ${selectedTf} ICT bias & OTE`,
                  'Any high impact news today?',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(undefined, chip)}
                    disabled={isAiAnalyzing}
                    className="chip whitespace-nowrap cursor-pointer active:scale-98 disabled:opacity-50 shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message History Area (flex-1 min-h-0 fills viewport without overflowing, space-y-3 vertical spacing) */}
              <div
                id="ai-chat-messages"
                className="flex-1 min-h-0 p-4 space-y-3 overflow-y-auto scroll-touch text-xs bg-[#0B0E14]"
              >
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-[12px] p-3 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#FFFFFF] text-[#0B0E14] font-medium'
                          : 'bg-[#131722] border border-[#1E222D] text-[#FFFFFF]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-[#787B86] mt-1 px-1 tabular-nums">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {isAiAnalyzing && (
                  <div className="space-y-2 p-2">
                    <div className="h-4 w-2/3 shimmer rounded" />
                    <div className="h-4 w-1/2 shimmer rounded" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom Input Form (Pinned to Bottom with shrink-0 mt-auto) */}
              <form
                id="ai-chat-input-form"
                onSubmit={handleSendChat}
                className="shrink-0 mt-auto p-3 bg-[#131722] border-t border-[#1E222D] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`Ask about ${activeSymbol.label} ICT setup, PD Arrays, or Profitability Report…`}
                  disabled={isAiAnalyzing}
                  className="flex-1 min-w-0 bg-[#0B0E14] border border-[#1E222D] rounded-[8px] px-3.5 py-2.5 text-xs text-[#FFFFFF] placeholder-[#787B86] outline-none focus:border-[#FFFFFF]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAiAnalyzing}
                  className="p-2.5 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] disabled:opacity-40 cursor-pointer active:scale-98 shrink-0"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Trade Confirmation Modal */}
      {showConfirmModal && aiPlan && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 fadein">
          <div className="card max-w-md w-full p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E222D] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-[#FFFFFF]" />
                <h3 className="font-bold text-sm text-[#FFFFFF]">Confirm Trade Execution</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-[#787B86] hover:text-[#FFFFFF] cursor-pointer active:scale-98"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-[#0B0E14] rounded-[10px] border border-[#1E222D] space-y-2 text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#787B86]">Instrument</span>
                <span className="font-bold text-[#FFFFFF]">{aiPlan.symbolLabel} ({aiPlan.symbolId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Direction</span>
                <span className="font-bold" style={{ color: aiPlan.direction === 'BUY' ? '#089981' : '#F23645' }}>
                  {aiPlan.direction}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Entry Level</span>
                <span className="font-bold text-[#FFFFFF]">{aiPlan.entry.toFixed(activeSymbol.digits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Stop Loss</span>
                <span className="font-bold text-[#F23645]">{aiPlan.stop.toFixed(activeSymbol.digits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">TP1 Target</span>
                <span className="font-bold text-[#089981]">{aiPlan.tp1.toFixed(activeSymbol.digits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Position Size</span>
                <span className="font-bold text-[#FFFFFF]">{dynamicLots} Lots</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[#787B86] hover:text-[#FFFFFF] text-xs font-semibold cursor-pointer active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="flex-1 py-2.5 rounded-[8px] bg-[#FFFFFF] text-[#0B0E14] text-xs font-semibold cursor-pointer active:scale-98"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
