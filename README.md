# SR Terminal — Complete Source Project

**Version:** 2.8.9.13 (versionCode 28914) · **Package:** `com.surajray.srterminal` · **Owner:** Suraj Ray
Private educational ICT / smart-money decision-support app (React + Vite + Capacitor Android).
**EDUCATIONAL DECISION SUPPORT · NOT FINANCIAL ADVICE.** No win rate is promised or guaranteed.

> Tagline: *Agar tum SR Terminal ke bina kuch bhi nahi ho, toh tum SR Terminal ke layak nahi ho.*

---

## 1. What this project contains

```
sr-terminal/
├── index.html                  # CSP, fonts, root — connect-src whitelist for Binance/relays/worker/TV
├── package.json                # all JS dependencies + scripts (npm install restores everything)
├── package-lock.json           # pinned dependency versions (npm ci / reproducible installs)
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite 7 + React + Tailwind 4
├── capacitor.config.ts         # appId com.surajray.srterminal, androidScheme https
├── .gitignore
├── README.md                   # this file
│
├── src/                        # ── APP SOURCE (React 19 + TypeScript) ──
│   ├── main.tsx                # entry
│   ├── App.tsx                 # native/dev vs hosted-web boot + session gate
│   ├── index.css               # Tailwind 4 theme, design tokens (#050505 ink, fonts), utility classes
│   ├── vite-env.d.ts
│   │
│   ├── lib/                    # ── CORE LOGIC ──
│   │   ├── ict.ts              # ★ TRADING PLAN ENGINE — analyse(), all detectors
│   │   │                       #   (swings, hierarchy, BSL/SSL pools, FVG, OB, BPR, BOS/CHoCH,
│   │   │                       #    sweep, displacement, CISD, turtle soup, AMD, session levels),
│   │   │                       #    8 concept evaluators, composite bias, quorum direction resolver,
│   │   │                       #    model picker, entry/stop/TP builder, validity gates, grading
│   │   ├── concepts.ts         # concept definitions (8) + selection persistence (sr.engine.concepts.v2)
│   │   ├── market.ts           # symbols (XAUUSD=PAXG etc.), Binance REST failover + shared WS stream
│   │   ├── economicNews.ts     # economic calendar fetch (via control server) + blackout logic
│   │   ├── news.ts             # RSS Finance Wire (CORS relays)
│   │   ├── journal.ts          # trade journal FSM (PLANNED→RUNNING→TP1/TP2→TP3/BE/STOP/EXPIRED)
│   │   ├── tradeNotifications.ts  # Capacitor local notifications, channel sr-trade-alerts
│   │   ├── deviceControl.ts    # auto-register + 30s heartbeat vs Cloudflare Worker (offline-grace)
│   │   ├── clock.ts            # IST/ET conversion, killzone windows, date labels
│   │   ├── lessons.ts          # ICT Academy — 28 Hinglish lessons
│   │   └── version.ts          # BUILD string + APP_VERSION_CODE (update checks use this)
│   │
│   ├── hooks/
│   │   ├── useMarket.ts        # candles (REST+WS), HTF fractal map, calendar, tickers, analysis
│   │   └── useJournal.ts       # journal state, auto-record valid plans, live-price heartbeat FSM
│   │
│   └── components/
│       ├── NativeAppShell.tsx  # bottom nav (Home/Terminal/Matrix/Journal/More), back button, device gate
│       ├── Home.tsx            # command center (quote, killzone strip, market watch, quick tools)
│       ├── Terminal.tsx        # ★ live terminal — 11 panels (concepts, chart, bias, fractal, news,
│       │                       #    phase, levels, why, plan, risk, signal log) + hotkeys 1-5/QWERT
│       ├── LiveChart.tsx       # lightweight-charts 5 candles + engine price lines (ENTRY/SL/TP/BSL/SSL/EQ)
│       ├── TradingViewChart.tsx# TV PRO fallback (iframe embed, mobile params)
│       ├── TradePlanModal.tsx  # full plan sheet (logic, blockers, risk sizing)
│       ├── Matrix.tsx          # MTF 5×5 bias grid
│       ├── JournalScreen.tsx   # journal list + stats + JSON export
│       ├── MarketStrip.tsx     # 24h tickers strip
│       ├── More.tsx            # tools menu + device control card
│       └── tools/              # NotificationSettings, Academy, KillzoneClock, AMDSection,
│                               #   BookKnowledge, FinanceWire, RedFolder (calendar), Playbook
│
├── scripts/
│   ├── engine-smoke.ts         # live engine health check (all symbols × TFs)
│   └── backtest-engine.ts      # walk-forward backtest (no look-ahead, conservative fills, 0.05R cost)
│
├── assets/
│   └── icon-master.png         # master logo (all launcher/splash icons generated from this)
│
├── signing/
│   ├── debug.keystore          # ★ keystore that signed 2.8.9.12/13 — keeps upgrade installs working
│   └── SIGNING.md              # how to use it + release keystore instructions
│
└── android/                    # ── ANDROID PROJECT (Capacitor 7, pre-generated & version-patched) ──
    ├── settings.gradle / build.gradle / variables.gradle   # SDK 35, AGP 8.7.2, minSdk 23
    ├── gradle.properties       # jvmargs tuned for low-RAM build machines
    ├── gradlew + gradlew.bat   # wrapper (Gradle 8.11.1 — no local gradle install needed)
    ├── gradle/wrapper/         # gradle-wrapper.jar + properties
    ├── capacitor.settings.gradle / capacitor-cordova-android-plugins/
    └── app/
        ├── build.gradle        # versionCode 28914, versionName "2.8.9.13"
        └── src/main/
            ├── AndroidManifest.xml     # INTERNET permission only, allowBackup=false
            ├── java/com/surajray/srterminal/MainActivity.java
            └── res/                    # SR launcher icons (all densities + adaptive),
                                          # splash screens (port/land all densities), styles
```

