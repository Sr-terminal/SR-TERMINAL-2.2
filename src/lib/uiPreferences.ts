import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { safeStorage } from './storage'
import { ChartToggles } from '../components/LiveChart'

export interface SymbolUiPreferences {
  chartToggles?: Partial<ChartToggles>
  chartView?: 'SR' | 'TV'
}

export interface GlobalUiPreferences {
  toggles: ChartToggles
  chartView: 'SR' | 'TV'
  symbolOverrides: Record<string, SymbolUiPreferences>
}

const UI_PREFS_KEY = 'sr.ui.preferences.v1'

const DEFAULT_TOGGLES: ChartToggles = {
  plan: true,
  levels: true,
  zones: true,
  key: true,
}

const DEFAULT_PREFS: GlobalUiPreferences = {
  toggles: { ...DEFAULT_TOGGLES },
  chartView: 'SR',
  symbolOverrides: {},
}

let cachedPrefs: GlobalUiPreferences | null = null

async function syncDrawingPrefsToFirestore(symbolId: string, prefs: GlobalUiPreferences): Promise<void> {
  const uid = auth?.currentUser?.uid
  if (!db || !uid) return
  try {
    const docId = `draw_${symbolId || 'GLOBAL'}`
    await setDoc(
      doc(db, 'users', uid, 'drawings', docId),
      {
        id: docId,
        uid,
        symbolId: symbolId || 'GLOBAL',
        chartView: prefs.chartView,
        toggles: prefs.symbolOverrides[symbolId]?.chartToggles || prefs.toggles,
        drawingsJson: JSON.stringify(prefs),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  } catch {
    // ignore transient offline
  }
}

export async function loadCloudDrawingPreferences(): Promise<void> {
  const uid = auth?.currentUser?.uid
  if (!db || !uid) return
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'drawings', 'draw_GLOBAL'))
    if (snap.exists() && snap.data()?.drawingsJson) {
      const parsed = JSON.parse(snap.data().drawingsJson)
      if (parsed && typeof parsed === 'object') {
        cachedPrefs = parsed
        safeStorage.setItem(UI_PREFS_KEY, JSON.stringify(parsed))
      }
    }
  } catch {}
}

function loadPreferences(): GlobalUiPreferences {
  if (cachedPrefs) return cachedPrefs
  try {
    const raw = safeStorage.getItem(UI_PREFS_KEY)
    if (!raw) {
      cachedPrefs = { ...DEFAULT_PREFS, toggles: { ...DEFAULT_TOGGLES }, symbolOverrides: {} }
      return cachedPrefs
    }
    const parsed = JSON.parse(raw)
    cachedPrefs = {
      toggles: {
        plan: typeof parsed?.toggles?.plan === 'boolean' ? parsed.toggles.plan : DEFAULT_TOGGLES.plan,
        levels: typeof parsed?.toggles?.levels === 'boolean' ? parsed.toggles.levels : DEFAULT_TOGGLES.levels,
        zones: typeof parsed?.toggles?.zones === 'boolean' ? parsed.toggles.zones : DEFAULT_TOGGLES.zones,
        key: typeof parsed?.toggles?.key === 'boolean' ? parsed.toggles.key : DEFAULT_TOGGLES.key,
      },
      chartView: parsed?.chartView === 'TV' ? 'TV' : 'SR',
      symbolOverrides: parsed?.symbolOverrides && typeof parsed.symbolOverrides === 'object' ? parsed.symbolOverrides : {},
    }
    return cachedPrefs
  } catch {
    cachedPrefs = { ...DEFAULT_PREFS, toggles: { ...DEFAULT_TOGGLES }, symbolOverrides: {} }
    return cachedPrefs
  }
}

function persistPreferences(prefs: GlobalUiPreferences, symbolId = 'GLOBAL'): void {
  cachedPrefs = prefs
  try {
    safeStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs))
  } catch {}
  void syncDrawingPrefsToFirestore(symbolId, prefs)
}

export function getChartToggles(symbolId: string): ChartToggles {
  const prefs = loadPreferences()
  const symOverride = prefs.symbolOverrides[symbolId]?.chartToggles
  return {
    plan: typeof symOverride?.plan === 'boolean' ? symOverride.plan : prefs.toggles.plan,
    levels: typeof symOverride?.levels === 'boolean' ? symOverride.levels : prefs.toggles.levels,
    zones: typeof symOverride?.zones === 'boolean' ? symOverride.zones : prefs.toggles.zones,
    key: typeof symOverride?.key === 'boolean' ? symOverride.key : prefs.toggles.key,
  }
}

export function setChartToggle(symbolId: string, key: keyof ChartToggles, value: boolean, symbolSpecific = false): ChartToggles {
  const prefs = loadPreferences()
  if (symbolSpecific) {
    const existing = prefs.symbolOverrides[symbolId] || {}
    const existingToggles = existing.chartToggles || {}
    const updated = {
      ...prefs,
      symbolOverrides: {
        ...prefs.symbolOverrides,
        [symbolId]: {
          ...existing,
          chartToggles: {
            ...existingToggles,
            [key]: value,
          },
        },
      },
    }
    persistPreferences(updated, symbolId)
    return getChartToggles(symbolId)
  } else {
    const updated = {
      ...prefs,
      toggles: {
        ...prefs.toggles,
        [key]: value,
      },
    }
    persistPreferences(updated, 'GLOBAL')
    return getChartToggles(symbolId)
  }
}

export function saveChartToggles(symbolId: string, toggles: ChartToggles, symbolSpecific = false): void {
  const prefs = loadPreferences()
  if (symbolSpecific) {
    const existing = prefs.symbolOverrides[symbolId] || {}
    const updated = {
      ...prefs,
      symbolOverrides: {
        ...prefs.symbolOverrides,
        [symbolId]: {
          ...existing,
          chartToggles: { ...toggles },
        },
      },
    }
    persistPreferences(updated, symbolId)
  } else {
    const updated = {
      ...prefs,
      toggles: { ...toggles },
    }
    persistPreferences(updated, 'GLOBAL')
  }
}

export function getSavedChartView(): 'SR' | 'TV' {
  return loadPreferences().chartView
}

export function saveChartView(view: 'SR' | 'TV'): void {
  const prefs = loadPreferences()
  persistPreferences({
    ...prefs,
    chartView: view,
  }, 'GLOBAL')
}
