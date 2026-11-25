import React, { useState, useEffect } from 'react'
import { SlidersHorizontal, RefreshCw, Check, X, ArrowUpDown, Radio } from 'lucide-react'
import {
  getBrokerOffset,
  setBrokerOffset,
  resetBrokerOffset,
  syncToBrokerPrice,
  syncBenchmarks,
} from '../lib/brokerCalibration'
import { fmtPrice, computeBidAskSpread, type SymbolDef } from '../lib/market'

interface BrokerSyncModalProps {
  isOpen: boolean
  onClose: () => void
  symbol: SymbolDef
  livePrice: number
  dataStatus?: string
}

export default function BrokerSyncModal({
  isOpen,
  onClose,
  symbol,
  livePrice,
  dataStatus = 'LIVE',
}: BrokerSyncModalProps) {
  const [brokerInput, setBrokerInput] = useState('')
  const [currentOffset, setCurrentOffset] = useState(0)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const off = getBrokerOffset(symbol.id)
      setCurrentOffset(off)
      setBrokerInput(livePrice > 0 ? livePrice.toFixed(symbol.digits) : '')
      setSyncSuccess(false)
    }
  }, [isOpen, symbol.id, livePrice, symbol.digits])

  if (!isOpen) return null

  const quote = computeBidAskSpread(symbol.id, livePrice)

  // Slider bounds & step based on instrument class
  const sliderConfig =
    symbol.id === 'EURUSD' || symbol.id === 'GBPUSD'
      ? { min: -0.005, max: 0.005, step: 0.00005 }
      : symbol.id === 'USDJPY'
      ? { min: -0.5, max: 0.5, step: 0.005 }
      : symbol.id === 'XAUUSD'
      ? { min: -25, max: 25, step: 0.1 }
      : { min: -100, max: 100, step: 0.5 }

  const handleSliderChange = (val: number) => {
    const baseWithoutOffset = livePrice - currentOffset
    setBrokerOffset(symbol.id, val)
    setCurrentOffset(val)
    const nextPrice = baseWithoutOffset + val
    if (isFinite(nextPrice) && nextPrice > 0) {
      setBrokerInput(nextPrice.toFixed(symbol.digits))
    }
  }

  const handleApplySync = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(brokerInput)
    if (!isFinite(target) || target <= 0) return
    syncToBrokerPrice(symbol.id, livePrice, target)
    setCurrentOffset(getBrokerOffset(symbol.id))
    setSyncSuccess(true)
    setTimeout(() => {
      setSyncSuccess(false)
      onClose()
    }, 800)
  }

  const handleReset = () => {
    resetBrokerOffset(symbol.id)
    setCurrentOffset(0)
    setBrokerInput(livePrice.toFixed(symbol.digits))
    setSyncSuccess(true)
    setTimeout(() => {
      setSyncSuccess(false)
      onClose()
    }, 800)
  }

  const handleRefreshFeed = async () => {
    setIsRefreshing(true)
    await syncBenchmarks()
    setCurrentOffset(getBrokerOffset(symbol.id))
    setIsRefreshing(false)
  }

  const handleNudge = (delta: number) => {
    const newOffset = Number((currentOffset + delta).toFixed(symbol.digits))
    setBrokerOffset(symbol.id, newOffset)
    setCurrentOffset(newOffset)
    setBrokerInput((livePrice + delta).toFixed(symbol.digits))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 fadein"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1E222D] pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#FFFFFF]" />
            <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
              Chart Settings & Broker Calibration · {symbol.label}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[6px] bg-[#0B0E14] border border-[#1E222D] text-[10px] font-semibold text-[#26A69A] flex items-center gap-1 tabular-nums">
              <Radio size={10} />
              {dataStatus}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[8px] text-[#787B86] hover:text-[#FFFFFF] active:scale-98 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Live Bid / Ask / Spread Bar */}
        <div className="grid grid-cols-3 gap-2.5 text-[11.5px] tabular-nums">
          <div className="p-2.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <span className="label block">Live Bid</span>
            <span className="text-[14px] font-bold text-[#EF5350] mt-0.5 block font-mono">
              {fmtPrice(quote.bid, symbol.digits)}
            </span>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <span className="label block">Live Ask</span>
            <span className="text-[14px] font-bold text-[#26A69A] mt-0.5 block font-mono">
              {fmtPrice(quote.ask, symbol.digits)}
            </span>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[#0B0E14] border border-[#1E222D]">
            <span className="label block">Spread</span>
            <span className="text-[14px] font-bold text-[#FFFFFF] mt-0.5 block font-mono">
              {quote.spreadPips} <span className="text-[10px] text-[#787B86]">pts</span>
            </span>
          </div>
        </div>

        {/* Broker Offset Calibration (+/- points) Slider */}
        <div className="p-3 rounded-[10px] bg-[#0B0E14] border border-[#1E222D] space-y-2 tabular-nums">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-[#FFFFFF] font-semibold">
              Broker Offset Calibration (+/- points)
            </span>
            <span
              className="font-mono font-bold text-[12px]"
              style={{ color: currentOffset === 0 ? '#787B86' : currentOffset > 0 ? '#26A69A' : '#EF5350' }}
            >
              {currentOffset > 0 ? `+${currentOffset.toFixed(symbol.digits)}` : currentOffset.toFixed(symbol.digits)}
            </span>
          </div>
          <input
            type="range"
            min={sliderConfig.min}
            max={sliderConfig.max}
            step={sliderConfig.step}
            value={Math.max(sliderConfig.min, Math.min(sliderConfig.max, currentOffset))}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="w-full accent-[#26A69A] cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-[#787B86] font-mono">
            <span>{sliderConfig.min}</span>
            <span>Default: 0.0 (Zero Gap)</span>
            <span>+{sliderConfig.max}</span>
          </div>
        </div>

        <form onSubmit={handleApplySync} className="space-y-3">
          <div>
            <label className="block text-[11.5px] text-[#FFFFFF] mb-1.5 font-medium">
              Or Enter Exact Broker Quote (Exness / OANDA / IC Markets):
            </label>
            <input
              type="number"
              step="any"
              value={brokerInput}
              onChange={(e) => setBrokerInput(e.target.value)}
              placeholder={`e.g. ${fmtPrice(livePrice, symbol.digits)}`}
              className="w-full bg-[#0B0E14] border border-[#1E222D] rounded-[8px] px-3 py-2.5 text-[14px] text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF] tabular-nums font-mono"
            />
            <p className="text-[11px] text-[#787B86] mt-1.5 leading-normal">
              All OHLCV candles, Protected Stop Loss buffers, Entry, and TP levels calibrate with zero pip gap.
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-1 flex-wrap tabular-nums">
            <span className="text-[11px] text-[#787B86]">Quick nudge:</span>
            {symbol.id === 'EURUSD' || symbol.id === 'GBPUSD' ? (
              <>
                <button type="button" onClick={() => handleNudge(-0.0002)} className="chip active:scale-98">-2 pips</button>
                <button type="button" onClick={() => handleNudge(-0.0001)} className="chip active:scale-98">-1 pip</button>
                <button type="button" onClick={() => handleNudge(0.0001)} className="chip active:scale-98">+1 pip</button>
                <button type="button" onClick={() => handleNudge(0.0002)} className="chip active:scale-98">+2 pips</button>
              </>
            ) : symbol.id === 'USDJPY' ? (
              <>
                <button type="button" onClick={() => handleNudge(-0.02)} className="chip active:scale-98">-2 pips</button>
                <button type="button" onClick={() => handleNudge(-0.01)} className="chip active:scale-98">-1 pip</button>
                <button type="button" onClick={() => handleNudge(0.01)} className="chip active:scale-98">+1 pip</button>
                <button type="button" onClick={() => handleNudge(0.02)} className="chip active:scale-98">+2 pips</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => handleNudge(-0.5)} className="chip active:scale-98">-0.50</button>
                <button type="button" onClick={() => handleNudge(-0.1)} className="chip active:scale-98">-0.10</button>
                <button type="button" onClick={() => handleNudge(0.1)} className="chip active:scale-98">+0.10</button>
                <button type="button" onClick={() => handleNudge(0.5)} className="chip active:scale-98">+0.50</button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#FFFFFF] text-[#0B0E14] font-semibold text-[12px] py-2.5 rounded-[8px] flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-98"
            >
              {syncSuccess ? (
                <>
                  <Check size={14} /> Synced
                </>
              ) : (
                <>
                  <ArrowUpDown size={14} /> Apply Calibration
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-[8px] bg-[#0B0E14] border border-[#1E222D] text-[12px] font-medium text-[#787B86] hover:text-[#FFFFFF] cursor-pointer select-none active:scale-98"
              title="Reset offset to 0.0"
            >
              Reset (0.0)
            </button>
          </div>
        </form>

        <div className="pt-2.5 border-t border-[#1E222D] flex items-center justify-between text-[11px] text-[#787B86]">
          <span>Institutional Spot & TwelveData Synchronized</span>
          <button
            type="button"
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-[#787B86] hover:text-[#FFFFFF] cursor-pointer active:scale-98"
          >
            <RefreshCw size={11} />
            {isRefreshing ? 'Syncing…' : 'Refresh Benchmark'}
          </button>
        </div>
      </div>
    </div>
  )
}
