export interface Killzone {
  id: string
  name: string
  from: number
  to: number
  istLabel: string
}

export const KILLZONES: Killzone[] = [
  { id: 'asia', name: 'ASIA RANGE', from: 20, to: 0, istLabel: '05:30–09:30 IST' },
  { id: 'london', name: 'LONDON KZ', from: 2, to: 5, istLabel: '11:30–14:30 IST' },
  { id: 'nyam', name: 'NY AM KZ', from: 7, to: 11, istLabel: '16:30–20:30 IST' },
  { id: 'nypm', name: 'NY PM KZ', from: 13, to: 16, istLabel: '22:30–01:30 IST' },
]

export function etOffsetHours(d: Date): number {
  const y = d.getUTCFullYear()
  const secondSunMarch = 1 + ((7 - new Date(Date.UTC(y, 2, 1)).getUTCDay()) % 7) + 7
  const firstSunNov = 1 + ((7 - new Date(Date.UTC(y, 10, 1)).getUTCDay()) % 7)
  const start = Date.UTC(y, 2, secondSunMarch, 7)
  const end = Date.UTC(y, 10, firstSunNov, 6)
  const now = d.getTime()
  return now >= start && now < end ? -4 : -5
}

export function etTime(d: Date): { h: number; m: number } {
  const off = etOffsetHours(d)
  let h = d.getUTCHours() + off
  const m = d.getUTCMinutes()
  if (h < 0) h += 24
  if (h >= 24) h -= 24
  return { h: Math.floor(h), m }
}

export function istTime(d: Date): { h: number; m: number; ampm: string } {
  let h = d.getUTCHours() + Math.floor(5.5)
  let m = d.getUTCMinutes() + 30
  if (m >= 60) {
    m -= 60
    h += 1
  }
  if (h >= 24) h -= 24
  const ampm = h < 12 ? 'AM' : 'PM'
  return { h, m, ampm }
}

export function fmtClock(d: Date, tz: 'IST' | 'ET', ampm = false): string {
  if (tz === 'IST') {
    const { h, m, ampm: p } = istTime(d)
    const minStr = String(m).padStart(2, '0')
    if (ampm) {
      const h12 = h % 12 === 0 ? 12 : h % 12
      return `${String(h12).padStart(2, '0')}:${minStr} ${p} IST`
    }
    return `${String(h).padStart(2, '0')}:${minStr} IST`
  }
  const { h, m } = etTime(d)
  const minStr = String(m).padStart(2, '0')
  if (ampm) {
    const p = h < 12 ? 'AM' : 'PM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${String(h12).padStart(2, '0')}:${minStr} ${p} ET`
  }
  return `${String(h).padStart(2, '0')}:${minStr} ET`
}

export function activeKillzone(d: Date): Killzone | null {
  const { h, m } = etTime(d)
  const mins = h * 60 + m
  // Check exact Silver Bullet / Killzone windows first
  if (mins >= 2 * 60 && mins < 5 * 60) {
    return KILLZONES.find(k => k.id === 'london') || KILLZONES[1]
  }
  if (mins >= 7 * 60 && mins < 11 * 60) {
    return KILLZONES.find(k => k.id === 'nyam') || KILLZONES[2]
  }
  if (mins >= 13 * 60 && mins < 16 * 60) {
    return KILLZONES.find(k => k.id === 'nypm') || KILLZONES[3]
  }
  for (const kz of KILLZONES) {
    if (kz.to === 0 && kz.from === 20) {
      if (h >= 20) return kz
    } else {
      if (kz.from === 20) continue
      if (h >= kz.from && h < kz.to) return kz
    }
  }
  return null
}

export interface ApexKillzoneWindow {
  id: 'LONDON_OPEN_SB' | 'NY_AM_SB' | 'NY_PM_MACRO_SB' | 'ASIA_ACCUMULATION' | 'INTRADAY_LIQUIDITY'
  name: string
  shortLabel: string
  estRange: string
  istRange: string
  isSilverBulletActive: boolean
  targetDailyTrades: '2-3 A+ Setups/Day'
  cascadeTimeframes: ('15m' | '5m' | '1m')[]
}

