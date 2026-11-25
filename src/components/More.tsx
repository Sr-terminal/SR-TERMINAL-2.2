// @ts-nocheck
import React, { useState, useEffect } from "react";
import * as p from "react/jsx-runtime";
import {
  BookOpen as Wb,
  CalendarDays as tx,
  ChevronLeft as Lv,
  ClipboardList as nx,
  Clock as Gp,
  GraduationCap as Kp,
  Newspaper as Qp,
  Repeat as mx,
  ShieldCheck as Ip,
  Bell as $b,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  ChevronUp,
  Circle,
  CheckCircle,
  Crown,
  Shield,
  FileText,
  Sliders,
  RotateCcw,
  Sparkles,
  LogOut,
} from "lucide-react";
import SubscriptionScreen from "./SubscriptionScreen";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import AuthModal from "./AuthModal";
import ChartReplay from "./ChartReplay";
import TerminalLockedScreen from "./TerminalLockedScreen";
import { subscribeUserProfile, signOutUser } from "../lib/authService";
import {
  evaluateEntitlement,
  isFeatureUnlockedByRewardedAd,
  subscribeRewardedAdUnlocks,
} from "../lib/subscriptionService";
import { BUILD as Kh, BUILD_LABEL as sg, BUILD_CODE as ng } from "../lib/version";
import { etTime as is, KILLZONES as Ch, fmtClock as Fp } from "../lib/clock";
import { safeStorage } from "../lib/storage";
import { fetchEconomicCalendar, fetchMarketNews, checkNewsBlackout, formatEventCountdownIst } from "../lib/newsService";
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  areNotificationsEnabled,
  requestNotificationPermission,
  isNativePlatform,
  testNotification,
} from "../lib/notifications";

// Missing icon definitions that caused crash / black screen on click
const Yh = ChevronUp;
const qh = ChevronDown;
const Vh = RefreshCw;
const rx = ExternalLink;
const gx = CheckCircle;
const yx = Circle;
const Hh = async (fn) => fn();

const V = React;
const vu = "https://sr-control-server.srterminalofficial.workers.dev";
function ug() { return getNotificationPrefs(); }
function S2(r) { return saveNotificationPrefs(r); }
async function w2() { return areNotificationsEnabled(); }
async function N2() { return requestNotificationPermission(); }
function el() { return isNativePlatform(); }
const Mn = { getPlatform: () => (isNativePlatform() ? "android" : "web"), isNativePlatform: () => isNativePlatform() };