**Not included (regenerable — never needed in the archive):** `node_modules/` (restored by `npm install`),
`dist/` (restored by `npm run build`), `android/*/build/` (restored by gradle). Including them would add
hundreds of MB without adding any information.

---

## 2. Tech stack

| Layer | Tech |
|---|---|
| UI | React 19, TypeScript 5.9, Tailwind CSS 4, lucide-react icons |
| Chart | lightweight-charts 5 (+ TradingView iframe fallback) |
| Build | Vite 7 (dev + single-page production build) |
| Mobile | Capacitor 7 (android, app, device, local-notifications, browser) |
| Android | Gradle 8.11.1 wrapper, AGP 8.7.2, compileSdk/targetSdk 35, minSdk 23, JDK 21 |
| Market data | Binance public REST + WebSocket (no API keys) |
| Tests | tsx scripts (engine smoke, walk-forward backtest) |

---

## 3. Prerequisites

1. **Node.js 20+** (with npm)
2. **JDK 21** (Capacitor 7 / AGP 8.7 requirement) — `sudo apt install openjdk-21-jdk` (Ubuntu/Debian) or
   download from adoptium.net
3. **Android SDK** with: `platform-tools`, `platforms;android-35`, `build-tools;35.0.0`
   (easiest via Android Studio → SDK Manager, or `sdkmanager` from command-line tools)
4. (Nice to have) 3–4 GB free RAM for Gradle; on low-RAM machines add swap or lower
   `org.gradle.jvmargs` in `android/gradle.properties`

Set environment variables (Linux/macOS example):

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64   # your JDK 21 path
export ANDROID_HOME=$HOME/Android/Sdk                 # your SDK path
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

---

## 4. Run (web browser)

```bash
cd sr-terminal
npm install            # restores ALL dependencies (package-lock.json pins exact versions)
npm run dev            # http://localhost:5173 — live Binance data, full terminal
```

Other scripts:

```bash
npm run typecheck      # TypeScript strict check
npm run test:engine    # engine smoke test on live data (all 5 symbols × 5 TFs)
npm run backtest       # walk-forward engine validation (real Binance data)
BACKTEST_PROFILE=ICT BACKTEST_TFS=15m,1h BACKTEST_BARS=6000 npm run backtest
npm run build          # production build -> dist/
npm run verify         # typecheck + engine smoke + build
```

---

## 5. Build the Android APK

The `android/` folder is **already generated and version-patched** (versionCode 28914, versionName
"2.8.9.13", SR icons, INTERNET-only manifest). You do NOT need to run `cap add` again.

