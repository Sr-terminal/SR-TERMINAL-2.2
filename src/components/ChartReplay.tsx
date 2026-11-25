import { useEffect, useRef, useState, useMemo, type FormEvent } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineStyle,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Clock,
  Calendar,
  Layers,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Maximize2,
  Minimize2,
  Download,
  Trash2,
  Check,
  Compass,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  BarChart2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { SYMBOLS, symbolById, fmtPrice, type Candle, type SymbolDef } from '../lib/market'
import { CONCEPTS, type ConceptSelection } from '../lib/concepts'
import {
  REPLAY_INTERVALS,
  fetchHistoricalReplayFeed,
  formatToISTString,
  parseISTToTimestamp,
  evaluateReplayStep,
  calculateBacktestStats,
  type ReplayTrade,
  type BacktestSummaryStats,
} from '../lib/replayService'
import type { Analysis } from '../lib/ict'

interface ChartReplayProps {
  initialSymbolId?: string
  initialIntervalId?: string
  initialFullScreen?: boolean
  onClose: () => void
}

type ReplayMode = 'AUTOMATED' | 'MANUAL'
type ActiveTab = 'METRICS' | 'TRADES' | 'CONCEPTS' | 'CONFIG'
type DrawerTab = 'CONTROLS' | 'CONCEPTS' | 'RESULTS'