const nN = [
  {
    key: "planCreated",
    label: "1. Pre-Trade Setup Approaching",
    desc: "24/7 Closed-App FCM alert when price nears institutional ICT zone",
  },
  {
    key: "executed",
    label: "1b. Safe Entry Confirmed",
    desc: "Instant push with Entry, Protected SL, TP1, and Live R:R",
  },
  {
    key: "moveBE",
    label: "2. Move Stop Loss to Break-Even (+1R)",
    desc: "Automatic closed-app alert when price reaches +1.0R profit",
  },
  { key: "tp1", label: "3a. Take Profit 1 (TP1) Hit", desc: "First partial target reached — move SL to BE" },
  { key: "tp2", label: "3b. Take Profit 2 (TP2) Hit", desc: "Second partial target reached (+2.0R)" },
  { key: "tp3", label: "3c. Take Profit 3 (TP3) Runner Hit", desc: "Final institutional liquidity target completed" },
  {
    key: "beClosed",
    label: "Break-Even Closed (0.00R)",
    desc: "Price returned to entry after +1R / TP1 protection",
  },
  { key: "stop", label: "4. Stop Loss (SL) Hit / Setup Invalidated", desc: "Protected SL hit or HTF structure invalidated" },
  {
    key: "redFolderNews15m",
    label: "5. 15-Minute Red-Folder High-Impact News Alert",
    desc: "Closed-app FCM warning 15 minutes before USD/XAU/EUR High-Impact print",
  },
  { key: "riskAlert", label: "Risk Proximity Warning", desc: "Price within 30% of Protected Stop Loss" },
  { key: "sound", label: "Alert Sound / Chime", desc: "Play high-priority tone on trade alerts" },
  { key: "vibrate", label: "Vibration / Haptic", desc: "Vibrate device on trade lifecycle events" },
];
function sN() {
  const [r, e] = V.useState(() => ug()),
    [s, l] = V.useState(null),
    [testSent, setTestSent] = V.useState(false);

  V.useEffect(() => {
    w2().then(l);
  }, []);

  const u = (c) => {
    const d = { ...r, [c]: !r[c] };
    e(d);
    S2(d);
  };

  const handleRequestPerm = async () => {
    await N2();
    setTimeout(async () => {
      const allowed = await w2();
      l(allowed);
    }, 500);
  };

  const handleTest = async () => {
    setTestSent(true);
    await testNotification();
    setTimeout(() => setTestSent(false), 3000);
  };

  return p.jsxs("div", {
    children: [
      p.jsxs("div", {
        className: "card p-3 mb-3 border border-[#1E222D] bg-[#131722] flex items-center justify-between",
        children: [
          p.jsxs("div", {
            children: [
              p.jsx("div", {
                className: "text-[12px] font-semibold text-white",
                children: el()
                  ? "24/7 Closed-App FCM Push Engine: Active (Android APK)"
                  : "24/7 Background FCM & Web Push Engine: Active",
              }),
              p.jsx("div", {
                className: "mono text-[10px] text-[#26A69A] mt-0.5",
                children: s === false
                  ? "Notification permission required — tap Enable"
                  : "Channel: sr-trade-alerts-v2 (IMPORTANCE_HIGH = 5 · Screen-Off Push Active)",
              }),
            ],
          }),
          s === false &&
            p.jsx("button", {
              onClick: handleRequestPerm,
              className: "px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-semibold rounded active:scale-98 smooth-ui",
              children: "Enable",
            }),
        ],
      }),
      p.jsx("div", {
        className: "mb-3",
        children: p.jsx("button", {
          onClick: handleTest,
          className: "w-full py-2.5 px-4 bg-[#26A69A]/15 hover:bg-[#26A69A]/25 border border-[#26A69A]/40 text-[#26A69A] rounded-lg text-[12px] font-mono font-bold flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer",
          children: testSent
            ? "🔔 24/7 FCM Push Dispatched! (Check Notification Shade & Sound)"
            : "🔔 Test 24/7 Closed-App FCM Push Notification",
        }),
      }),
      p.jsx("div", {
        className: "space-y-2",
        children: nN.map((c) =>
          p.jsxs(
            "button",
            {
              onClick: () => u(c.key),
              className:
                "card w-full p-3 flex items-center justify-between text-left",
              children: [
                p.jsxs("div", {
                  children: [
                    p.jsx("div", {
                      className: "text-[13px]",
                      children: c.label,
                    }),
                    p.jsx("div", {
                      className: "mono text-[9px] text-neutral-500",
                      children: c.desc,
                    }),
                  ],
                }),
                p.jsx("span", {
                  className: "w-9 h-5 rounded-full relative transition",
                  style: { background: r[c.key] ? "#f5f5f5" : "#1c1c1c" },
                  children: p.jsx("span", {
                    className:
                      "absolute top-0.5 w-4 h-4 rounded-full transition-all",
                    style: {
                      left: r[c.key] ? 18 : 2,
                      background: r[c.key] ? "#050505" : "#525252",
                    },
                  }),
                }),
              ],
            },
            c.key,
          ),
        ),
      }),
    ],
  });
}
const lN = [
  {
    title: "ICT 2022 Content",
    pages: 31,
    core: "Liquidity, PD arrays, killzones, Power of Three — poora core framework isi pe khada hai.",
    rules: [
      "Killzone ke bahar entry nahi",
      "Sweep ke bina reversal nahi",
      "PD-correct entry mandatory",
      "HTF draw ke against trade nahi",
    ],
  },
  {
    title: "AMD / STD Trading",
    pages: 10,
    core: "Accumulation-Manipulation-Distribution cycle + standard deviation projection.",
    rules: [
      "Asia range = accumulation",
      "Sweep ke baad hi distribution entry",
      "Overextension pe chase nahi",
    ],
  },
  {
    title: "Street Smarts (Connors)",
    pages: 145,
    core: "SR Concept, ADX pullback, momentum reversals — quantitative short-term setups.",
    rules: [
      "SR Concept: extreme ≥4 bars purana",
      "Plus One = day-2 reclaim (zyada reliable)",
      "ADX ≥25 trend + EMA20 pullback",
      "ADX <18 = chop, skip",
    ],
  },
  {
    title: "How To Trade Better (Larry Williams)",
    pages: 4,
    core: "Risk sizing aur survival — account ko bachao, market kal bhi hoga.",
    rules: [
      "Fixed fractional risk",
      "Drawdown me size half",
      "Process over prediction",
    ],
  },
  {
    title: "PO3 Fractal Study",
    pages: 8,
    core: "Fractal nature — har TF pe AMD repeat hota hai; 5m se 1d tak same script.",
    rules: [
      "HTF phase align hona chahiye",
      "Fractal disagreement = stand aside",
      "Execution TF se pehle HTF map",
    ],
  },
  {
    title: "Market Maker Model",
    pages: 9,
    core: "Smart money ka full cycle: LL→HL→displacement→consolidation→expansion (aur mirror).",
    rules: [
      "Confirmation displacement pe",
      "Model ke against counter-trade nahi",
      "Buy/Sell model alag regimes hain",
    ],
  },
];
function aN() {
  const [r, e] = V.useState(null);
  return p.jsxs("div", {
    children: [
      p.jsx("p", {
        className: "text-[11px] text-neutral-400 mb-3",
        children:
          "Six sources, engine me distilled. Asli edge in rules ke following me hai — reading me nahi.",
      }),
      p.jsx("div", {
        className: "space-y-2",
        children: lN.map((s, l) =>
          p.jsxs(
            "div",
            {
              className: "card overflow-hidden",
              children: [
                p.jsxs("button", {
                  className: "w-full p-3 flex items-center gap-2 text-left",
                  onClick: () => e((u) => (u === l ? null : l)),
                  children: [
                    p.jsxs("div", {
                      className: "flex-1",
                      children: [
                        p.jsx("div", {
                          className: "text-[13px]",
                          children: s.title,
                        }),
                        p.jsxs("div", {
                          className: "mono text-[9px] text-neutral-500",
                          children: [s.pages, " pages · source PDF notes"],
                        }),
                      ],
                    }),
                    r === l
                      ? p.jsx(Yh, { size: 13, className: "text-neutral-600" })
                      : p.jsx(qh, { size: 13, className: "text-neutral-600" }),
                  ],
                }),
                r === l &&
                  p.jsxs("div", {
                    className: "px-3 pb-3",
                    children: [
                      p.jsx("p", {
                        className:
                          "text-[12px] text-neutral-300 leading-relaxed mb-2",
                        children: s.core,
                      }),
                      p.jsx("div", {
                        className: "label mb-1",
                        children: "Hard rules in engine",
                      }),
                      p.jsx("ul", {
                        className: "space-y-1",
                        children: s.rules.map((u, c) =>
                          p.jsxs(
                            "li",
                            {
                              className: "mono text-[10px] text-neutral-400",
                              children: ["· ", u],
                            },
                            c,
                          ),
                        ),
                      }),
                    ],
                  }),
              ],
            },
            s.title,
          ),
        ),
      }),
    ],
  });
}
const rN = [
  {
    id: 1,
    title: "Market Kaise Kaam Karta Hai",
    minutes: 6,
    summary:
      "Buyers aur sellers ka order flow — price liquidity ki taraf move karta hai, support resistance ki taraf nahi.",
    points: [
      "Price hamesha liquidity hunt karta hai",
      "Orders hi movement banate hain",
      "Retail vs institutional difference",
    ],
  },
  {
    id: 2,
    title: "Liquidity Kya Hai",
    minutes: 7,
    summary:
      "Buy-side aur sell-side liquidity — jahan stops cluster hote hain, wahan institutional orders milte hain.",
    points: [
      "BSL = equal highs ke upar",
      "SSL = equal lows ke neeche",
      "Liquidity = fuel",
    ],
  },
  {
    id: 3,
    title: "Draw On Liquidity",
    minutes: 6,
    summary:
      "Engine hamesha ek side ka draw select karta hai — opposite pool ki taraf price ko kheenchta hai.",
    points: [
      "Neeche SSL hai to draw upar BSL hai",
      "Draw change = trend change",
      "Pool sweep ke baad naya draw",
    ],
  },
  {
    id: 4,
    title: "Market Structure — BOS",
    minutes: 7,
    summary: "Break of Structure — close basis trend continuation ka proof.",
    points: [
      "Close > swing high = bullish BOS",
      "Wick se structure nahi badalta",
      "BOS ke baad retracement entry",
    ],
  },
  {
    id: 5,
    title: "Market Structure — CHoCH",
    minutes: 7,
    summary: "Change of Character — trend shift ka pehla signal.",
    points: [
      "Opposite swing ka close-basis break",
      "CHoCH ke baad confirmation wait karo",
      "Sweep + CHoCH = strong reversal",
    ],
  },
  {
    id: 6,
    title: "Fair Value Gap (FVG)",
    minutes: 8,
    summary:
      "3-candle imbalance jahan price inefficiently move karta hai — wapas aakar react karta hai.",
    points: [
      "Bull FVG = candle 1 high < candle 3 low",
      "CE = gap ka 50%",
      "Mitigated FVG weak hota hai",
    ],
  },
  {
    id: 7,
    title: "Order Blocks",
    minutes: 8,
    summary:
      "Displacement se pehle ka last opposing candle — institutional entry zone.",
    points: [
      "Bull OB = last bearish candle before rally",
      "Body ≥ 1 ATR displacement chahiye",
      "OB ka retest = entry",
    ],
  },
  {
    id: 8,
    title: "Premium Aur Discount",
    minutes: 6,
    summary:
      "Dealing range ke upper half me sell, lower half me buy — kabhi bhi premium me long nahi.",
    points: [
      "EQ = range ka 50%",
      "Discount me bullish arrays dhoondo",
      "PD array + EQ = high probability",
    ],
  },
  {
    id: 9,
    title: "Optimal Trade Entry (OTE)",
    minutes: 7,
    summary: "61.8% se 79% retracement — swing ka golden zone.",
    points: [
      "Move ke 62–79% pullback",
      "Stop swing ke bahar",
      "OTE + FVG overlap = best",
    ],
  },
  {
    id: 10,
    title: "Liquidity Sweep / Stop Hunt",
    minutes: 8,
    summary:
      "Pool ke upar wick, close wapas andar — false breakout jise smart money use karta hai.",
    points: [
      "Wick through + close back inside",
      "Sweep ke baad displacement dekho",
      "Sweep = entry trigger, prediction nahi",
    ],
  },
  {
    id: 11,
    title: "Displacement",
    minutes: 6,
    summary: "Energetic one-directional move — institutional intent ka proof.",
    points: [
      "Body ≥ 0.75 ATR",
      "Efficiency (body/range) ≥ 0.58",
      "Displacement ke baad FVG banta hai",
    ],
  },
  {
    id: 12,
    title: "CISD — Change In State Of Delivery",
    minutes: 7,
    summary: "Raid ke baad candle delivery flip — reversal confirmation.",
    points: [
      "Sweep ke baad same-direction closes",
      "CISD ke baad entry legit",
      "CISD + CHoCH combo",
    ],
  },
  {
    id: 13,
    title: "Inducement (IDM)",
    minutes: 6,
    summary: "Trend continuation se pehle ka chhota trap — minor sweep.",
    points: [
      "IDM = pullback ke daan minor liquidity",
      "IDM taken = continuation ready",
      "IDM ke bina BOS weak",
    ],
  },
  {
    id: 14,
    title: "Power Of Three (AMD)",
    minutes: 8,
    summary:
      "Accumulation, Manipulation, Distribution — har session ka hidden script.",
    points: [
      "Asia = accumulation",
      "London = manipulation (sweep)",
      "NY = distribution",
    ],
  },
  {
    id: 15,
    title: "Killzones",
    minutes: 6,
    summary:
      "London 02–05 ET, NY AM 07–11 ET, NY PM 13–16 ET — inhi windows me entries.",
    points: [
      "Killzone bahar entry = low quality",
      "NY AM sabse consistent",
      "Session ke pehle sweep aksar hota hai",
    ],
  },
  {
    id: 16,
    title: "Market Maker Buy Model",
    minutes: 9,
    summary:
      "Smart accumulation ka full cycle — LL se HL, displacement, consolidation, expansion.",
    points: [
      "Model 4 phases me chalta hai",
      "Confirmation displacement pe hoti hai",
      "HTF draw ke against mat jao",
    ],
  },
  {
    id: 17,
    title: "Market Maker Sell Model",
    minutes: 9,
    summary: "Buy model ka mirror — HH se LH, distribution, markdown.",
    points: ["Raid upar, delivery neeche", "Premium me sell", "Same 4 phases"],
  },
  {
    id: 18,
    title: "Breaker Blocks",
    minutes: 7,
    summary: "Failed order block jo opposite side flip ho jata hai — BPR zone.",
    points: [
      "OB fail + FVG overlap = breaker",
      "Breaker retest = entry",
      "Consequent encroachment use karo",
    ],
  },
  {
    id: 19,
    title: "SR Concept — Reversal",
    minutes: 8,
    summary:
      "20-bar extreme ka false breakout — Classic SR Concept reversal.",
    points: [
      "Extreme ≥ 4 bars purana hona chahiye",
      "Pierce + close back inside = signal",
      "Stop wick extreme ke bahar",
    ],
  },
  {
    id: 20,
    title: "SR Concept Plus One",
    minutes: 7,
    summary:
      "Day 1 close through extreme, day 2 reclaim — zyada reliable version.",
    points: [
      "Plus One = ek din late confirmation",
      "Wick extreme track karo",
      "Volume dry = better",
    ],
  },
  {
    id: 21,
    title: "ADX Trend Pullback",
    minutes: 8,
    summary:
      "ADX ≥ 25 strong trend, EMA20 pullback, resume close — trend continuation.",
    points: [
      "ADX < 18 = chop, skip",
      "Pullback quiet volume me best",
      "Resume candle = trigger",
    ],
  },
  {
    id: 22,
    title: "Volatility Regimes",
    minutes: 6,
    summary: "Range expansion vs contraction — engine ka regime filter.",
    points: [
      "ATR squeeze ke baad expansion",
      "Chop me stand aside",
      "Expansion me continuation models",
    ],
  },
  {
    id: 23,
    title: "Fractal MTF Alignment",
    minutes: 7,
    summary: "5m se 1d tak ek hi direction — fractal nature of markets.",
    points: [
      "HTF bias ke against execution nahi",
      "4H + 1H align = green flag",
      "Fractal disagreement = wait",
    ],
  },
  {
    id: 24,
    title: "Standard Deviation aur Price",
    minutes: 6,
    summary: "Distribution ka projection — kitna stretch ho sakta hai.",
    points: [
      "Overextension = mean reversion risk",
      "Projection = target planning",
      "Isolated use mat karo",
    ],
  },
  {
    id: 25,
    title: "Risk Management",
    minutes: 8,
    summary: "1% risk, stop Pehle, position size baad me — survival pehle.",
    points: [
      "Risk % fix rakho",
      "Stop kabhi widen mat karo",
      "TP1 par 50% + BE",
    ],
  },
  {
    id: 26,
    title: "Trade Journal Kyun",
    minutes: 5,
    summary:
      "Jo measure nahi hota, wo improve nahi hota — journal = tumhara edge.",
    points: [
      "Har plan record karo",
      "Win rate nahi, expectancy dekho",
      "Weekly review",
    ],
  },
  {
    id: 27,
    title: "News Aur Red Folder",
    minutes: 6,
    summary: "High-impact prints ke aas paas entry nahi — blackout window.",
    points: [
      "−20/+30 min no entry",
      "Surprise direction ka effect",
      "Calendar hamesha on rakho",
    ],
  },
  {
    id: 28,
    title: "Discipline Aur Patience",
    minutes: 5,
    summary: "Setup nahi hai to trade nahi — STAND ASIDE bhi ek position hai.",
    points: [
      "Force trade = donation",
      "A+ setup ka wait karo",
      "Process over outcome",
    ],
  },
];
function uN() {
  const [r, e] = V.useState(1);
  return p.jsxs("div", {
    children: [
      p.jsx("p", {
        className: "text-[11px] text-neutral-400 mb-3 leading-relaxed",
        children:
          "28 lessons · ICT + Street Smarts curriculum · Hinglish. Ek lesson roz padho, chart pe verify karo.",
      }),
      p.jsx("div", {
        className: "space-y-2",
        children: rN.map((s) =>
          p.jsxs(
            "div",
            {
              className: "card overflow-hidden",
              children: [
                p.jsxs("button", {
                  className: "w-full p-3 flex items-center gap-2 text-left",
                  onClick: () => e((l) => (l === s.id ? null : s.id)),
                  children: [
                    p.jsx("span", {
                      className: "mono text-[10px] text-neutral-500 w-6",
                      children: String(s.id).padStart(2, "0"),
                    }),
                    p.jsx("span", {
                      className: "text-[13px] flex-1",
                      children: s.title,
                    }),
                    p.jsxs("span", {
                      className: "mono text-[9px] text-neutral-600",
                      children: [s.minutes, "m"],
                    }),
                    r === s.id
                      ? p.jsx(Yh, { size: 13, className: "text-neutral-600" })
                      : p.jsx(qh, { size: 13, className: "text-neutral-600" }),
                  ],
                }),
                r === s.id &&
                  p.jsxs("div", {
                    className: "px-3 pb-3 pt-0",
                    children: [
                      p.jsx("p", {
                        className:
                          "text-[12px] text-neutral-300 leading-relaxed mb-2",
                        children: s.summary,
                      }),
                      p.jsx("ul", {
                        className: "space-y-1",
                        children: s.points.map((l, u) =>
                          p.jsxs(
                            "li",
                            {
                              className: "mono text-[10px] text-neutral-400",
                              children: ["· ", l],
                            },
                            u,
                          ),
                        ),
                      }),
                    ],
                  }),
              ],
            },
            s.id,
          ),
        ),
      }),
    ],
  });
}
function oN() {
  const [r, e] = V.useState(new Date()),
    [s, l] = V.useState(() =>
      safeStorage.getItem("sr.zone") === "ET" ? "ET" : "IST",
    ),
    [u, c] = V.useState(() => safeStorage.getItem("sr.h12") !== "false");
  (V.useEffect(() => {
    const v = setInterval(() => e(new Date()), 1e3);
    return () => {
      clearInterval(v);
    };
  }, []),
    V.useEffect(() => {
      try {
        safeStorage.setItem("sr.zone", s);
      } catch {}
    }, [s]),
    V.useEffect(() => {
      try {
        safeStorage.setItem("sr.h12", String(u));
      } catch {}
    }, [u]));
  const { h: d, m: f } = is(r),
    m = Ch.find((v) =>
      v.from === 20 ? d >= 20 : v.to === 0 ? !1 : d >= v.from && d < v.to,
    ),
    b = (v) => {
      const y = v.from === 20 ? 4 : v.to - v.from;
      return (Math.max(0, Math.min(y, d + f / 60 - v.from)) / y) * 100;
    };
  return p.jsxs("div", {
    children: [
      p.jsxs("div", {
        className: "card p-4 mb-3 text-center",
        children: [
          p.jsx("div", {
            className: "mono text-3xl tracking-tight",
            children: Fp(r, s, u),
          }),
          p.jsxs("div", {
            className: "flex justify-center gap-2 mt-3",
            children: [
              p.jsx("button", {
                className: `chip ${s === "IST" ? "chip-on" : ""}`,
                onClick: () => l("IST"),
                children: "IST",
              }),
              p.jsx("button", {
                className: `chip ${s === "ET" ? "chip-on" : ""}`,
                onClick: () => l("ET"),
                children: "ET",
              }),
              p.jsx("button", {
                className: `chip ${u ? "chip-on" : ""}`,
                onClick: () => c((v) => !v),
                children: u ? "12H" : "24H",
              }),
            ],
          }),
        ],
      }),
      p.jsx("div", {
        className: "space-y-2",
        children: Ch.map((v) => {
          const y = m?.id === v.id;
          return p.jsxs(
            "div",
            {
              className: "card p-3",
              style: { borderColor: y ? "#f5f5f5" : "#1c1c1c" },
              children: [
                p.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    p.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        y && p.jsx("span", { className: "pulse-dot" }),
                        p.jsx("span", {
                          className: "mono text-[12px]",
                          children: v.name,
                        }),
                      ],
                    }),
                    p.jsxs("span", {
                      className: "mono text-[10px]",
                      style: { color: y ? "#f5f5f5" : "#525252" },
                      children: [
                        v.from.toString().padStart(2, "0"),
                        ":00–",
                        v.to.toString().padStart(2, "0"),
                        ":00 ET",
                      ],
                    }),
                  ],
                }),
                p.jsx("div", {
                  className: "mono text-[10px] text-neutral-500 mt-1",
                  children: v.istLabel,
                }),
                p.jsx("div", {
                  className: "h-1 rounded-full mt-2 overflow-hidden",
                  style: { background: "#141414" },
                  children: p.jsx("div", {
                    className: "h-full",
                    style: {
                      width: `${y || (v.from !== 20 && d >= v.to) ? (y ? b(v) : 100) : 0}%`,
                      background: y ? "#f5f5f5" : "#333",
                    },
                  }),
                }),
              ],
            },
            v.id,
          );
        }),
      }),
      p.jsx("p", {
        className: "text-[10px] text-neutral-600 mt-3",
        children:
          "Killzone = quality filter, ye guarantee nahi ki price bahar move nahi karega. Asia range sweep ka primary source hota hai.",
      }),
    ],
  });
}
function cN() {
  const r = [
    {
      name: "ACCUMULATION",
      desc: "Asia range — tight delivery, dono side liquidity build hoti hai. Engine is phase me entries nahi deta.",
      icon: "▰▰▰▱▱",
    },
    {
      name: "MANIPULATION",
      desc: "London raid — Asia range ka ek side sweep hota hai (false move). Yahi SR Concept / sweep entry ka setup banata hai.",
      icon: "▱▰▱▰▱",
    },
    {
      name: "DISTRIBUTION",
      desc: "NY expansion — real move, manipulated side ke against. Displacement + FVG + BOS isi me aata hai.",
      icon: "▱▱▱▰▰",
    },
  ];
  return p.jsxs("div", {
    children: [
      p.jsx("p", {
        className: "text-[12px] text-neutral-300 leading-relaxed mb-4",
        children:
          "Power of Three (AMD): har session ka hidden script. Accumulation me smart money position banata hai, Manipulation me retail ko sweep karke fills leta hai, Distribution me asli move hota hai. SR Terminal ka engine isi sequence ko detect karta hai.",
      }),
      p.jsx("div", {
        className: "space-y-3",
        children: r.map((e, s) =>
          p.jsxs(
            "div",
            {
              className: "card p-3",
              children: [
                p.jsxs("div", {
                  className: "flex items-center justify-between mb-1.5",
                  children: [
                    p.jsx("span", {
                      className: "mono text-[12px] text-white",
                      children: e.name,
                    }),
                    p.jsx("span", {
                      className:
                        "mono text-[14px] text-neutral-500 tracking-widest",
                      children: e.icon,
                    }),
                  ],
                }),
                p.jsx("p", {
                  className: "text-[11px] text-neutral-400 leading-relaxed",
                  children: e.desc,
                }),
                p.jsxs("div", {
                  className: "mono text-[9px] text-neutral-600 mt-2",
                  children: ["STEP ", s + 1, " / 3"],
                }),
              ],
            },
            e.name,
          ),
        ),
      }),
      p.jsxs("div", {
        className: "card p-3 mt-3",
        children: [
          p.jsx("div", {
            className: "label mb-1.5",
            children: "Terminal me kaise dekhein",
          }),
          p.jsx("p", {
            className: "text-[11px] text-neutral-400 leading-relaxed",
            children:
              "Terminal → ICT Phase Read panel me AMD phase live dikhta hai (60-bar rolling detection). MANIPULATION complete hone ke baad CISD + displacement = confirmation.",
          }),
        ],
      }),
    ],
  });
}
const hN = [
    (r) => `https://api.allorigins.win/raw?url=${encodeURIComponent(r)}`,
    (r) => `https://corsproxy.io/?${encodeURIComponent(r)}`,
    (r) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(r)}`,
    (r) => `https://thingproxy.freeboard.io/fetch/${r}`,
  ],
  fN = [
    {
      source: "YAHOO",
      url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPI&region=US&lang=en-US",
    },
    {
      source: "CNBC",
      url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    },
    { source: "FXSTREET", url: "https://www.fxstreet.com/rss/news" },
    {
      source: "COINDESK",
      url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    },
  ];
