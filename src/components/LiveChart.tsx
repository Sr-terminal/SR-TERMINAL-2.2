import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineStyle,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import {
  TrendingUp,
  TrendingDown,
  Square,
  Minus,
  Type as TypeIcon,
  Magnet,
  Undo2,
  Redo2,
  Trash2,
  Play,
  Pause,
  SkipForward,
  Scissors,
  RotateCcw,
  NotebookPen,
  Sliders,
} from 'lucide-react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { symbolById, fmtPrice, type Candle } from '../lib/market'
import type { Analysis } from '../lib/ict'
import { getActiveApexKillzoneWindow } from '../lib/clock'
import { run2000PossibilitySimulation, calculateApexLotSize } from '../lib/aiServices'
import { createRecord, loadJournal, saveJournal } from '../lib/journal'

export interface ChartToggles {
  plan: boolean
  levels: boolean
  zones: boolean
  key: boolean
}

export const ICT_CHART_ZONE_COLORS = {
  BULLISH_GREEN: '#00C853',
  BEARISH_RED: '#FF1744',
  APEX_BULLISH_EMERALD: '#00E676',
  APEX_BULLISH_FILL: 'rgba(0, 230, 118, 0.25)',
  APEX_BEARISH_CRIMSON: '#FF1744',
  APEX_BEARISH_FILL: 'rgba(255, 23, 68, 0.25)',
  APEX_LIQUIDITY_GOLD: '#FFD740',
  APEX_UNICORN_PURPLE: '#D500F9',
  APEX_UNICORN_FILL: 'rgba(213, 0, 249, 0.25)',
} as const

export const MONOCHROME_CHART_THEME = {
  backgroundColor: '#000000',
  gridColor: 'rgba(0, 0, 0, 0)',
  crosshairColor: '#CCCCCC',
  priceLineColor: '#CCCCCC',
  priceLabelBg: '#E0E0E0',
  priceLabelText: '#000000',
  axisTextColor: '#EAEAEA',
  upColor: '#FFFFFF',
  downColor: '#000000',
  borderUpColor: '#B2B5BE',
  borderDownColor: '#B2B5BE',
  wickUpColor: '#B2B5BE',
  wickDownColor: '#B2B5BE',
  colorBarsBasedOnPreviousClose: false,
  precision: 'default',
  timezone: 'Asia/Kolkata',
  timezoneLabel: '(UTC+5:30) Kolkata',
  ictBullishGreen: '#00C853',
  ictBearishRed: '#FF1744',
  apexBullishEmerald: '#00E676',
  apexBearishCrimson: '#FF1744',
  apexLiquidityGold: '#FFD740',
  apexUnicornPurple: '#D500F9',
} as const

export type DrawingToolType =
  | 'CURSOR'
  | 'LONG_POS'
  | 'SHORT_POS'
  | 'ZONE_OB_BULL'
  | 'ZONE_OB_BEAR'
  | 'ZONE_FVG_BISI'
  | 'ZONE_FVG_SIBI'
  | 'ZONE_BB_BULL'
  | 'ZONE_BB_BEAR'
  | 'RAY_BSL'
  | 'RAY_SSL'
  | 'RAY_PDH'
  | 'RAY_PDL'
  | 'OTE_FIB'
  | 'TRENDLINE'
  | 'TEXT_NOTE'

export interface ChartDrawingItem {
  id: string
  type: DrawingToolType
  symbolId: string
  createdAt: number
  // Normalized time (sec) & price coordinates
  t1: number
  p1: number
  t2?: number
  p2?: number
  // For Long/Short Position Tool
  entry?: number
  sl?: number
  tp1?: number
  tp2?: number
  // For Text / Zone label
  label?: string
}

interface BacktestTradeSim {
  id: string
  dir: 'LONG' | 'SHORT'
  entry: number
  sl: number
  tp: number
  status: 'OPEN' | 'WIN' | 'LOSS'
  resultR: number
}

const VISIBLE_BARS = 90

