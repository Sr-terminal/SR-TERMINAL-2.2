// @ts-nocheck
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { SYMBOLS, symbolById, fetchKlines, fetch24hTickers, subscribeKline, type Candle, type Ticker } from "../lib/market"
import { calibrateCandles, calibrateCandle, calibratePrice, syncBenchmarks, onCalibrationChange } from "../lib/brokerCalibration"
import { analyse, type Analysis } from "../lib/ict"
import type { ConceptSelection } from "../lib/concepts"
import type { LiveDataStatus, TickMetadata } from "../lib/dataIntegrity"
import { fetchEconomicCalendar, checkNewsBlackout } from "../lib/newsService"

function r2(r) {
  return r
    .filter((e) => e.analysis.ok)
    .map((e) => ({
      tf: e.tf,
      score: e.analysis.score,
      vote:
        e.analysis.score > 15
          ? "bull"
          : e.analysis.score < -15
            ? "bear"
            : "neutral",
    }));
}

const $p = { loaded: !1, events: [], blackout: !1, lastFetch: 0 };

async function Wp() {
  const { events } = await fetchEconomicCalendar();
  return events;
}

function tg(r, e = Date.now()) {
  const res = checkNewsBlackout(r, e);
  return { blackout: res.blackout, title: res.title };
}

function c2(r) {
  return {
    loaded: r.loaded,
    events: r.events.map((e) => ({
      time: e.time,
      impact: e.impact,
      title: e.title,
      actual: e.actual,
      forecast: e.forecast,
    })),
  };
}

const h2 = {
  "1m": ["5m", "15m", "1h"],
  "5m": ["15m", "1h", "4h"],
  "15m": ["1h", "4h", "1d"],
  "1h": ["4h", "1d"],
  "4h": ["1d", "1w"],
  "1d": ["1w"],
  "1w": [],
};

