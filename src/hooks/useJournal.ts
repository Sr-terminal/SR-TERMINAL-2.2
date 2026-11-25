// @ts-nocheck
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import {
  loadJournal,
  saveJournal,
  createRecord,
  updateRecordsOnTick,
  revalidateSetups,
  manualClose,
  moveToBreakEven,
  computeStats,
  sanitizeTradeRecord,
  deduplicateJournalRecords,
  migrateAndCleanJournalStorage,
  isClosed,
  isSymbolInPostCloseCooldown,
  type JournalRecord,
} from "../lib/journal"
import { sendTradeNotification, getNotificationPrefs } from "../lib/notifications"
import { apiUrl } from "../lib/apiConfig"

async function notify(type: string, title: string, body: string, eventId?: string) {
  try {
    await sendTradeNotification(type, title, body, eventId)
  } catch (err) {
    console.warn("Notification error:", err)
  }
}

async function syncTradesToFirestore(uid: string, trades: JournalRecord[]) {
  if (!db || !uid || !Array.isArray(trades)) return
  const nowIso = new Date().toISOString()
  for (const raw of trades.slice(0, 60)) {
    const t = sanitizeTradeRecord(raw)
    if (!t?.id) continue
    try {
      const ref = doc(db, "users", uid, "journals", String(t.id))
      await setDoc(
        ref,
        {
          id: String(t.id),
          uid,
          setupId: String(t.setupId || ""),
          signalId: String(t.signalId || t.id),
          symbolId: String(t.symbolId || "XAUUSD"),
          symbolLabel: String(t.symbolLabel || t.symbolId || "XAUUSD"),
          tf: String(t.tf || "15m"),
          direction: t.direction === "SHORT" ? "SHORT" : "LONG",
          model: String(t.model || "ICT MSS REVERSAL"),
          entry: Number(t.entry) || 0,
          initialStopLoss: Number(t.initialStopLoss ?? t.initialSl ?? t.stop) || 0,
          currentStopLoss: Number(t.currentStopLoss ?? t.stop) || 0,
          stop: Number(t.currentStopLoss ?? t.stop) || 0,
          tp1: Number(t.tp1) || 0,
          tp2: Number(t.tp2) || 0,
          tp3: Number(t.tp3) || 0,
          stage: String(t.stage || t.status || "SETUP_FORMING"),
          status: String(t.status || t.stage || "SETUP_FORMING"),
          resultR: Number(t.resultR ?? 0),
          rMultiple: Number(t.rMultiple ?? t.resultR ?? 0),
          beProtected: Boolean(t.beProtected),
          confluences: Array.isArray(t.confluences) ? t.confluences : [],
          logicSummary: String(t.logicSummary || ""),
          createdTs: Number(t.createdTs || Date.now()),
          statusTs: Number(t.statusTs || Date.now()),
          entryConfirmedTs: Number(t.entryConfirmedTs || t.createdTs || Date.now()),
          updatedAt: nowIso,
        },
        { merge: true }
      )
    } catch {
      // ignore transient network error
    }
  }
}

