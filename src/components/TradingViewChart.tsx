import { useMemo, useState } from 'react'
import type { Analysis } from '../lib/ict'
import { fmtPrice } from '../lib/market'

interface BrokerOption {
  id: string
  label: string
  symbol: string
}

export const OANDA_TV_MONOCHROME_OVERRIDES = {
  'paneProperties.background': '#000000',
  'paneProperties.backgroundType': 'solid',
  'paneProperties.vertGridProperties.color': 'rgba(0, 0, 0, 0)',
  'paneProperties.horzGridProperties.color': 'rgba(0, 0, 0, 0)',
  'paneProperties.crossHairProperties.color': '#CCCCCC',
  'paneProperties.crossHairProperties.width': 1,
  'paneProperties.crossHairProperties.style': 2,
  'scalesProperties.textColor': '#EAEAEA',
  'scalesProperties.backgroundColor': '#000000',
  'scalesProperties.lineColor': '#1E222D',
  'mainSeriesProperties.style': 1,
  'mainSeriesProperties.barColorsOnPrevClose': false,
  'mainSeriesProperties.priceAxisProperties.precision': 'default',
  'mainSeriesProperties.priceLineVisible': true,
  'mainSeriesProperties.priceLineColor': '#CCCCCC',
  'mainSeriesProperties.priceLineWidth': 1,
  'mainSeriesProperties.candleStyle.upColor': '#FFFFFF',
  'mainSeriesProperties.candleStyle.downColor': '#000000',
  'mainSeriesProperties.candleStyle.drawWick': true,
  'mainSeriesProperties.candleStyle.drawBorder': true,
  'mainSeriesProperties.candleStyle.borderColor': '#B2B5BE',
  'mainSeriesProperties.candleStyle.borderUpColor': '#B2B5BE',
  'mainSeriesProperties.candleStyle.borderDownColor': '#B2B5BE',
  'mainSeriesProperties.candleStyle.wickColor': '#B2B5BE',
  'mainSeriesProperties.candleStyle.wickUpColor': '#B2B5BE',
  'mainSeriesProperties.candleStyle.wickDownColor': '#B2B5BE',
} as const

