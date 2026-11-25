import { Capacitor } from '@capacitor/core'
import { BUILD, BUILD_CODE } from './version'
import { safeStorage } from './storage'

const SERVER = 'https://sr-control-server.srterminalofficial.workers.dev'

export interface DeviceState {
  status: 'checking' | 'active' | 'blocked' | 'offline-grace'
  deviceId: string
  name: string
  lastOk: number
}

export interface UpdateManifest {
  versionCode: number
  versionName: string
  url: string
  notes?: string
}

const KEYS = {
  id: 'sr.control.deviceId',
  token: 'sr.control.token',
  name: 'sr.control.name',
  lastOk: 'sr.control.lastOk',
}

function randHex(n: number) {
  const chars = 'abcdef0123456789'
  let s = ''
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function getDeviceId(): string {
  let id = safeStorage.getItem(KEYS.id)
  if (!id) {
    id = `SR-${randHex(4)}-${randHex(4)}-${randHex(4)}`
    safeStorage.setItem(KEYS.id, id)
  }
  return id
}

function getToken(): string {
  let tok = safeStorage.getItem(KEYS.token)
  if (!tok) {
    tok = randHex(32)
    safeStorage.setItem(KEYS.token, tok)
  }
  return tok
}

function getDeviceName(): string {
  return safeStorage.getItem(KEYS.name) || `${Capacitor.getPlatform()}-${getDeviceId().slice(-4)}`
}

async function getMeta() {
  return {
    platform: Capacitor.getPlatform(),
    appVersion: BUILD,
    versionCode: String(BUILD_CODE),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : 'web',
  }
}

const listeners = new Set<(s: DeviceState) => void>()
let current: DeviceState = {
  status: 'active',
  deviceId: getDeviceId(),
  name: getDeviceName(),
  lastOk: Number(safeStorage.getItem(KEYS.lastOk) || Date.now()),
}

export function subscribeDevice(cb: (s: DeviceState) => void) {
  listeners.add(cb)
  cb(current)
  return () => {
    listeners.delete(cb)
  }
}

function emit(partial: Partial<DeviceState>) {
  current = { ...current, ...partial }
  listeners.forEach((l) => l(current))
}

async function registerDevice() {
  const deviceId = getDeviceId()
  const token = getToken()
  try {
    const meta = await getMeta()
    const res = await fetch(`${SERVER}/api/device/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, token, meta }),
    })
    if (res.ok) {
      safeStorage.setItem(KEYS.lastOk, String(Date.now()))
      emit({ status: 'active', lastOk: Date.now() })
    } else {
      emit({ status: 'offline-grace' })
    }
  } catch {
    emit({ status: 'offline-grace' })
  }
}

let timer: any = null

async function heartbeat() {
  const deviceId = getDeviceId()
  const token = getToken()
  try {
    const res = await fetch(`${SERVER}/api/device/heartbeat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${deviceId}.${token}` },
    })
    if (res.status === 403) {
      emit({ status: 'blocked' })
      return
    }
    if (res.ok) {
      safeStorage.setItem(KEYS.lastOk, String(Date.now()))
      emit({ status: 'active', lastOk: Date.now() })
    } else {
      emit({ status: 'offline-grace' })
    }
  } catch {
    emit({ status: 'offline-grace' })
  }
}

export function startDeviceControl() {
  registerDevice().then(() => heartbeat())
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    heartbeat()
  }, 30000)
}

export async function checkUpdate(): Promise<UpdateManifest | null> {
  try {
    const res = await fetch(`${SERVER}/api/admin/update`)
    if (!res.ok) return null
    const data = await res.json()
    if (data && typeof data.versionCode === 'number' && data.versionCode > BUILD_CODE) {
      return data
    }
    return null
  } catch {
    return null
  }
}