export function useJournal() {
  const [records, setRecords] = useState<JournalRecord[]>(() => deduplicateJournalRecords(loadJournal()))
  const prefsRef = useRef(getNotificationPrefs())

  // One-time migration on app load to clean all saved trades
  useEffect(() => {
    const cleaned = migrateAndCleanJournalStorage()
    setRecords(cleaned)
  }, [])

  // Real-time Cloud Firestore listener for users/{uid}/journals so Play Store updates never wipe user trade journals
  useEffect(() => {
    const uid = auth?.currentUser?.uid
    if (!db || !uid) return

    const colRef = collection(db, "users", uid, "journals")
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        if (snap.empty) {
          const local = deduplicateJournalRecords(loadJournal())
          if (local.length > 0) {
            void syncTradesToFirestore(uid, local)
          }
          return
        }
        const cloudTrades: JournalRecord[] = []
        snap.forEach((docSnap) => {
          cloudTrades.push(sanitizeTradeRecord(docSnap.data()))
        })
        if (cloudTrades.length > 0) {
          const mergedMap = new Map<string, JournalRecord>()
          for (const localRec of deduplicateJournalRecords(loadJournal())) {
            mergedMap.set(localRec.id, localRec)
          }
          for (const cloudRec of cloudTrades) {
            const existing = mergedMap.get(cloudRec.id)
            if (!existing || (cloudRec.statusTs || 0) >= (existing.statusTs || 0)) {
              mergedMap.set(cloudRec.id, cloudRec)
            }
          }
          const merged = deduplicateJournalRecords(Array.from(mergedMap.values()))
          saveJournal(merged)
          setRecords(merged)
        }
      },
      () => {}
    )
    return () => unsub()
  }, [auth?.currentUser?.uid])

  const setAndSave = useCallback((newRecords: JournalRecord[]) => {
    const sanitized = deduplicateJournalRecords(Array.isArray(newRecords) ? newRecords : [])
    setRecords(sanitized)
    saveJournal(sanitized)
    const uid = auth?.currentUser?.uid
    if (uid) {
      void syncTradesToFirestore(uid, sanitized)
    }
  }, [])

  const maybeRecord = useCallback(
    (analysis: any, symbolId: string, symbolLabel: string, tf: string, livePrice: number) => {
      if (!analysis) return
      const currentRecords = deduplicateJournalRecords(loadJournal())
      const reval = revalidateSetups(currentRecords, symbolId, tf, analysis)
      const baseRecords = deduplicateJournalRecords(reval.changed ? reval.records : currentRecords)

      if (!analysis?.plan?.valid) {
        if (reval.changed) setAndSave(baseRecords)
        return
      }
      const p = analysis.plan

      const result = createRecord(p, symbolId, symbolLabel, tf, livePrice, baseRecords)
      if (result) {
        setAndSave(result.records)
      } else if (reval.changed) {
        setAndSave(baseRecords)
      }
    },
    [setAndSave]
  )

  const tick = useCallback(
    (symbolId: string, livePrice: number) => {
      if (!isFinite(livePrice) || livePrice <= 0) return
      const currentRecords = deduplicateJournalRecords(loadJournal())
      const { records: updated, fired, notificationsToSend } = updateRecordsOnTick(currentRecords, symbolId, livePrice)

      if (notificationsToSend && notificationsToSend.length > 0) {
        setAndSave(updated)
        for (const item of notificationsToSend) {
          void notify(item.type, item.title, item.body, item.eventId)
        }
      } else if (fired && fired.length > 0) {
        setAndSave(updated)
        for (const item of fired) {
          void notify(item.status, item.title, item.body, `${item.rec?.signalId || item.rec?.id}-${item.status}`)
        }
      } else if (updated.some((r, i) => r !== currentRecords[i])) {
        setAndSave(updated)
      }
    },
    [setAndSave]
  )

  const closeManual = useCallback(
    (id: string, price: number) => {
      const currentRecords = deduplicateJournalRecords(loadJournal())
      setAndSave(currentRecords.map((r) => (r.id === id ? manualClose(r, price) : r)))
    },
    [setAndSave]
  )

  const moveToBE = useCallback(
    (id: string, price: number) => {
      const currentRecords = deduplicateJournalRecords(loadJournal())
      setAndSave(currentRecords.map((r) => (r.id === id ? moveToBreakEven(r, price) : r)))
      void notify(
        "MOVE_BREAKEVEN",
        "SL MOVED TO BREAK-EVEN",
        "Position risk-free kar di gayi hai (Capital Protected)",
        `${id}-MANUAL_MOVE_BREAKEVEN`
      )
    },
    [setAndSave]
  )

  const clear = useCallback(() => {
    setAndSave([])
  }, [setAndSave])

  useEffect(() => {
    const syncServerAndLocal = async () => {
      let current = deduplicateJournalRecords(loadJournal())
      let changed = false

      try {
        const res = await fetch(apiUrl('/api/signals/active'))
        if (res.ok) {
          const data = await res.json()
          const rawServerTrades: JournalRecord[] = Array.isArray(data?.trades) ? data.trades : []
          const serverTrades = rawServerTrades.map(sanitizeTradeRecord)
          if (serverTrades.length > 0) {
            const bySignalOrSetup = new Map<string, JournalRecord>()
            for (const item of current) {
              bySignalOrSetup.set(item.signalId || item.id, item)
              if (item.setupId) bySignalOrSetup.set(item.setupId, item)
            }
            for (const st of serverTrades) {
              const key = st.signalId || st.id
              const setupKey = st.setupId || key
              const hasExistingMatch = bySignalOrSetup.has(key) || bySignalOrSetup.has(setupKey)

              if (!hasExistingMatch) {
                // Only merge a brand new server trade if:
                // 1) There is NO active open trade for this symbol already
                // 2) This symbol is NOT in its 15-minute post-close cooldown
                const hasActiveForSymbol = current.some(
                  (r) => r.symbolId === st.symbolId && !isClosed(r)
                )
                const cooldown = isSymbolInPostCloseCooldown(st.symbolId, current)
                if (!hasActiveForSymbol && !cooldown.inCooldown && !isClosed(st)) {
                  current = [st, ...current]
                  bySignalOrSetup.set(key, st)
                  if (st.setupId) bySignalOrSetup.set(st.setupId, st)
                  changed = true
                }
              } else {
                const existing = bySignalOrSetup.get(key) || bySignalOrSetup.get(setupKey)
                // Only accept forward lifecycle progression (never revert a closed local trade back to open)
                if (existing && !isClosed(existing) && isClosed(st) && (st.statusTs || 0) >= (existing.statusTs || 0)) {
                  current = current.map((r) =>
                    r.id === existing.id ? { ...existing, stage: st.stage, status: st.status, statusTs: st.statusTs, resultR: st.resultR } : r
                  )
                  changed = true
                }
              }
            }
          }
        }
      } catch {
        // ignore network offline
      }

      const finalClean = deduplicateJournalRecords(current)
      if (changed || finalClean.length !== records.length) {
        saveJournal(finalClean)
        setRecords(finalClean)
        const uid = auth?.currentUser?.uid
        if (uid) {
          void syncTradesToFirestore(uid, finalClean)
        }
      }
    }

    void syncServerAndLocal()
    const t = setInterval(() => {
      void syncServerAndLocal()
    }, 15000)
    return () => clearInterval(t)
  }, [records.length])

  const sanitizedRecords = useMemo(() => deduplicateJournalRecords(records), [records])

  return {
    records: sanitizedRecords,
    stats: computeStats(sanitizedRecords),
    maybeRecord,
    tick,
    closeManual,
    moveToBE,
    clear,
  }
}