export default function TradingViewChart({
  tvSymbol,
  interval,
  height,
  mode = 'SR',
  analysis,
  digits = 2,
  toggles,
}: {
  tvSymbol: string
  interval: string
  height?: number
  mode?: 'SR' | 'PRO'
  analysis?: Analysis | null
  digits?: number
  toggles?: { plan?: boolean; levels?: boolean; zones?: boolean; key?: boolean }
}) {
  const tvInterval: Record<string, string> = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1d': 'D',
    '1w': 'W',
  }

  // Define broker options for all pairs — OANDA is strictly #1 default across all pairs
  const getBrokerOptions = (sym: string): BrokerOption[] => {
    if (sym.includes('XAUUSD') || sym.includes('GOLD')) {
      return [
        { id: 'OANDA', label: 'OANDA (Exness Standard)', symbol: 'OANDA:XAUUSD' },
        { id: 'CAPITALCOM', label: 'Capital.com', symbol: 'CAPITALCOM:GOLD' },
        { id: 'PEPPERSTONE', label: 'Pepperstone', symbol: 'PEPPERSTONE:XAUUSD' },
        { id: 'TVC', label: 'Spot Metal (TVC)', symbol: 'TVC:GOLD' },
      ]
    }
    if (sym.includes('EURUSD')) {
      return [
        { id: 'OANDA', label: 'OANDA (Exness Standard)', symbol: 'OANDA:EURUSD' },
        { id: 'FX', label: 'FX Spot (Standard)', symbol: 'FX:EURUSD' },
        { id: 'FXCM', label: 'FXCM Interbank', symbol: 'FXCM:EURUSD' },
      ]
    }
    if (sym.includes('GBPUSD')) {
      return [
        { id: 'OANDA', label: 'OANDA (Exness Standard)', symbol: 'OANDA:GBPUSD' },
        { id: 'FX', label: 'FX Spot (Standard)', symbol: 'FX:GBPUSD' },
        { id: 'FXCM', label: 'FXCM Interbank', symbol: 'FXCM:GBPUSD' },
      ]
    }
    if (sym.includes('BTC')) {
      return [
        { id: 'OANDA', label: 'OANDA (Broker Spot)', symbol: 'OANDA:BTCUSD' },
        { id: 'BINANCE', label: 'Binance', symbol: 'BINANCE:BTCUSDT' },
        { id: 'COINBASE', label: 'Coinbase', symbol: 'COINBASE:BTCUSD' },
      ]
    }
    if (sym.includes('ETH')) {
      return [
        { id: 'OANDA', label: 'OANDA (Broker Spot)', symbol: 'OANDA:ETHUSD' },
        { id: 'BINANCE', label: 'Binance', symbol: 'BINANCE:ETHUSDT' },
        { id: 'COINBASE', label: 'Coinbase', symbol: 'COINBASE:ETHUSD' },
      ]
    }
    return [{ id: 'OANDA', label: 'OANDA Feed', symbol: sym }]
  }

  const brokerOptions = getBrokerOptions(tvSymbol)
  const [selectedBroker, setSelectedBroker] = useState<string>('OANDA')

  const activeSymbol =
    brokerOptions.find(b => b.id === selectedBroker)?.symbol ??
    brokerOptions[0]?.symbol ??
    tvSymbol

  const h =
    height ?? (typeof window !== 'undefined' && window.innerWidth < 420 ? 370 : 440)

  const hideSideToolbar = mode === 'SR'
  const allowSymbolChange = mode === 'PRO'
  const resolvedInterval = tvInterval[interval] ?? '15'

  // Build self-contained TradingView Advanced Chart srcDoc with exact monochrome institutional overrides:
  // - Pure Black (#000000) background, Transparent/Hidden grid (rgba(0, 0, 0, 0))
  // - Bullish (#FFFFFF) body, Bearish (#000000) hollow body, #B2B5BE borders & wicks
  // - barColorsOnPrevClose: false, precision: 'default', timezone: 'Asia/Kolkata' ((UTC+5:30) Kolkata)
  // - Crosshair / Current Price Line: thin dotted #CCCCCC, Axis text: #EAEAEA, Y-axis label: #E0E0E0 bg with #000000 text
  const srcDoc = useMemo(() => {
    const widgetConfig = {
      autosize: true,
      symbol: activeSymbol,
      interval: resolvedInterval,
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#000000',
      gridColor: 'rgba(0, 0, 0, 0)',
      hide_side_toolbar: hideSideToolbar,
      allow_symbol_change: allowSymbolChange,
      save_image: false,
      hide_volume: true,
      withdateranges: false,
      support_host: 'https://www.tradingview.com',
      overrides: OANDA_TV_MONOCHROME_OVERRIDES,
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <style>
    html, body, .tradingview-widget-container, #tv_oanda_chart {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      color: #EAEAEA;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="tradingview-widget-container">
    <div id="tv_oanda_chart" class="tradingview-widget-container__widget"></div>
    <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
    ${JSON.stringify(widgetConfig)}
    </script>
  </div>
</body>
</html>`
  }, [activeSymbol, resolvedInterval, hideSideToolbar, allowSymbolChange])

  // Extract SR Plan Levels
  const plan = analysis?.plan
  const bsl = analysis?.levels.bsl?.[0]
  const ssl = analysis?.levels.ssl?.[0]
  const showPlan = toggles?.plan !== false && plan && plan.valid

  return (
    <div className="w-full space-y-2">
      {/* Top Status & Broker Indicator */}
      <div className="flex items-center justify-between px-1 py-1 text-[10.5px] mono flex-wrap gap-1.5 tabular-nums">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-[#089981] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981] inline-block" />
            OANDA Live Feed
          </span>
          <span className="text-[#787B86] hidden sm:inline">· (UTC+5:30) Kolkata · Precision: Default</span>
        </div>

        {mode === 'PRO' && brokerOptions.length > 1 && (
          <div className="flex items-center gap-1 bg-[#0B0E14] p-0.5 rounded-[8px] border border-[#1E222D]">
            <span className="text-[#787B86] text-[9.5px] px-1.5">Broker:</span>
            {brokerOptions.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBroker(b.id)}
                className={`px-2 py-0.5 rounded-[6px] text-[9.5px] font-semibold smooth-ui active:scale-98 cursor-pointer ${
                  selectedBroker === b.id
                    ? 'bg-[#FFFFFF] text-[#0B0E14]'
                    : 'text-[#787B86] hover:text-[#FFFFFF]'
                }`}
              >
                {b.id}
              </button>
            ))}
          </div>
        )}

        {mode === 'SR' && (
          <span className="text-[10px] text-[#787B86] tabular-nums">
            Pair: <strong className="text-[#FFFFFF]">{activeSymbol}</strong>
          </span>
        )}
      </div>

      {/* SR ICT Targets HUD Strip (When Plan is Valid) */}
      {showPlan && (
        <div
          className="flex items-center gap-2.5 px-2.5 py-1.5 bg-[#0B0E14] rounded-[8px] border border-[#1E222D] text-[10px] mono overflow-x-auto scroll-touch tabular-nums"
        >
          <span
            className="font-bold text-[10px]"
            style={{ color: plan.direction === 'LONG' ? '#089981' : '#F23645' }}
          >
            {plan.direction}
          </span>
          <span className="text-[#787B86] shrink-0">
            Entry: <strong className="text-[#FFFFFF]">{fmtPrice(plan.entry, digits)}</strong>
          </span>
          <span className="text-[#787B86] shrink-0">
            SL: <strong className="text-[#F23645]">{fmtPrice(plan.stop, digits)}</strong>
          </span>
          <span className="text-[#787B86] shrink-0">
            TP1: <strong className="text-[#089981]">{fmtPrice(plan.tp1, digits)}</strong>
          </span>
          {plan.tp2 && (
            <span className="text-[#787B86] shrink-0">
              TP2: <strong className="text-[#089981]">{fmtPrice(plan.tp2, digits)}</strong>
            </span>
          )}
          {bsl && (
            <span className="text-[#787B86] shrink-0">
              BSL: <span className="text-[#089981]">{fmtPrice(bsl, digits)}</span>
            </span>
          )}
          {ssl && (
            <span className="text-[#787B86] shrink-0">
              SSL: <span className="text-[#F23645]">{fmtPrice(ssl, digits)}</span>
            </span>
          )}
        </div>
      )}

      {/* OANDA Chart Frame — Pure Black (#000000) Institutional Theme */}
      <div
        className="w-full rounded-[8px] overflow-hidden border border-[#1E222D]"
        style={{ height: h, background: '#000000' }}
      >
        <iframe
          key={`${activeSymbol}_${resolvedInterval}_${mode}`}
          title={`OANDA Chart - ${activeSymbol}`}
          srcDoc={srcDoc}
          style={{ width: '100%', height: '100%', border: '0', display: 'block', background: '#000000' }}
          allowFullScreen
        />
      </div>
    </div>
  )
}