const LiveChart = memo(function LiveChart({
  candles,
  analysis,
  toggles,
  height,
  showApexPulse = true,
  fullScreen = false,
  symbolId = 'XAUUSD',
  interval = '15m',
  accountBalance = 10000,
  riskPct = 1.0,
  onLoggedToJournal,
}: {
  candles: Candle[]
  analysis: Analysis | null
  toggles: ChartToggles
  height?: number
  showApexPulse?: boolean
  fullScreen?: boolean
  symbolId?: string
  interval?: string
  accountBalance?: number
  riskPct?: number
  onLoggedToJournal?: (msg: string) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const series = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const currentPriceLineRef = useRef<unknown>(null)
  const lines = useRef<unknown[]>([])
  const lastLen = useRef(0)
  const lastSig = useRef('')
  const lastBarTime = useRef<number>(0)

  const symDef = useMemo(() => symbolById(symbolId), [symbolId])

  // Interactive Drawing Toolbar State
  const [activeTool, setActiveTool] = useState<DrawingToolType>('CURSOR')
  const [magnetMode, setMagnetMode] = useState<boolean>(true)
  const [drawings, setDrawings] = useState<ChartDrawingItem[]>([])
  const [redoStack, setRedoStack] = useState<ChartDrawingItem[][]>([])
  const [undoStack, setUndoStack] = useState<ChartDrawingItem[][]>([])
  const [pendingStart, setPendingStart] = useState<{ t: number; p: number } | null>(null)
  const [draggingHandle, setDraggingHandle] = useState<{
    drawingId: string
    handle: 'entry' | 'sl' | 'tp1' | 'tp2' | 'p1' | 'p2'
  } | null>(null)
  const [coordVersion, setCoordVersion] = useState(0)
  const [journalToast, setJournalToast] = useState<string | null>(null)
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false)
  const [rayMenuOpen, setRayMenuOpen] = useState(false)

  // Inline Historical Backtest Replay State
  const [replayMode, setReplayMode] = useState<boolean>(false)
  const [selectingCutBar, setSelectingCutBar] = useState<boolean>(false)
  const [replayIndex, setReplayIndex] = useState<number>(candles.length)
  const [replayPlaying, setReplayPlaying] = useState<boolean>(false)
  const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 5>(1)
  const [simTrades, setSimTrades] = useState<BacktestTradeSim[]>([])

  useEffect(() => {
    if (!replayMode) {
      setReplayIndex(candles.length)
      setReplayPlaying(false)
    }
  }, [candles.length, replayMode])

  const displayedCandles = useMemo(() => {
    if (!replayMode) return candles
    const cut = Math.max(15, Math.min(candles.length, replayIndex))
    return candles.slice(0, cut)
  }, [candles, replayMode, replayIndex])

  // Load & Sync Drawings with Connected Firebase Firestore (`users/{uid}/drawings/{symbolId}`)
  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const drawingDocRef = doc(db, 'users', uid, 'drawings', symDef.id)
    const unsub = onSnapshot(
      drawingDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          if (Array.isArray(data?.items)) {
            setDrawings(data.items as ChartDrawingItem[])
          }
        } else {
          setDrawings([])
        }
      },
      () => {
        // Ignore snapshot permission error if logged out
      }
    )
    return () => unsub()
  }, [symDef.id])

  const persistDrawingsToCloud = useCallback(
    (nextItems: ChartDrawingItem[]) => {
      const uid = auth.currentUser?.uid
      if (!uid) return
      const drawingDocRef = doc(db, 'users', uid, 'drawings', symDef.id)
      void setDoc(
        drawingDocRef,
        {
          uid,
          symbolId: symDef.id,
          items: nextItems.slice(-60),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {})
    },
    [symDef.id]
  )

  const pushDrawingsUpdate = useCallback(
    (updater: (prev: ChartDrawingItem[]) => ChartDrawingItem[]) => {
      setDrawings((prev) => {
        const next = updater(prev)
        setUndoStack((u) => [...u.slice(-19), prev])
        setRedoStack([])
        persistDrawingsToCloud(next)
        return next
      })
    },
    [persistDrawingsToCloud]
  )

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const previous = undoStack[undoStack.length - 1]
    setUndoStack((u) => u.slice(0, -1))
    setRedoStack((r) => [...r, drawings])
    setDrawings(previous)
    persistDrawingsToCloud(previous)
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setRedoStack((r) => r.slice(0, -1))
    setUndoStack((u) => [...u, drawings])
    setDrawings(next)
    persistDrawingsToCloud(next)
  }

  const handleClearDrawings = () => {
    if (drawings.length === 0) return
    pushDrawingsUpdate(() => [])
  }

  // Step forward in Historical Backtest Replay Mode & evaluate open simulated trades
  const stepReplayForward = useCallback(() => {
    setReplayIndex((prev) => {
      if (prev >= candles.length) {
        setReplayPlaying(false)
        return candles.length
      }
      const nextIdx = prev + 1
      const bar = candles[nextIdx - 1]
      if (bar) {
        setSimTrades((trades) =>
          trades.map((tr) => {
            if (tr.status !== 'OPEN') return tr
            const risk = Math.max(1e-6, Math.abs(tr.entry - tr.sl))
            if (tr.dir === 'LONG') {
              if (bar.l <= tr.sl) return { ...tr, status: 'LOSS', resultR: -1.0 }
              if (bar.h >= tr.tp) {
                const rr = Number((Math.abs(tr.tp - tr.entry) / risk).toFixed(2))
                return { ...tr, status: 'WIN', resultR: rr }
              }
            } else {
              if (bar.h >= tr.sl) return { ...tr, status: 'LOSS', resultR: -1.0 }
              if (bar.l <= tr.tp) {
                const rr = Number((Math.abs(tr.entry - tr.tp) / risk).toFixed(2))
                return { ...tr, status: 'WIN', resultR: rr }
              }
            }
            return tr
          })
        )
      }
      return nextIdx
    })
  }, [candles])

  useEffect(() => {
    if (!replayMode || !replayPlaying) return
    const ms = replaySpeed === 5 ? 220 : replaySpeed === 2 ? 500 : 950
    const timer = setInterval(() => {
      stepReplayForward()
    }, ms)
    return () => clearInterval(timer)
  }, [replayMode, replayPlaying, replaySpeed, stepReplayForward])

  const openSimTrade = (dir: 'LONG' | 'SHORT') => {
    const lastBar = displayedCandles[displayedCandles.length - 1]
    if (!lastBar) return
    const atrEst =
      displayedCandles
        .slice(-14)
        .reduce((acc, c) => acc + (c.h - c.l), 0) / Math.max(1, Math.min(14, displayedCandles.length))
    const slDist = Math.max(atrEst * 1.5 + symDef.defaultSpread, symDef.pipSize * 15)
    const entry = lastBar.c
    const sl = dir === 'LONG' ? Number((entry - slDist).toFixed(symDef.digits)) : Number((entry + slDist).toFixed(symDef.digits))
    const tp = dir === 'LONG' ? Number((entry + slDist * 2.2).toFixed(symDef.digits)) : Number((entry - slDist * 2.2).toFixed(symDef.digits))
    setSimTrades((prev) => [
      ...prev,
      {
        id: `sim_${Date.now()}`,
        dir,
        entry,
        sl,
        tp,
        status: 'OPEN',
        resultR: 0,
      },
    ])
  }

  const backtestScorecard = useMemo(() => {
    const closed = simTrades.filter((t) => t.status !== 'OPEN')
    const wins = closed.filter((t) => t.status === 'WIN').length
    const losses = closed.filter((t) => t.status === 'LOSS').length
    const open = simTrades.filter((t) => t.status === 'OPEN').length
    const winRate = closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0
    const netR = Number(closed.reduce((acc, t) => acc + t.resultR, 0).toFixed(2))
    return { total: simTrades.length, wins, losses, open, winRate, netR }
  }, [simTrades])

  const chartH =
    height ??
    (fullScreen
      ? typeof window !== 'undefined'
        ? Math.max(320, window.innerHeight - 165)
        : 560
      : typeof window !== 'undefined' && window.innerWidth < 420
      ? 365
      : 430)

  const hudData = useMemo(() => {
    const kz = getActiveApexKillzoneWindow(new Date())
    if (!analysis?.ok || displayedCandles.length === 0) {
      return {
        killzone: kz,
        confluenceScorePct: 0,
        passesGate: false,
        sweptLiquidity: 'Awaiting Sweep',
        pdArray: 'Scanning PD Arrays',
      }
    }
    const sim = run2000PossibilitySimulation(
      displayedCandles,
      analysis,
      symDef.id,
      analysis.interval || interval
    )
    const sweptLiquidity =
      analysis.plan?.sweptLiquidityType && analysis.plan.sweptLiquidityType !== 'NONE'
        ? analysis.plan.sweptLiquidityType
        : analysis.phase?.sweptLiquidityType && analysis.phase.sweptLiquidityType !== 'NONE'
        ? analysis.phase.sweptLiquidityType
        : 'BSL / SSL Pool'
    const pdArray =
      analysis.plan?.primaryPdArray && analysis.plan.primaryPdArray !== 'NONE'
        ? analysis.plan.primaryPdArray
        : analysis.phase?.primaryPdArray && analysis.phase.primaryPdArray !== 'NONE'
        ? analysis.phase.primaryPdArray
        : 'OTE Dealing Range'
    return {
      killzone: kz,
      confluenceScorePct: sim.winProbabilityPct,
      passesGate: sim.passesThreshold,
      sweptLiquidity,
      pdArray,
    }
  }, [displayedCandles, analysis, symDef.id, interval])

  useEffect(() => {
    if (!box.current) return
    const istTimeFmt = new Intl.DateTimeFormat('en-IN', {
      timeZone: MONOCHROME_CHART_THEME.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const istDateTimeFmt = new Intl.DateTimeFormat('en-IN', {
      timeZone: MONOCHROME_CHART_THEME.timezone,
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const c = createChart(box.current, {
      width: box.current.clientWidth,
      height: chartH,
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
        rightOffset: 3,
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
        mode: CrosshairMode.Normal,
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
        precision: symDef.digits,
        minMove: 1 / Math.pow(10, symDef.digits),
      },
    })

    chart.current = c
    series.current = s

    const handleViewportChange = () => {
      setCoordVersion((v) => v + 1)
    }
    c.timeScale().subscribeVisibleLogicalRangeChange(handleViewportChange)

    const ro = new ResizeObserver(() => {
      if (box.current) {
        const w = box.current.clientWidth
        const h = box.current.clientHeight || chartH
        c.applyOptions({ width: w, height: h })
        setCoordVersion((v) => v + 1)
      }
    })
    ro.observe(box.current)

    return () => {
      c.timeScale().unsubscribeVisibleLogicalRangeChange(handleViewportChange)
      ro.disconnect()
      c.remove()
      chart.current = null
      series.current = null
      currentPriceLineRef.current = null
      lastLen.current = 0
      lastSig.current = ''
      lastBarTime.current = 0
    }
  }, [chartH, symDef.digits])

  useEffect(() => {
    const s = series.current
    if (!s || displayedCandles.length === 0) return
    const data = displayedCandles
      .map((k) => ({
        time: Math.floor(k.t / 1000) as UTCTimestamp,
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number))
      .filter((v, i, arr) => i === 0 || v.time !== arr[i - 1].time)
    const n = data.length
    if (n === 0) return

    const stepSec = n > 1 ? (data[1].time as number) - (data[0].time as number) : 0
    const sig = `${data[0].time}_${stepSec}_${data[0].open.toFixed(4)}_${replayMode ? 'rep' : 'live'}`
    const lastBar = data[n - 1]
    const ts = chart.current?.timeScale()

    if (lastLen.current === 0 || sig !== lastSig.current || replayMode) {
      s.setData(data)
      if (ts && lastLen.current === 0) {
        ts.setVisibleLogicalRange({ from: Math.max(0, n - VISIBLE_BARS), to: n + 3 })
      }
    } else if (n === lastLen.current && (lastBar.time as number) === lastBarTime.current) {
      try {
        s.update(lastBar)
      } catch {
        s.setData(data)
      }
    } else {
      s.setData(data)
    }

    if (currentPriceLineRef.current) {
      try {
        s.removePriceLine(currentPriceLineRef.current as never)
      } catch {}
      currentPriceLineRef.current = null
    }
    try {
      currentPriceLineRef.current = s.createPriceLine({
        price: lastBar.close,
        color: '#CCCCCC',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        axisLabelColor: '#E0E0E0',
        axisLabelTextColor: '#000000',
        title: '',
      })
    } catch {}

    lastLen.current = n
    lastSig.current = sig
    lastBarTime.current = lastBar.time as number
    setCoordVersion((v) => v + 1)
  }, [displayedCandles, replayMode])

  useEffect(() => {
    const s = series.current
    if (!s) return
    for (const l of lines.current) {
      try {
        s.removePriceLine(l as never)
      } catch {}
    }
    lines.current = []
    if (!analysis?.ok) return
    const add = (price: number, title: string, color: string, style: LineStyle, width: 1 | 2 = 1) => {
      if (!isFinite(price) || price <= 0) return
      try {
        lines.current.push(
          s.createPriceLine({ price, color, lineWidth: width, lineStyle: style, axisLabelVisible: true, title })
        )
      } catch {}
    }
    const L = analysis.levels
    if (toggles.levels) {
      add(L.eq, 'EQ (50%)', '#B2B5BE', LineStyle.Dashed, 1)
      L.sweptPools?.forEach((sp: { kind: string; price: number }) =>
        add(sp.price, `SWEPT ${sp.kind}`, ICT_CHART_ZONE_COLORS.APEX_LIQUIDITY_GOLD, LineStyle.Dashed, 1)
      )
      L.bsl.forEach((p: number, i: number) =>
        add(
          p,
          i === 0 ? 'BSL POOL (EQH)' : 'BSL',
          i === 0 ? ICT_CHART_ZONE_COLORS.BULLISH_GREEN : ICT_CHART_ZONE_COLORS.APEX_LIQUIDITY_GOLD,
          LineStyle.Dashed,
          i === 0 ? 2 : 1
        )
      )
      L.ssl.forEach((p: number, i: number) =>
        add(
          p,
          i === 0 ? 'SSL POOL (EQL)' : 'SSL',
          i === 0 ? ICT_CHART_ZONE_COLORS.BEARISH_RED : ICT_CHART_ZONE_COLORS.APEX_LIQUIDITY_GOLD,
          LineStyle.Dashed,
          i === 0 ? 2 : 1
        )
      )
      if (L.pdh) add(L.pdh, 'PDH (BSL)', ICT_CHART_ZONE_COLORS.APEX_LIQUIDITY_GOLD, LineStyle.Dashed, 1)
      if (L.pdl) add(L.pdl, 'PDL (SSL)', ICT_CHART_ZONE_COLORS.APEX_LIQUIDITY_GOLD, LineStyle.Dashed, 1)
      if (L.asiaH) add(L.asiaH, 'ASIA HIGH', ICT_CHART_ZONE_COLORS.APEX_LIQUIDITY_GOLD, LineStyle.Dotted, 1)
      if (L.asiaL) add(L.asiaL, 'ASIA LOW', ICT_CHART_ZONE_COLORS.APEX_LIQUIDITY_GOLD, LineStyle.Dotted, 1)
    }
    if (toggles.key) {
      if (L.sth) add(L.sth, 'BSL SWING', ICT_CHART_ZONE_COLORS.BULLISH_GREEN, LineStyle.Dotted, 1)
      if (L.stl) add(L.stl, 'SSL SWING', ICT_CHART_ZONE_COLORS.BEARISH_RED, LineStyle.Dotted, 1)
    }
    if (toggles.zones) {
      L.fvgZones?.forEach((z: { dir: string; top: number; bottom: number }) => {
        const isBull = z.dir === 'bull'
        add(
          (z.top + z.bottom) / 2,
          isBull ? 'FVG (BISI)' : 'FVG (SIBI)',
          isBull ? ICT_CHART_ZONE_COLORS.APEX_BULLISH_EMERALD : ICT_CHART_ZONE_COLORS.APEX_BEARISH_CRIMSON,
          LineStyle.LargeDashed,
          1
        )
      })
      L.obZones?.forEach((z: { dir: { toString(): string } | string; top: number; bottom: number }) => {
        const isBull = z.dir === 'bull'
        add(
          (z.top + z.bottom) / 2,
          isBull ? '+OB' : '-OB',
          isBull ? ICT_CHART_ZONE_COLORS.APEX_BULLISH_EMERALD : ICT_CHART_ZONE_COLORS.APEX_BEARISH_CRIMSON,
          LineStyle.Dashed,
          1
        )
      })
      if (showApexPulse) {
        L.unicornZones?.forEach((z: { dir: string; top: number; bottom: number }) => {
          add(
            (z.top + z.bottom) / 2,
            z.dir === 'bull' ? 'UNICORN (+BB+FVG)' : 'UNICORN (-BB+FVG)',
            ICT_CHART_ZONE_COLORS.APEX_UNICORN_PURPLE,
            LineStyle.Solid,
            2
          )
        })
      }
    }
    if (toggles.plan) {
      const p = analysis.plan
      if (p && (p.valid || p.entry > 0)) {
        const isLong = p.direction === 'LONG' || p.direction === 'BUY'
        add(
          p.entry,
          isLong ? 'LONG ENTRY' : 'SHORT ENTRY',
          isLong ? ICT_CHART_ZONE_COLORS.BULLISH_GREEN : ICT_CHART_ZONE_COLORS.BEARISH_RED,
          LineStyle.Solid,
          2
        )
        add(p.stop, 'PROTECTED SL (1.5xATR+SPREAD)', ICT_CHART_ZONE_COLORS.BEARISH_RED, LineStyle.Dashed, 2)
        add(p.tp1, 'TP1 (1:2 RR -> BE)', ICT_CHART_ZONE_COLORS.BULLISH_GREEN, LineStyle.Dashed, 2)
        add(p.tp2, 'TP2 (1:3.5 RR)', ICT_CHART_ZONE_COLORS.BULLISH_GREEN, LineStyle.Dotted, 2)
        add(p.tp3, 'TP3 (1:5+ RR)', ICT_CHART_ZONE_COLORS.BULLISH_GREEN, LineStyle.Dotted, 2)
      }
    }
  }, [analysis, toggles, showApexPulse])

  // Coordinate Conversion Helpers (Magnet Mode snaps to closest candle OHLC)
  const clientPointToChartTimePrice = useCallback(
    (clientX: number, clientY: number): { t: number; p: number; candleIdx: number } | null => {
      if (!box.current || !chart.current || !series.current || displayedCandles.length === 0) return null
      const rect = box.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width - 50, clientX - rect.left))
      const y = Math.max(0, Math.min(rect.height - 24, clientY - rect.top))

      const rawPrice = series.current.coordinateToPrice(y)
      if (rawPrice === null || !isFinite(rawPrice)) return null

      const timeCoord = chart.current.timeScale().coordinateToTime(x)
      let tSec =
        typeof timeCoord === 'number'
          ? timeCoord
          : Math.floor(displayedCandles[displayedCandles.length - 1].t / 1000)

      // Find nearest candle index
      let bestIdx = displayedCandles.length - 1
      let minDiff = Infinity
      for (let i = 0; i < displayedCandles.length; i++) {
        const cSec = Math.floor(displayedCandles[i].t / 1000)
        const d = Math.abs(cSec - tSec)
        if (d < minDiff) {
          minDiff = d
          bestIdx = i
        }
      }
      const snapCandle = displayedCandles[bestIdx]
      tSec = Math.floor(snapCandle.t / 1000)

      let finalPrice = Number(rawPrice.toFixed(symDef.digits))
      if (magnetMode && snapCandle) {
        const candidates = [snapCandle.h, snapCandle.l, snapCandle.o, snapCandle.c]
        let closest = finalPrice
        let bestDist = Infinity
        for (const cand of candidates) {
          const dist = Math.abs(cand - finalPrice)
          if (dist < bestDist) {
            bestDist = dist
            closest = cand
          }
        }
        const atrApprox = Math.max(snapCandle.h - snapCandle.l, symDef.pipSize * 5)
        if (bestDist <= atrApprox * 0.9) {
          finalPrice = Number(closest.toFixed(symDef.digits))
        }
      }

      return { t: tSec, p: finalPrice, candleIdx: bestIdx }
    },
    [displayedCandles, magnetMode, symDef.digits, symDef.pipSize]
  )

  const timeToX = useCallback(
    (tSec: number): number => {
      if (!chart.current || !box.current || displayedCandles.length === 0) return 60
      const coord = chart.current.timeScale().timeToCoordinate(tSec as UTCTimestamp)
      if (coord !== null && isFinite(coord)) return coord
      const lastSec = Math.floor(displayedCandles[displayedCandles.length - 1].t / 1000)
      const lastCoord = chart.current.timeScale().timeToCoordinate(lastSec as UTCTimestamp)
      return lastCoord ?? box.current.clientWidth - 80
    },
    [displayedCandles]
  )

  const priceToY = useCallback((price: number): number => {
    if (!series.current) return 100
    const coord = series.current.priceToCoordinate(price)
    return coord !== null && isFinite(coord) ? coord : 100
  }, [])

  // Handle tap/click on chart overlay when a drawing tool or Cut Candle selector is active
  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingHandle) return
    const pt = clientPointToChartTimePrice(e.clientX, e.clientY)
    if (!pt) return

    // If user is selecting a Cut Candle for Backtest Replay
    if (selectingCutBar) {
      setReplayMode(true)
      setReplayIndex(Math.max(15, pt.candleIdx + 1))
      setSelectingCutBar(false)
      setReplayPlaying(false)
      return
    }

    if (activeTool === 'CURSOR') return

    const lastCandleSec = Math.floor(displayedCandles[displayedCandles.length - 1].t / 1000)
    const stepSec =
      displayedCandles.length > 1
        ? Math.max(60, Math.floor((displayedCandles[1].t - displayedCandles[0].t) / 1000))
        : 900
    const atrEst =
      displayedCandles
        .slice(-14)
        .reduce((acc, c) => acc + (c.h - c.l), 0) / Math.max(1, Math.min(14, displayedCandles.length))
    const defaultRiskDist = Math.max(atrEst * 1.5 + symDef.defaultSpread, symDef.pipSize * 15)

    // 1. Single-tap tools: LONG_POS, SHORT_POS, RAYS, TEXT_NOTE
    if (activeTool === 'LONG_POS' || activeTool === 'SHORT_POS') {
      const isLong = activeTool === 'LONG_POS'
      const entry = pt.p
      const sl = isLong
        ? Number((entry - defaultRiskDist).toFixed(symDef.digits))
        : Number((entry + defaultRiskDist).toFixed(symDef.digits))
      const tp1 = isLong
        ? Number((entry + defaultRiskDist * 2.0).toFixed(symDef.digits))
        : Number((entry - defaultRiskDist * 2.0).toFixed(symDef.digits))
      const tp2 = isLong
        ? Number((entry + defaultRiskDist * 3.5).toFixed(symDef.digits))
        : Number((entry - defaultRiskDist * 3.5).toFixed(symDef.digits))

      const item: ChartDrawingItem = {
        id: `pos_${Date.now()}`,
        type: activeTool,
        symbolId: symDef.id,
        createdAt: Date.now(),
        t1: pt.t,
        p1: entry,
        t2: Math.min(lastCandleSec, pt.t + stepSec * 18),
        p2: tp2,
        entry,
        sl,
        tp1,
        tp2,
      }
      pushDrawingsUpdate((prev) => [...prev, item])
      setActiveTool('CURSOR')
      return
    }

    if (
      activeTool === 'RAY_BSL' ||
      activeTool === 'RAY_SSL' ||
      activeTool === 'RAY_PDH' ||
      activeTool === 'RAY_PDL'
    ) {
      const labelMap: Record<string, string> = {
        RAY_BSL: 'BSL ($$$)',
        RAY_SSL: 'SSL ($$$)',
        RAY_PDH: 'PDH',
        RAY_PDL: 'PDL',
      }
      const item: ChartDrawingItem = {
        id: `ray_${Date.now()}`,
        type: activeTool,
        symbolId: symDef.id,
        createdAt: Date.now(),
        t1: pt.t,
        p1: pt.p,
        label: labelMap[activeTool],
      }
      pushDrawingsUpdate((prev) => [...prev, item])
      setActiveTool('CURSOR')
      return
    }

    if (activeTool === 'TEXT_NOTE') {
      const item: ChartDrawingItem = {
        id: `note_${Date.now()}`,
        type: 'TEXT_NOTE',
        symbolId: symDef.id,
        createdAt: Date.now(),
        t1: pt.t,
        p1: pt.p,
        label: 'ICT Liquidity / CISD Note',
      }
      pushDrawingsUpdate((prev) => [...prev, item])
      setActiveTool('CURSOR')
      return
    }

    // 2. Two-point tools: ICT Zones (+OB/-OB, BISI/SIBI, +BB/-BB), OTE_FIB, TRENDLINE
    if (!pendingStart) {
      setPendingStart({ t: pt.t, p: pt.p })
    } else {
      const labelMap: Record<string, string> = {
        ZONE_OB_BULL: '+OB (Bullish Order Block)',
        ZONE_OB_BEAR: '-OB (Bearish Order Block)',
        ZONE_FVG_BISI: 'FVG (BISI)',
        ZONE_FVG_SIBI: 'FVG (SIBI)',
        ZONE_BB_BULL: '+BB (Bullish Breaker)',
        ZONE_BB_BEAR: '-BB (Bearish Breaker)',
        OTE_FIB: 'ICT OTE Fib',
        TRENDLINE: 'Liquidity Trendline',
      }
      const t2 = pt.t === pendingStart.t ? pendingStart.t + stepSec * 12 : pt.t
      const p2 =
        Math.abs(pt.p - pendingStart.p) < symDef.pipSize * 2
          ? Number((pendingStart.p + defaultRiskDist * 0.8).toFixed(symDef.digits))
          : pt.p
      const item: ChartDrawingItem = {
        id: `draw_${Date.now()}`,
        type: activeTool,
        symbolId: symDef.id,
        createdAt: Date.now(),
        t1: pendingStart.t,
        p1: pendingStart.p,
        t2,
        p2,
        label: labelMap[activeTool] || activeTool,
      }
      pushDrawingsUpdate((prev) => [...prev, item])
      setPendingStart(null)
      setActiveTool('CURSOR')
    }
  }

  const handleOverlayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingHandle) return
    const pt = clientPointToChartTimePrice(e.clientX, e.clientY)
    if (!pt) return
    setDrawings((prev) =>
      prev.map((d) => {
        if (d.id !== draggingHandle.drawingId) return d
        if (draggingHandle.handle === 'entry') return { ...d, entry: pt.p, p1: pt.p }
        if (draggingHandle.handle === 'sl') return { ...d, sl: pt.p }
        if (draggingHandle.handle === 'tp1') return { ...d, tp1: pt.p }
        if (draggingHandle.handle === 'tp2') return { ...d, tp2: pt.p, p2: pt.p }
        if (draggingHandle.handle === 'p1') return { ...d, p1: pt.p, t1: pt.t }
        if (draggingHandle.handle === 'p2') return { ...d, p2: pt.p, t2: pt.t }
        return d
      })
    )
  }

  const handleOverlayPointerUp = () => {
    if (draggingHandle) {
      persistDrawingsToCloud(drawings)
      setDraggingHandle(null)
    }
  }

  const handleLogDrawingPositionToJournal = (item: ChartDrawingItem) => {
    const isLong = item.type === 'LONG_POS'
    const entry = item.entry ?? item.p1
    const sl = item.sl ?? (isLong ? entry * 0.995 : entry * 1.005)
    const tp2 = item.tp2 ?? (isLong ? entry + Math.abs(entry - sl) * 3.0 : entry - Math.abs(entry - sl) * 3.0)
    const tp1 = item.tp1 ?? (isLong ? entry + Math.abs(entry - sl) * 1.8 : entry - Math.abs(entry - sl) * 1.8)
    const riskDist = Math.max(1e-6, Math.abs(entry - sl))
    const rr = Number((Math.abs(tp2 - entry) / riskDist).toFixed(2))
    const rr1 = Number((Math.abs(tp1 - entry) / riskDist).toFixed(2))

    const existing = loadJournal()
    const planPayload = {
      valid: true,
      direction: isLong ? 'LONG' : 'SHORT',
      model: isLong ? 'ICT CHART LONG POSITION' : 'ICT CHART SHORT POSITION',
      modelKind: 'reversal',
      entry,
      entryZone: [entry, entry] as [number, number],
      stop: sl,
      tp1,
      tp2,
      tp3: isLong ? Number((entry + riskDist * 5.0).toFixed(symDef.digits)) : Number((entry - riskDist * 5.0).toFixed(symDef.digits)),
      rr,
      rr1,
      grade: rr >= 2.5 ? 'A+' : 'A',
      confidence: 88,
      confluences: ['ORDER BLOCK (OB)', 'FVG / IFVG', 'LIQUIDITY SWEEP', 'OTE'],
      logic: {
        summary: `${isLong ? 'LONG' : 'SHORT'} — 4 concepts aligned, 0 opposing (Interactive Chart Position Tool)`,
      },
      createdTs: Date.now(),
    }

    const latestClose = displayedCandles[displayedCandles.length - 1]?.c || entry
    const created = createRecord(
      planPayload as never,
      symDef.id,
      symDef.label,
      interval,
      latestClose,
      existing
    )
    if (created) {
      saveJournal(created.records)
      const msg = `Logged ${isLong ? 'LONG' : 'SHORT'} ${symDef.label} @ ${fmtPrice(entry, symDef.digits)} (1:${rr} RR) to Cloud Journal`
      setJournalToast(msg)
      onLoggedToJournal?.(msg)
      setTimeout(() => setJournalToast(null), 4000)
    }
  }

  return (
    <div className={`relative w-full bg-[#000000] select-none ${fullScreen ? 'h-full flex-1 flex flex-col' : 'rounded-[8px]'}`}>
      {/* TOP BAR: Interactive Chart Drawing Toolbar & Backtest Replay Toggle */}
      <div className="z-20 bg-[#0B0E14] border-b border-[#1E222D] px-2 py-1.5 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 shrink-0">
          {/* Long Position Tool */}
          <button
            type="button"
            onClick={() => {
              setPendingStart(null)
              setActiveTool((t) => (t === 'LONG_POS' ? 'CURSOR' : 'LONG_POS'))
            }}
            className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold flex items-center gap-1 cursor-pointer border ${
              activeTool === 'LONG_POS'
                ? 'bg-[#26A69A] text-[#0B0E14] border-[#26A69A]'
                : 'bg-[#131722] text-[#26A69A] border-[#1E222D] hover:border-[#26A69A]'
            }`}
            title="Long Position Tool (Tap chart to place interactive Entry / SL / TP box)"
          >
            <TrendingUp size={11} />
            <span>Long</span>
          </button>

          {/* Short Position Tool */}
          <button
            type="button"
            onClick={() => {
              setPendingStart(null)
              setActiveTool((t) => (t === 'SHORT_POS' ? 'CURSOR' : 'SHORT_POS'))
            }}
            className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold flex items-center gap-1 cursor-pointer border ${
              activeTool === 'SHORT_POS'
                ? 'bg-[#EF5350] text-[#FFFFFF] border-[#EF5350]'
                : 'bg-[#131722] text-[#EF5350] border-[#1E222D] hover:border-[#EF5350]'
            }`}
            title="Short Position Tool (Tap chart to place interactive Entry / SL / TP box)"
          >
            <TrendingDown size={11} />
            <span>Short</span>
          </button>

          {/* ICT Institutional Zones Dropdown (+OB/-OB, BISI/SIBI, +BB/-BB) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setZoneMenuOpen((o) => !o)
                setRayMenuOpen(false)
              }}
              className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold flex items-center gap-1 cursor-pointer border ${
                activeTool.startsWith('ZONE_')
                  ? 'bg-[#FFFFFF] text-[#0B0E14] border-[#FFFFFF]'
                  : 'bg-[#131722] text-[#FFFFFF] border-[#1E222D]'
              }`}
            >
              <Square size={10} />
              <span>ICT Zones</span>
            </button>
            {zoneMenuOpen && (
              <div className="absolute left-0 mt-1 w-44 rounded-[8px] bg-[#131722] border border-[#1E222D] shadow-xl p-1 z-40 space-y-0.5 text-[10.5px]">
                {(
                  [
                    ['ZONE_OB_BULL', '+OB Bullish Order Block', '#26A69A'],
                    ['ZONE_OB_BEAR', '-OB Bearish Order Block', '#EF5350'],
                    ['ZONE_FVG_BISI', 'BISI Bullish FVG', '#26A69A'],
                    ['ZONE_FVG_SIBI', 'SIBI Bearish FVG', '#EF5350'],
                    ['ZONE_BB_BULL', '+BB Bullish Breaker', '#D500F9'],
                    ['ZONE_BB_BEAR', '-BB Bearish Breaker', '#D500F9'],
                  ] as const
                ).map(([toolId, label, col]) => (
                  <button
                    key={toolId}
                    type="button"
                    onClick={() => {
                      setPendingStart(null)
                      setActiveTool(toolId)
                      setZoneMenuOpen(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-[6px] hover:bg-[#0B0E14] flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold" style={{ color: col }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Liquidity Rays Dropdown (BSL $$$, SSL $$$, PDH, PDL) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setRayMenuOpen((o) => !o)
                setZoneMenuOpen(false)
              }}
              className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold flex items-center gap-1 cursor-pointer border ${
                activeTool.startsWith('RAY_')
                  ? 'bg-[#FFD740] text-[#0B0E14] border-[#FFD740]'
                  : 'bg-[#131722] text-[#FFD740] border-[#1E222D]'
              }`}
            >
              <Minus size={11} />
              <span>Liquidity Ray</span>
            </button>
            {rayMenuOpen && (
              <div className="absolute left-0 mt-1 w-40 rounded-[8px] bg-[#131722] border border-[#1E222D] shadow-xl p-1 z-40 space-y-0.5 text-[10.5px]">
                {(
                  [
                    ['RAY_BSL', 'BSL ($$$) Buy-Side'],
                    ['RAY_SSL', 'SSL ($$$) Sell-Side'],
                    ['RAY_PDH', 'PDH Prev Day High'],
                    ['RAY_PDL', 'PDL Prev Day Low'],
                  ] as const
                ).map(([toolId, label]) => (
                  <button
                    key={toolId}
                    type="button"
                    onClick={() => {
                      setPendingStart(null)
                      setActiveTool(toolId)
                      setRayMenuOpen(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-[6px] hover:bg-[#0B0E14] text-[#FFD740] font-semibold cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ICT OTE Fibonacci (0.50, 0.618, 0.705, 0.79) */}
          <button
            type="button"
            onClick={() => {
              setPendingStart(null)
              setActiveTool((t) => (t === 'OTE_FIB' ? 'CURSOR' : 'OTE_FIB'))
            }}
            className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold flex items-center gap-1 cursor-pointer border ${
              activeTool === 'OTE_FIB'
                ? 'bg-[#FFFFFF] text-[#0B0E14] border-[#FFFFFF]'
                : 'bg-[#131722] text-[#FFFFFF] border-[#1E222D]'
            }`}
            title="ICT OTE Fibonacci (0.50 EQ, 0.618, 0.705 OTE Sweet Spot, 0.79)"
          >
            <Sliders size={10} />
            <span>OTE Fib</span>
          </button>

          {/* Trendline */}
          <button
            type="button"
            onClick={() => {
              setPendingStart(null)
              setActiveTool((t) => (t === 'TRENDLINE' ? 'CURSOR' : 'TRENDLINE'))
            }}
            className={`px-2 py-1 rounded-[6px] text-[10px] font-semibold cursor-pointer border ${
              activeTool === 'TRENDLINE'
                ? 'bg-[#FFFFFF] text-[#0B0E14] border-[#FFFFFF]'
                : 'bg-[#131722] text-[#B2B5BE] border-[#1E222D]'
            }`}
            title="Draw Trendline / Inducement Line"
          >
            Line
          </button>

          {/* Text Note */}
          <button
            type="button"
            onClick={() => {
              setPendingStart(null)
              setActiveTool((t) => (t === 'TEXT_NOTE' ? 'CURSOR' : 'TEXT_NOTE'))
            }}
            className={`p-1 rounded-[6px] text-[10px] cursor-pointer border ${
              activeTool === 'TEXT_NOTE'
                ? 'bg-[#FFFFFF] text-[#0B0E14] border-[#FFFFFF]'
                : 'bg-[#131722] text-[#B2B5BE] border-[#1E222D]'
            }`}
            title="Place Text Note"
          >
            <TypeIcon size={11} />
          </button>

          {/* Magnet Mode */}
          <button
            type="button"
            onClick={() => setMagnetMode((m) => !m)}
            className={`p-1 rounded-[6px] text-[10px] cursor-pointer border ${
              magnetMode
                ? 'bg-[#26A69A]/20 text-[#26A69A] border-[#26A69A]/50'
                : 'bg-[#131722] text-[#787B86] border-[#1E222D]'
            }`}
            title="Magnet Mode (Snap to Candle OHLC)"
          >
            <Magnet size={11} />
          </button>

          {/* Undo / Redo / Clear */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1 rounded-[6px] bg-[#131722] border border-[#1E222D] text-[#B2B5BE] disabled:opacity-35 cursor-pointer"
            title="Undo Drawing"
          >
            <Undo2 size={11} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1 rounded-[6px] bg-[#131722] border border-[#1E222D] text-[#B2B5BE] disabled:opacity-35 cursor-pointer"
            title="Redo Drawing"
          >
            <Redo2 size={11} />
          </button>
          <button
            type="button"
            onClick={handleClearDrawings}
            disabled={drawings.length === 0}
            className="p-1 rounded-[6px] bg-[#131722] border border-[#1E222D] text-[#EF5350] disabled:opacity-35 cursor-pointer"
            title="Clear All Drawings"
          >
            <Trash2 size={11} />
          </button>
        </div>

        {/* Historical Backtest Replay Toggle Button */}
        <button
          type="button"
          onClick={() => {
            setReplayMode((r) => {
              const next = !r
              if (next) {
                setReplayIndex(Math.max(20, Math.floor(candles.length * 0.7)))
              } else {
                setReplayPlaying(false)
                setSelectingCutBar(false)
              }
              return next
            })
          }}
          className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer border ${
            replayMode
              ? 'bg-[#FFD740] text-[#0B0E14] border-[#FFD740]'
              : 'bg-[#131722] text-[#FFFFFF] border-[#1E222D]'
          }`}
        >
          <RotateCcw size={11} />
          <span>{replayMode ? 'Exit Replay' : 'Backtest Replay'}</span>
        </button>
      </div>

      {/* HISTORICAL BACKTEST REPLAY BAR (Select Cut Candle, Play, Pause, +1 Step, 1x/2x/5x Speed, Buy/Sell & Win-Rate Scorecard) */}
      {replayMode && (
        <div className="z-20 bg-[#131722] border-b border-[#1E222D] px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] tabular-nums">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectingCutBar((s) => !s)}
              className={`px-2 py-1 rounded-[6px] font-semibold flex items-center gap-1 cursor-pointer border ${
                selectingCutBar
                  ? 'bg-[#FFD740] text-[#0B0E14] border-[#FFD740]'
                  : 'bg-[#0B0E14] text-[#FFD740] border-[#1E222D]'
              }`}
            >
              <Scissors size={11} />
              <span>{selectingCutBar ? 'Tap Any Candle…' : 'Select Cut Candle'}</span>
            </button>

            <button
              type="button"
              onClick={() => setReplayPlaying((p) => !p)}
              className="px-2.5 py-1 rounded-[6px] bg-[#FFFFFF] text-[#0B0E14] font-bold flex items-center gap-1 cursor-pointer"
            >
              {replayPlaying ? <Pause size={11} /> : <Play size={11} />}
              <span>{replayPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={stepReplayForward}
              disabled={replayIndex >= candles.length}
              className="px-2 py-1 rounded-[6px] bg-[#0B0E14] border border-[#1E222D] text-[#FFFFFF] font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <SkipForward size={11} />
              <span>+1 Candle</span>
            </button>

            <div className="inline-flex rounded-[6px] bg-[#0B0E14] border border-[#1E222D] p-0.5">
              {([1, 2, 5] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setReplaySpeed(spd)}
                  className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold cursor-pointer ${
                    replaySpeed === spd ? 'bg-[#FFFFFF] text-[#0B0E14]' : 'text-[#787B86]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <span className="text-[#787B86] font-mono">
              Bar {replayIndex}/{candles.length}
            </span>
          </div>

          {/* Simulated Execution & Live Backtest Win-Rate Scorecard */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => openSimTrade('LONG')}
              className="px-2 py-1 rounded-[6px] bg-[#26A69A] text-[#0B0E14] font-bold cursor-pointer"
            >
              Sim Buy
            </button>
            <button
              type="button"
              onClick={() => openSimTrade('SHORT')}
              className="px-2 py-1 rounded-[6px] bg-[#EF5350] text-[#FFFFFF] font-bold cursor-pointer"
            >
              Sim Sell
            </button>
            <div className="px-2 py-1 rounded-[6px] bg-[#0B0E14] border border-[#1E222D] font-mono text-[10px] flex items-center gap-2">
              <span>
                Win Rate: <strong className="text-[#26A69A]">{backtestScorecard.winRate}%</strong> ({backtestScorecard.wins}W/{backtestScorecard.losses}L)
              </span>
              <span>
                Net:{' '}
                <strong style={{ color: backtestScorecard.netR >= 0 ? '#26A69A' : '#EF5350' }}>
                  {backtestScorecard.netR >= 0 ? '+' : ''}
                  {backtestScorecard.netR}R
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Active Drawing Mode Instruction Banner */}
      {(activeTool !== 'CURSOR' || selectingCutBar || journalToast) && (
        <div className="z-20 bg-[#0B0E14]/95 border-b border-[#1E222D] px-3 py-1 flex items-center justify-between text-[10.5px]">
          {journalToast ? (
            <span className="text-[#26A69A] font-semibold">{journalToast}</span>
          ) : selectingCutBar ? (
            <span className="text-[#FFD740] font-semibold">
              Tap any historical candle on the chart to cut future bars and begin bar-by-bar replay.
            </span>
          ) : (
            <span className="text-[#FFFFFF]">
              Tool Active: <strong className="text-[#26A69A]">{activeTool}</strong> —{' '}
              {pendingStart ? 'Tap second point on chart to finish drawing' : 'Tap anywhere on the chart to place'}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setActiveTool('CURSOR')
              setPendingStart(null)
              setSelectingCutBar(false)
            }}
            className="text-[#787B86] hover:text-[#FFFFFF] font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Chart + Interactive SVG/HTML Drawing Overlay */}
      <div className="relative w-full flex-1">
        {showApexPulse && (
          <div className="pointer-events-none absolute top-2 left-2 right-16 z-10 flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                style={{
                  backgroundColor: hudData.killzone.isSilverBulletActive ? 'rgba(0, 230, 118, 0.25)' : 'rgba(18, 22, 31, 0.85)',
                  borderColor: hudData.killzone.isSilverBulletActive ? '#00E676' : '#262B38',
                  color: hudData.killzone.isSilverBulletActive ? '#00E676' : '#B2B5BE',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: hudData.killzone.isSilverBulletActive ? '#00E676' : '#FFD740' }}
                />
                {hudData.killzone.shortLabel} · {hudData.killzone.estRange}
              </span>
              {hudData.confluenceScorePct > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    backgroundColor: hudData.passesGate ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 23, 68, 0.25)',
                    borderColor: hudData.passesGate ? '#00E676' : '#FF1744',
                    color: hudData.passesGate ? '#00E676' : '#FF1744',
                  }}
                >
                  CONFLUENCE: {hudData.confluenceScorePct}%
                </span>
              )}
            </div>
          </div>
        )}

        <div
          ref={box}
          className={`w-full bg-[#000000] ${fullScreen ? 'h-full flex-1' : 'rounded-b-[8px]'}`}
          style={{ overflow: 'hidden', backgroundColor: '#000000' }}
        />

        {/* Interactive Overlay Layer for Placing & Dragging Drawings */}
        <div
          data-coord-version={coordVersion}
          onPointerDown={handleOverlayPointerDown}
          onPointerMove={handleOverlayPointerMove}
          onPointerUp={handleOverlayPointerUp}
          className="absolute inset-0 z-10 overflow-hidden"
          style={{
            pointerEvents:
              activeTool !== 'CURSOR' || selectingCutBar || draggingHandle !== null ? 'auto' : 'none',
            cursor: activeTool !== 'CURSOR' || selectingCutBar ? 'crosshair' : 'default',
          }}
        >
          {drawings.map((item) => {
            const x1 = Math.max(8, Math.min((box.current?.clientWidth || 360) - 90, timeToX(item.t1)))
            const x2 = item.t2
              ? Math.max(x1 + 95, Math.min((box.current?.clientWidth || 360) - 55, timeToX(item.t2)))
              : Math.min((box.current?.clientWidth || 360) - 55, x1 + 150)

            // 1. Long & Short Position Interactive SL/TP Box
            if (item.type === 'LONG_POS' || item.type === 'SHORT_POS') {
              const isLong = item.type === 'LONG_POS'
              const entry = item.entry ?? item.p1
              const sl = item.sl ?? (isLong ? entry * 0.996 : entry * 1.004)
              const tp1 = item.tp1 ?? (isLong ? entry * 1.004 : entry * 0.996)
              const tp2 = item.tp2 ?? (isLong ? entry * 1.008 : entry * 0.992)

              const yEntry = priceToY(entry)
              const ySl = priceToY(sl)
              const yTp1 = priceToY(tp1)
              const yTp2 = priceToY(tp2)

              const slPips = Number((Math.abs(entry - sl) / symDef.pipSize).toFixed(1))
              const tpPips = Number((Math.abs(tp2 - entry) / symDef.pipSize).toFixed(1))
              const riskDist = Math.max(1e-6, Math.abs(entry - sl))
              const rr = Number((Math.abs(tp2 - entry) / riskDist).toFixed(2))
              const lotCalc = calculateApexLotSize(accountBalance, riskPct, entry, sl, symDef.id)

              const profitTop = Math.min(yEntry, yTp2)
              const profitHeight = Math.max(14, Math.abs(yTp2 - yEntry))
              const lossTop = Math.min(yEntry, ySl)
              const lossHeight = Math.max(14, Math.abs(ySl - yEntry))
              const boxWidth = Math.max(130, x2 - x1)

              return (
                <div key={item.id} className="pointer-events-auto">
                  {/* Green Take Profit Zone */}
                  <div
                    style={{
                      position: 'absolute',
                      left: x1,
                      top: profitTop,
                      width: boxWidth,
                      height: profitHeight,
                      backgroundColor: 'rgba(38, 166, 154, 0.22)',
                      border: '1px solid #26A69A',
                    }}
                  />
                  {/* Red Stop Loss Zone */}
                  <div
                    style={{
                      position: 'absolute',
                      left: x1,
                      top: lossTop,
                      width: boxWidth,
                      height: lossHeight,
                      backgroundColor: 'rgba(239, 83, 80, 0.22)',
                      border: '1px solid #EF5350',
                    }}
                  />

                  {/* Telemetry Badge + One-Tap "Log to Journal" Button */}
                  <div
                    style={{
                      position: 'absolute',
                      left: x1,
                      top: Math.max(4, Math.min(profitTop, lossTop) - 42),
                    }}
                    className="rounded-[6px] bg-[#0B0E14]/95 border border-[#1E222D] px-2 py-1 text-[9.5px] font-mono text-[#FFFFFF] shadow-lg flex flex-wrap items-center gap-1.5 whitespace-nowrap"
                  >
                    <span className={isLong ? 'text-[#26A69A] font-bold' : 'text-[#EF5350] font-bold'}>
                      {isLong ? 'LONG' : 'SHORT'}
                    </span>
                    <span>1 : {rr} RR</span>
                    <span className="text-[#26A69A]">+{tpPips}p</span>
                    <span className="text-[#EF5350]">-{slPips}p</span>
                    <span className="text-[#FFD740]">{lotCalc.lotSize} Lots</span>
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        handleLogDrawingPositionToJournal(item)
                      }}
                      className="px-1.5 py-0.5 rounded-[4px] bg-[#FFFFFF] text-[#0B0E14] font-sans font-bold text-[9px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <NotebookPen size={9} />
                      <span>Log to Journal</span>
                    </button>
                  </div>

                  {/* Draggable Entry Handle */}
                  <div
                    onPointerDown={(ev) => {
                      ev.stopPropagation()
                      setDraggingHandle({ drawingId: item.id, handle: 'entry' })
                    }}
                    style={{ position: 'absolute', left: x1, top: yEntry - 9, width: boxWidth }}
                    className="h-4 flex items-center justify-between px-1.5 bg-[#FFFFFF]/90 text-[#0B0E14] font-mono text-[9px] font-bold rounded-[3px] cursor-ns-resize shadow"
                  >
                    <span>ENTRY {fmtPrice(entry, symDef.digits)}</span>
                    <span>⇅ Drag</span>
                  </div>

                  {/* Draggable TP1 Handle */}
                  <div
                    onPointerDown={(ev) => {
                      ev.stopPropagation()
                      setDraggingHandle({ drawingId: item.id, handle: 'tp1' })
                    }}
                    style={{ position: 'absolute', left: x1, top: yTp1 - 8, width: boxWidth }}
                    className="h-3.5 flex items-center justify-between px-1.5 bg-[#26A69A]/85 text-[#0B0E14] font-mono text-[8.5px] font-bold rounded-[3px] cursor-ns-resize"
                  >
                    <span>TP1 (BE) {fmtPrice(tp1, symDef.digits)}</span>
                    <span>⇅</span>
                  </div>

                  {/* Draggable TP2 Handle */}
                  <div
                    onPointerDown={(ev) => {
                      ev.stopPropagation()
                      setDraggingHandle({ drawingId: item.id, handle: 'tp2' })
                    }}
                    style={{ position: 'absolute', left: x1, top: yTp2 - 9, width: boxWidth }}
                    className="h-4 flex items-center justify-between px-1.5 bg-[#26A69A] text-[#0B0E14] font-mono text-[9px] font-bold rounded-[3px] cursor-ns-resize shadow"
                  >
                    <span>TP2 {fmtPrice(tp2, symDef.digits)} (+{tpPips}p)</span>
                    <span>⇅</span>
                  </div>

                  {/* Draggable Stop Loss Handle */}
                  <div
                    onPointerDown={(ev) => {
                      ev.stopPropagation()
                      setDraggingHandle({ drawingId: item.id, handle: 'sl' })
                    }}
                    style={{ position: 'absolute', left: x1, top: ySl - 9, width: boxWidth }}
                    className="h-4 flex items-center justify-between px-1.5 bg-[#EF5350] text-[#FFFFFF] font-mono text-[9px] font-bold rounded-[3px] cursor-ns-resize shadow"
                  >
                    <span>SL {fmtPrice(sl, symDef.digits)} (-{slPips}p)</span>
                    <span>⇅</span>
                  </div>
                </div>
              )
            }

            // 2. ICT Institutional Shaded Zones (+OB/-OB, BISI/SIBI, +BB/-BB)
            if (item.type.startsWith('ZONE_')) {
              const y1 = priceToY(item.p1)
              const y2 = priceToY(item.p2 ?? item.p1)
              const top = Math.min(y1, y2)
              const heightPx = Math.max(16, Math.abs(y2 - y1))
              const isBull = item.type.endsWith('BULL') || item.type.endsWith('BISI')
              const isBreaker = item.type.includes('_BB_')
              const borderCol = isBreaker ? '#D500F9' : isBull ? '#26A69A' : '#EF5350'
              const fillCol = isBreaker
                ? 'rgba(213, 0, 249, 0.20)'
                : isBull
                ? 'rgba(38, 166, 154, 0.22)'
                : 'rgba(239, 83, 80, 0.22)'

              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: x1,
                    top,
                    width: Math.max(110, x2 - x1),
                    height: heightPx,
                    backgroundColor: fillCol,
                    border: `1px solid ${borderCol}`,
                  }}
                  className="pointer-events-auto flex items-start justify-between px-1.5 py-0.5 text-[9px] font-mono font-bold"
                >
                  <span style={{ color: borderCol }}>{item.label}</span>
                  <span className="text-[#EAEAEA]">{fmtPrice((item.p1 + (item.p2 ?? item.p1)) / 2, symDef.digits)}</span>
                </div>
              )
            }

            // 3. Liquidity Rays (BSL $$$, SSL $$$, PDH, PDL)
            if (item.type.startsWith('RAY_')) {
              const y = priceToY(item.p1)
              const isBsl = item.type === 'RAY_BSL' || item.type === 'RAY_PDH'
              const col = isBsl ? '#26A69A' : '#EF5350'
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: x1,
                    right: 52,
                    top: y - 8,
                  }}
                  className="pointer-events-auto flex items-center"
                >
                  <div className="w-full border-t-2 border-dashed" style={{ borderColor: '#FFD740' }} />
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-[#0B0E14] border text-[9px] font-mono font-bold whitespace-nowrap"
                    style={{ borderColor: col, color: '#FFD740' }}
                  >
                    {item.label} · {fmtPrice(item.p1, symDef.digits)}
                  </span>
                </div>
              )
            }

            // 4. ICT OTE Fibonacci (0.50, 0.618, 0.705, 0.79)
            if (item.type === 'OTE_FIB') {
              const pStart = item.p1
              const pEnd = item.p2 ?? item.p1
              const levels = [
                { fib: 0, label: '0.00', col: '#787B86' },
                { fib: 0.5, label: '0.50 (EQ)', col: '#B2B5BE' },
                { fib: 0.618, label: '0.618 (OTE)', col: '#FFD740' },
                { fib: 0.705, label: '0.705 (OTE Sweet Spot)', col: '#00E676' },
                { fib: 0.79, label: '0.79 (OTE)', col: '#FFD740' },
                { fib: 1, label: '1.00', col: '#787B86' },
              ]
              return (
                <div key={item.id} className="pointer-events-auto">
                  {levels.map((lv) => {
                    const priceVal = pEnd - (pEnd - pStart) * lv.fib
                    const y = priceToY(priceVal)
                    return (
                      <div
                        key={lv.fib}
                        style={{
                          position: 'absolute',
                          left: x1,
                          width: Math.max(140, x2 - x1),
                          top: y - 7,
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1 border-t border-dashed" style={{ borderColor: lv.col }} />
                        <span
                          className="ml-1 px-1 rounded bg-[#0B0E14]/90 text-[8.5px] font-mono font-bold whitespace-nowrap"
                          style={{ color: lv.col }}
                        >
                          {lv.label} ({fmtPrice(priceVal, symDef.digits)})
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            }

            // 5. Trendline
            if (item.type === 'TRENDLINE') {
              const y1 = priceToY(item.p1)
              const y2 = priceToY(item.p2 ?? item.p1)
              return (
                <svg key={item.id} className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD740" strokeWidth={1.75} strokeDasharray="4 3" />
                </svg>
              )
            }

            // 6. Text Note
            if (item.type === 'TEXT_NOTE') {
              const y = priceToY(item.p1)
              return (
                <div
                  key={item.id}
                  style={{ position: 'absolute', left: x1, top: y - 12 }}
                  className="pointer-events-auto px-2 py-0.5 rounded-[4px] bg-[#131722] border border-[#FFD740] text-[#FFD740] text-[9.5px] font-mono font-semibold shadow"
                >
                  {item.label}
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
})

export default LiveChart