export default function ChartReplay({
  initialSymbolId = 'XAUUSD',
  initialIntervalId = '15m',
  initialFullScreen = false,
  onClose,
}: ChartReplayProps) {
  // 1. Replay Feed Setup State
  const [symbolId, setSymbolId] = useState(initialSymbolId)
  const [intervalId, setIntervalId] = useState(initialIntervalId)
  const sym: SymbolDef = symbolById(symbolId)

  // Default historical date to 3 days ago in IST
  const [selectedDateIST, setSelectedDateIST] = useState(() => {
    const d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [selectedTimeIST, setSelectedTimeIST] = useState('09:30')

  // Feed status
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [allCandles, setAllCandles] = useState<Candle[]>([])
  const [startIndex, setStartIndex] = useState<number>(0)
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // 2. Playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1) // 0.5x, 1x, 2x, 5x, 10x

  // 3. Operational Mode: Automated Replay vs Manual Backtest
  const [replayMode, setReplayMode] = useState<ReplayMode>('AUTOMATED')

  // Full Screen & Layout State
  const [isFullScreen, setIsFullScreen] = useState(initialFullScreen)
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > window.innerHeight
    }
    return false
  })
  const [sidePanelOpen, setSidePanelOpen] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('CONTROLS')

  // 4. Multiple Concept Selection
  // User can select 1, 2, 3, or all 14 SR concepts
  const [selectedConceptKeys, setSelectedConceptKeys] = useState<string[]>(() =>
    CONCEPTS.map((c) => c.key)
  )

  // Active concept selection object passed to the existing SR engine
  const conceptSelection = useMemo<ConceptSelection>(() => {
    const keys: Record<string, boolean> = {}
    for (const c of CONCEPTS) {
      keys[c.key] = selectedConceptKeys.includes(c.key)
    }
    return { mode: 'BALANCED', keys }
  }, [selectedConceptKeys])

  // 5. Manual Backtesting Trade Inputs
  const [manualDirection, setManualDirection] = useState<'LONG' | 'SHORT'>('LONG')
  const [manualEntryPrice, setManualEntryPrice] = useState<string>('')
  const [manualStopLoss, setManualStopLoss] = useState<string>('')
  const [manualTakeProfit, setManualTakeProfit] = useState<string>('')
  const [manualTradeError, setManualTradeError] = useState<string | null>(null)

  // Backtested trades and results
  const [trades, setTrades] = useState<ReplayTrade[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('METRICS')
  const [tradeLogFilter, setTradeLogFilter] = useState<'ALL' | 'WINS' | 'LOSSES' | 'OPEN' | 'MANUAL'>('ALL')

  // Lightweight chart refs
  const containerRef = useRef<HTMLDivElement>(null)
  const chartBoxRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const linesRef = useRef<unknown[]>([])
  const playTimerRef = useRef<any>(null)

  // Current visible candle
  const currentCandle = allCandles[currentIndex]
  const currentIST = currentCandle ? formatToISTString(currentCandle.t) : null

  // Monitor screen orientation dynamically for responsive layout adjustment
  useEffect(() => {
    const handleOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight
      setIsLandscape(landscape)
      resizeChart()
    }
    window.addEventListener('resize', handleOrientation)
    window.addEventListener('orientationchange', handleOrientation)
    return () => {
      window.removeEventListener('resize', handleOrientation)
      window.removeEventListener('orientationchange', handleOrientation)
    }
  }, [])

  // Pre-fill manual trade entry price whenever currentCandle changes and entry is empty or user requests
  useEffect(() => {
    if (currentCandle && (!manualEntryPrice || replayMode === 'MANUAL')) {
      const price = currentCandle.c
      setManualEntryPrice(price.toFixed(sym.digits))
      const offset = sym.id === 'XAUUSD' ? 5.0 : price * 0.003
      if (manualDirection === 'LONG') {
        setManualStopLoss((price - offset).toFixed(sym.digits))
        setManualTakeProfit((price + offset * 2).toFixed(sym.digits))
      } else {
        setManualStopLoss((price + offset).toFixed(sym.digits))
        setManualTakeProfit((price - offset * 2).toFixed(sym.digits))
      }
    }
  }, [currentIndex, currentCandle, manualDirection, sym.digits, sym.id, replayMode])

  // Initial load of historical feed
  useEffect(() => {
    void handleLoadFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Function to load real historical market feed
  const handleLoadFeed = async () => {
    setIsPlaying(false)
    if (playTimerRef.current) clearInterval(playTimerRef.current)

    setFeedLoading(true)
    setFeedError(null)

    try {
      const targetTs = parseISTToTimestamp(selectedDateIST, selectedTimeIST)
      const res = await fetchHistoricalReplayFeed(symbolId, intervalId, targetTs)

      setAllCandles(res.candles)
      setStartIndex(res.startIndex)
      setCurrentIndex(res.startIndex)
      setTrades([])

      // Initial step analysis at start index (strict historical slice, no future data!)
      const visible = res.candles.slice(0, res.startIndex + 1)
      const evalRes = evaluateReplayStep(
        visible,
        res.startIndex,
        intervalId,
        sym,
        conceptSelection,
        [],
        replayMode === 'AUTOMATED'
      )
      setAnalysis(evalRes.analysis)
      setTrades(evalRes.updatedTrades)
    } catch (err: any) {
      setFeedError(err?.message || 'Failed to fetch historical candles.')
    } finally {
      setFeedLoading(false)
    }
  }

  // Step Forward (Reveal next single candle)
  const stepForward = () => {
    if (allCandles.length === 0) return
    if (currentIndex >= allCandles.length - 1) {
      setIsPlaying(false)
      return
    }

    const nextIdx = currentIndex + 1
    setCurrentIndex(nextIdx)

    const visible = allCandles.slice(0, nextIdx + 1)
    const evalRes = evaluateReplayStep(
      visible,
      nextIdx,
      intervalId,
      sym,
      conceptSelection,
      trades,
      replayMode === 'AUTOMATED'
    )
    setAnalysis(evalRes.analysis)
    setTrades(evalRes.updatedTrades)
  }

  // Step Backward (Roll back 1 candle)
  const stepBackward = () => {
    if (allCandles.length === 0 || currentIndex <= startIndex) return
    setIsPlaying(false)

    const prevIdx = currentIndex - 1
    setCurrentIndex(prevIdx)

    const visible = allCandles.slice(0, prevIdx + 1)
    const validTrades = trades.filter((t) => t.candleIndex <= prevIdx)

    const evalRes = evaluateReplayStep(
      visible,
      prevIdx,
      intervalId,
      sym,
      conceptSelection,
      validTrades,
      false
    )
    setAnalysis(evalRes.analysis)
    setTrades(evalRes.updatedTrades)
  }

  // Jump to specific index using scrubber slider
  const handleSeek = (newIndex: number) => {
    if (allCandles.length === 0) return
    setIsPlaying(false)

    const targetIdx = Math.max(startIndex, Math.min(newIndex, allCandles.length - 1))
    setCurrentIndex(targetIdx)

    const visible = allCandles.slice(0, targetIdx + 1)
    const validTrades = trades.filter((t) => t.candleIndex <= targetIdx)

    const evalRes = evaluateReplayStep(
      visible,
      targetIdx,
      intervalId,
      sym,
      conceptSelection,
      validTrades,
      replayMode === 'AUTOMATED'
    )
    setAnalysis(evalRes.analysis)
    setTrades(evalRes.updatedTrades)
  }

  // Reset back to start of replay window
  const handleReset = () => {
    setIsPlaying(false)
    if (playTimerRef.current) clearInterval(playTimerRef.current)

    if (allCandles.length === 0) return
    setCurrentIndex(startIndex)
    setTrades([])

    const visible = allCandles.slice(0, startIndex + 1)
    const evalRes = evaluateReplayStep(
      visible,
      startIndex,
      intervalId,
      sym,
      conceptSelection,
      [],
      replayMode === 'AUTOMATED'
    )
    setAnalysis(evalRes.analysis)
    setTrades(evalRes.updatedTrades)
  }

  // Play / Pause loop
  useEffect(() => {
    if (isPlaying) {
      const ms = Math.max(100, Math.floor(1000 / playbackSpeed))
      playTimerRef.current = setInterval(() => {
        stepForward()
      }, ms)
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, playbackSpeed, currentIndex, allCandles, trades, conceptSelection, replayMode])

  // Responsive chart resizing handler
  const resizeChart = () => {
    if (!chartRef.current || !chartBoxRef.current) return
    const w = chartBoxRef.current.clientWidth
    let h = chartBoxRef.current.clientHeight
    if (isFullScreen && h < 250) {
      h = Math.max(350, window.innerHeight - 80)
    }
    if (w > 0 && h > 0) {
      chartRef.current.applyOptions({ width: w, height: h })
    }
  }

  // Helper to sync candle and line data into candlestick series
  const syncChartData = (targetSeries?: ISeriesApi<'Candlestick'> | null) => {
    const s = targetSeries || seriesRef.current
    if (!s || allCandles.length === 0) return

    // FUTURE BARS ARE NEVER RENDERED OR EXPOSED!
    const visibleData = allCandles.slice(0, currentIndex + 1)
    const formatted = visibleData
      .map((k) => ({
        time: (k.t / 1000) as UTCTimestamp,
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
      }))
      .filter((v, i, arr) => i === 0 || v.time !== arr[i - 1].time)

    s.setData(formatted)

    // Clear old lines
    for (const line of linesRef.current as any[]) {
      try {
        s.removePriceLine(line)
      } catch {}
    }
    linesRef.current = []

    // Draw thin dotted #CCCCCC current price line with #E0E0E0 background and #000000 black text on Y-axis
    const latestVisibleBar = formatted[formatted.length - 1]
    if (latestVisibleBar) {
      try {
        const curPriceLine = s.createPriceLine({
          price: latestVisibleBar.close,
          color: '#CCCCCC',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          axisLabelColor: '#E0E0E0',
          axisLabelTextColor: '#000000',
          title: '',
        })
        linesRef.current.push(curPriceLine)
      } catch {}
    }

    // 1. Draw Active Trade lines (Automated or Manual) using Institutional Bias Colors (#00C853 Green / #FF1744 Red)
    const openTrade = trades.find((t) => t.status === 'OPEN')
    if (openTrade) {
      try {
        const isLong = openTrade.direction === 'LONG'
        const entryLine = s.createPriceLine({
          price: openTrade.entryPrice,
          color: isLong ? '#00C853' : '#FF1744',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `ENTRY (${openTrade.direction})`,
        })
        const slLine = s.createPriceLine({
          price: openTrade.stopLoss,
          color: '#FF1744',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'SL (INVALIDATION)',
        })
        const tpLine = s.createPriceLine({
          price: openTrade.takeProfit1,
          color: '#00C853',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'TP1 (BSL)',
        })
        linesRef.current.push(entryLine, slLine, tpLine)
      } catch {}
    } else if (analysis?.plan && analysis.plan.valid) {
      // 2. Draw Potential Plan setup lines
      try {
        const p = analysis.plan
        const isLong = p.direction === 'LONG' || p.direction === 'BUY'
        if (p.entry > 0) {
          const entryLine = s.createPriceLine({
            price: p.entry,
            color: isLong ? '#00C853' : '#FF1744',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: true,
            title: `POTENTIAL ${p.direction}`,
          })
          linesRef.current.push(entryLine)
        }
        if (p.stop > 0) {
          const slLine = s.createPriceLine({
            price: p.stop,
            color: '#FF1744',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'PLAN SL',
          })
          linesRef.current.push(slLine)
        }
        const tpTarget = p.tp1 || p.target1 || 0
        if (tpTarget > 0) {
          const tpLine = s.createPriceLine({
            price: tpTarget,
            color: '#00C853',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'PLAN TP1 (BSL)',
          })
          linesRef.current.push(tpLine)
        }
      } catch {}
    }

    // 3. Draw ICT PD Arrays (BSL / SSL / FVG BISI & SIBI / +OB & -OB)
    if (analysis?.levels) {
      try {
        const bslArr = Array.isArray(analysis.levels.bsl)
          ? analysis.levels.bsl
          : analysis.levels.bsl > 0
            ? [analysis.levels.bsl]
            : []
        bslArr.slice(0, 2).forEach((price: number, idx: number) => {
          if (price > 0) {
            linesRef.current.push(
              s.createPriceLine({
                price,
                color: '#00C853',
                lineWidth: idx === 0 ? 2 : 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: idx === 0,
                title: idx === 0 ? 'BSL POOL' : 'BSL',
              })
            )
          }
        })

        const sslArr = Array.isArray(analysis.levels.ssl)
          ? analysis.levels.ssl
          : analysis.levels.ssl > 0
            ? [analysis.levels.ssl]
            : []
        sslArr.slice(0, 2).forEach((price: number, idx: number) => {
          if (price > 0) {
            linesRef.current.push(
              s.createPriceLine({
                price,
                color: '#FF1744',
                lineWidth: idx === 0 ? 2 : 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: idx === 0,
                title: idx === 0 ? 'SSL POOL' : 'SSL',
              })
            )
          }
        })

        analysis.levels.fvgZones?.slice(0, 3).forEach((z: { dir: string; top: number; bottom: number }) => {
          const mid = (z.top + z.bottom) / 2
          if (mid > 0) {
            const isBull = z.dir === 'bull'
            linesRef.current.push(
              s.createPriceLine({
                price: mid,
                color: isBull ? '#00C853' : '#FF1744',
                lineWidth: 1,
                lineStyle: LineStyle.LargeDashed,
                axisLabelVisible: false,
                title: isBull ? 'FVG (BISI)' : 'FVG (SIBI)',
              })
            )
          }
        })

        analysis.levels.obZones?.slice(0, 2).forEach((z: { dir: string; top: number; bottom: number }) => {
          const mid = (z.top + z.bottom) / 2
          if (mid > 0) {
            const isBull = z.dir === 'bull'
            linesRef.current.push(
              s.createPriceLine({
                price: mid,
                color: isBull ? '#00C853' : '#FF1744',
                lineWidth: 1,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: false,
                title: isBull ? '+OB' : '-OB',
              })
            )
          }
        })
      } catch {}
    }
  }

  // Trigger resize when layout state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      resizeChart()
    }, 60)
    return () => clearTimeout(timer)
  }, [isFullScreen, isLandscape, sidePanelOpen, drawerOpen, drawerTab])

  // Initialize Lightweight Charts
  useEffect(() => {
    if (!chartBoxRef.current) return

    const initialWidth = chartBoxRef.current.clientWidth || 320
    const initialHeight = chartBoxRef.current.clientHeight || (isFullScreen ? Math.max(350, window.innerHeight - 80) : 420)

    const istTimeFmt = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const istDateTimeFmt = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const c = createChart(chartBoxRef.current, {
      width: initialWidth,
      height: initialHeight,
      localization: {
        timeFormatter: (timestamp: number) => {
          try {
            return `${istDateTimeFmt.format(new Date(timestamp * 1000))} (UTC+5:30)`
          } catch {
            return String(timestamp)
          }
        },
      },
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#EAEAEA',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(0, 0, 0, 0)', visible: false },
        horzLines: { color: 'rgba(0, 0, 0, 0)', visible: false },
      },
      rightPriceScale: {
        borderColor: '#1E222D',
        textColor: '#EAEAEA',
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: '#1E222D',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
        barSpacing: 6,
        minBarSpacing: 1,
        tickMarkFormatter: (time: number) => {
          try {
            return istTimeFmt.format(new Date(time * 1000))
          } catch {
            return ''
          }
        },
      },
      crosshair: {
        vertLine: {
          color: '#CCCCCC',
          width: 1,
          style: LineStyle.Dotted,
          labelBackgroundColor: '#E0E0E0',
        },
        horzLine: {
          color: '#CCCCCC',
          width: 1,
          style: LineStyle.Dotted,
          labelBackgroundColor: '#E0E0E0',
        },
      },
    })

    // Monochrome Black-and-White Institutional Candlestick Theme
    const s = c.addSeries(CandlestickSeries, {
      upColor: '#FFFFFF',
      downColor: '#000000',
      borderVisible: true,
      borderUpColor: '#B2B5BE',
      borderDownColor: '#B2B5BE',
      wickVisible: true,
      wickUpColor: '#B2B5BE',
      wickDownColor: '#B2B5BE',
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: 'price',
      },
    })

    chartRef.current = c
    seriesRef.current = s

    // Immediately render current historical candle data into newly created series!
    syncChartData(s)

    const ro = new ResizeObserver(() => {
      resizeChart()
    })
    ro.observe(chartBoxRef.current)

    const onResize = () => resizeChart()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      ro.disconnect()
      c.remove()
      chartRef.current = null
      seriesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen])

  // Update chart data whenever currentIndex or layout changes (STRICT HISTORICAL BARRIER)
  useEffect(() => {
    syncChartData()
  }, [currentIndex, allCandles, trades, analysis, isFullScreen])

  // Execute a Manual Trade at current historical bar
  const handleExecuteManualTrade = (e: FormEvent) => {
    e.preventDefault()
    setManualTradeError(null)

    if (!currentCandle) {
      setManualTradeError('No historical candle available. Please load feed.')
      return
    }

    const openTrade = trades.find((t) => t.status === 'OPEN')
    if (openTrade) {
      setManualTradeError('Another trade is currently OPEN. Close it first before entering a new one.')
      return
    }

    const entry = parseFloat(manualEntryPrice)
    const sl = parseFloat(manualStopLoss)
    const tp = parseFloat(manualTakeProfit)

    if (isNaN(entry) || entry <= 0) {
      setManualTradeError('Please enter a valid Entry price.')
      return
    }
    if (isNaN(sl) || sl <= 0) {
      setManualTradeError('Please enter a valid Stop Loss price.')
      return
    }
    if (isNaN(tp) || tp <= 0) {
      setManualTradeError('Please enter a valid Take Profit price.')
      return
    }

    if (manualDirection === 'LONG') {
      if (sl >= entry) {
        setManualTradeError('For a LONG trade, Stop Loss must be lower than Entry price.')
        return
      }
      if (tp <= entry) {
        setManualTradeError('For a LONG trade, Take Profit must be higher than Entry price.')
        return
      }
    } else {
      if (sl <= entry) {
        setManualTradeError('For a SHORT trade, Stop Loss must be higher than Entry price.')
        return
      }
      if (tp >= entry) {
        setManualTradeError('For a SHORT trade, Take Profit must be lower than Entry price.')
        return
      }
    }

    const ist = formatToISTString(currentCandle.t)
    const activeConceptLabels = selectedConceptKeys.map((k) => CONCEPTS.find((c) => c.key === k)?.label || k)

    const newManualTrade: ReplayTrade = {
      id: `manual_${Date.now()}_${currentIndex}`,
      candleIndex: currentIndex,
      entryTimestamp: currentCandle.t,
      dateStrIST: ist.date,
      timeStrIST: ist.time,
      symbol: sym.id,
      timeframe: intervalId.toUpperCase(),
      direction: manualDirection,
      entryPrice: entry,
      stopLoss: sl,
      takeProfit1: tp,
      conceptKey: 'manual',
      conceptLabel: 'Manual Trade',
      grade: 'MANUAL',
      status: 'OPEN',
      pnlR: 0,
      pnlPoints: 0,
      barsHeld: 0,
      tradeType: 'MANUAL',
      selectedConcepts: activeConceptLabels.length > 0 ? activeConceptLabels : ['Manual Execution'],
    }

    setTrades((prev) => [...prev, newManualTrade])
  }

  // Manually close an active open trade at current candle close price
  const handleCloseActiveTrade = (tradeId: string) => {
    if (!currentCandle) return

    setTrades((prev) =>
      prev.map((t) => {
        if (t.id !== tradeId || t.status !== 'OPEN') return t

        const exitPrice = currentCandle.c
        const ist = formatToISTString(currentCandle.t)
        const isLong = t.direction === 'LONG'
        const riskDist = Math.max(0.00001, Math.abs(t.entryPrice - t.stopLoss))
        const rewardDist = isLong ? exitPrice - t.entryPrice : t.entryPrice - exitPrice
        const pnlR = Number((rewardDist / riskDist).toFixed(2))

        return {
          ...t,
          status: 'CLOSED',
          outcome: pnlR >= 0 ? 'WIN' : 'LOSS',
          exitPrice,
          exitTimestamp: currentCandle.t,
          exitDateStrIST: ist.full,
          exitReason: 'MANUAL',
          pnlR,
          pnlPoints: Number(rewardDist.toFixed(sym.digits)),
          barsHeld: Math.max(1, currentIndex - t.candleIndex),
        }
      })
    )
  }

  // Toggle single concept selection
  const toggleConcept = (key: string) => {
    setSelectedConceptKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key)
      } else {
        return [...prev, key]
      }
    })
  }

  // Select all concepts
  const selectAllConcepts = () => {
    setSelectedConceptKeys(CONCEPTS.map((c) => c.key))
  }

  // Clear concept selection
  const clearConcepts = () => {
    setSelectedConceptKeys([])
  }

  // Export Backtest CSV
  const handleExportCSV = () => {
    if (trades.length === 0) return
    const headers = 'TradeID,Type,DateIST,TimeIST,Symbol,Timeframe,Direction,Concept,SelectedConcepts,Entry,SL,TP1,Exit,Outcome,PnL_R,PnL_Points,BarsHeld\n'
    const rows = trades
      .map(
        (t) =>
          `"${t.id}","${t.tradeType || 'AUTO'}","${t.dateStrIST}","${t.timeStrIST}","${t.symbol}","${t.timeframe}","${t.direction}","${t.conceptLabel.replace(/"/g, '""')}","${(t.selectedConcepts || []).join(' + ')}","${t.entryPrice}","${t.stopLoss}","${t.takeProfit1}","${t.exitPrice ?? ''}","${t.outcome ?? 'OPEN'}","${t.pnlR}","${t.pnlPoints}","${t.barsHeld}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SR_Terminal_Backtest_${sym.id}_${intervalId}_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate factual real-time backtest summary stats
  const stats: BacktestSummaryStats = useMemo(() => {
    return calculateBacktestStats(trades)
  }, [trades])

  // Active open trade
  const activeTrade = trades.find((t) => t.status === 'OPEN')

  // Filtered trades for trade log
  const filteredTrades = useMemo(() => {
    if (tradeLogFilter === 'WINS') return trades.filter((t) => t.outcome === 'WIN')
    if (tradeLogFilter === 'LOSSES') return trades.filter((t) => t.outcome === 'LOSS')
    if (tradeLogFilter === 'OPEN') return trades.filter((t) => t.status === 'OPEN')
    if (tradeLogFilter === 'MANUAL') return trades.filter((t) => t.tradeType === 'MANUAL')
    return trades
  }, [trades, tradeLogFilter])

  // List of active concept names for display
  const activeConceptNames = useMemo(() => {
    return selectedConceptKeys
      .map((k) => CONCEPTS.find((c) => c.key === k)?.label)
      .filter(Boolean) as string[]
  }, [selectedConceptKeys])

  // =========================================================================
  // SUB-COMPONENT: Replay Playback Bar (Clean, Compact, Unified)
  // =========================================================================
  const renderReplayControls = (compact: boolean = false) => (
    <div className={`flex items-center gap-1.5 ${compact ? 'flex-wrap' : 'flex-wrap sm:flex-nowrap'}`}>
      <button
        type="button"
        onClick={handleReset}
        disabled={allCandles.length === 0}
        className="p-1.5 rounded-lg bg-[#14141e] hover:bg-[#202030] text-neutral-300 hover:text-white border border-[#262638] disabled:opacity-40 transition-all cursor-pointer"
        title="Reset to Starting Candle"
      >
        <RotateCcw size={13} />
      </button>

      <button
        type="button"
        onClick={stepBackward}
        disabled={allCandles.length === 0 || currentIndex <= startIndex}
        className="p-1.5 rounded-lg bg-[#14141e] hover:bg-[#202030] text-neutral-300 hover:text-white border border-[#262638] disabled:opacity-40 transition-all cursor-pointer"
        title="Step Backward"
      >
        <SkipBack size={13} />
      </button>

      <button
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        disabled={allCandles.length === 0}
        className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md ${
          isPlaying
            ? 'bg-amber-400 text-black hover:bg-amber-300'
            : 'bg-white text-black hover:bg-neutral-200'
        } disabled:opacity-40`}
      >
        {isPlaying ? (
          <>
            <Pause size={12} />
            <span>PAUSE</span>
          </>
        ) : (
          <>
            <Play size={12} />
            <span>PLAY</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={stepForward}
        disabled={allCandles.length === 0 || currentIndex >= allCandles.length - 1}
        className="p-1.5 rounded-lg bg-[#14141e] hover:bg-[#202030] text-neutral-300 hover:text-white border border-[#262638] disabled:opacity-40 transition-all cursor-pointer"
        title="Step Forward"
      >
        <SkipForward size={13} />
      </button>

      {/* Speed Selector */}
      <div className="flex items-center gap-0.5 bg-[#12121a] p-0.5 rounded-lg border border-[#22222f]">
        {[0.5, 1, 2, 5, 10].map((spd) => (
          <button
            key={spd}
            type="button"
            onClick={() => setPlaybackSpeed(spd)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
              playbackSpeed === spd
                ? 'bg-amber-400 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {spd}x
          </button>
        ))}
      </div>
    </div>
  )

  // =========================================================================
  // SUB-COMPONENT: Manual Trading Form
  // =========================================================================
  const renderManualTradeForm = () => (
    <form onSubmit={handleExecuteManualTrade} className="space-y-2.5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-neutral-400 text-[11px]">DIRECTION</span>
        <div className="inline-flex rounded-lg bg-[#12121a] p-0.5 border border-[#22222f]">
          <button
            type="button"
            onClick={() => setManualDirection('LONG')}
            className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
              manualDirection === 'LONG' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setManualDirection('SHORT')}
            className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
              manualDirection === 'SHORT' ? 'bg-red-500 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            SELL / SHORT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <label className="block text-neutral-400 text-[10px] mb-1">ENTRY</label>
          <input
            type="number"
            step="any"
            required
            value={manualEntryPrice}
            onChange={(e) => setManualEntryPrice(e.target.value)}
            className="w-full h-8 px-2 rounded-lg bg-[#12121a] border border-[#272738] text-white text-[11px] font-mono focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-red-400 text-[10px] mb-1">STOP LOSS</label>
          <input
            type="number"
            step="any"
            required
            value={manualStopLoss}
            onChange={(e) => setManualStopLoss(e.target.value)}
            className="w-full h-8 px-2 rounded-lg bg-[#12121a] border border-[#272738] text-red-300 text-[11px] font-mono focus:outline-none focus:border-red-400"
          />
        </div>
        <div>
          <label className="block text-sky-400 text-[10px] mb-1">TAKE PROFIT</label>
          <input
            type="number"
            step="any"
            required
            value={manualTakeProfit}
            onChange={(e) => setManualTakeProfit(e.target.value)}
            className="w-full h-8 px-2 rounded-lg bg-[#12121a] border border-[#272738] text-sky-300 text-[11px] font-mono focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* R:R Ratio Preview */}
      {(() => {
        const e = parseFloat(manualEntryPrice)
        const s = parseFloat(manualStopLoss)
        const t = parseFloat(manualTakeProfit)
        if (!isNaN(e) && !isNaN(s) && !isNaN(t) && e > 0 && s > 0 && t > 0) {
          const risk = Math.abs(e - s)
          const reward = Math.abs(t - e)
          const rr = risk > 0 ? (reward / risk).toFixed(2) : '0'
          return (
            <div className="flex items-center justify-between text-[10.5px] p-2 rounded-lg bg-[#14141e] border border-[#20202e]">
              <span className="text-neutral-400">Risk/Reward:</span>
              <span className="font-bold text-amber-400">1 : {rr}</span>
              <span className="text-neutral-500">({reward.toFixed(sym.digits)} pts)</span>
            </div>
          )
        }
        return null
      })()}

      {manualTradeError && (
        <div className="p-2 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-[10.5px] flex items-center gap-1.5">
          <AlertCircle size={13} className="shrink-0 text-red-400" />
          <span>{manualTradeError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={Boolean(activeTrade)}
        className={`w-full py-2 px-3 rounded-lg font-mono text-[11px] font-bold smooth-ui cursor-pointer active:scale-98 ${
          manualDirection === 'LONG'
            ? 'bg-[#089981] hover:opacity-90 text-[#FFFFFF]'
            : 'bg-[#F23645] hover:opacity-90 text-[#FFFFFF]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {manualDirection === 'LONG' ? 'EXECUTE BUY (LONG)' : 'EXECUTE SELL (SHORT)'}
      </button>
    </form>
  )

  // =========================================================================
  // SUB-COMPONENT: Concept Selector
  // =========================================================================
  const renderConceptList = (compact: boolean = false) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-[#1c1c28]">
        <span className="text-amber-400 font-bold">
          {selectedConceptKeys.length} / {CONCEPTS.length} ACTIVE
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={selectAllConcepts}
            className="text-[10px] px-1.5 py-0.5 rounded bg-[#161622] hover:bg-[#202030] text-neutral-300 hover:text-white"
          >
            ALL
          </button>
          <button
            type="button"
            onClick={clearConcepts}
            className="text-[10px] px-1.5 py-0.5 rounded bg-[#161622] hover:bg-[#202030] text-neutral-300 hover:text-white"
          >
            CLEAR
          </button>
        </div>
      </div>

      <div className={`grid gap-1.5 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {CONCEPTS.map((c) => {
          const isSelected = selectedConceptKeys.includes(c.key)
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggleConcept(c.key)}
              className={`p-1.5 rounded-lg text-left font-mono transition-all border flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#151522] border-amber-400/60 text-white'
                  : 'bg-[#0b0b11] border-[#1c1c28] text-neutral-500 hover:border-neutral-700'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border transition-all ${
                  isSelected ? 'bg-amber-400 border-amber-400 text-black' : 'border-[#333344] bg-black'
                }`}
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
              </div>
              <span className="text-[10.5px] font-bold truncate flex-1">{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  // =========================================================================
  // SUB-COMPONENT: Backtest Summary & Results Card
  // =========================================================================
  const renderBacktestResults = () => (
    <div className="space-y-3 font-mono text-xs">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-lg bg-[#0e0e16] border border-[#1d1d28]">
          <div className="text-[9.5px] text-neutral-400 uppercase">Total Trades</div>
          <div className="text-sm font-bold text-white mt-0.5">{stats.totalSetups}</div>
          <div className="text-[9px] text-neutral-500">{stats.wins}W · {stats.losses}L</div>
        </div>

        <div className="p-2 rounded-lg bg-[#0e0e16] border border-[#1d1d28]">
          <div className="text-[9.5px] text-neutral-400 uppercase">Win Rate</div>
          <div
            className={`text-sm font-bold mt-0.5 ${
              stats.winRate >= 50 ? 'text-emerald-400' : stats.winRate > 0 ? 'text-amber-400' : 'text-neutral-300'
            }`}
          >
            {stats.winRate}%
          </div>
          <div className="text-[9px] text-neutral-500">PF: {stats.profitFactor}</div>
        </div>

        <div className="p-2 rounded-lg bg-[#0e0e16] border border-[#1d1d28]">
          <div className="text-[9.5px] text-neutral-400 uppercase">Net Result</div>
          <div
            className={`text-sm font-bold mt-0.5 ${
              stats.totalR >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {stats.totalR >= 0 ? `+${stats.totalR}` : stats.totalR} R
          </div>
          <div className="text-[9px] text-neutral-400">
            {stats.netPoints >= 0 ? `+${stats.netPoints}` : stats.netPoints} pts
          </div>
        </div>

        <div className="p-2 rounded-lg bg-[#0e0e16] border border-[#1d1d28]">
          <div className="text-[9.5px] text-neutral-400 uppercase">Max Drawdown</div>
          <div className="text-sm font-bold text-red-400 mt-0.5">-{stats.maxDrawdownR} R</div>
          <div className="text-[9px] text-neutral-500">Max Peak: +{stats.grossProfitR}R</div>
        </div>
      </div>

      {/* Selected Concepts Pill Summary */}
      <div className="p-2 rounded-lg bg-[#0e0e16] border border-[#1b1b26] text-[10px]">
        <div className="text-neutral-400 uppercase font-bold mb-1">Concepts In Backtest:</div>
        <div className="text-neutral-300 max-h-16 overflow-y-auto leading-relaxed">
          {activeConceptNames.length > 0 ? activeConceptNames.join(' + ') : 'None selected'}
        </div>
      </div>

      {/* Actions: Export CSV and Clear */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          disabled={trades.length === 0}
          onClick={handleExportCSV}
          className="flex-1 py-1.5 px-2 rounded-lg bg-[#14141f] hover:bg-[#222232] border border-[#272738] text-[10.5px] text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <Download size={11} />
          <span>EXPORT CSV</span>
        </button>

        <button
          type="button"
          disabled={trades.length === 0}
          onClick={() => {
            if (confirm('Clear all recorded trades in this backtest?')) {
              setTrades([])
            }
          }}
          className="py-1.5 px-2 rounded-lg bg-[#181116] hover:bg-[#25151f] border border-[#382229] text-[10.5px] text-red-300 hover:text-red-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <Trash2 size={11} />
          <span>CLEAR</span>
        </button>
      </div>

      {/* Mini Trade Log */}
      {trades.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] text-neutral-400 font-bold uppercase">Recent Trades ({trades.length})</div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {trades.slice().reverse().map((t, idx) => (
              <div
                key={t.id}
                className="p-1.5 rounded bg-[#101017] border border-[#1e1e2c] flex items-center justify-between text-[10px]"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold ${
                      t.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {t.direction}
                  </span>
                  <span className="text-neutral-400 truncate max-w-[100px]">{t.conceptLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">{t.outcome || 'OPEN'}</span>
                  <span
                    className={`font-bold ${
                      t.status === 'OPEN'
                        ? 'text-amber-400'
                        : t.pnlR >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {t.status === 'OPEN' ? '0.00R' : `${t.pnlR >= 0 ? '+' : ''}${t.pnlR}R`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // =========================================================================
  // SUB-COMPONENT: Floating Active Trade Banner
  // =========================================================================
  const renderFloatingActiveTrade = () => {
    if (!activeTrade || !currentCandle) return null
    const isLong = activeTrade.direction === 'LONG'
    const riskDist = Math.max(0.00001, Math.abs(activeTrade.entryPrice - activeTrade.stopLoss))
    const rewardDist = isLong ? currentCandle.c - activeTrade.entryPrice : activeTrade.entryPrice - currentCandle.c
    const currentR = Number((rewardDist / riskDist).toFixed(2))

    return (
      <div className="absolute bottom-3 left-3 z-30 max-w-sm p-2.5 rounded-xl bg-black/90 backdrop-blur-md border border-amber-400/60 shadow-2xl font-mono text-xs animate-fadeIn flex items-center gap-3">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isLong ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
          }`}
        >
          {activeTrade.direction}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-white font-bold truncate">
            {activeTrade.conceptLabel}
          </div>
          <div className="text-[9.5px] text-neutral-400">
            Entry: {fmtPrice(activeTrade.entryPrice, sym.digits)} | SL: {fmtPrice(activeTrade.stopLoss, sym.digits)} | TP: {fmtPrice(activeTrade.takeProfit1, sym.digits)}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xs font-bold ${currentR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentR >= 0 ? `+${currentR}` : currentR} R
          </div>
          <button
            type="button"
            onClick={() => handleCloseActiveTrade(activeTrade.id)}
            className="mt-0.5 px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[9.5px] font-bold cursor-pointer"
          >
            EXIT
          </button>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 1: DEDICATED FULL-SCREEN TRADING VIEW (Fulfills Requirements 1, 2, 3, 4, 5, 6)
  // =========================================================================
  if (isFullScreen) {
    return (
      <div
        ref={containerRef}
        id="chart-replay-fullscreen-view"
        className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#050508] text-[#f5f5f5] flex flex-col overflow-hidden font-sans select-none animate-fadeIn"
      >
        {/* Compact 2-Row Top Bar (Guaranteed Zero Off-Screen Overflow on Mobile & Desktop) */}
        <header className="w-full px-2.5 py-1.5 bg-[#09090f] border-b border-[#1c1c28] flex flex-col gap-1.5 shrink-0 font-mono text-xs z-40">
          {/* Row 1: Symbol + Live Candle Price/IST on Left | Mode + Pinned Exit Full & Close (X) on Right */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <select
                value={symbolId}
                onChange={(e) => {
                  setSymbolId(e.target.value)
                  setTrades([])
                }}
                className="bg-[#14141f] border border-[#272738] text-white text-[11px] font-bold rounded-lg px-2 py-1 cursor-pointer focus:outline-none shrink-0"
              >
                {SYMBOLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              {currentCandle && (
                <span className="text-[11.5px] font-bold text-white tabular-nums truncate">
                  {fmtPrice(currentCandle.c, sym.digits)}
                </span>
              )}
              {currentIST && (
                <span className="hidden sm:inline-block text-[10px] text-neutral-400 shrink-0">
                  {currentIST.time} IST
                </span>
              )}
            </div>

            {/* Right Pinned Actions: ALGO/MANUAL + Side Panel Toggle + Exit Full Screen + Close (X) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setReplayMode(replayMode === 'AUTOMATED' ? 'MANUAL' : 'AUTOMATED')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                  replayMode === 'MANUAL'
                    ? 'bg-amber-400 text-black'
                    : 'bg-[#14141f] text-neutral-300 border border-[#252535]'
                }`}
              >
                {replayMode === 'MANUAL' ? 'MANUAL' : 'ALGO'}
              </button>

              {isLandscape && (
                <button
                  type="button"
                  onClick={() => setSidePanelOpen(!sidePanelOpen)}
                  className="p-1.5 rounded-lg bg-[#14141f] hover:bg-[#202030] text-neutral-300 hover:text-white border border-[#252535] cursor-pointer shrink-0"
                  title={sidePanelOpen ? 'Collapse Controls Panel' : 'Open Controls Panel'}
                >
                  {sidePanelOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
                </button>
              )}

              {/* Pinned Exit Full Screen Button */}
              <button
                id="btn-exit-fullscreen"
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="px-2 py-1 rounded-lg bg-[#14141f] hover:bg-[#202030] text-amber-300 hover:text-amber-200 border border-amber-400/40 cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0 whitespace-nowrap"
                title="Exit Full Screen"
              >
                <Minimize2 size={12} />
                <span>EXIT</span>
              </button>

              {/* Pinned Close / Cut Button */}
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 rounded-lg bg-[#F23645] hover:opacity-90 text-white border border-[#F23645] cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0 whitespace-nowrap"
                title="Close Backtesting"
              >
                <X size={13} />
                <span>CLOSE</span>
              </button>
            </div>
          </div>

          {/* Row 2: Timeframe Selector Strip + Playback Transport Controls */}
          <div className="flex items-center justify-between gap-1.5 w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-0.5 bg-[#14141f] p-0.5 rounded-lg border border-[#272738] shrink-0">
              {REPLAY_INTERVALS.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => {
                    setIntervalId(tf.id)
                    setTrades([])
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer whitespace-nowrap ${
                    intervalId === tf.id ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {renderReplayControls(true)}
            </div>
          </div>
        </header>

        {/* Full-Screen Main Content Body */}
        {isLandscape ? (
          /* =========================================================================
             LANDSCAPE FULL-SCREEN MODE
             Left: Chart takes 100% available area
             Right: Compact collapsible panel with Replay, Manual Trade, Concepts & Results
             ========================================================================= */
          <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden relative">
            {/* Chart Area */}
            <div className="flex-1 h-full relative overflow-hidden bg-black flex flex-col">
              {/* Overlaid Legend */}
              <div className="absolute top-2 left-3 z-20 flex items-center gap-2 text-[9px] font-mono text-neutral-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md border border-[#22222e]">
                <span className="flex items-center gap-1"><span className="w-2 h-1.5 bg-white inline-block rounded-xs" /> BULL</span>
                <span className="flex items-center gap-1"><span className="w-2 h-1.5 border border-[#787b86] bg-black inline-block rounded-xs" /> BEAR</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-400 inline-block" /> ENTRY</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-500 inline-block" /> SL</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-sky-400 inline-block" /> TP</span>
              </div>

              {/* Lightweight Chart Canvas */}
              <div ref={chartBoxRef} className="w-full h-full flex-1 min-h-[300px]" />

              {/* Zero lookahead watermark */}
              <div className="absolute bottom-2 right-3 pointer-events-none px-2 py-0.5 rounded bg-black/75 border border-[#22222f] text-[9px] font-mono text-neutral-500">
                BAR {currentIndex - startIndex + 1} / {Math.max(1, allCandles.length - startIndex)} · ZERO LOOKAHEAD
              </div>

              {/* Floating Active Trade Card */}
              {renderFloatingActiveTrade()}
            </div>

            {/* Right Side Compact Collapsible Panel */}
            {sidePanelOpen && (
              <aside className="w-[300px] h-full bg-[#0a0a12] border-l border-[#1d1d2b] flex flex-col shrink-0 overflow-hidden font-mono z-30">
                {/* Panel Tab Bar */}
                <div className="grid grid-cols-3 bg-[#0d0d16] border-b border-[#1c1c28] p-1 gap-1 text-[11px] font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('CONTROLS')}
                    className={`py-1 rounded text-center cursor-pointer transition-all ${
                      drawerTab === 'CONTROLS' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    CONTROLS
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('CONCEPTS')}
                    className={`py-1 rounded text-center cursor-pointer transition-all ${
                      drawerTab === 'CONCEPTS' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    CONCEPTS ({selectedConceptKeys.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('RESULTS')}
                    className={`py-1 rounded text-center cursor-pointer transition-all ${
                      drawerTab === 'RESULTS' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    RESULTS ({trades.length})
                  </button>
                </div>

                {/* Panel Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {drawerTab === 'CONTROLS' && (
                    <div className="space-y-3">
                      {/* Timeline Scrubber */}
                      <div>
                        <div className="flex items-center justify-between text-[10.5px] text-neutral-400 mb-1">
                          <span>SCRUB TIMELINE</span>
                          <span className="text-white font-bold">
                            Bar {currentIndex - startIndex + 1} of {Math.max(1, allCandles.length - startIndex)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={startIndex}
                          max={Math.max(startIndex, allCandles.length - 1)}
                          value={currentIndex}
                          onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* Date & Time Picker */}
                      <div className="p-2.5 rounded-xl bg-[#0f0f18] border border-[#1e1e2d] space-y-2">
                        <div className="text-[10px] text-neutral-400 uppercase font-bold">Historical Feed Range</div>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                          <input
                            type="date"
                            value={selectedDateIST}
                            onChange={(e) => setSelectedDateIST(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#151522] border border-[#272738] text-white"
                          />
                          <input
                            type="time"
                            value={selectedTimeIST}
                            onChange={(e) => setSelectedTimeIST(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#151522] border border-[#272738] text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleLoadFeed}
                          disabled={feedLoading}
                          className="w-full py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10.5px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {feedLoading ? <RefreshCw size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                          <span>{feedLoading ? 'LOADING FEED...' : 'RELOAD FEED'}</span>
                        </button>
                      </div>

                      {/* Manual Trade Placement (When Manual Mode) */}
                      {replayMode === 'MANUAL' ? (
                        <div className="p-2.5 rounded-xl bg-[#0f0f18] border border-[#1e1e2d]">
                          <div className="text-[10px] text-amber-400 uppercase font-bold mb-2">
                            Manual Trade Placement
                          </div>
                          {renderManualTradeForm()}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-[#0f0f18] border border-[#1e1e2d] text-[10.5px] text-neutral-400">
                          <span className="text-white font-bold block mb-1">Algorithmic Replay Active</span>
                          The replay engine automatically evaluates your {selectedConceptKeys.length} selected SR models candle-by-candle.
                        </div>
                      )}
                    </div>
                  )}

                  {drawerTab === 'CONCEPTS' && renderConceptList(true)}

                  {drawerTab === 'RESULTS' && renderBacktestResults()}
                </div>
              </aside>
            )}
          </div>
        ) : (
          /* =========================================================================
             PORTRAIT FULL-SCREEN MODE
             Chart occupies virtually the ENTIRE phone screen (~90%)
             Controls are in a compact bottom drawer with expand/collapse
             ========================================================================= */
          <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden relative">
            {/* Chart Area */}
            <div className="flex-1 w-full relative overflow-hidden bg-black flex flex-col">
              {/* Overlaid Legend */}
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 text-[8.5px] font-mono text-neutral-400 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-[#22222e]">
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-white inline-block" /> BULL</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 border border-[#787b86] bg-black inline-block" /> BEAR</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-0.5 bg-amber-400 inline-block" /> ENTRY</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-0.5 bg-red-500 inline-block" /> SL</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-0.5 bg-sky-400 inline-block" /> TP</span>
              </div>

              {/* Lightweight Chart Canvas */}
              <div ref={chartBoxRef} className="w-full h-full flex-1 min-h-[260px]" />

              {/* Zero lookahead watermark */}
              <div className="absolute bottom-2 right-2 pointer-events-none px-1.5 py-0.5 rounded bg-black/75 border border-[#22222f] text-[8.5px] font-mono text-neutral-500">
                BAR {currentIndex - startIndex + 1}/{Math.max(1, allCandles.length - startIndex)}
              </div>

              {/* Floating Active Trade Card */}
              {renderFloatingActiveTrade()}
            </div>

            {/* Compact Bottom Drawer */}
            <div className="bg-[#0a0a12] border-t border-[#1c1c28] flex flex-col shrink-0 font-mono z-30">
              {/* Drawer Header (Always visible, responsive wrap) */}
              <div className="px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#171724]">
                {/* Mini Scrubber slider */}
                <div className="flex-1 min-w-[120px] flex items-center gap-2">
                  <input
                    type="range"
                    min={startIndex}
                    max={Math.max(startIndex, allCandles.length - 1)}
                    value={currentIndex}
                    onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5"
                  />
                  <span className="text-[10px] text-neutral-400 shrink-0 tabular-nums">
                    {currentIndex - startIndex + 1}/{Math.max(1, allCandles.length - startIndex)}
                  </span>
                </div>

                {/* Tab switch pills */}
                <div className="flex items-center gap-1 shrink-0">
                  {(['CONTROLS', 'CONCEPTS', 'RESULTS'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setDrawerTab(tab)
                        setDrawerOpen(true)
                      }}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                        drawerOpen && drawerTab === tab
                          ? 'bg-amber-400 text-black'
                          : 'text-neutral-400 hover:text-white bg-[#14141f]'
                      }`}
                    >
                      {tab === 'CONCEPTS' ? `CONCEPTS (${selectedConceptKeys.length})` : tab}
                    </button>
                  ))}

                  {/* Expand / Collapse toggle */}
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="p-1 rounded bg-[#14141f] text-neutral-300 hover:text-white shrink-0"
                  >
                    {drawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                </div>
              </div>

              {/* Drawer Body (Expandable) */}
              {drawerOpen && (
                <div className="max-h-[38vh] overflow-y-auto p-3 bg-[#08080e]">
                  {drawerTab === 'CONTROLS' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <input
                          type="date"
                          value={selectedDateIST}
                          onChange={(e) => setSelectedDateIST(e.target.value)}
                          className="px-2 py-1 rounded bg-[#151522] border border-[#272738] text-white"
                        />
                        <button
                          type="button"
                          onClick={handleLoadFeed}
                          disabled={feedLoading}
                          className="py-1 rounded bg-amber-400 text-black font-bold flex items-center justify-center gap-1"
                        >
                          <RotateCcw size={11} />
                          <span>RELOAD FEED</span>
                        </button>
                      </div>

                      {replayMode === 'MANUAL' ? (
                        <div className="pt-1">{renderManualTradeForm()}</div>
                      ) : (
                        <div className="text-[10px] text-neutral-400">
                          Automated Replay evaluating {selectedConceptKeys.length} SR institutional concepts.
                        </div>
                      )}
                    </div>
                  )}

                  {drawerTab === 'CONCEPTS' && renderConceptList(false)}

                  {drawerTab === 'RESULTS' && renderBacktestResults()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: STANDARD / WINDOWED VIEW (Preserves original UI + Prominent Full Screen Button)
  // =========================================================================
  return (
    <div
      ref={containerRef}
      id="chart-replay-container"
      className="fixed inset-0 z-50 flex flex-col bg-[#050505] text-[#f5f5f5] overflow-y-auto font-sans select-none animate-fadeIn"
    >
      {/* 1. TOP HEADER NAVIGATION STRIP (Responsive 2-Row Mobile / Pinned Exit & Close) */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 py-2 bg-[#09090e]/95 backdrop-blur-md border-b border-[#1c1c28] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-black border border-[#272738] p-1 flex items-center justify-center shrink-0">
            <RotateCcw size={14} className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold font-mono tracking-wider text-white truncate">
                SR BACKTESTING
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
              Historical Replay · Multi-Concept Alignment · Manual Trade Execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Replay vs Manual Mode Switcher */}
          <div className="flex items-center p-0.5 bg-[#13131c] rounded-lg border border-[#232332]">
            <button
              type="button"
              onClick={() => setReplayMode('AUTOMATED')}
              className={`px-2 py-1 rounded-md text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                replayMode === 'AUTOMATED'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              REPLAY
            </button>
            <button
              type="button"
              onClick={() => setReplayMode('MANUAL')}
              className={`px-2 py-1 rounded-md text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                replayMode === 'MANUAL'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              MANUAL
            </button>
          </div>

          {/* Full Screen Toggle Button */}
          <button
            id="btn-toggle-fullscreen"
            type="button"
            onClick={() => setIsFullScreen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-amber-200 transition-all cursor-pointer flex items-center gap-1 text-[10.5px] font-mono font-bold shrink-0 whitespace-nowrap"
            title="Full Screen Backtesting"
          >
            <Maximize2 size={13} />
            <span className="hidden xs:inline">FULL</span>
          </button>

          {/* Pinned Close / Exit Button */}
          <button
            id="btn-close-replay"
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-lg bg-[#F23645] hover:opacity-90 border border-[#F23645] text-white transition-all cursor-pointer flex items-center gap-1 text-[10.5px] font-mono font-bold shrink-0 whitespace-nowrap"
            title="Exit Replay"
          >
            <X size={14} />
            <span>EXIT</span>
          </button>
        </div>
      </header>

      {/* 2. FEED & DATE/TIME SELECTOR BAR */}
      <section className="px-3 sm:px-6 py-2.5 bg-[#0b0b11] border-b border-[#181822] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          {/* Symbol Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 text-[11px]">SYMBOL:</span>
            <select
              value={symbolId}
              onChange={(e) => {
                setSymbolId(e.target.value)
                setTrades([])
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#14141f] border border-[#272738] text-white font-bold cursor-pointer focus:outline-none focus:border-amber-400"
            >
              {SYMBOLS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.src})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 text-[11px]">TF:</span>
            <div className="flex items-center gap-0.5 bg-[#14141f] p-0.5 rounded-lg border border-[#272738]">
              {REPLAY_INTERVALS.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => {
                    setIntervalId(tf.id)
                    setTrades([])
                  }}
                  className={`px-2 py-1 rounded text-[10.5px] font-bold cursor-pointer transition-all ${
                    intervalId === tf.id ? 'bg-amber-400 text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker (IST) */}
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-amber-400 shrink-0" />
            <span className="text-neutral-400 text-[11px]">DATE:</span>
            <input
              type="date"
              value={selectedDateIST}
              onChange={(e) => setSelectedDateIST(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[#14141f] border border-[#272738] text-white text-[11px] font-mono cursor-pointer"
            />
          </div>

          {/* Time Picker (IST) */}
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-amber-400 shrink-0" />
            <span className="text-neutral-400 text-[11px]">TIME:</span>
            <input
              type="time"
              value={selectedTimeIST}
              onChange={(e) => setSelectedTimeIST(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[#14141f] border border-[#272738] text-white text-[11px] font-mono cursor-pointer"
            />
          </div>

          {/* Load Feed Button */}
          <button
            type="button"
            disabled={feedLoading}
            onClick={handleLoadFeed}
            className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E2E4E9] active:scale-98 text-[#0B0E14] font-bold text-xs smooth-ui flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {feedLoading ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>LOADING...</span>
              </>
            ) : (
              <>
                <RotateCcw size={12} />
                <span>LOAD FEED</span>
              </>
            )}
          </button>
        </div>

        {/* Replay Info pill */}
        {allCandles.length > 0 && currentIST && (
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">{currentIST.full}</span>
          </div>
        )}
      </section>

      {/* Feed Error Alert */}
      {feedError && (
        <div className="mx-3 sm:mx-6 mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{feedError}</span>
        </div>
      )}

      {/* 3. REPLAY PLAYBACK CONTROLLER BAR */}
      <section className="px-3 sm:px-6 py-2 bg-[#08080c] border-b border-[#161622] flex flex-wrap items-center justify-between gap-3">
        {/* Play / Step Buttons */}
        <div className="flex items-center gap-2">
          {renderReplayControls(false)}
        </div>

        {/* Scrubber Progress Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
          <div className="text-[10.5px] font-mono text-neutral-400 shrink-0">
            Candle: <strong className="text-white">{currentIndex - startIndex + 1}</strong> /{' '}
            {Math.max(1, allCandles.length - startIndex)}
          </div>
          <input
            type="range"
            min={startIndex}
            max={Math.max(startIndex, allCandles.length - 1)}
            value={currentIndex}
            onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer h-1.5"
            disabled={allCandles.length === 0}
          />
        </div>
      </section>

      {/* MAIN CONTENT BODY */}
      <main className="p-3 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
        {/* CHART CONTAINER */}
        <section className="card p-3 border-[#22222e] bg-[#07070a] relative rounded-2xl shadow-xl">
          {/* Top Chart Status Strip */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#181822]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-white tracking-wide">
                {sym.label} · {intervalId.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-neutral-900 border border-neutral-700 text-neutral-300">
                {replayMode === 'AUTOMATED' ? 'ALGORITHMIC REPLAY' : 'MANUAL BACKTEST'}
              </span>
              {currentIST && (
                <span className="text-[10px] font-mono text-amber-400">
                  {currentIST.full}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Legend */}
              <div className="hidden md:flex items-center gap-3 text-[9.5px] font-mono text-neutral-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 rounded bg-amber-400" /> ENTRY
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 rounded bg-red-500" /> SL
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 rounded bg-sky-400" /> TP
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 rounded bg-purple-500" /> BSL
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 rounded bg-pink-500" /> SSL
                </span>
              </div>

              {/* Full Screen Button */}
              <button
                type="button"
                onClick={() => setIsFullScreen(true)}
                className="px-2 py-1 rounded bg-[#14141f] hover:bg-[#202030] text-amber-300 hover:text-white border border-amber-400/30 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 size={12} />
                <span>EXPAND FULL</span>
              </button>
            </div>
          </div>

          {/* Lightweight Chart Render Box */}
          <div ref={chartBoxRef} className="w-full h-[420px] rounded-xl overflow-hidden" />

          {/* Strict barrier label */}
          <div className="absolute bottom-5 right-5 pointer-events-none px-2.5 py-1 rounded-md bg-black/80 border border-[#2a2a38] text-[9.5px] font-mono text-neutral-400">
            FUTURE BARS MASKED · ZERO LOOKAHEAD
          </div>
        </section>

        {/* ACTIVE TRADE BANNER */}
        {activeTrade && currentCandle && (
          <section className="p-3.5 rounded-2xl bg-[#11111a] border border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shadow-lg shadow-black">
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  activeTrade.direction === 'LONG' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                }`}
              >
                OPEN {activeTrade.direction}
              </span>
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span>{activeTrade.conceptLabel}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                    {activeTrade.tradeType || 'AUTO'}
                  </span>
                </div>
                <div className="text-[10.5px] text-neutral-400 font-mono mt-0.5">
                  Entry: <span className="text-white">{fmtPrice(activeTrade.entryPrice, sym.digits)}</span> | SL:{' '}
                  <span className="text-red-400">{fmtPrice(activeTrade.stopLoss, sym.digits)}</span> | TP:{' '}
                  <span className="text-sky-400">{fmtPrice(activeTrade.takeProfit1, sym.digits)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              {(() => {
                const isLong = activeTrade.direction === 'LONG'
                const riskDist = Math.max(0.00001, Math.abs(activeTrade.entryPrice - activeTrade.stopLoss))
                const rewardDist = isLong ? currentCandle.c - activeTrade.entryPrice : activeTrade.entryPrice - currentCandle.c
                const currentR = Number((rewardDist / riskDist).toFixed(2))
                return (
                  <div className="text-right">
                    <div className="text-[10px] text-neutral-400">FLOATING P&L</div>
                    <div className={`font-bold text-sm ${currentR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {currentR >= 0 ? `+${currentR}` : currentR} R ({rewardDist >= 0 ? `+${rewardDist.toFixed(sym.digits)}` : rewardDist.toFixed(sym.digits)} pts)
                    </div>
                  </div>
                )
              })()}

              <button
                type="button"
                onClick={() => handleCloseActiveTrade(activeTrade.id)}
                className="px-3 py-1.5 rounded-lg bg-[#F23645] hover:opacity-90 active:scale-98 text-[#FFFFFF] font-bold text-xs cursor-pointer smooth-ui font-mono"
              >
                CLOSE TRADE
              </button>
            </div>
          </section>
        )}

        {/* MANUAL BACKTESTING PANEL */}
        {replayMode === 'MANUAL' && (
          <section className="card p-4 border-[#22222e] bg-[#09090d] rounded-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c1c26]">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-amber-400" />
                <div>
                  <h2 className="text-xs font-bold font-mono tracking-wider text-white">
                    MANUAL BACKTESTING EXECUTION
                  </h2>
                  <p className="text-[10.5px] text-neutral-400 font-mono">
                    User-driven trade placement, manual entries, stop loss, targets & market exits
                  </p>
                </div>
              </div>

              {currentCandle && (
                <div className="text-xs font-mono text-neutral-400">
                  Current Market Price:{' '}
                  <span className="text-white font-bold">{fmtPrice(currentCandle.c, sym.digits)}</span>
                </div>
              )}
            </div>

            {renderManualTradeForm()}
          </section>
        )}

        {/* MULTI-CONCEPT SELECTION */}
        <section className="card p-4 border-[#22222e] bg-[#09090d] rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-[#1c1c26]">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-amber-400" />
              <div>
                <h2 className="text-xs font-bold font-mono tracking-wider text-white flex items-center gap-2">
                  <span>SR INSTITUTIONAL CONCEPTS SELECTION</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/20 text-amber-300">
                    {selectedConceptKeys.length} / {CONCEPTS.length} ACTIVE
                  </span>
                </h2>
                <p className="text-[10px] text-neutral-400 font-mono">
                  Select 1 or multiple algorithms (Turtle Soup, Order Flow, PD Arrays, etc.) to evaluate together
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllConcepts}
                className="px-2.5 py-1 rounded-lg bg-[#14141e] hover:bg-[#202030] text-[10.5px] font-mono font-bold text-neutral-300 hover:text-white border border-[#252535] cursor-pointer"
              >
                SELECT ALL
              </button>
              <button
                type="button"
                onClick={clearConcepts}
                className="px-2.5 py-1 rounded-lg bg-[#14141e] hover:bg-[#202030] text-[10.5px] font-mono font-bold text-neutral-300 hover:text-white border border-[#252535] cursor-pointer"
              >
                CLEAR ALL
              </button>
            </div>
          </div>

          {/* 14 Concept Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {CONCEPTS.map((c) => {
              const isSelected = selectedConceptKeys.includes(c.key)
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleConcept(c.key)}
                  className={`p-2 rounded-xl text-left font-mono transition-all border flex items-start gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#151522] border-amber-400/60 text-white shadow-sm'
                      : 'bg-[#0b0b11] border-[#1c1c28] text-neutral-500 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-black'
                        : 'border-[#333344] bg-black'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold truncate">{c.label}</div>
                    <div className="text-[9px] text-neutral-400 line-clamp-1 mt-0.5">{c.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* FACTUAL BACKTEST RESULTS */}
        <section className="card p-4 border-[#22222e] bg-[#09090d] rounded-2xl">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#1c1c28] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('METRICS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  activeTab === 'METRICS'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                SUMMARY METRICS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TRADES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'TRADES'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>TRADE LOG</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-neutral-800 text-neutral-200">
                  {trades.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CONCEPTS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  activeTab === 'CONCEPTS'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                CONCEPT COMPARISON
              </button>
            </div>

            <div className="flex items-center gap-2">
              {trades.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-2.5 py-1 rounded-lg bg-[#14141f] hover:bg-[#222232] border border-[#272738] text-[10.5px] font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={11} />
                    <span>EXPORT CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all recorded trades in this backtest session?')) {
                        setTrades([])
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#181116] hover:bg-[#25151f] border border-[#382229] text-[10.5px] font-mono text-red-300 hover:text-red-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>CLEAR LOG</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Context Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-3 p-2.5 rounded-xl bg-[#0e0e15] border border-[#1b1b26] text-[10.5px] font-mono text-neutral-400">
            <div>
              INSTRUMENT: <strong className="text-white">{sym.label}</strong>
            </div>
            <span className="text-neutral-600">·</span>
            <div>
              TIMEFRAME: <strong className="text-white">{intervalId.toUpperCase()}</strong>
            </div>
            <span className="text-neutral-600">·</span>
            <div>
              PERIOD: <strong className="text-amber-400">{selectedDateIST} {selectedTimeIST} IST</strong> →{' '}
              <strong className="text-white">{currentIST ? currentIST.date + ' ' + currentIST.time : '—'}</strong>
            </div>
            <span className="text-neutral-600">·</span>
            <div>
              MODE:{' '}
              <strong className="text-white">
                {replayMode === 'AUTOMATED' ? `ALGO (${selectedConceptKeys.length} Concepts)` : 'MANUAL BACKTEST'}
              </strong>
            </div>
          </div>

          {/* TAB 1: SUMMARY METRICS */}
          {activeTab === 'METRICS' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0f0f15] border border-[#1d1d28]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Total Trades</div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {stats.totalSetups}
                </div>
                <div className="text-[9.5px] font-mono text-neutral-500 mt-0.5">
                  {stats.closedTrades} closed · {stats.openTrades} open
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f15] border border-[#1d1d28]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Win Rate</div>
                <div
                  className={`text-base font-bold font-mono mt-1 ${
                    stats.winRate >= 50 ? 'text-emerald-400' : stats.winRate > 0 ? 'text-amber-400' : 'text-neutral-300'
                  }`}
                >
                  {stats.winRate}%
                </div>
                <div className="text-[9.5px] font-mono text-neutral-500 mt-0.5">
                  {stats.wins} Wins · {stats.losses} Losses
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f15] border border-[#1d1d28]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Net Result</div>
                <div
                  className={`text-base font-bold font-mono mt-1 ${
                    stats.totalR >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {stats.totalR >= 0 ? `+${stats.totalR}` : stats.totalR} R
                </div>
                <div className="text-[9.5px] font-mono text-neutral-400 mt-0.5">
                  {stats.netPoints >= 0 ? `+${stats.netPoints}` : stats.netPoints} pts
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f15] border border-[#1d1d28]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Gross Profit</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  +{stats.grossProfitR} R
                </div>
                <div className="text-[9.5px] font-mono text-neutral-400 mt-0.5">
                  +{stats.grossProfitPoints} pts
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f15] border border-[#1d1d28]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Gross Loss</div>
                <div className="text-base font-bold font-mono text-red-400 mt-1">
                  -{stats.grossLossR} R
                </div>
                <div className="text-[9.5px] font-mono text-neutral-400 mt-0.5">
                  -{stats.grossLossPoints} pts
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f15] border border-[#1d1d28]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Profit Factor</div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {stats.profitFactor}
                </div>
                <div className="text-[9.5px] font-mono text-neutral-500 mt-0.5">
                  Max DD: -{stats.maxDrawdownR} R
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRADE LOG TABLE */}
          {activeTab === 'TRADES' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap text-[10.5px] font-mono">
                <span className="text-neutral-500">FILTER:</span>
                {(['ALL', 'WINS', 'LOSSES', 'OPEN', 'MANUAL'] as const).map((flt) => (
                  <button
                    key={flt}
                    type="button"
                    onClick={() => setTradeLogFilter(flt)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      tradeLogFilter === flt
                        ? 'bg-neutral-200 text-black font-bold'
                        : 'bg-[#14141e] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#1d1d28]">
                {filteredTrades.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                    No trades match the current filter.
                  </div>
                ) : (
                  <table className="w-full text-left font-mono text-[11px] whitespace-nowrap">
                    <thead className="bg-[#121219] text-neutral-400 border-b border-[#1f1f2b]">
                      <tr>
                        <th className="p-2.5">Trade #</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">IST Time</th>
                        <th className="p-2.5">Direction</th>
                        <th className="p-2.5">Concept</th>
                        <th className="p-2.5">Selected Concepts</th>
                        <th className="p-2.5">Entry</th>
                        <th className="p-2.5">SL</th>
                        <th className="p-2.5">TP1</th>
                        <th className="p-2.5">Exit</th>
                        <th className="p-2.5">Outcome</th>
                        <th className="p-2.5">P/L (R)</th>
                        <th className="p-2.5">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171722]">
                      {filteredTrades.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-[#101017]">
                          <td className="p-2.5 text-neutral-500">#{idx + 1}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                t.tradeType === 'MANUAL'
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : 'bg-neutral-800 text-neutral-300'
                              }`}
                            >
                              {t.tradeType || 'AUTO'}
                            </span>
                          </td>
                          <td className="p-2.5 text-neutral-300">
                            {t.dateStrIST} {t.timeStrIST}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.direction === 'LONG'
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-red-950/40 text-red-400 border border-red-800/40'
                              }`}
                            >
                              {t.direction}
                            </span>
                          </td>
                          <td className="p-2.5 text-white max-w-[160px] truncate" title={t.conceptLabel}>
                            {t.conceptLabel}
                          </td>
                          <td className="p-2.5 text-neutral-400 max-w-[180px] truncate" title={(t.selectedConcepts || []).join(' + ')}>
                            {(t.selectedConcepts || []).join(' + ') || '—'}
                          </td>
                          <td className="p-2.5 text-amber-300">{fmtPrice(t.entryPrice, sym.digits)}</td>
                          <td className="p-2.5 text-red-400">{fmtPrice(t.stopLoss, sym.digits)}</td>
                          <td className="p-2.5 text-sky-400">{fmtPrice(t.takeProfit1, sym.digits)}</td>
                          <td className="p-2.5 text-neutral-300">
                            {t.exitPrice ? fmtPrice(t.exitPrice, sym.digits) : '—'}
                          </td>
                          <td className="p-2.5">
                            {t.status === 'OPEN' ? (
                              <span className="text-amber-400 font-bold">OPEN</span>
                            ) : t.outcome === 'WIN' ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                <span>WIN</span>
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold flex items-center gap-1">
                                <XCircle size={12} />
                                <span>LOSS</span>
                              </span>
                            )}
                          </td>
                          <td
                            className={`p-2.5 font-bold ${
                              t.status === 'OPEN'
                                ? 'text-neutral-400'
                                : t.pnlR > 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {t.status === 'OPEN' ? '0.00 R' : `${t.pnlR > 0 ? '+' : ''}${t.pnlR} R`}
                          </td>
                          <td
                            className={`p-2.5 font-bold ${
                              t.status === 'OPEN'
                                ? 'text-neutral-400'
                                : t.pnlPoints > 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {t.status === 'OPEN'
                              ? '0.00'
                              : `${t.pnlPoints > 0 ? '+' : ''}${t.pnlPoints.toFixed(sym.digits)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONCEPT-WISE COMPARISON */}
          {activeTab === 'CONCEPTS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CONCEPTS.map((c) => {
                const cs = stats.conceptStats[c.key]
                const hasTrades = cs && cs.totalTrades > 0
                const isSelected = selectedConceptKeys.includes(c.key)
                return (
                  <div
                    key={c.key}
                    className={`p-3 rounded-xl border transition-all ${
                      hasTrades
                        ? 'bg-[#101017] border-[#252535]'
                        : 'bg-[#0b0b10] border-[#181824] opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-white truncate max-w-[180px]">
                        {c.label}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {isSelected ? (
                          <span className="text-emerald-400 font-semibold">ACTIVE</span>
                        ) : (
                          <span className="text-neutral-600">INACTIVE</span>
                        )}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-neutral-400 font-mono mb-2 line-clamp-1">{c.desc}</p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1a1a26] text-center font-mono text-[10.5px]">
                      <div>
                        <div className="text-neutral-500 text-[9px]">WIN RATE</div>
                        <div
                          className={`font-bold mt-0.5 ${
                            hasTrades && cs.winRate >= 50
                              ? 'text-emerald-400'
                              : hasTrades
                              ? 'text-red-400'
                              : 'text-neutral-400'
                          }`}
                        >
                          {hasTrades ? `${cs.winRate}%` : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-[9px]">W / L</div>
                        <div className="font-bold text-white mt-0.5">
                          {hasTrades ? `${cs.wins} / ${cs.losses}` : '0 / 0'}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-[9px]">TOTAL R</div>
                        <div
                          className={`font-bold mt-0.5 ${
                            hasTrades && cs.totalR >= 0
                              ? 'text-emerald-400'
                              : hasTrades
                              ? 'text-red-400'
                              : 'text-neutral-400'
                          }`}
                        >
                          {hasTrades ? `${cs.totalR >= 0 ? '+' : ''}${cs.totalR}R` : '0.00R'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
