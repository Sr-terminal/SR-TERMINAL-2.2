/**
 * SR TERMINAL — COMPLETE END-TO-END VERIFICATION SUITE
 *
 * Tests all 4 mandatory mission systems:
 * 1. Login & OTP System (Admin preservation, Non-admin OTP delivery/verification, cooldown, max attempts, role security, Firestore persistence)
 * 2. Live Chart & Market Data (XAUUSD, EURUSD, GBPUSD, BTC/USDT across all 7 timeframes: 1m, 5m, 15m, 1h, 4h, 1d, 1w + tick calibration + freshness)
 * 3. Trading Engine Intelligence (ICT + SR Concept analysis, wide SL rejection, anti-chase filter, duplicate signal prevention, setup revalidation, news blackout)
 * 4. Trade Lifecycle & Break-Even State Machine (SETUP_FORMING -> RUNNING -> TP1 -> TP2 -> TP3 / BREAKEVEN / STOPPED)
 */

import {
  classifySetup,
  updateTradeLifecycleOnTick,
  revalidateFormingSetups,
  type ImmutableTradeRecord,
} from '../src/lib/tradeLifecycleEngine'
import { moveToBreakEven } from '../src/lib/journal'
import {
  getCalibrationMultiplier,
  calibratePrice,
  calibrateCandles,
  syncBenchmarks,
} from '../src/lib/brokerCalibration'
import { validateTickFreshness } from '../src/lib/dataIntegrity'
import { SYMBOLS, INTERVALS, fetchKlines } from '../src/lib/market'
import { analyse } from '../src/lib/ict'
import { checkNewsBlackout, type EconomicEvent } from '../src/lib/newsService'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${msg}`)
    failed++
  }
}

const API_BASE = 'http://localhost:3000'

async function postJson(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

async function runTests() {
  console.log('================================================================')
  console.log('   SR TERMINAL — COMPLETE LIVE SYSTEM & ENGINE VERIFICATION     ')
  console.log('================================================================\n')

  // ===================================================================
  // SUITE 1: LOGIN & OTP SYSTEM (ADMIN + NORMAL USERS + SECURITY)
  // ===================================================================
  console.log('[Suite 1: Login & OTP System — Admin & Normal Users]')

  // 1.1 Empty & Invalid email validation
  const emptyEmailRes = await postJson('/api/auth/send-otp', { email: '   ' })
  assert(
    emptyEmailRes.status === 400 && emptyEmailRes.data.success === false,
    'Rejects empty email input with HTTP 400 before generating OTP'
  )

  const invalidEmailRes = await postJson('/api/auth/send-otp', { email: 'not-an-email' })
  assert(
    invalidEmailRes.status === 400 && invalidEmailRes.data.success === false,
    'Rejects invalid email format with HTTP 400'
  )

  // 1.2 Admin email OTP flow (surajrayxyz09@gmail.com)
  const adminEmail = 'surajrayxyz09@gmail.com'
  const adminSendRes = await postJson('/api/auth/send-otp', { email: adminEmail })
  assert(
    (adminSendRes.status === 200 && adminSendRes.data.success === true && adminSendRes.data.recipient === adminEmail) ||
      (adminSendRes.status === 429 && typeof adminSendRes.data.error === 'string' && adminSendRes.data.error.includes('wait')),
    `Admin email (${adminEmail}) OTP generation & dispatch succeeds (HTTP 200 or active 60s cooldown)`
  )

  // 1.3 Cooldown check on immediate resend (<60s)
  const cooldownRes = await postJson('/api/auth/request-otp', { email: adminEmail })
  assert(
    cooldownRes.status === 429 && typeof cooldownRes.data.error === 'string' && cooldownRes.data.error.includes('wait'),
    `Enforces 60-second resend cooldown ("${cooldownRes.data.error}")`
  )

  // 1.4 Normal user #1 OTP flow (non-admin email)
  const normalUserEmail = `trader.user.${Date.now()}@gmail.com`
  const userSendRes = await postJson('/api/auth/request-otp', { email: normalUserEmail })
  assert(
    userSendRes.status === 200 &&
      userSendRes.data.success === true &&
      userSendRes.data.recipient === normalUserEmail &&
      userSendRes.data.recipient !== adminEmail,
    `Normal user email (${normalUserEmail}) is strictly set as recipient (never routed to admin email)`
  )

  const userOtpCode = userSendRes.data.relayCode
  assert(
    typeof userOtpCode === 'string' && /^\d{6}$/.test(userOtpCode),
    `Normal user receives valid 6-digit OTP code for verification`
  )

  // Verify Normal user OTP
  const userVerifyRes = await postJson('/api/auth/verify-otp', {
    email: normalUserEmail,
    code: userOtpCode,
  })
  assert(
    userVerifyRes.status === 200 && userVerifyRes.data.success === true,
    `Normal user OTP verification succeeds and creates login session`
  )
  assert(
    userVerifyRes.data.isAdmin === false && userVerifyRes.data.profile?.role === 'user',
    `Normal user is strictly assigned role='user' and isAdmin=false (zero privilege escalation)`
  )
  assert(
    userVerifyRes.data.profile?.uid?.startsWith('trader_'),
    `Normal user receives deterministic UID (${userVerifyRes.data.profile?.uid})`
  )

  // Verify replay attack prevention (re-using same OTP fails)
  const replayVerifyRes = await postJson('/api/auth/verify-otp', {
    email: normalUserEmail,
    code: userOtpCode,
  })
  assert(
    replayVerifyRes.status === 400 && replayVerifyRes.data.success === false,
    `Used OTP is immediately burned and cannot be replayed`
  )

  // 1.5 Maximum verification attempts (5 failed attempts burns OTP)
  const bruteEmail = `security.test.${Date.now()}@outlook.com`
  const bruteSendRes = await postJson('/api/auth/request-otp', { email: bruteEmail })
  assert(bruteSendRes.status === 200, 'Generated OTP for max-attempts security test')
  let fifthAttemptMsg = ''
  for (let i = 1; i <= 5; i++) {
    const wrongRes = await postJson('/api/auth/verify-otp', { email: bruteEmail, code: '000000' })
    if (i === 5) fifthAttemptMsg = wrongRes.data.error || ''
  }
  assert(
    fifthAttemptMsg.toLowerCase().includes('too many') || fifthAttemptMsg.toLowerCase().includes('burned'),
    `Locks and burns OTP on 5th failed verification attempt ("${fifthAttemptMsg}")`
  )

  // ===================================================================
  // SUITE 2: LIVE CHART & MARKET DATA (ALL SYMBOLS x ALL 7 TIMEFRAMES)
  // ===================================================================
  console.log('\n[Suite 2: Live Chart & Market Data — All Symbols & All 7 Timeframes]')

  const requiredIntervals = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']
  const configuredIntervals = INTERVALS.map((i) => i.id)
  assert(
    requiredIntervals.every((tf) => configuredIntervals.includes(tf as any)),
    `All 7 required timeframes configured in market.ts: ${configuredIntervals.join(', ')}`
  )

  const requiredSymbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD']
  const configuredSymbols = SYMBOLS.map((s) => s.id)
  assert(
    requiredSymbols.every((s) => configuredSymbols.includes(s)),
    `All required markets configured in market.ts: ${configuredSymbols.join(', ')}`
  )

  // Sync live spot benchmarks
  await syncBenchmarks({
    PAXGUSDT: 2750.0,
    EURUSDT: 1.085,
    GBPUSDT: 1.295,
  })

  // Verify live tick movement is NOT frozen by getCalibrationMultiplier
  const tickA = calibratePrice('XAUUSD', 2750.0)
  const tickB = calibratePrice('XAUUSD', 2752.5)
  assert(
    tickB > tickA && Math.abs((tickB - tickA) - 2.5 * getCalibrationMultiplier('XAUUSD', 2750.0)) < 0.05,
    `Live tick calibration preserves real-time price deltas (${tickA} -> ${tickB} on +$2.50 move)`
  )

  // Verify WebSocket event timestamp freshness validation
  const nowTs = Date.now()
  const freshness = validateTickFreshness(nowTs - 120, nowTs)
  assert(
    freshness.valid === true && freshness.isStale === false,
    `WebSocket event timestamp freshness check passes (${freshness.ageMs}ms age)`
  )

  // Test real historical kline loading + calibration + engine consistency across all 4 required symbols & all 7 timeframes
  for (const symId of requiredSymbols) {
    const symMeta = SYMBOLS.find((s) => s.id === symId)!
    let allTfsOk = true
    const tfSummary: string[] = []

    for (const tf of requiredIntervals) {
      const rawKlines = await fetchKlines(symMeta.src, tf, 120)
      const minExpected = tf === '1w' ? 40 : 80
      if (!Array.isArray(rawKlines) || rawKlines.length < minExpected) {
        allTfsOk = false
        tfSummary.push(`${tf}:FAIL(${rawKlines?.length || 0})`)
        continue
      }

      const calKlines = calibrateCandles(symId, rawKlines)
      const lastBar = calKlines[calKlines.length - 1]
      const ohlcValid = calKlines.every(
        (b, idx) =>
          b.h >= Math.max(b.o, b.c) - 1e-6 &&
          b.l <= Math.min(b.o, b.c) + 1e-6 &&
          (idx === 0 || b.t > calKlines[idx - 1].t)
      )
      const analysis = analyse(calKlines, tf, undefined, undefined, undefined, symMeta.digits)
      const priceConsistent = analysis?.ok && Math.abs(analysis.price - lastBar.c) < 1e-6

      if (!ohlcValid || !priceConsistent) {
        allTfsOk = false
        tfSummary.push(`${tf}:ERR`)
      } else {
        tfSummary.push(`${tf}:${calKlines.length}b@${lastBar.c}`)
      }
    }

    assert(
      allTfsOk,
      `${symId} (${symMeta.label}) loaded, calibrated & verified across all 7 timeframes [${tfSummary.join(', ')}]`
    )
  }

  // ===================================================================
  // SUITE 3: TRADING ENGINE INTELLIGENCE & RISK FILTERS
  // ===================================================================
  console.log('\n[Suite 3: Trading Engine Intelligence, Risk Filters & Setup Revalidation]')

  const basePlan = {
    valid: true,
    direction: 'LONG' as const,
    model: 'LIQUIDITY SWEEP',
    modelKind: 'reversal',
    entry: 2750.5,
    entryZone: [2750.0, 2751.0] as [number, number],
    stop: 2742.0,
    tp1: 2759.0,
    tp2: 2768.0,
    tp3: 2780.0,
    rr: 2.06,
    rr1: 1.0,
    grade: 'A',
    confidence: 85,
    confluences: ['LIQUIDITY SWEEP', 'CISD', 'MSS', 'ORDER BLOCK (OB)'],
    logic: { summary: 'LONG — 4 concepts aligned, 0 opposing (BALANCED mode)' },
  }

  const existingRecords: ImmutableTradeRecord[] = []
  const now = 1730000000000

  // 3.1 New setup classification
  const firstClassification = classifySetup(basePlan, 'XAUUSD', 'GOLD', '15m', 2753.0, existingRecords, 2, now)
  assert(firstClassification.type === 'NEW_SETUP', 'Creates NEW_SETUP in SETUP_FORMING stage when valid plan arrives')
  if (firstClassification.type === 'NEW_SETUP') {
    existingRecords.push(firstClassification.trade)
  }

  // 3.2 Duplicate prevention on identical setup
  const dupClassification = classifySetup(basePlan, 'XAUUSD', 'GOLD', '15m', 2752.8, existingRecords, 2, now + 30000)
  assert(
    dupClassification.type === 'UPDATE_EXISTING',
    'Refines existing SETUP_FORMING trade without creating duplicate signals'
  )

  // 3.3 Revalidate pending setup when market structure flips strongly opposite
  const revalResult = revalidateFormingSetups(
    existingRecords,
    'XAUUSD',
    '15m',
    { ok: true, price: 2745.0, score: -58, bias: 'STRONG SELL', plan: { valid: false, logic: { blackout: false } } },
    now + 45000
  )
  assert(
    revalResult.changed === true && revalResult.records[0].stage === 'INVALIDATED',
    'Revalidates and invalidates pending SETUP_FORMING trade when market bias flips to STRONG SELL'
  )

  // 3.4 News Blackout filter
  const eventTime = now + 15 * 60 * 1000
  const mockEvents: EconomicEvent[] = [
    { id: 'us-cpi', country: 'USD', title: 'CPI m/m', impact: 'high', time: eventTime },
  ]
  assert(
    checkNewsBlackout(mockEvents, now).blackout === true &&
      checkNewsBlackout(mockEvents, eventTime + 40 * 60 * 1000).blackout === false,
    'Enforces high-impact news blackout window (-20m / +30m) and clears outside window'
  )

  // ===================================================================
  // SUITE 4: TRADE LIFECYCLE & BREAK-EVEN STATE MACHINE
  // ===================================================================
  console.log('\n[Suite 4: Trade Lifecycle — Entry Fill, Break-Even Protection, TP1/TP2/TP3 & SL]')

  const formingTrade: ImmutableTradeRecord = {
    id: 'test_xau_lifecycle',
    signalId: 'sig_xau_lifecycle',
    symbolId: 'XAUUSD',
    symbolLabel: 'GOLD',
    tf: '15m',
    direction: 'LONG',
    model: 'LIQUIDITY SWEEP',
    entry: 2750.0,
    entryZone: [2749.5, 2750.5],
    stop: 2742.0,
    initialStopLoss: 2742.0,
    initialStop: 2742.0,
    tp1: 2759.0,
    tp2: 2768.0,
    tp3: 2780.0,
    rr: 2.25,
    rr1: 1.12,
    rr3: 3.75,
    grade: 'A',
    confidence: 85,
    confluences: ['LIQUIDITY SWEEP', 'ORDER BLOCK (OB)'],
    createdTs: now,
    statusTs: now,
    stage: 'SETUP_FORMING',
    status: 'SETUP_FORMING',
    risky: false,
    events: [],
    priceAtCreate: 2754.0,
    digits: 2,
  }

  // 4.1 Price above entry zone (2753.0) -> remains SETUP_FORMING (never premature fill)
  const step1 = updateTradeLifecycleOnTick([formingTrade], 'XAUUSD', 2753.0, now + 5000)
  assert(step1.records[0].stage === 'SETUP_FORMING', 'Setup stays SETUP_FORMING before price reaches entry zone')

  // 4.2 Price enters entry zone (2750.1) -> transitions to RUNNING
  const step2 = updateTradeLifecycleOnTick(step1.records, 'XAUUSD', 2750.1, now + 10000)
  assert(step2.records[0].stage === 'RUNNING', 'Setup transitions to RUNNING only when live price enters entry zone')

  // 4.3 Manual Move to Break-Even while RUNNING keeps trade active (does NOT prematurely close trade) and preserves initialStopLoss
  const beProtectedTrade = moveToBreakEven(step2.records[0], 2755.0)
  assert(
    beProtectedTrade.stage === 'RUNNING' &&
      beProtectedTrade.stop === 2750.0 &&
      beProtectedTrade.initialStopLoss === 2742.0 &&
      beProtectedTrade.beProtected === true,
    'moveToBreakEven keeps trade RUNNING with stop locked at entry (2750.0) while preserving initialStopLoss (2742.0)'
  )

  // If price pulls back to 2750.0 on a BE-protected RUNNING trade -> closes at CLOSED (BE) (0.0R), not STOPPED (-1.0R) or CANCELLED
  const beHitStep = updateTradeLifecycleOnTick([beProtectedTrade], 'XAUUSD', 2749.9, now + 15000)
  assert(
    beHitStep.records[0].stage === 'CLOSED (BE)' && beHitStep.records[0].resultR === 0,
    'BE-protected RUNNING trade closes as CLOSED (BE) (0.00R) when price returns to entry'
  )

  // 4.4 Normal progression: RUNNING -> TP1 -> TP2 -> TP3
  const step3 = updateTradeLifecycleOnTick(step2.records, 'XAUUSD', 2759.2, now + 20000)
  assert(
    step3.records[0].stage === 'TP1' && step3.records[0].stop === 2750.0,
    'Reaching TP1 transitions stage to TP1 and auto-trails stop to Breakeven (2750.0)'
  )

  const step4 = updateTradeLifecycleOnTick(step3.records, 'XAUUSD', 2768.4, now + 30000)
  assert(
    step4.records[0].stage === 'TP2' && step4.records[0].stop === 2759.0,
    'Reaching TP2 transitions stage to TP2 and trails stop to TP1 (2759.0)'
  )

  const step5 = updateTradeLifecycleOnTick(step4.records, 'XAUUSD', 2780.5, now + 40000)
  assert(
    step5.records[0].stage === 'TP3' && (step5.records[0].resultR ?? 0) >= 3.0,
    `Reaching TP3 closes runner with full target profit (+${step5.records[0].resultR}R)`
  )

  // ===================================================================
  // SUITE 5: OTP DYNAMIC EMAIL ROUTING & EXISTING ACCOUNT LOGIN FLOW
  // ===================================================================
  console.log('\n[Suite 5: Authentication — Dynamic OTP Email Routing & Existing User Login]')
  const fs = await import('fs')
  const path = await import('path')
  const serverSource = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf8')
  const otpServiceSource = fs.readFileSync(path.join(process.cwd(), 'src/lib/emailOtpService.ts'), 'utf8')
  const authScreenSource = fs.readFileSync(path.join(process.cwd(), 'src/components/AuthScreen.tsx'), 'utf8')

  assert(
    serverSource.includes('to: cleanEmail') &&
      serverSource.includes('to: [cleanEmail]') &&
      !serverSource.includes('to: [ADMIN_EMAILS[0]]'),
    'Backend dispatchOtpEmail routes OTP strictly to dynamic user email (cleanEmail), never hardcoded to admin inbox'
  )

  assert(
    !otpServiceSource.includes('An account with this email already exists, and the password entered does not match') &&
      otpServiceSource.includes('/api/auth/complete-login') &&
      otpServiceSource.includes('/api/auth/check-account'),
    'emailOtpService handles existing accounts seamlessly without throwing "Account already exists" blocking errors'
  )

  assert(
    authScreenSource.includes("setStep('login')") &&
      authScreenSource.includes("setStep('create_account')") &&
      authScreenSource.includes('handleCompleteLoginSubmit'),
    'AuthScreen implements 2-step OTP verification -> Password login for existing users and signup for new users'
  )

  // ===================================================================
  // SUITE 6: MONOCHROME BLACK & WHITE INSTITUTIONAL CHART THEME
  // ===================================================================
  console.log('\n[Suite 6: Monochrome Institutional Chart Theme — SR Chart, OANDA Chart & Replay]')
  const liveChartSource = fs.readFileSync(path.join(process.cwd(), 'src/components/LiveChart.tsx'), 'utf8')
  const tvChartSource = fs.readFileSync(path.join(process.cwd(), 'src/components/TradingViewChart.tsx'), 'utf8')
  const replayChartSource = fs.readFileSync(path.join(process.cwd(), 'src/components/ChartReplay.tsx'), 'utf8')

  assert(
    liveChartSource.includes("color: '#000000'") &&
      liveChartSource.includes("color: 'rgba(0, 0, 0, 0)'") &&
      liveChartSource.includes("textColor: '#EAEAEA'") &&
      liveChartSource.includes("color: '#CCCCCC'") &&
      liveChartSource.includes("axisLabelColor: '#E0E0E0'") &&
      liveChartSource.includes("axisLabelTextColor: '#000000'") &&
      liveChartSource.includes("upColor: '#FFFFFF'") &&
      liveChartSource.includes("downColor: '#000000'") &&
      liveChartSource.includes("borderUpColor: '#B2B5BE'") &&
      liveChartSource.includes("wickUpColor: '#B2B5BE'") &&
      liveChartSource.includes("timeZone: MONOCHROME_CHART_THEME.timezone"),
    'SR Chart (LiveChart.tsx) applies exact #000000 background, hidden grid, #CCCCCC dotted crosshair/price line, #E0E0E0/#000000 Y-axis badge, #EAEAEA axis text, #FFFFFF/#000000 candles with #B2B5BE borders/wicks, and Asia/Kolkata timezone'
  )

  assert(
    tvChartSource.includes("'paneProperties.background': '#000000'") &&
      tvChartSource.includes("'paneProperties.vertGridProperties.color': 'rgba(0, 0, 0, 0)'") &&
      tvChartSource.includes("'paneProperties.crossHairProperties.color': '#CCCCCC'") &&
      tvChartSource.includes("'scalesProperties.textColor': '#EAEAEA'") &&
      tvChartSource.includes("'mainSeriesProperties.barColorsOnPrevClose': false") &&
      tvChartSource.includes("'mainSeriesProperties.candleStyle.upColor': '#FFFFFF'") &&
      tvChartSource.includes("'mainSeriesProperties.candleStyle.downColor': '#000000'") &&
      tvChartSource.includes("'mainSeriesProperties.candleStyle.borderUpColor': '#B2B5BE'") &&
      tvChartSource.includes("'mainSeriesProperties.candleStyle.wickUpColor': '#B2B5BE'") &&
      tvChartSource.includes("timezone: 'Asia/Kolkata'"),
    'OANDA Chart (TradingViewChart.tsx) applies exact monochrome overrides, barColorsOnPrevClose=false, default precision, and (UTC+5:30) Kolkata timezone'
  )

  assert(
    replayChartSource.includes("color: 'rgba(0, 0, 0, 0)'") &&
      replayChartSource.includes("textColor: '#EAEAEA'") &&
      replayChartSource.includes("upColor: '#FFFFFF'") &&
      replayChartSource.includes("downColor: '#000000'") &&
      replayChartSource.includes("borderUpColor: '#B2B5BE'") &&
      replayChartSource.includes("axisLabelColor: '#E0E0E0'") &&
      replayChartSource.includes("axisLabelTextColor: '#000000'"),
    'Historical Chart Replay (ChartReplay.tsx) applies matching monochrome black-and-white institutional theme'
  )

  // ===================================================================
  // SUITE 7: ADMIN-ONLY DOWNLOADS, ULTRA-CLEAN UI, SILENT 2,000-SIM ENGINE,
  //          #00C853/#FF1744 ICT ZONES & PROFITABILITY REPORTS
  // ===================================================================
  console.log('\n[Suite 7: Admin-Only APK/ZIP, Ultra-Clean UI, Silent Background Engine & ICT Reports]')
  const {
    ICT_CHART_COLORS,
    run2000PossibilitySimulation,
    computeEngineProfitabilityReport,
    runAiTradingAnalysis,
  } = await import('../src/lib/aiServices')

  const homeSource = fs.readFileSync(path.join(process.cwd(), 'src/components/Home.tsx'), 'utf-8')
  const moreSource = fs.readFileSync(path.join(process.cwd(), 'src/components/More.tsx'), 'utf-8')
  const aiAgentUiSource = fs.readFileSync(path.join(process.cwd(), 'src/components/AiTradingAgent.tsx'), 'utf-8')

  // 7.0 Verify Admin-Only Access for APK & Source ZIP Downloads + Ultra-Clean UI
  assert(
    homeSource.includes('!isNativePlatform() && isUserAdmin(profile)') &&
      moreSource.includes('if (!isOwner) return;') &&
      serverSource.includes('if (/\\.(apk|zip)$/i.test(req.path))') &&
      !aiAgentUiSource.includes('Pure ICT · 2,000-Sim') &&
      !aiAgentUiSource.includes('Institutional Smart Money PD Arrays & Quantitative Engine') &&
      !aiAgentUiSource.includes('+OB · BISI · BSL') &&
      !aiAgentUiSource.includes('({aiPlan.grade})'),
    'Part 1 & Part 2: Admin-only APK/ZIP gating active and Ultra-Clean UI removes all engine badges, WAIT (C), and raw legend tags'
  )

  // 7.1 Verify Chart Board Dynamic Color Logic (#00C853 Green / #FF1744 Red)
  assert(
    ICT_CHART_COLORS.BULLISH_GREEN === '#00C853' &&
      ICT_CHART_COLORS.BEARISH_RED === '#FF1744' &&
      liveChartSource.includes("BULLISH_GREEN: '#00C853'") &&
      liveChartSource.includes("BEARISH_RED: '#FF1744'") &&
      liveChartSource.includes('FVG (BISI)') &&
      liveChartSource.includes('FVG (SIBI)') &&
      liveChartSource.includes('+OB') &&
      liveChartSource.includes('-OB'),
    'Chart Board assigns GREEN (#00C853) to +OB, BISI, Discount, Buy Entry & BSL/TP and RED (#FF1744) to -OB, SIBI, Premium, Sell Entry & SSL/SL'
  )

  // 7.2 Verify Text-Only Guardrail (Blocks Image/Photo/Video Generation Requests)
  const mediaAttempt = await runAiTradingAnalysis(
    'XAUUSD',
    'Gold / USD',
    '15m',
    [],
    null,
    [],
    [],
    10000,
    1.0,
    'Generate a photo or video of this gold chart'
  )
  assert(
    mediaAttempt.answerText.toLowerCase().includes('never generate') &&
      mediaAttempt.answerText.toLowerCase().includes('images, photos, or videos') &&
      !mediaAttempt.answerText.includes('2,000'),
    'Strictly blocks image, photo, and video generation requests without leaking internal simulation text'
  )

  // 7.3 Verify Strict ICT Methodology (Zero Retail Concepts — Rejects Support/Resistance/Trendlines)
  const retailAttempt = await runAiTradingAnalysis(
    'XAUUSD',
    'Gold / USD',
    '15m',
    [],
    null,
    [],
    [],
    10000,
    1.0,
    'Where are the support and resistance levels and trendlines?'
  )
  assert(
    retailAttempt.answerText.includes('Zero Retail Concepts') &&
      retailAttempt.answerText.includes('#00C853') &&
      retailAttempt.answerText.includes('#FF1744') &&
      !retailAttempt.answerText.includes('2,000'),
    'Rejects retail support/resistance/trendlines and maps strictly to ICT PD Arrays (+OB/-OB, BISI/SIBI, BSL/SSL) with silent background filtering'
  )

  // 7.4 Verify Silent 2,000-Possibility Historical Simulation & 65% Minimum Win Probability Gate
  const approvedSim = run2000PossibilitySimulation(
    [],
    {
      score: 78,
      bias: 'STRONG BUY',
      rangePos: 28,
      phase: {
        amd: 'MANIPULATION',
        sweep: { dir: 'bull', displacementAfter: true },
        cisd: true,
        displaced: true,
        adx: 31,
        atr: 4.5,
      },
      levels: {
        fvgZones: [{ dir: 'bull', top: 2752, bottom: 2749 }],
        obZones: [{ dir: 'bull', top: 2749, bottom: 2746 }],
      },
      plan: {
        valid: true,
        direction: 'LONG',
        model: 'ICT SILVER BULLET +OB',
        entry: 2750,
        stop: 2742,
        tp1: 2762,
        tp2: 2774,
        tp3: 2786,
        rr: 2.5,
      },
    } as any,
    'XAUUSD',
    '15m'
  )
  assert(
    approvedSim.totalPossibilities === 2000 &&
      approvedSim.minimumThresholdPct === 78 &&
      approvedSim.passesThreshold === true &&
      approvedSim.winProbabilityPct >= 78 &&
      approvedSim.entryColor === '#00C853' &&
      approvedSim.stopLossColor === '#FF1744' &&
      approvedSim.targetLiquidityColor === '#00C853',
    `Silent 2,000-scenario engine approves high-confluence ICT setup (${approvedSim.winProbabilityPct}% >= 78% gate)`
  )

  const lowProbSim = run2000PossibilitySimulation(
    [],
    {
      score: 10,
      bias: 'NEUTRAL',
      rangePos: 50,
      phase: { amd: 'ACCUMULATION', sweep: null, cisd: false, displaced: false, adx: 12, atr: 1.5 },
      levels: { fvgZones: [], obZones: [] },
      plan: { valid: false, direction: 'STAND ASIDE' },
    } as any,
    'XAUUSD',
    '15m'
  )
  assert(
    lowProbSim.passesThreshold === false && lowProbSim.verdict === 'FILTERED_LOW_PROBABILITY',
    `Silent 2,000-scenario engine filters out low-probability setup (${lowProbSim.winProbabilityPct}% < 78% gate)`
  )

  // 7.5 Verify Trading Engine Profitability Report (When Context Present vs When Missing)
  const missingReportReply = await runAiTradingAnalysis(
    'XAUUSD',
    'Gold / USD',
    '15m',
    [],
    null,
    [],
    [],
    10000,
    1.0,
    'Ye chart par trading engine kitna profitable hai?'
  )
  assert(
    missingReportReply.operatingMode === 'MODE_2_INTERACTIVE_CHAT' &&
      missingReportReply.requiresEngineReportFetch === true &&
      missingReportReply.answerText.includes('Trading Engine Report') &&
      !missingReportReply.answerText.includes('2,000'),
    'Triggers request to fetch Trading Engine Report when historical chart data is not attached without exposing internal 2,000-sim text'
  )

  const { recordExecutionMetadataSample, getLatestExecutionMetadata } = await import('../src/lib/market')
  recordExecutionMetadataSample('XAUUSD', '15m', 1.4, 34.0)
  const latestExecMeta = getLatestExecutionMetadata('XAUUSD', '15m')
  assert(
    latestExecMeta.executionTimeMs > 0 &&
      latestExecMeta.latencyMs > 0 &&
      latestExecMeta.executionEfficiencyPct >= 82 &&
      latestExecMeta.executionEfficiencyPct <= 99.9,
    `Chart Data Feed hidden metadata stream captures executionTimeMs (${latestExecMeta.avgExecutionTimeMs}ms), latencyMs (${latestExecMeta.avgLatencyMs}ms) & Execution Efficiency (${latestExecMeta.executionEfficiencyPct}%)`
  )

  const populatedReport = computeEngineProfitabilityReport(
    'XAUUSD',
    'Gold / USD',
    '15m',
    [],
    null,
    10000,
    1.0,
    {
      totalTrades: 18,
      winningTrades: 14,
      losingTrades: 4,
      winRatePct: 77.8,
      netPnlR: 26.8,
      profitFactor: 4.35,
      maxDrawdownR: 1.5,
    }
  )
  const reportChatReply = await runAiTradingAnalysis(
    'XAUUSD',
    'Gold / USD',
    '15m',
    [],
    null,
    [],
    [],
    10000,
    1.0,
    'Show me the Engine Profitability Report',
    [],
    populatedReport
  )
  assert(
    populatedReport.available === true &&
      populatedReport.winRatePct === 77.8 &&
      populatedReport.netProfitPct === 26.8 &&
      populatedReport.totalTrades === 18 &&
      populatedReport.executionEfficiencyPct >= 82 &&
      reportChatReply.answerText.includes('Execution Efficiency'),
    `Engine Profitability Report computes exact Win Rate (${populatedReport.winRatePct}%), Net Profit (+${populatedReport.netProfitPct}%), Profit Factor (${populatedReport.profitFactor}), Max Drawdown & Execution Efficiency (${populatedReport.executionEfficiencyPct}%)`
  )

  // 7.6 Verify Proactive Autonomous Trade Execution (Silent 2,000-Scenario Filter + Clean Output)
  const syntheticCandles = Array.from({ length: 40 }, (_, idx) => ({
    t: Date.now() - (40 - idx) * 900000,
    o: 2740 + idx * 0.3,
    h: 2742 + idx * 0.3,
    l: 2739 + idx * 0.3,
    c: 2741 + idx * 0.3,
    v: 1000,
  }))
  const mode1AutoPlan = await runAiTradingAnalysis(
    'XAUUSD',
    'Gold / USD',
    '15m',
    syntheticCandles,
    {
      score: 82,
      bias: 'STRONG BUY',
      rangePos: 26,
      phase: {
        amd: 'MANIPULATION',
        sweep: { dir: 'bull', displacementAfter: true },
        cisd: true,
        displaced: true,
        adx: 32,
        atr: 4.2,
      },
      levels: {
        fvgZones: [{ dir: 'bull', top: 2752, bottom: 2749 }],
        obZones: [{ dir: 'bull', top: 2749, bottom: 2746 }],
      },
      plan: {
        valid: true,
        direction: 'LONG',
        model: 'ICT SILVER BULLET +OB',
        entry: 2750,
        stop: 2742,
        tp1: 2762,
        tp2: 2774,
        tp3: 2786,
        rr: 2.5,
        confluences: ['Bullish Order Block (+OB)', 'Bullish FVG (BISI)', 'SSL Liquidity Sweep', 'MSS Displacement'],
      },
    } as any,
    [],
    [],
    10000,
    1.0
  )
  assert(
    mode1AutoPlan.operatingMode === 'MODE_1_AUTONOMOUS_ALERT' &&
      mode1AutoPlan.shouldBroadcastAutoTrade === true &&
      mode1AutoPlan.autonomousAlert?.filterStatus === 'BROADCAST_APPROVED' &&
      mode1AutoPlan.autonomousAlert?.chartBoardLevels.entry.color === '#00C853' &&
      mode1AutoPlan.autonomousAlert?.chartBoardLevels.stopLoss.color === '#FF1744' &&
      mode1AutoPlan.autonomousAlert?.chartBoardLevels.targetLiquidity.color === '#00C853' &&
      mode1AutoPlan.answerText.includes('Institutional ICT Trade Setup') &&
      !mode1AutoPlan.answerText.includes('2,000'),
    'Proactive Autonomous Trade Engine silently verifies 2,000 scenarios, assigns #00C853/#FF1744 colors, and outputs clean verified trade without internal simulation text'
  )

  // =========================================================================
  // SUITE 8: ICT APEX-PULSE ENGINE (2000X MATRIX) & ANDROID FOREGROUND SERVICE
  // =========================================================================
  console.log('\n--- SUITE 8: ICT APEX-PULSE ENGINE (2000X MATRIX) VERIFICATION ---')

  const { calculateApexLotSize, formatApexPulseNotification } = await import('../src/lib/aiServices')
  const { getActiveApexKillzoneWindow, APEX_KILLZONE_WINDOWS } = await import('../src/lib/clock')
  const { evaluateApexNewsWindow } = await import('../src/lib/newsService')
  const { BUILD, BUILD_CODE } = await import('../src/lib/version')

  // 8.1 Module 1: Dynamic Chart Zone Coloring & Advanced ICT Arrays (IFVG, Breaker, Unicorn, VI)
  assert(
    ICT_CHART_COLORS.APEX_BULLISH_EMERALD === '#00E676' &&
      ICT_CHART_COLORS.APEX_BULLISH_FILL === 'rgba(0, 230, 118, 0.25)' &&
      ICT_CHART_COLORS.APEX_BEARISH_CRIMSON === '#FF1744' &&
      ICT_CHART_COLORS.APEX_BEARISH_FILL === 'rgba(255, 23, 68, 0.25)' &&
      ICT_CHART_COLORS.APEX_LIQUIDITY_GOLD === '#FFD740' &&
      ICT_CHART_COLORS.APEX_UNICORN_PURPLE === '#D500F9' &&
      ICT_CHART_COLORS.APEX_UNICORN_FILL === 'rgba(213, 0, 249, 0.25)',
    'Module 1: Dynamic Chart Zone Coloring configured (#00E676 25%, #FF1744 25%, #FFD740 Gold Dashed, #D500F9 Unicorn Purple)'
  )

  const ictCandles = Array.from({ length: 100 }, (_, idx) => ({
    t: Date.now() - (100 - idx) * 900000,
    o: 2720 + Math.sin(idx * 0.25) * 8 + idx * 0.15,
    h: 2724 + Math.sin(idx * 0.25) * 8 + idx * 0.15,
    l: 2716 + Math.sin(idx * 0.25) * 8 + idx * 0.15,
    c: 2722 + Math.sin(idx * 0.25) * 8 + idx * 0.15,
    v: 1200 + idx * 10,
  }))
  const ictRes = analyse(ictCandles, '15m', undefined, undefined, undefined, 2)
  assert(
    Array.isArray(ictRes?.levels?.ifvgZones) &&
      Array.isArray(ictRes?.levels?.breakerZones) &&
      Array.isArray(ictRes?.levels?.unicornZones) &&
      Array.isArray(ictRes?.levels?.viZones) &&
      Array.isArray(ictRes?.levels?.sweptPools),
    'Module 1: ICT Engine computes IFVG, Breaker Blocks, Unicorn Model Overlaps, Volume Imbalances (VI), and Swept Liquidity Pools'
  )

  // 8.2 Module 2: Daily 2-3 Trades Cadence (3 Session Killzone Windows in EST)
  const londonEstDate = new Date('2026-05-12T03:15:00-04:00')
  const nyAmEstDate = new Date('2026-05-12T10:00:00-04:00')
  const nyPmEstDate = new Date('2026-05-12T14:00:00-04:00')
  const kzLondon = getActiveApexKillzoneWindow(londonEstDate)
  const kzNyAm = getActiveApexKillzoneWindow(nyAmEstDate)
  const kzNyPm = getActiveApexKillzoneWindow(nyPmEstDate)
  assert(
    APEX_KILLZONE_WINDOWS.length === 3 &&
      kzLondon.id === 'LONDON_OPEN_SB' &&
      kzLondon.isSilverBulletActive === true &&
      kzNyAm.id === 'NY_AM_SB' &&
      kzNyAm.isSilverBulletActive === true &&
      kzNyPm.id === 'NY_PM_MACRO_SB' &&
      kzNyPm.isSilverBulletActive === true,
    'Module 2: Session Killzone Scanner accurately identifies London Open (02:00-05:00 EST), NY AM (09:30-11:00 EST), and NY PM Macro (01:30-03:00 PM EST)'
  )

  // 8.3 Module 4: High-Voltage News Protection (-15m Pause & +5m Post-News Manipulation Hunter) & Risk Engine
  const fakeEventTime = Date.now()
  const mockCpiEvent = [
    {
      id: 'cpi-test',
      title: 'US Core CPI (YoY)',
      country: 'USD',
      impact: 'high' as const,
      time: fakeEventTime,
    },
  ]
  const preNewsCheck = evaluateApexNewsWindow(mockCpiEvent as any, fakeEventTime - 10 * 60 * 1000)
  const postNewsHunterCheck = evaluateApexNewsWindow(mockCpiEvent as any, fakeEventTime + 12 * 60 * 1000)
  assert(
    preNewsCheck.mode === 'PRE_NEWS_PAUSE' &&
      preNewsCheck.pausedExecution === true &&
      postNewsHunterCheck.mode === 'POST_NEWS_MANIPULATION_HUNTER' &&
      postNewsHunterCheck.postNewsHunterActive === true,
    'Module 4: Tier-1 Red Folder News Filter pauses execution 15m BEFORE release and activates Post-News Manipulation Hunter 5m AFTER release'
  )

  const lotCalc = calculateApexLotSize(10000, 1.5, 2750, 2742, 'XAUUSD')
  assert(
    lotCalc.cappedRiskPct <= 1.0 &&
      lotCalc.lotSize > 0 &&
      Math.abs(lotCalc.tp1 - 2766) < 0.01 &&
      Math.abs(lotCalc.tp2 - 2778) < 0.01 &&
      Math.abs(lotCalc.tp3 - 2790) < 0.01,
    `Module 4: Dynamic Risk Management caps risk at <= 1% (${lotCalc.cappedRiskPct}%) and computes exact TP1 (1:2 RR = ${lotCalc.tp1}), TP2 (1:3.5 RR = ${lotCalc.tp2}), TP3 (1:5 RR = ${lotCalc.tp3})`
  )

  // 8.4 Module 5: Unkillable Background Trade Notification Format & v2.8.9.19 Version Bump
  const formattedPush = formatApexPulseNotification(
    'XAUUSD',
    'LONG',
    2750.25,
    2742.1,
    2766.55,
    86,
    'SSL (PDL)',
    'Unicorn Overlap (+BB + BISI)',
    2
  )
  assert(
    formattedPush ===
      '⚡ [ICT APEX-PULSE] XAUUSD BUY | Entry: 2750.25 | SL: 2742.10 | TP1: 2766.55 | Confluence: 86% (Swept SSL (PDL) + Unicorn Overlap (+BB + BISI))' &&
      BUILD === '2.8.9.20' &&
      BUILD_CODE === 28921,
    `Module 5: Notification matches exact ICT APEX-PULSE format & app version bumped to v${BUILD} (code ${BUILD_CODE})`
  )

  // 8.5 Verify ICT APEX-PULSE Concept Toggle (ON/OFF in Active Concepts list)
  const { CONCEPTS, defaultSelection } = await import('../src/lib/concepts')
  const hasApexConcept = CONCEPTS.some((c) => c.key === 'apexPulse' && c.label.includes('ICT APEX-PULSE'))
  const defSel = defaultSelection()
  const ictResOff = analyse(
    ictCandles,
    '15m',
    [],
    { mode: 'BALANCED', keys: { ...defSel.keys, apexPulse: false } },
    undefined,
    2
  )
  assert(
    hasApexConcept &&
      defSel.keys.apexPulse === true &&
      'apexPulse' in (ictRes?.concepts || {}) &&
      ictResOff?.levels?.unicornZones?.length === 0 &&
      ictResOff?.levels?.ifvgZones?.length === 0,
    'ICT APEX-PULSE (2000X Matrix) is registered in Active Concepts and cleanly toggles ON/OFF'
  )

  // 8.6 Verify Dedicated Full-Screen Live Chart & Optimized Backtesting Viewport Controls
  const terminalSrc = fs.readFileSync('src/components/Terminal.tsx', 'utf8')
  const replaySrc = fs.readFileSync('src/components/ChartReplay.tsx', 'utf8')
  assert(
    terminalSrc.includes('liveChartFullScreen') &&
      terminalSrc.includes('id="live-chart-fullscreen-modal"') &&
      terminalSrc.includes('id="btn-exit-live-chart-fullscreen"') &&
      replaySrc.includes('id="btn-exit-fullscreen"') &&
      replaySrc.includes('id="btn-close-replay"'),
    'Live Trading Chart expands into dedicated Full-Screen Live Chart modal (not Backtesting) and both views pin Exit/Close controls inside viewport'
  )

  // 8.7 Verify AI Chat Container flex-1 Full-Screen Layout, Bottom-Pinned Input, and Message History Spacing
  const aiAgentSrc = fs.readFileSync('src/components/AiTradingAgent.tsx', 'utf8')
  assert(
    aiAgentSrc.includes('id="ai-chat-container"') &&
      aiAgentSrc.includes('id="ai-chat-messages"') &&
      aiAgentSrc.includes('flex-1 min-h-0 p-4 space-y-3 overflow-y-auto') &&
      aiAgentSrc.includes('id="ai-chat-input-form"') &&
      aiAgentSrc.includes('shrink-0 mt-auto'),
    'AI Chat container applies flex-1 layout filling viewport in full-screen, pins input form to bottom, and maintains space-y-3 message spacing'
  )

  console.log('\n================================================================')
  console.log(`FINAL VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('================================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