export const APEX_KILLZONE_WINDOWS: ApexKillzoneWindow[] = [
  {
    id: 'LONDON_OPEN_SB',
    name: 'London Open Killzone / Silver Bullet',
    shortLabel: 'LONDON SB (02:00–05:00 EST)',
    estRange: '02:00 AM - 05:00 AM EST',
    istRange: '12:30 PM - 03:30 PM IST',
    isSilverBulletActive: true,
    targetDailyTrades: '2-3 A+ Setups/Day',
    cascadeTimeframes: ['15m', '5m', '1m'],
  },
  {
    id: 'NY_AM_SB',
    name: 'New York AM Session / Silver Bullet',
    shortLabel: 'NY AM SB (09:30–11:00 EST)',
    estRange: '09:30 AM - 11:00 AM EST',
    istRange: '08:00 PM - 09:30 PM IST',
    isSilverBulletActive: true,
    targetDailyTrades: '2-3 A+ Setups/Day',
    cascadeTimeframes: ['15m', '5m', '1m'],
  },
  {
    id: 'NY_PM_MACRO_SB',
    name: 'New York PM Macro / Silver Bullet',
    shortLabel: 'NY PM SB (01:30–03:00 PM EST)',
    estRange: '01:30 PM - 03:00 PM EST',
    istRange: '12:00 AM - 01:30 AM IST',
    isSilverBulletActive: true,
    targetDailyTrades: '2-3 A+ Setups/Day',
    cascadeTimeframes: ['15m', '5m', '1m'],
  },
]

export function getActiveApexKillzoneWindow(d: Date = new Date()): ApexKillzoneWindow {
  const { h, m } = etTime(d)
  const mins = h * 60 + m

  // Window 1: London Open Killzone / Silver Bullet (02:00 AM - 05:00 AM EST)
  if (mins >= 2 * 60 && mins <= 5 * 60) {
    return APEX_KILLZONE_WINDOWS[0]
  }
  // Window 2: New York AM Session / Silver Bullet (09:30 AM - 11:00 AM EST)
  if (mins >= 9 * 60 + 30 && mins <= 11 * 60) {
    return APEX_KILLZONE_WINDOWS[1]
  }
  // Window 3: New York PM Macro / Silver Bullet (01:30 PM - 03:00 PM EST / 13:30 - 15:00)
  if (mins >= 13 * 60 + 30 && mins <= 15 * 60) {
    return APEX_KILLZONE_WINDOWS[2]
  }
  // Extended NY / London macro transition windows
  if (mins >= 7 * 60 && mins < 13 * 60 + 30) {
    return {
      ...APEX_KILLZONE_WINDOWS[1],
      shortLabel: 'NY SESSION SCANNER',
      isSilverBulletActive: true,
    }
  }
  if (h >= 20 || h < 2) {
    return {
      id: 'ASIA_ACCUMULATION',
      name: 'Asian Session Liquidity Pool Builder',
      shortLabel: 'ASIA RANGE (BSL/SSL BUILD)',
      estRange: '08:00 PM - 12:00 AM EST',
      istRange: '06:30 AM - 10:30 AM IST',
      isSilverBulletActive: false,
      targetDailyTrades: '2-3 A+ Setups/Day',
      cascadeTimeframes: ['15m', '5m', '1m'],
    }
  }
  return {
    id: 'INTRADAY_LIQUIDITY',
    name: 'Intraday Killzone Liquidity Scanner',
    shortLabel: 'KILLZONE SCANNER (15M→5M→1M)',
    estRange: '24H Intraday Cascade',
    istRange: '24H IST',
    isSilverBulletActive: true,
    targetDailyTrades: '2-3 A+ Setups/Day',
    cascadeTimeframes: ['15m', '5m', '1m'],
  }
}

export function istDateLabel(d: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(d)
}

export function istTimeLabel(ts: number | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(ts))
}