```bash
# 1. build the web app + sync into the android project
npm run android:sync          # = npm run build && npx cap sync android

# 2. compile the APK
cd android
chmod +x gradlew              # first time on Linux/macOS (zip may drop the exec bit)
./gradlew assembleDebug       # Windows: gradlew.bat assembleDebug

# 3. done — APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

Install on phone: `adb install -r app-debug.apk` or copy the APK and enable "install unknown apps".

### Build an AAB (Play Store format — release)

```bash
cd android
./gradlew bundleRelease
# output: android/app/build/outputs/bundle/release/app-release.aab
```
> Note: `bundleRelease` is unsigned by default — see `signing/SIGNING.md` for the release keystore setup.
> Private direct-install distribution should keep using `assembleDebug`.

### If you ever change appId / webDir / app name
Edit `capacitor.config.ts`, then `npm run build && npx cap sync android`.

---

## 6. Signing (IMPORTANT — read before your first rebuild)

The APKs `2.8.9.12` and `2.8.9.13` were signed with the debug keystore in **`signing/debug.keystore`**.
If you rebuild on your own machine WITHOUT it, Android will refuse to upgrade-install over the existing
app (signature mismatch) — the user would have to uninstall first (journal history would be lost).

**Fix:** copy `signing/debug.keystore` to `~/.android/debug.keystore` (backup any existing one first).
Full instructions + release-keystore guide: [`signing/SIGNING.md`](signing/SIGNING.md).

---

## 7. Version bumping (for every future release)

1. `src/lib/version.ts` → `BUILD = 'x.y.z.n'`, `APP_VERSION_CODE = <n+1>`
2. `package.json` → `"version": "x.y.z.n"`
3. `android/app/build.gradle` → `versionCode <n+1>`, `versionName "x.y.z.n"`
4. `npm run android:sync` (so the web bundle label matches)

Current: BUILD `2.8.9.13` / versionCode `28914`.

---

## 8. Engine — how the trade plan works (v2, 2.8.9.12+)

**Pipeline:** confirmed closes only (live bar excluded) → indicators (EMA 20/50/200, ATR 14, RSI 14,
Wilder ADX) → detectors (swings, STH/STL/ITH/ITL hierarchy, BSL/SSL pools, FVG, OB, BPR, BOS/CHoCH,
sweeps, displacement, CISD, turtle soup + plus-one, AMD phase, PDH/PDL/Asia levels) → 8 concept
evaluators → composite bias (−100…+100) → direction resolution → model → entry/stop/TPs → gates → grade.

**Concepts (8):** liquidity, turtleSoup, adxTrend, orderFlow, pdArrays, fractal, news, risk.
The old 14-concept list was cut — amd/hierarchy/marketMaker/volatility/standardDeviation/failedBreakout
now live inside the core engine instead of being separate AND-veto votes.

**Direction resolution (the fix that made the engine give plans again):**
- **BALANCED:** confluence quorum — ≥40% of voting (non-neutral) directional concepts aligned
  (score ≥55), and **zero** opposing concepts (score ≥50). Neutral concepts never block.
- **STRICT:** every selected market-conditional directional concept must align (score ≥65);
  news is a blackout gate, not an alignment requirement.
- No concepts selected → composite score (≥30 LONG, ≤−30 SHORT).

**Entry ranking:** turtle(10) > BPR(8) > ADX-EMA20(7) > FVG-CE(6) > OB(4) > OTE(3). PD-correct
(turtle/ADX exempt), ≤3 ATR distance, reversal entries must come after the raid.

**Stops:** turtle wick / swept wick / structural anchor within 1.2 ATR — else zone edge. Buffer
0.18–0.26 ATR, min risk 0.38 ATR, hard reject >1.8 ATR. **Stops are never widened.**

**Targets:** BSL/SSL pools + ITH/ITL/LTH/LTL + PDH/PDL + range extremes. TP1 = min(1.2R, obstacle)
(50% partial + move breakeven), TP2 = first obstacle or 2.5R (25%), TP3 = next obstacle or 4R (25% runner).
Needs ≥1.35R clean space to the first obstacle.

**Validity gates:** entry exists · model ready · concept quorum · structure fresh ≤30 bars (turtle/ADX
exempt) · killzone (intraday outside-window allows A/A+ only; 4H/1D always OK) · RR ≥1.35 · risk ≤1.8 ATR ·
no chase (>1.15R beyond entry) · not through stop · grade ≥ B · news blackout (if news concept on) ·
risk concept checks. Every failed gate is reported — STAND ASIDE always shows its exact blockers.

**Grades:** A+ (≥7 confluences, RR ≥2.5, quality ≥80) · A (5 / 2.0 / 68) · B (4 / 1.8 / 55) · C = invalid.

**Honest validation:** walk-forward backtests (conservative same-bar-stop-first fills, 0.05R cost):
CORE 3000 bars → 422 trades, 60.0% win, +172R; 6000 bars → 880 trades, 59.0%, +336R; 5m+4h → 61.5%, +222R.
These are in-sample results — not a promise. Never market a guaranteed win rate.

---

## 9. Data / network endpoints

| Purpose | Endpoint |
|---|---|
| REST klines (failover) | `https://data-api.binance.vision`, `https://api.binance.com` |
| WS kline (failover) | `wss://data-stream.binance.vision`, `wss://stream.binance.com:9443` |
| 24h tickers | Binance `/api/v3/ticker/24hr` |
| Economic calendar | `https://sr-control-server.srterminalofficial.workers.dev/api/public/calendar` (proxy → TradingView calendar) |
| Device register/heartbeat | same worker `/api/device/*` (30s heartbeat, offline-grace on outage) |
| APK update manifest | same worker `/api/admin/update` (shows banner if versionCode > APP_VERSION_CODE) |
| RSS (display only) | Yahoo/CNBC/FXStreet/CoinDesk via CORS relays |
| Chart fallback | `https://s.tradingview.com` iframe |