function dN(r, e) {
  const s = [];
  try {
    new DOMParser()
      .parseFromString(r, "text/xml")
      .querySelectorAll("item, entry")
      .forEach((c, d) => {
        if (d >= 8) return;
        const f = c.querySelector("title")?.textContent?.trim(),
          m =
            c.querySelector("link")?.textContent?.trim() ||
            c.querySelector("link")?.getAttribute("href") ||
            "",
          b = c.querySelector("pubDate, published, updated")?.textContent ?? "",
          v = b ? Date.parse(b) : Date.now();
        f &&
          s.push({
            source: e,
            title: f,
            link: m,
            ts: isNaN(v) ? Date.now() : v,
          });
      });
  } catch {}
  return s;
}
async function mN() {
  try {
    const items = await fetchMarketNews();
    if (items && items.length > 0) return items;
  } catch {}
  return [];
}
function vN() {
  const [r, e] = V.useState([]),
    [s, l] = V.useState(!1),
    [u, c] = V.useState(null),
    d = async () => {
      (l(!0), c(null));
      try {
        e(await mN());
      } catch (f) {
        c(String(f));
      }
      l(!1);
    };
  return (
    V.useEffect(() => {
      d();
    }, []),
    p.jsxs("div", {
      children: [
        p.jsxs("div", {
          className: "flex items-center justify-between mb-3",
          children: [
            p.jsx("p", {
              className: "text-[11px] text-neutral-400",
              children:
                "RSS relays se headlines — display only, trading decisions isse nahi hote.",
            }),
            p.jsx("button", {
              onClick: () => {
                d();
              },
              className: "chip chip-on flex items-center gap-1 shrink-0",
              children: p.jsx(Vh, {
                size: 11,
                className: s ? "animate-spin" : "",
              }),
            }),
          ],
        }),
        u &&
          p.jsx("div", {
            className: "card p-3 mb-3",
            children: p.jsx("p", {
              className: "text-[11px] text-neutral-500",
              children:
                "Feeds unreachable — CORS relays down. Thodi der baad retry karo.",
            }),
          }),
        p.jsxs("div", {
          className: "space-y-2",
          children: [
            r.map((f, m) =>
              p.jsxs(
                "a",
                {
                  href: f.link,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "card p-3 block",
                  children: [
                    p.jsxs("div", {
                      className: "flex items-center justify-between mb-1",
                      children: [
                        p.jsx("span", {
                          className: "mono text-[9px] text-neutral-500",
                          children: f.source,
                        }),
                        p.jsx("span", {
                          className: "mono text-[9px] text-neutral-600",
                          children: new Date(f.ts).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: !0,
                            timeZone: "Asia/Kolkata",
                          }),
                        }),
                      ],
                    }),
                    p.jsxs("div", {
                      className:
                        "text-[12px] text-neutral-200 leading-snug flex items-start gap-1.5",
                      children: [
                        p.jsx("span", {
                          className: "flex-1",
                          children: f.title,
                        }),
                        p.jsx(rx, {
                          size: 11,
                          className: "text-neutral-600 shrink-0 mt-0.5",
                        }),
                      ],
                    }),
                  ],
                },
                m,
              ),
            ),
            r.length === 0 &&
              !s &&
              !u &&
              p.jsx("div", {
                className: "card p-6 text-center",
                children: p.jsx("p", {
                  className: "text-[12px] text-neutral-500",
                  children: "No headlines loaded.",
                }),
              }),
          ],
        }),
      ],
    })
  );
}
const pN = { high: "#EF5350", medium: "#FF9800", low: "#FFD740" };
const FOLDER_BADGE = {
  high: { icon: "🔴", label: "RED FOLDER · HIGH", color: "#EF5350", bg: "rgba(239, 83, 80, 0.14)" },
  medium: { icon: "🟠", label: "ORANGE FOLDER · MED", color: "#FF9800", bg: "rgba(255, 152, 0, 0.14)" },
  low: { icon: "🟡", label: "YELLOW FOLDER · LOW", color: "#FFD740", bg: "rgba(255, 215, 64, 0.14)" },
};
function gN() {
  const [r, e] = V.useState({ loaded: false, events: [], blackout: false, blackoutTitle: '', source: 'LIVE' }),
    [s, l] = V.useState(!1),
    [currFilter, setCurrFilter] = V.useState("ALL"),
    [nowTick, setNowTick] = V.useState(() => Date.now()),
    u = async () => {
      l(!0);
      try {
        const { events: d, source: src } = await fetchEconomicCalendar(),
          { blackout: f, title: m } = checkNewsBlackout(d);
        e({
          loaded: !0,
          events: d,
          blackout: f,
          blackoutTitle: m,
          source: src || "LIVE API",
          lastFetch: Date.now(),
        });
      } catch (d) {
        e((f) => ({ ...f, loaded: !1, error: String(d) }));
      }
      l(!1);
    };
  V.useEffect(() => {
    u();
    const d = setInterval(() => {
      u();
    }, 180000);
    const tick = setInterval(() => {
      setNowTick(Date.now());
    }, 15000);
    return () => {
      clearInterval(d);
      clearInterval(tick);
    };
  }, []);

  const filteredEvents = r.events.filter((ev) => {
    if (currFilter === "ALL") return true;
    return (ev.country || "").toUpperCase() === currFilter;
  });

  return p.jsxs("div", {
    className: "space-y-3",
    children: [
      p.jsxs("div", {
        className: "flex items-center justify-between gap-2 flex-wrap",
        children: [
          r.blackout
            ? p.jsxs("span", {
                className: "px-2.5 py-1 rounded-[6px] border text-[10.5px] font-bold font-mono",
                style: { borderColor: "#EF5350", color: "#EF5350", backgroundColor: "rgba(239,83,80,0.15)" },
                children: ["🔴 15M RED-FOLDER LOCKOUT — ", r.blackoutTitle?.slice(0, 32)],
              })
            : p.jsxs("span", {
                className: "px-2.5 py-1 rounded-[6px] border border-[#1E222D] bg-[#131722] text-[10.5px] font-semibold text-[#26A69A] font-mono",
                children: ["● ", r.loaded ? `CALENDAR CLEAR (${r.source})` : "SYNCING CALENDAR..."],
              }),
          p.jsxs("button", {
            onClick: () => {
              u();
            },
            className: "chip chip-on flex items-center gap-1.5 cursor-pointer",
            children: [
              p.jsx(Vh, {
                size: 11,
                className: s ? "animate-spin" : "",
              }),
              p.jsx("span", { children: "Refresh" }),
            ],
          }),
        ],
      }),

      /* Currency Filter Bar: ALL, USD, EUR, GBP, XAU, BTC */
      p.jsx("div", {
        className: "grid grid-cols-6 gap-1.5",
        children: ["ALL", "USD", "EUR", "GBP", "XAU", "BTC"].map((cur) =>
          p.jsx(
            "button",
            {
              type: "button",
              onClick: () => setCurrFilter(cur),
              className: `py-1.5 rounded-[8px] text-[11px] font-bold cursor-pointer transition ${
                currFilter === cur
                  ? "bg-[#FFFFFF] text-[#0B0E14]"
                  : "bg-[#131722] border border-[#1E222D] text-[#787B86] hover:text-[#FFFFFF]"
              }`,
              children: cur,
            },
            cur
          )
        ),
      }),

      p.jsxs("p", {
        className: "text-[11px] text-[#787B86] leading-relaxed",
        children: [
          "🔴 Red Folder (High Impact) events trigger an automatic ",
          p.jsx("span", {
            className: "text-[#FFFFFF] font-semibold",
            children: "15-minute Pre-News Lockout",
          }),
          " and Post-News Judas Swing Manipulation Hunter across USD, EUR, GBP, XAU & BTC (IST UTC+5:30).",
        ],
      }),

      p.jsxs("div", {
        className: "space-y-2.5",
        children: [
          filteredEvents.map((d, f) => {
            const folder = FOLDER_BADGE[d.impact] || FOLDER_BADGE.low;
            const timing = formatEventCountdownIst(d.time, nowTick);
            return p.jsxs(
              "div",
              {
                className: "card p-3.5 space-y-2",
                style: {
                  borderColor: timing.isImminent && d.impact === "high" ? "#EF5350" : "#1E222D",
                },
                children: [
                  p.jsxs("div", {
                    className: "flex items-center justify-between gap-2 flex-wrap",
                    children: [
                      p.jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          p.jsxs("span", {
                            className: "px-2 py-0.5 rounded-[5px] text-[9.5px] font-bold font-mono",
                            style: {
                              color: folder.color,
                              backgroundColor: folder.bg,
                              border: `1px solid ${folder.color}40`,
                            },
                            children: [folder.icon, " ", folder.label],
                          }),
                          p.jsx("span", {
                            className: "px-2 py-0.5 rounded-[5px] bg-[#0B0E14] border border-[#1E222D] font-mono text-[10px] font-bold text-[#FFFFFF]",
                            children: d.country,
                          }),
                        ],
                      }),
                      p.jsxs("div", {
                        className: "text-right font-mono text-[10px]",
                        children: [
                          p.jsx("span", {
                            className: `font-bold ${timing.isPast ? "text-[#787B86]" : "text-[#26A69A]"}`,
                            children: timing.countdownLabel,
                          }),
                          p.jsx("span", {
                            className: "text-[#787B86] ml-1.5",
                            children: `· ${timing.istTimestamp}`,
                          }),
                        ],
                      }),
                    ],
                  }),

                  p.jsx("div", {
                    className: "text-[12.5px] font-semibold text-[#FFFFFF] leading-snug",
                    children: d.title,
                  }),

                  p.jsxs("div", {
                    className: "grid grid-cols-3 gap-2 pt-1 font-mono text-[10.5px]",
                    children: [
                      p.jsxs("div", {
                        className: "p-1.5 rounded-[6px] bg-[#0B0E14] border border-[#1E222D] flex justify-between",
                        children: [
                          p.jsx("span", { className: "text-[#787B86]", children: "Actual" }),
                          p.jsx("span", {
                            className: "font-bold text-[#FFFFFF]",
                            children: d.actual || "—",
                          }),
                        ],
                      }),
                      p.jsxs("div", {
                        className: "p-1.5 rounded-[6px] bg-[#0B0E14] border border-[#1E222D] flex justify-between",
                        children: [
                          p.jsx("span", { className: "text-[#787B86]", children: "Forecast" }),
                          p.jsx("span", {
                            className: "font-semibold text-[#B2B5BE]",
                            children: d.forecast || "—",
                          }),
                        ],
                      }),
                      p.jsxs("div", {
                        className: "p-1.5 rounded-[6px] bg-[#0B0E14] border border-[#1E222D] flex justify-between",
                        children: [
                          p.jsx("span", { className: "text-[#787B86]", children: "Previous" }),
                          p.jsx("span", {
                            className: "text-[#787B86]",
                            children: d.previous || "—",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              },
              d.id || f
            );
          }),
          filteredEvents.length === 0 &&
            r.loaded &&
            p.jsx("div", {
              className: "card p-6 text-center",
              children: p.jsx("p", {
                className: "text-[12px] text-[#787B86]",
                children: `No events scheduled for ${currFilter} in this week's window.`,
              }),
            }),
        ],
      }),
    ],
  });
}
const yN = [
    "HTF (4H/1D) bias map dekha — draw ka direction pata hai",
    "Fractal alignment check — execution TF HTF ke against nahi",
    "Liquidity map — BSL/SSL dono side marked",
    "Kya sweep hua hai? Nahi hua to entry nahi (reversal ke liye)",
    "Price discount/premium zone me hai (PD-correct)?",
    "Killzone ke andar hoon (London/NY)?",
    "Red folder clear — koi high-impact print ±30min me nahi",
    "Entry zone, stop, TP1-3 pehle se likhe hain",
    "Risk 1% max — position size calculated",
    "Plan invalid hua to STAND ASIDE — force trade nahi",
  ],
  Up = "sr.playbook.day";
function bN({ go: r }) {
  const [e, s] = V.useState(() => {
    const u = new Date().toISOString().slice(0, 10),
      c = safeStorage.getItem(Up);
    if (!c) return new Array(10).fill(!1);
    const { day: d, checks: f } = JSON.parse(c);
    return d === u ? f : new Array(10).fill(!1);
  });
  V.useEffect(() => {
    try {
      safeStorage.setItem(
        Up,
        JSON.stringify({
          day: new Date().toISOString().slice(0, 10),
          checks: e,
        }),
      );
    } catch {}
  }, [e]);
  const l = e.filter(Boolean).length;
  return p.jsxs("div", {
    children: [
      p.jsxs("div", {
        className: "card p-4 mb-3",
        children: [
          p.jsxs("div", {
            className: "flex justify-between mono text-[12px] mb-2",
            children: [
              p.jsx("span", { children: "DAILY DISCIPLINE" }),
              p.jsxs("span", { children: [l, "/10"] }),
            ],
          }),
          p.jsx("div", {
            className: "h-1.5 rounded-full overflow-hidden",
            style: { background: "#141414" },
            children: p.jsx("div", {
              className: "h-full transition-all",
              style: {
                width: `${l * 10}%`,
                background: l === 10 ? "#4ade80" : "#f5f5f5",
              },
            }),
          }),
          l === 10 &&
            p.jsx("p", {
              className: "text-[11px] text-green-400 mt-2 mono",
              children: "CHECKLIST COMPLETE — Aaj tum process ke saath ho.",
            }),
        ],
      }),
      p.jsx("div", {
        className: "space-y-2",
        children: yN.map((u, c) =>
          p.jsxs(
            "button",
            {
              onClick: () => s((d) => d.map((f, m) => (m === c ? !f : f))),
              className: "card w-full p-3 flex items-start gap-2.5 text-left",
              children: [
                e[c]
                  ? p.jsx(gx, {
                      size: 15,
                      className: "text-white shrink-0 mt-0.5",
                    })
                  : p.jsx(yx, {
                      size: 15,
                      className: "text-neutral-600 shrink-0 mt-0.5",
                    }),
                p.jsx("span", {
                  className: `text-[12px] leading-relaxed ${e[c] ? "text-neutral-500 line-through" : "text-neutral-200"}`,
                  children: u,
                }),
              ],
            },
            c,
          ),
        ),
      }),
      p.jsx("button", {
        onClick: () => r("terminal"),
        className: "chip chip-on w-full mt-4 py-2.5",
        children: "OPEN TERMINAL →",
      }),
      p.jsx("p", {
        className: "text-[10px] text-neutral-600 mt-3",
        children:
          "Checklist roz reset hoti hai. Jo measure nahi hota, wo improve nahi hota.",
      }),
    ],
  });
}
const Cn = {
  id: "sr.control.deviceId",
  token: "sr.control.token",
  name: "sr.control.name",
  lastOk: "sr.control.lastOk",
};
function uu(r) {
  const e = "abcdef0123456789";
  let s = "";
  for (let l = 0; l < r; l++) s += e[Math.floor(Math.random() * e.length)];
  return s;
}
function Nu() {
  let r = safeStorage.getItem(Cn.id);
  return (
    r ||
      ((r = `SR-${uu(4)}-${uu(4)}-${uu(4)}`), safeStorage.setItem(Cn.id, r)),
    r
  );
}
function zg() {
  let r = safeStorage.getItem(Cn.token);
  return (r || ((r = uu(32)), safeStorage.setItem(Cn.token, r)), r);
}
function xN() {
  return (
    safeStorage.getItem(Cn.name) || `${Mn.getPlatform()}-${Nu().slice(-4)}`
  );
}
async function SN() {
  const r = {
    platform: Mn.getPlatform(),
    appVersion: Kh,
    versionCode: String(ng),
    userAgent: navigator.userAgent.slice(0, 120),
  };
  try {
    const { Device: e } = await Hh(async () => {
        const { Device: l } = Promise.resolve({ Device: { getInfo: async () => ({}) } });
        return { Device: l };
      }, []),
      s = await e.getInfo();
    ((r.manufacturer = s.manufacturer ?? ""),
      (r.model = s.model ?? ""),
      (r.os = `${s.platform} ${s.osVersion}`));
  } catch {}
  return r;
}
const kh = new Set();
let ou = {
  status: "checking",
  deviceId: Nu(),
  name: xN(),
  lastOk: Number(safeStorage.getItem(Cn.lastOk) || 0),
};
function Dg(r) {
  return (
    kh.add(r),
    r(ou),
    () => {
      kh.delete(r);
    }
  );
}
function es(r) {
  ((ou = { ...ou, ...r }), kh.forEach((e) => e(ou)));
}
async function wN() {
  const r = Nu(),
    e = zg();
  try {
    (
      await fetch(`${vu}/api/device/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: r, token: e, meta: await SN() }),
      })
    ).ok
      ? (safeStorage.setItem(Cn.lastOk, String(Date.now())),
        es({ status: "active", lastOk: Date.now() }))
      : es({ status: "offline-grace" });
  } catch {
    es({ status: "offline-grace" });
  }
}
let Eh = null;
async function Bp() {
  const r = Nu(),
    e = zg();
  try {
    const s = await fetch(`${vu}/api/device/heartbeat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${r}.${e}` },
    });
    if (s.status === 403) {
      es({ status: "blocked" });
      return;
    }
    s.ok
      ? (safeStorage.setItem(Cn.lastOk, String(Date.now())),
        es({ status: "active", lastOk: Date.now() }))
      : es({ status: "offline-grace" });
  } catch {
    es({ status: "offline-grace" });
  }
}
function NN() {
  (wN().then(() => Bp()),
    Eh && clearInterval(Eh),
    (Eh = setInterval(() => {
      Bp();
    }, 3e4)));
}
async function MN() {
  try {
    const r = await fetch(`${vu}/api/admin/update`);
    if (!r.ok) return null;
    const e = await r.json();
    return e && typeof e.versionCode == "number" && e.versionCode > ng
      ? e
      : null;
  } catch {
    return null;
  }
}
const BASE_HP = [
  {
    id: "subscription",
    label: "SR Terminal Premium",
    desc: "Google Play 30d/2m/1y subscriptions",
    Icon: Crown,
  },
  {
    id: "replay",
    label: "Chart Replay & Backtest",
    desc: "Historical candle-by-candle & SR Concepts engine",
    Icon: RotateCcw,
  },
  {
    id: "account",
    label: "Account & Profile",
    desc: "Google Authentication",
    Icon: Shield,
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    desc: "Official 20-point institutional policy",
    Icon: FileText,
  },
  {
    id: "notifications",
    label: "Trade Notifications",
    desc: "Plan + lifecycle alerts",
    Icon: $b,
  },
  {
    id: "books",
    label: "Book Knowledge",
    desc: "Six sources, distilled",
    Icon: Wb,
  },
  {
    id: "academy",
    label: "ICT Academy",
    desc: "28 lessons · Hinglish",
    Icon: Kp,
  },
  {
    id: "killzones",
    label: "Killzone Clock",
    desc: "London / NY in IST · ET",
    Icon: Gp,
  },
  { id: "amd", label: "AMD Cycle", desc: "Power of Three", Icon: mx },
  { id: "wire", label: "Finance Wire", desc: "RSS headlines", Icon: Qp },
  {
    id: "redfolder",
    label: "Red Folder Radar",
    desc: "Economic calendar",
    Icon: tx,
  },
  { id: "playbook", label: "ICT Playbook", desc: "Daily checklist", Icon: nx },
];
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.warn("Tab render notice:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return p.jsxs("div", {
        className: "card p-4 text-center my-4 border-red-900/50 bg-red-950/20",
        children: [
          p.jsx("div", { className: "text-red-400 font-bold mb-1 text-sm", children: "Content load error" }),
          p.jsx("p", { className: "text-neutral-400 text-xs mb-3", children: "Is section ko load karne me dikkat aayi. Please refresh karein." }),
          p.jsx("button", {
            onClick: () => this.setState({ hasError: false, error: null }),
            className: "chip chip-on text-xs",
            children: "Retry",
          }),
        ],
      });
    }
    return this.props.children;
  }
}

function EN({ go: r, onSignOut }: { go: any; onSignOut?: any }) {
  const [e, s] = V.useState(() => {
      const initialTab = safeStorage.getItem("sr.more.tab");
      if (initialTab) {
        safeStorage.removeItem("sr.more.tab");
        return initialTab;
      }
      return null;
    }),
    [userProfile, setUserProfile] = V.useState(null),
    [authOpen, setAuthOpen] = V.useState(false),
    [, setRewardTick] = V.useState(0);

  V.useEffect(() => {
    const unsubProfile = subscribeUserProfile((prof) => setUserProfile(prof));
    const unsubRewards = subscribeRewardedAdUnlocks(() => setRewardTick((n) => n + 1));
    return () => {
      unsubProfile();
      unsubRewards();
    };
  }, []);

  const entitlement = evaluateEntitlement(userProfile);
  const basicNewsUnlocked = entitlement.isActive || isFeatureUnlockedByRewardedAd("basic_news_breakdown");
  const aiAgentLabel = entitlement.isTrial || entitlement.tierLevel >= 2 ? "AI Trading Agent" : "Basic AI Agent";

  const menuItems = [...BASE_HP];

  // Funded Account / Prop Firm Pass Manager navigation
  menuItems.unshift({
    id: "funded-manager",
    label: "Funded Account Pass Manager",
    desc: "Ment Funding, Blue Guardian, Goat Funded, FTMO & FundedNext · 60% Anti-Breach Shield",
    Icon: Ip,
  });

  // AI Trading Agent navigation
  menuItems.unshift({
    id: "ai-trading",
    label: aiAgentLabel,
    desc: "Institutional ICT setups, chart analysis & risk lot sizing",
    Icon: Sparkles,
  });

  // Dedicated 1-tap Sign Out / Switch Account button
  if (userProfile) {
    menuItems.push({
      id: "signout",
      label: "Sign Out / Switch Account",
      desc: `Signed in as ${userProfile.email || userProfile.name || "Trader"} · Tap to log out immediately`,
      Icon: LogOut,
    });
  }

  const handleMenuSelect = (id: string) => {
    if (id === "signout") {
      void signOutUser().then(() => {
        if (onSignOut) onSignOut();
      });
      return;
    }
    if (id === "ai-trading") {
      r("ai-agent");
      return;
    }
    if (id === "funded-manager") {
      r("funded");
      return;
    }
    s(id);
  };

  V.useEffect(() => {
    if (!e) return;
    if (e === "signout") {
      s(null);
      void signOutUser().then(() => {
        if (onSignOut) onSignOut();
      });
    } else if (e === "ai-trading") {
      s(null);
      r("ai-agent");
    } else if (e === "funded-manager") {
      s(null);
      r("funded");
    }
  }, [e, onSignOut, r]);

  if (e) {
    if (e === "signout" || e === "ai-trading" || e === "funded-manager") {
      return null;
    }
    if (e === "subscription") {
      return p.jsx(SubscriptionScreen, {
        userProfile,
        onOpenAuth: () => setAuthOpen(true),
        onClose: () => s(null),
      });
    }
    if (e === "replay") {
      if (!entitlement.isActive) {
        return p.jsx(TerminalLockedScreen, {
          userProfile,
          featureTitle: "Historical Bar-by-Bar Backtest Replay",
          allowRewardedAd: false,
          onViewPlans: () => s("subscription"),
          onSubscribeNow: () => s("subscription"),
        });
      }
      return p.jsx(ChartReplay, { onClose: () => s(null) });
    }
    if (e === "notifications" && !entitlement.isActive) {
      return p.jsx(TerminalLockedScreen, {
        userProfile,
        featureTitle: "24/7 Closed-App FCM Push Notifications",
        allowRewardedAd: false,
        onViewPlans: () => s("subscription"),
        onSubscribeNow: () => s("subscription"),
      });
    }
    if ((e === "wire" || e === "redfolder") && !basicNewsUnlocked) {
      return p.jsx(TerminalLockedScreen, {
        userProfile,
        featureKey: "basic_news_breakdown",
        featureTitle: "Basic News & Economic Calendar Breakdown",
        allowRewardedAd: true,
        onViewPlans: () => s("subscription"),
        onSubscribeNow: () => s("subscription"),
        onTrialActivated: () => setRewardTick((n) => n + 1),
      });
    }
    if (e === "account") {
      return p.jsx(AuthModal, {
        isOpen: true,
        onClose: () => s(null),
        userProfile,
        onOpenSubscription: () => s("subscription"),
        onSignOut: () => {
          if (onSignOut) onSignOut();
          s(null);
        },
      });
    }
    if (e === "privacy") {
      return p.jsx(PrivacyPolicyScreen, { onBack: () => s(null) });
    }

    const f = menuItems.find((m) => m.id === e);
    return p.jsxs("div", {
      className: "pb-8 max-w-xl mx-auto fadein",
      children: [
        p.jsxs("div", {
          className: "sticky top-0 z-10 px-4 pt-4 pb-2 flex items-center gap-2 bg-[#0B0E14]",
          children: [
            p.jsxs("button", {
              onClick: () => s(null),
              className: "chip flex items-center gap-1",
              children: [p.jsx(Lv, { size: 12 }), " MORE"],
            }),
            p.jsx("span", {
              className: "display text-sm font-semibold",
              children: f?.label || "SECTION",
            }),
          ],
        }),
        p.jsx("div", {
          className: "px-4",
          children: p.jsx(TabErrorBoundary, {
            children: p.jsxs(React.Fragment, {
              children: [
                e === "notifications" && p.jsx(sN, {}),
                e === "books" && p.jsx(aN, {}),
                e === "academy" && p.jsx(uN, {}),
                e === "killzones" && p.jsx(oN, {}),
                e === "amd" && p.jsx(cN, {}),
                e === "wire" && p.jsx(vN, {}),
                e === "redfolder" && p.jsx(gN, {}),
                e === "playbook" && p.jsx(bN, { go: r }),
              ],
            }),
          }),
        }),
      ],
    });
  }

  return p.jsxs("div", {
    className: "px-4 pt-4 pb-8 max-w-xl mx-auto fadein",
    children: [
      p.jsxs("div", {
        className: "flex items-center justify-between mb-3",
        children: [
          p.jsx("h1", {
            className: "display text-base font-bold",
            children: "MORE",
          }),
          p.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              p.jsxs("button", {
                onClick: () => (userProfile ? s("account") : setAuthOpen(true)),
                className: "chip flex items-center gap-1.5 mono text-[10px]",
                children: [
                  p.jsx(Shield, { size: 12, className: userProfile ? "text-[#26A69A]" : "text-amber-400" }),
                  userProfile ? (userProfile.name || "Trader") : "SIGN IN",
                ],
              }),
              userProfile &&
                p.jsxs("button", {
                  onClick: async () => {
                    await signOutUser();
                    if (onSignOut) onSignOut();
                  },
                  className: "chip flex items-center gap-1 mono text-[10px] text-[#EF5350] border border-[#EF5350]/40 bg-[#EF5350]/10 hover:bg-[#EF5350]/20 cursor-pointer active:scale-98 smooth-ui",
                  children: [
                    p.jsx(LogOut, { size: 11 }),
                    "LOG OUT",
                  ],
                }),
            ],
          }),
        ],
      }),
      /* Account Status Card */
      p.jsx("div", {
        className: "card p-3 mb-3 border-[#1E222D] bg-[#131722]",
        children: p.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            p.jsxs("div", {
              className: "space-y-0.5",
              children: [
                p.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    p.jsx(Crown, { size: 14, className: entitlement.isActive ? "text-[#26A69A]" : "text-[#F59E0B]" }),
                    p.jsx("span", {
                      className: "font-mono text-xs font-bold text-white uppercase",
                      children: entitlement.isActive
                        ? `${entitlement.tierBadge}: ${entitlement.planName}`
                        : "FREE TIER (AD-SUPPORTED)",
                    }),
                  ],
                }),
                p.jsx("div", {
                  className: "mono text-[10px] text-[#787B86]",
                  children: entitlement.isActive
                    ? entitlement.isTrial
                      ? `24-Hour Free Trial Active · Full Institutional & Funded Account Access`
                      : `${entitlement.daysRemaining} days remaining · 100% Ad-Free Google Play verified`
                    : "Basic tools via Rewarded Ad · Upgrade to Ad-Free Pro for Live Signals, Funded Manager & Replay",
                }),
              ],
            }),
            p.jsx("button", {
              onClick: () => s("subscription"),
              className: "chip chip-on text-[10px] mono font-bold",
              children: entitlement.isActive ? "MANAGE" : "UPGRADE",
            }),
          ],
        }),
      }),
      p.jsx("div", {
        className: "space-y-2",
        children: menuItems.map(({ id: f, label: m, desc: b, Icon: v }) =>
          p.jsxs(
            "button",
            {
              onClick: () => handleMenuSelect(f),
              className:
                "card w-full p-3 flex items-center gap-3 text-left active:scale-98 smooth-ui",
              children: [
                p.jsx(v, { size: 16, className: "text-neutral-300 shrink-0" }),
                p.jsxs("div", {
                  className: "min-w-0",
                  children: [
                    p.jsx("div", {
                      className: "text-[13px] font-medium",
                      children: m,
                    }),
                    p.jsx("div", {
                      className: "mono text-[9px] text-[#787B86]",
                      children: b,
                    }),
                  ],
                }),
                p.jsx(Lv, {
                  size: 14,
                  className: "text-[#787B86] ml-auto rotate-180 shrink-0",
                }),
              ],
            },
            f,
          ),
        ),
      }),
      p.jsxs("p", {
        className:
          "mono text-[9px] text-[#787B86] text-center mt-6 leading-relaxed",
        children: [
          "SR TERMINAL · ",
          Kh,
          " · ",
          sg,
          p.jsx("br", {}),
          "EDUCATIONAL DECISION SUPPORT · NOT FINANCIAL ADVICE",
        ],
      }),
      authOpen &&
        p.jsx(AuthModal, {
          isOpen: true,
          onClose: () => setAuthOpen(false),
          userProfile,
          onOpenSubscription: () => s("subscription"),
          onSignOut: () => {
            if (onSignOut) onSignOut();
            setAuthOpen(false);
          },
        }),
    ],
  });
}

export default EN;