function eg(r, e, s) {
  const l = symbolById(r),
    [u, c] = useState([]),
    [d, f] = useState(0),
    [dataStatus, setDataStatus] = useState<LiveDataStatus>('SYNCING'),
    [statusMeta, setStatusMeta] = useState<{ ageMs: number; latencyMs: number }>({ ageMs: 0, latencyMs: 0 }),
    [v, y] = useState([]),
    [x, M] = useState($p),
    [w, O] = useState({}),
    rawKlinesRef = useRef([]),
    K = useRef([]),
    X = useRef(null),
    Q = useRef(!1),
    lastWsTick = useRef(0),
    currentSymbolRef = useRef(l.id);

  // Instant state reset and automatic refresh whenever trading pair or timeframe changes
  useEffect(() => {
    let cancelled = false;
    currentSymbolRef.current = l.id;

    // 1. Immediately clear old pair's temporary live candles and price to prevent cross-pair contamination
    K.current = [];
    rawKlinesRef.current = [];
    c([]);
    f(0);
    setDataStatus('SYNCING');

    const loadData = async (retryCount = 0) => {
      try {
        const raw = await fetchKlines(l.src, e, 320);
        if (cancelled) return;
        rawKlinesRef.current = raw;
        const lt = calibrateCandles(l.id, raw);
        K.current = lt;
        c(lt);
        const lastClose = lt.length ? lt[lt.length - 1].c : 0;
        f(lastClose);
        lastWsTick.current = Date.now();
        if (lastClose > 0) {
          O((prev) => ({
            ...prev,
            [l.src]: {
              symbol: l.src,
              price: lastClose,
              changePct: prev[l.src]?.changePct ?? 0,
            },
          }));
        }
        setDataStatus('LIVE');
      } catch (err) {
        if (cancelled) return;
        setDataStatus('RECONNECTING');
        if (retryCount < 4) {
          setTimeout(() => {
            if (!cancelled) loadData(retryCount + 1);
          }, 1200);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [l.src, l.id, e]);

  // 2. Real-time candle subscription with Data Freshness / Stale Guard
  useEffect(() => {
    let lastRenderTime = 0;
    lastWsTick.current = Date.now();
    const triggerRender = () => {
      lastRenderTime = Date.now();
      Q.current = !1;
      c([...K.current]);
    };

    const unsubWs = subscribeKline(
      l.src,
      e,
      (rawNt, meta?: TickMetadata) => {
        // Protect against race conditions: ignore ticks for previous symbol
        if (currentSymbolRef.current !== l.id) return;

        const nt = calibrateCandle(l.id, rawNt);
        const q = K.current;

        // Secondary 1.5% outlier spike guard on calibrated price
        if (q.length > 0) {
          const prevClose = q[q.length - 1].c;
          if (prevClose > 0 && Math.abs(nt.c - prevClose) / prevClose > 0.015) {
            return;
          }
        }

        lastWsTick.current = Date.now();
        // Keep rawKlinesRef synchronized with latest WebSocket candle
        const rawArr = rawKlinesRef.current;
        if (rawArr.length === 0) {
          rawKlinesRef.current = [rawNt];
        } else {
          const rk = rawArr.length - 1;
          if (rawArr[rk].t === rawNt.t) {
            rawArr[rk] = { ...rawNt };
          } else if (rawNt.t > rawArr[rk].t) {
            rawArr.push({ ...rawNt });
            if (rawArr.length > 400) rawArr.shift();
          }
        }

        // If initial historical candles haven't loaded yet, build initial seed
        if (q.length === 0) {
          K.current = [nt];
          f(nt.c);
          setDataStatus('LIVE');
          triggerRender();
          return;
        }

        const k = q.length - 1;
        if (q[k].t === nt.t) {
          q[k] = { ...nt };
        } else if (nt.t > q[k].t) {
          q.push({ ...nt });
          if (q.length > 400) q.shift();
        }

        // Fresh validated price update (single source of truth for both chart & ticker strip)
        f(nt.c);
        O((prev) => ({
          ...prev,
          [l.src]: {
            symbol: l.src,
            price: nt.c,
            changePct: prev[l.src]?.changePct ?? 0,
          },
        }));
        setDataStatus('LIVE');
        if (meta) {
          setStatusMeta({ ageMs: meta.latencyMs, latencyMs: meta.latencyMs });
        }
        Q.current = !0;

        const now = Date.now();
        const throttleMs = nt.final ? 0 : 80;
        if (!X.current && (nt.final || now - lastRenderTime > throttleMs)) {
          X.current = setTimeout(() => {
            X.current = null;
            triggerRender();
          }, throttleMs);
        }
      },
      (status, meta) => {
        setDataStatus(status);
        if (meta) setStatusMeta(meta);
      },
    );

    // Dynamic fallback polling ONLY if WebSocket has been completely silent for > 15 seconds
    const pollTimer = setInterval(async () => {
      const silenceDuration = Date.now() - lastWsTick.current;
      if (silenceDuration > 15000 && K.current.length > 0) {
        setDataStatus('STALE');
        try {
          const raw = await fetchKlines(l.src, e, 320);
          if (raw.length > 20 && currentSymbolRef.current === l.id && Date.now() - lastWsTick.current > 15000) {
            const nt = calibrateCandles(l.id, raw);
            const prevClose = K.current[K.current.length - 1]?.c || 0;
            const newClose = nt[nt.length - 1]?.c || 0;
            if (prevClose > 0 && newClose > 0 && Math.abs(newClose - prevClose) / prevClose > 0.015) {
              return;
            }
            rawKlinesRef.current = raw;
            K.current = nt;
            triggerRender();
            if (newClose > 0) {
              f(newClose);
            }
            lastWsTick.current = Date.now();
            setDataStatus('LIVE');
          }
        } catch {}
      }
    }, 6000);

    return () => {
      unsubWs();
      clearInterval(pollTimer);
      if (X.current) {
        clearTimeout(X.current);
        X.current = null;
      }
    };
  }, [l.src, l.id, e]);

  // 3. Smooth Broker Calibration update (NEVER wipes candles or triggers re-fetch)
  useEffect(() => {
    return onCalibrationChange(() => {
      if (rawKlinesRef.current.length > 0) {
        const calibrated = calibrateCandles(l.id, rawKlinesRef.current);
        K.current = calibrated;
        c([...calibrated]);
        if (calibrated.length) {
          f(calibrated[calibrated.length - 1].c);
        }
      }
    });
  }, [l.id]);

  // 4. Multi-Timeframe Alignment
  useEffect(() => {
    let J = !1;
    const lt = h2[e] ?? [],
      mt = async () => {
        if (lt.length === 0) {
          y([]);
          return;
        }
        const nt = await Promise.all(
          lt.map(async (q) => {
            try {
              const rawK = await fetchKlines(l.src, q, 200);
              const k = calibrateCandles(l.id, rawK);
              return {
                tf: q,
                analysis: analyse(k, q, void 0, void 0, void 0, l.digits),
              };
            } catch {
              return null;
            }
          }),
        );
        J ||
          y(
            r2(nt.filter((q) => q !== null)).sort(
              (q, k) => lt.indexOf(q.tf) - lt.indexOf(k.tf),
            ),
          );
      };
    mt();
    const yt = setInterval(() => {
      mt();
    }, 18e4);
    return () => {
      ((J = !0), clearInterval(yt));
    };
  }, [l.src, e]);

  // 5. Economic news calendar sync
  useEffect(() => {
    let J = !1;
    const lt = async () => {
      try {
        const yt = await Wp();
        if (J) return;
        const { blackout: nt, title: q } = tg(yt);
        M({
          loaded: !0,
          events: yt,
          blackout: nt,
          blackoutTitle: q,
          lastFetch: Date.now(),
        });
      } catch (yt) {
        J || M((nt) => ({ ...nt, loaded: !1, error: String(yt) }));
      }
    };
    lt();
    const mt = setInterval(() => {
      lt();
    }, 3e5);
    return () => {
      ((J = !0), clearInterval(mt));
    };
  }, []);

  const safeRefresh = useCallback(async () => {
    try {
      setDataStatus('SYNCING');
      const raw = await fetchKlines(l.src, e, 320);
      if (raw.length > 0) {
        rawKlinesRef.current = raw;
        const lt = calibrateCandles(l.id, raw);
        K.current = lt;
        c([...lt]);
        f(lt.length ? lt[lt.length - 1].c : 0);
        setDataStatus('LIVE');
      }
    } catch {
      setDataStatus('STALE');
    }
  }, [l.src, l.id, e]);

  useEffect(() => {
    let J = !1;
    const lt = async () => {
      const yt = await fetch24hTickers(SYMBOLS.map((nt) => nt.src));
      if (!J) {
        const cal: Record<string, Ticker> = {};
        for (const s of SYMBOLS) {
          if (yt[s.src]) {
            const activeCandleClose =
              s.id === currentSymbolRef.current && K.current.length > 0
                ? K.current[K.current.length - 1].c
                : 0;
            cal[s.src] = {
              ...yt[s.src],
              price: activeCandleClose > 0 ? activeCandleClose : calibratePrice(s.id, yt[s.src].price),
            };
          }
        }
        O((prev) => ({ ...prev, ...cal }));
      }
    };
    lt();
    const mt = setInterval(() => {
      lt();
    }, 3e4);
    return () => {
      ((J = !0), clearInterval(mt));
    };
  }, []);

  const [ct, P] = useState(null),
    $ = useMemo(() => `${x.loaded}|${x.events.length}|${x.blackout}`, [x]),
    G = useMemo(
      () => v.map((J) => `${J.tf}${J.score}${J.vote}`).join(","),
      [v],
    ),
    et = useMemo(
      () =>
        `${s.mode}|${Object.entries(s.keys)
          .filter(([, J]) => J)
          .map(([J]) => J)
          .join(".")}`,
      [s],
    );

  useEffect(() => {
    const lt = setTimeout(() => {
      const mt = K.current;
      const minBars = e === "1w" ? 40 : 80;
      if (mt.length < minBars) {
        P(null);
        return;
      }
      const yt = analyse(mt, e, v, s, c2(x), l.digits);
      P(yt);
    }, 50);
    return () => {
      clearTimeout(lt);
    };
  }, [u, e, G, et, $, l.digits]);

  return {
    candles: u,
    livePrice: d || (u.length ? u[u.length - 1].c : 0),
    feedOk: dataStatus === 'LIVE',
    dataStatus,
    statusMeta,
    analysis: ct,
    fractal: v,
    news: x,
    tickers: w,
    refresh: safeRefresh,
  };
}

export const useMarket = eg;