All of these are also whitelisted in the CSP inside `index.html`.

---

## 10. Local storage (all data stays on-device)

| Key | Content |
|---|---|
| `sr.engine.concepts.v2` | concept toggles + mode |
| `sr.journal.v1` | trade journal (max 500 records) |
| `sr.notifications.settings` | alert toggles |
| `sr.symbol` / `sr.tf` | last symbol/timeframe |
| `sr.apk.route` | last screen |
| `sr.zone` / `sr.h12` | clock prefs |
| `sr.control.deviceId/token/lastOk` | device identity for the control server |
| `sr.account` / `sr.riskPct` | risk engine inputs |
| `sr.playbook.day` | daily checklist |

Journal export: Journal screen → EXPORT (JSON download).

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `./gradlew: Permission denied` | `chmod +x gradlew` |
| SDK not found | set `ANDROID_HOME`, or create `android/local.properties` with `sdk.dir=/path/to/sdk` (don't commit it) |
| Gradle OOM / daemon disappeared | lower `org.gradle.jvmargs` in `android/gradle.properties` (e.g. `-Xmx1024m`), close other apps, or add swap |
| Wrong Java version | `JAVA_HOME` must point to JDK 17+ (21 recommended) |
| Signature mismatch on install | you didn't use `signing/debug.keystore` — see §6 |
| App shows old version after rebuild | bump all three places (§7) and re-run `npm run android:sync` |
| Web feed errors in terminal | Binance endpoints blocked on your network — app auto-falls back to TradingView PRO toggle |
| Calendar shows OFFLINE | control server/worker unreachable — app continues without news gating (offline-grace) |

---

## 12. Rules that never change (project constraints)

1. No "Support/Resistance" / "SNR" language in the Terminal — BSL/SSL/EQ/FVG/OB/OTE only.
2. STRICT mode preserves hard-AND concept logic; BALANCED quorum is never silently converted to OR.
3. Control-server outage must never brick the trading UI.
4. Scores are not calibrated probabilities; a win rate is never promised.
5. True order flow is unavailable (candle+volume proxy only) — stay honest.
6. Never put Cloudflare Worker secrets (`ADMIN_PASSWORD`, `SESSION_SECRET`) in this repo or chat.
7. Educational / research / internal beta until walk-forward validation is complete.

---

*Built as 2.8.9.13 (versionCode 28914) · engine v2 (quorum) · APK SHA-256: `d556b8203b6280235dc5908d752d1be121453c36aad6b1d4e24d302248c69007`*
