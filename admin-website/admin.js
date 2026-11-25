/**
 * SR TERMINAL — STANDALONE ADMIN CONTROL WEBSITE ENGINE (`admin-website/admin.js`)
 *
 * Strictly isolated from the consumer mobile app (`src/`).
 * Connected to Firebase Project: `gen-lang-client-0327010007`
 * Firestore Database ID: `ai-studio-srterminalprivat-41ef7494-5a58-4184-8c13-0b1ee9f8f190`
 * Authorized Administrator: `surajrayxyz09@gmail.com`
 */

const AUTHORIZED_ADMIN_EMAIL = 'surajrayxyz09@gmail.com'
const TOKEN_STORAGE_KEY = 'sr_standalone_admin_jwt_v3'

let adminToken = sessionStorage.getItem(TOKEN_STORAGE_KEY) || ''
let pendingAdminPassword = ''
let freezeInterval = null
let freezeUntilTs = 0

let firestoreDb = null
let firebaseAuth = null
let firestoreUsersMap = new Map()
let firestoreSecurityLogsMap = new Map()
let firestoreJournalsStats = { wins: 0, losses: 0, be: 0, netR: 0 }
let serverOverviewData = null
let activeTab = 'users-tab'

// DOM Elements
const authScreen = document.getElementById('auth-screen')
const dashboardScreen = document.getElementById('dashboard-screen')
const freezeBanner = document.getElementById('freeze-banner')
const freezeCountdownText = document.getElementById('freeze-countdown-text')
const authAlert = document.getElementById('auth-alert')
const step1Form = document.getElementById('login-step1-form')
const step2Form = document.getElementById('login-step2-form')
const emailInput = document.getElementById('admin-email')
const passwordInput = document.getElementById('admin-password')
const otpInput = document.getElementById('admin-otp')
const btnStep1 = document.getElementById('btn-step1-submit')
const btnStep2 = document.getElementById('btn-step2-verify')
const btnStep2Back = document.getElementById('btn-step2-back')
const dashboardToast = document.getElementById('dashboard-toast')

function getDeviceFingerprint() {
  const raw = [
    navigator.userAgent || '',
    navigator.language || '',
    screen?.width || 0,
    screen?.height || 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  ].join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i)
    hash |= 0
  }
  return `admin_fp_${Math.abs(hash).toString(16)}`
}

function showAuthAlert(msg, type = 'error') {
  if (!msg) {
    authAlert.classList.add('hidden')
    return
  }
  authAlert.textContent = msg
  authAlert.className = `alert-box mono ${type === 'success' ? 'alert-success' : 'alert-error'}`
  authAlert.classList.remove('hidden')
}

function showDashboardToast(msg, isError = false) {
  if (!dashboardToast) return
  dashboardToast.textContent = msg
  dashboardToast.className = `alert-box mono ${isError ? 'alert-error' : 'alert-success'}`
  dashboardToast.classList.remove('hidden')
  setTimeout(() => {
    dashboardToast.classList.add('hidden')
  }, 5000)
}

function formatTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

function startFreezeCountdown(lockedUntil) {
  freezeUntilTs = Number(lockedUntil) || 0
  if (freezeInterval) clearInterval(freezeInterval)

  const tick = () => {
    const remSec = Math.max(0, Math.ceil((freezeUntilTs - Date.now()) / 1000))
    if (remSec <= 0) {
      clearInterval(freezeInterval)
      freezeInterval = null
      freezeBanner.classList.add('hidden')
      emailInput.disabled = false
      passwordInput.disabled = false
      otpInput.disabled = false
      btnStep1.disabled = false
      btnStep2.disabled = false
      return
    }
    freezeBanner.classList.remove('hidden')
    freezeCountdownText.textContent = `Too many failed attempts. Login frozen for ${formatTimer(
      remSec
    )} to protect your account.`
    emailInput.disabled = true
    passwordInput.disabled = true
    otpInput.disabled = true
    btnStep1.disabled = true
    btnStep2.disabled = true
  }

  tick()
  freezeInterval = setInterval(tick, 1000)
}

async function checkInitialLockout() {
  try {
    const fp = getDeviceFingerprint()
    const res = await fetch('/api/auth/lockout-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Fingerprint': fp },
      body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL, deviceFingerprint: fp }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.locked && data.lockedUntil > Date.now()) {
        startFreezeCountdown(data.lockedUntil)
      }
    }
  } catch {}
}

// =====================================================================
// STEP 1: ADMIN PASSWORD + BREVO 6-DIGIT EMAIL OTP DISPATCH
// =====================================================================
step1Form.addEventListener('submit', async (e) => {
  e.preventDefault()
  showAuthAlert(null)

  const email = (emailInput.value || '').trim().toLowerCase()
  const password = passwordInput.value || ''
  const fp = getDeviceFingerprint()

  if (email !== AUTHORIZED_ADMIN_EMAIL) {
    showAuthAlert(`Access Denied: Only authorized Administrator (${AUTHORIZED_ADMIN_EMAIL}) is permitted.`)
    return
  }

  btnStep1.disabled = true
  btnStep1.textContent = 'VERIFYING & SENDING BREVO OTP...'

  try {
    const res = await fetch('/api/admin/auth/login-step1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp,
      },
      body: JSON.stringify({
        email,
        password,
        deviceFingerprint: fp,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      if (data.locked && data.lockedUntil) {
        startFreezeCountdown(data.lockedUntil)
      }
      showAuthAlert(data.error || 'Admin password verification failed.')
      return
    }

    pendingAdminPassword = password
    step1Form.classList.add('hidden')
    step2Form.classList.remove('hidden')
    showAuthAlert(data.message || 'Password verified. Enter the 6-digit Brevo OTP sent to your email.', 'success')
    otpInput.focus()
  } catch (err) {
    showAuthAlert(err?.message || 'Unable to connect to Admin Authentication server.')
  } finally {
    if (freezeUntilTs <= Date.now()) {
      btnStep1.disabled = false
    }
    btnStep1.textContent = 'VERIFY PASSWORD & SEND 6-DIGIT BREVO OTP'
  }
})

btnStep2Back.addEventListener('click', () => {
  step2Form.classList.add('hidden')
  step1Form.classList.remove('hidden')
  showAuthAlert(null)
})

// =====================================================================
// STEP 2: MANDATORY 6-DIGIT BREVO OTP VERIFICATION
// =====================================================================
step2Form.addEventListener('submit', async (e) => {
  e.preventDefault()
  showAuthAlert(null)

  const email = (emailInput.value || '').trim().toLowerCase()
  const code = (otpInput.value || '').trim()
  const fp = getDeviceFingerprint()

  if (!/^\d{6}$/.test(code)) {
    showAuthAlert('Please enter a valid 6-digit numeric OTP.')
    return
  }

  btnStep2.disabled = true
  btnStep2.textContent = 'VERIFYING 6-DIGIT OTP...'

  try {
    const res = await fetch('/api/admin/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp,
      },
      body: JSON.stringify({
        email,
        code,
        password: pendingAdminPassword,
        deviceFingerprint: fp,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      if (data.locked && data.lockedUntil) {
        startFreezeCountdown(data.lockedUntil)
      }
      showAuthAlert(data.error || 'Invalid 6-digit OTP.')
      return
    }

    adminToken = data.adminToken
    sessionStorage.setItem(TOKEN_STORAGE_KEY, adminToken)

    // Initialize direct Firestore real-time connection using admin credentials
    await initDirectFirebaseAdminConnection(email, pendingAdminPassword)
    pendingAdminPassword = ''

    enterDashboard()
  } catch (err) {
    showAuthAlert(err?.message || 'OTP verification failed.')
  } finally {
    if (freezeUntilTs <= Date.now()) {
      btnStep2.disabled = false
    }
    btnStep2.textContent = 'VERIFY OTP & UNLOCK CONSOLE'
  }
})

// =====================================================================
// DIRECT FIREBASE & FIRESTORE (`gen-lang-client-0327010007`) SYNC
// =====================================================================
async function initDirectFirebaseAdminConnection(email, password) {
  try {
    const cfgRes = await fetch('/api/admin/firebase-config', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (!cfgRes.ok) return
    const { config } = await cfgRes.json()
    if (!config?.projectId) return

    const [{ initializeApp }, { getAuth, signInWithEmailAndPassword }, { getFirestore, collection, onSnapshot }] =
      await Promise.all([
        import('https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js'),
      ])

    const app = initializeApp(config, 'sr-standalone-admin')
    firebaseAuth = getAuth(app)
    firestoreDb = getFirestore(app, config.firestoreDatabaseId)

    if (email && password) {
      await signInWithEmailAndPassword(firebaseAuth, email, password).catch(() => {})
    }

    // Real-time listener on Firestore `users`
    onSnapshot(
      collection(firestoreDb, 'users'),
      (snap) => {
        firestoreUsersMap.clear()
        snap.forEach((docSnap) => {
          const u = docSnap.data()
          firestoreUsersMap.set(docSnap.id, { ...u, uid: docSnap.id })
        })
        renderDashboard()
      },
      () => {}
    )

    // Real-time listener on Firestore `security_logs`
    onSnapshot(
      collection(firestoreDb, 'security_logs'),
      (snap) => {
        firestoreSecurityLogsMap.clear()
        snap.forEach((docSnap) => {
          firestoreSecurityLogsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() })
        })
        renderDashboard()
      },
      () => {}
    )
  } catch (err) {
    console.warn('[Admin-Website] Firestore direct stream notice:', err)
  }
}

async function fetchServerAdminOverview() {
  if (!adminToken) return
  try {
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (res.status === 401 || res.status === 403) {
      logoutAdmin()
      return
    }
    if (res.ok) {
      serverOverviewData = await res.json()
      const badge = document.getElementById('last-sync-badge')
      if (badge) {
        badge.textContent = `Synced: ${new Date().toLocaleTimeString('en-IN')}`
      }
      renderDashboard()
    }
  } catch {}
}

function getMergedUsers() {
  const byEmailOrUid = new Map()

  if (serverOverviewData?.users && Array.isArray(serverOverviewData.users)) {
    for (const u of serverOverviewData.users) {
      const key = (u.uid || u.email || '').toLowerCase()
      if (key) byEmailOrUid.set(key, { ...u })
    }
  }

  for (const [uid, u] of firestoreUsersMap.entries()) {
    const emailKey = (u.email || '').toLowerCase()
    if (emailKey && byEmailOrUid.has(emailKey)) {
      const prev = byEmailOrUid.get(emailKey)
      byEmailOrUid.delete(emailKey)
      byEmailOrUid.set(uid, { ...prev, ...u, uid })
    } else {
      byEmailOrUid.set(uid, { ...u, uid })
    }
  }

  return Array.from(byEmailOrUid.values()).sort((a, b) =>
    String(b.lastLoginAt || b.createdAt || '').localeCompare(String(a.lastLoginAt || a.createdAt || ''))
  )
}

function getMergedSecurityLogs() {
  const byId = new Map()
  if (serverOverviewData?.securityLogs && Array.isArray(serverOverviewData.securityLogs)) {
    for (const log of serverOverviewData.securityLogs) {
      byId.set(log.id || log.identifier, log)
    }
  }
  for (const [id, log] of firestoreSecurityLogsMap.entries()) {
    byId.set(id, log)
  }
  return Array.from(byId.values()).sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  )
}

function renderDashboard() {
  const users = getMergedUsers()
  const securityLogs = getMergedSecurityLogs()
  const now = Date.now()

  // Compute KPIs
  const totalUsers = users.length
  let onlineUsers = serverOverviewData?.onlineUsersCount || 0
  let proSubscribers = 0
  let cancelledAutoPay = 0
  let lockedOrFlagged = 0

  for (const u of users) {
    const lastLoginMs = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0
    if (lastLoginMs && now - lastLoginMs < 30 * 60 * 1000) {
      onlineUsers = Math.max(onlineUsers, 1)
    }

    const expMs = u.subscriptionExpiry ? new Date(u.subscriptionExpiry).getTime() : 0
    const isPro =
      (u.subscriptionStatus === 'PRO' ||
        u.subscriptionStatus === 'active' ||
        u.subscriptionStatus === 'trial' ||
        (u.subscriptionStatus === 'cancelled' && u.cancelAtPeriodEnd)) &&
      (!expMs || expMs > now)

    if (isPro) proSubscribers++
    if (u.cancelAtPeriodEnd || u.autoPayEnabled === false || u.subscriptionStatus === 'cancelled') {
      cancelledAutoPay++
    }
    if (
      u.accountStatus === 'blocked' ||
      u.accountStatus === 'suspended' ||
      (u.lockedUntil && Number(u.lockedUntil) > now)
    ) {
      lockedOrFlagged++
    }
  }

  for (const log of securityLogs) {
    if (log.lockedUntil && Number(log.lockedUntil) > now) {
      lockedOrFlagged++
    }
  }

  // Global Trade Stats from server engine + journals
  const tradeStats = serverOverviewData?.globalTradeStats || {
    totalTrades: 0,
    wins: 0,
    losses: 0,
    breakeven: 0,
    winRatePct: 0,
    netR: 0,
  }

  document.getElementById('kpi-total-users').textContent = String(totalUsers)
  document.getElementById('kpi-online-users').textContent = String(
    Math.max(onlineUsers, users.filter((u) => u.lastLoginAt && now - new Date(u.lastLoginAt).getTime() < 3600000).length)
  )
  document.getElementById('kpi-pro-users').textContent = String(proSubscribers)
  document.getElementById('kpi-cancelled-autopay').textContent = String(cancelledAutoPay)
  document.getElementById('kpi-locked-users').textContent = String(lockedOrFlagged)
  document.getElementById('kpi-win-rate').textContent = `${Number(tradeStats.winRatePct || 0).toFixed(1)}%`
  document.getElementById('kpi-win-loss-sub').textContent = `${tradeStats.wins || 0}W / ${
    tradeStats.losses || 0
  }L / ${tradeStats.breakeven || 0}BE · Net ${tradeStats.netR >= 0 ? '+' : ''}${Number(
    tradeStats.netR || 0
  ).toFixed(2)}R`

  renderUsersTable(users, now)
  renderSecurityTable(securityLogs, now)
  renderFcmStatus()
}

function renderUsersTable(users, now) {
  const tbody = document.getElementById('users-table-body')
  const searchQ = (document.getElementById('user-search-input')?.value || '').trim().toLowerCase()
  const filterVal = document.getElementById('user-filter-select')?.value || 'ALL'

  const filtered = users.filter((u) => {
    const matchText =
      !searchQ ||
      String(u.email || '').toLowerCase().includes(searchQ) ||
      String(u.name || '').toLowerCase().includes(searchQ) ||
      String(u.uid || '').toLowerCase().includes(searchQ)
    if (!matchText) return false

    const expMs = u.subscriptionExpiry ? new Date(u.subscriptionExpiry).getTime() : 0
    const isPro =
      (u.subscriptionStatus === 'PRO' ||
        u.subscriptionStatus === 'active' ||
        u.subscriptionStatus === 'trial' ||
        (u.subscriptionStatus === 'cancelled' && u.cancelAtPeriodEnd)) &&
      (!expMs || expMs > now)
    const isFrozen = Boolean(u.lockedUntil && Number(u.lockedUntil) > now)
    const isBlocked = u.accountStatus === 'blocked' || u.accountStatus === 'suspended'
    const isAutoPayCancelled = Boolean(
      u.cancelAtPeriodEnd || u.autoPayEnabled === false || u.subscriptionStatus === 'cancelled'
    )

    if (filterVal === 'PRO') return isPro
    if (filterVal === 'AUTOPAY_CANCELLED') return isAutoPayCancelled
    if (filterVal === 'FROZEN') return isFrozen
    if (filterVal === 'BLOCKED') return isBlocked
    if (filterVal === 'FREE') return !isPro && !isBlocked
    return true
  })

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="mono" style="text-align:center;padding:24px;color:var(--text-muted);">No matching user accounts found.</td></tr>`
    return
  }

  tbody.innerHTML = filtered
    .map((u) => {
      const uid = u.uid || u.email || 'unknown'
      const email = u.email || 'No Email'
      const name = u.name || 'SR Trader'
      const expMs = u.subscriptionExpiry ? new Date(u.subscriptionExpiry).getTime() : 0
      const isPro =
        (u.subscriptionStatus === 'PRO' ||
          u.subscriptionStatus === 'active' ||
          u.subscriptionStatus === 'trial' ||
          (u.subscriptionStatus === 'cancelled' && u.cancelAtPeriodEnd)) &&
        (!expMs || expMs > now)
      const isFrozen = Boolean(u.lockedUntil && Number(u.lockedUntil) > now)
      const isBlocked = u.accountStatus === 'blocked' || u.accountStatus === 'suspended'
      const isAutoPayCancelled = Boolean(u.cancelAtPeriodEnd || (isPro && u.autoPayEnabled === false))
      const daysRem = expMs && expMs > now ? Math.ceil((expMs - now) / 86400000) : 0
      const fcmCount = Array.isArray(u.fcmTokens) ? u.fcmTokens.length : 0

      const planPriceLabel =
        u.subscriptionPlan === 'sr_terminal_1y'
          ? 'Level 3 · ₹12,999 (365D)'
          : u.subscriptionPlan === 'sr_terminal_2m'
          ? 'Level 2 · ₹1,899 (60D)'
          : u.subscriptionPlan === 'sr_terminal_30d'
          ? 'Level 1 · ₹999 (30D)'
          : u.subscriptionPlan || 'PRO'

      const subBadge = isPro
        ? `<span class="badge badge-bull mono">${u.subscriptionStatus === 'trial' ? '24H TRIAL' : 'PRO ACTIVE'} (${
            planPriceLabel
          })</span>`
        : `<span class="badge badge-neutral mono">${(u.subscriptionStatus || 'FREE').toUpperCase()}</span>`

      const autoPayBadge = isAutoPayCancelled
        ? `<span class="badge badge-amber mono">AUTOPAY CANCELLED (ACTIVE TILL EXPIRY)</span>`
        : isPro
        ? `<span class="badge badge-bull mono">AUTOPAY ENABLED</span>`
        : `<span class="badge badge-neutral mono">N/A</span>`

      const securityBadge = isBlocked
        ? `<span class="badge badge-bear mono">⛔ BANNED / BLOCKED</span>`
        : isFrozen
        ? `<span class="badge badge-bear mono">❄️ FROZEN 5M (${Math.ceil(
            (Number(u.lockedUntil) - now) / 1000
          )}s)</span>`
        : `<span class="badge badge-bull mono">ACTIVE (${u.failedAttempts || 0}/3 fails)</span>`

      return `
        <tr>
          <td>
            <div style="font-weight:700;color:#FFFFFF;">${escapeHtml(name)}</div>
            <div class="mono" style="font-size:11px;color:var(--bull);">${escapeHtml(email)}</div>
            <div class="mono" style="font-size:10px;color:var(--text-muted);">UID: ${escapeHtml(uid)}</div>
          </td>
          <td>${subBadge}</td>
          <td>${autoPayBadge}</td>
          <td class="mono" style="font-size:11px;">
            ${
              u.subscriptionExpiry
                ? `<div>${new Date(u.subscriptionExpiry).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}</div><div style="color:var(--text-muted);">${daysRem}d remaining</div>`
                : '<span style="color:var(--text-muted);">No active validity</span>'
            }
          </td>
          <td>${securityBadge}</td>
          <td class="mono" style="font-size:11px;">
            <div>${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : 'Never'}</div>
            <div style="color:var(--bull);">FCM Tokens: ${fcmCount}</div>
          </td>
          <td>
            <div class="actions-cell">
              <button type="button" class="btn btn-bull btn-sm mono" data-action="grant_30d" data-uid="${escapeAttr(
                uid
              )}" data-email="${escapeAttr(email)}">
                +Grant 30D (₹999)
              </button>
              <button type="button" class="btn btn-bull btn-sm mono" data-action="grant_60d" data-uid="${escapeAttr(
                uid
              )}" data-email="${escapeAttr(email)}">
                +Grant 60D (₹1,899)
              </button>
              <button type="button" class="btn btn-bull btn-sm mono" data-action="grant_1y" data-uid="${escapeAttr(
                uid
              )}" data-email="${escapeAttr(email)}">
                +Grant 1Y (₹12,999)
              </button>
              <button type="button" class="btn btn-amber btn-sm mono" data-action="revoke_pro" data-uid="${escapeAttr(
                uid
              )}" data-email="${escapeAttr(email)}">
                Revoke Pro
              </button>
              <button type="button" class="btn btn-secondary btn-sm mono" data-action="unlock_freeze" data-uid="${escapeAttr(
                uid
              )}" data-email="${escapeAttr(email)}">
                🔓 Unlock 5m Freeze
              </button>
              ${
                isBlocked
                  ? `<button type="button" class="btn btn-bull btn-sm mono" data-action="unban_user" data-uid="${escapeAttr(
                      uid
                    )}" data-email="${escapeAttr(email)}">Unban User</button>`
                  : `<button type="button" class="btn btn-bear btn-sm mono" data-action="ban_user" data-uid="${escapeAttr(
                      uid
                    )}" data-email="${escapeAttr(email)}">Ban User</button>`
              }
              <button type="button" class="btn btn-bear btn-sm mono" data-action="remove_user" data-uid="${escapeAttr(
                uid
              )}" data-email="${escapeAttr(email)}">
                Remove
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
}

function renderSecurityTable(logs, now) {
  const tbody = document.getElementById('security-table-body')
  if (!logs || logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="mono" style="text-align:center;padding:24px;color:var(--text-muted);">No failed login or 5-minute freeze incidents recorded.</td></tr>`
    return
  }

  tbody.innerHTML = logs
    .map((log) => {
      const id = log.identifier || log.email || log.id || 'unknown'
      const isFrozen = Boolean(log.lockedUntil && Number(log.lockedUntil) > now)
      const remSec = isFrozen ? Math.ceil((Number(log.lockedUntil) - now) / 1000) : 0

      return `
        <tr>
          <td class="mono" style="font-weight:700;">${escapeHtml(log.email || id)}</td>
          <td class="mono" style="font-size:11px;color:var(--text-muted);">${escapeHtml(
            log.deviceFingerprint || log.ip || 'N/A'
          )}</td>
          <td>
            <span class="badge ${
              log.eventType === 'ACCOUNT_FROZEN_5M'
                ? 'badge-bear'
                : log.eventType === 'AUTH_SUCCESS' || log.eventType === 'LOCKOUT_RESET'
                ? 'badge-bull'
                : 'badge-amber'
            } mono">
              ${escapeHtml(log.eventType || 'SECURITY_EVENT')}
            </span>
          </td>
          <td class="mono">${Number(log.failedAttempts || 0)} / 3</td>
          <td class="mono">
            ${
              isFrozen
                ? `<span class="badge badge-bear mono">❄️ FROZEN (${formatTimer(remSec)})</span>`
                : `<span class="badge badge-bull mono">UNLOCKED</span>`
            }
          </td>
          <td class="mono" style="font-size:11px;">
            <div>${escapeHtml(log.reason || 'Security check')}</div>
            <div style="color:var(--text-muted);">${
              log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : ''
            }</div>
          </td>
          <td>
            <button type="button" class="btn btn-bull btn-sm mono" data-unlock-id="${escapeAttr(
              log.email || id
            )}">
              🔓 Unlock Now
            </button>
          </td>
        </tr>
      `
    })
    .join('')
}

function renderFcmStatus() {
  const box = document.getElementById('fcm-status-box')
  if (!box) return
  const fcmInfo = serverOverviewData?.fcmStatus || {
    registeredTokensCount: 0,
    channelId: 'sr-trade-alerts-v2',
    importance: '5 (IMPORTANCE_HIGH)',
    engineRunning: true,
    activeTradesCount: 0,
    totalSignalsDispatched: 0,
  }
  box.innerHTML = `
    <div>• <strong>Firebase Admin SDK:</strong> Connected (gen-lang-client-0327010007)</div>
    <div>• <strong>Android Notification Channel:</strong> ${escapeHtml(fcmInfo.channelId)} (Importance: ${escapeHtml(
    fcmInfo.importance
  )})</div>
    <div>• <strong>Registered Device FCM Tokens:</strong> <span style="color:var(--bull);font-weight:700;">${
      fcmInfo.registeredTokensCount
    } devices</span></div>
    <div>• <strong>24/7 Background Market Watcher:</strong> <span style="color:var(--bull);font-weight:700;">${
      fcmInfo.engineRunning ? 'RUNNING 24/7 (15s Cycle)' : 'STANDBY'
    }</span></div>
    <div>• <strong>Monitored Active Institutional Setups:</strong> ${fcmInfo.activeTradesCount}</div>
    <div>• <strong>Total Lifecycle Push Alerts Dispatched:</strong> ${fcmInfo.totalSignalsDispatched}</div>
  `
}

// =====================================================================
// ONE-CLICK ADMIN USER MANAGEMENT ACTIONS (Firestore + Backend Server)
// =====================================================================
document.getElementById('users-table-body').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]')
  if (!btn) return

  const action = btn.getAttribute('data-action')
  const uid = btn.getAttribute('data-uid')
  const email = btn.getAttribute('data-email')

  btn.disabled = true
  try {
    // 1. Apply on Backend Server
    const res = await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ action, uid, email }),
    })
    const data = await res.json().catch(() => ({}))

    // 2. Also mutate Firestore `users/{uid}` directly if Firestore SDK is connected
    if (firestoreDb && uid) {
      try {
        const { doc, setDoc, deleteDoc } = await import(
          'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js'
        )
        const nowIso = new Date().toISOString()
        const userRef = doc(firestoreDb, 'users', uid)

        if (action === 'grant_30d' || action === 'grant_60d' || action === 'grant_1y') {
          const days = action === 'grant_1y' ? 365 : action === 'grant_60d' ? 60 : 30
          const planId =
            action === 'grant_1y'
              ? 'sr_terminal_1y'
              : action === 'grant_60d'
              ? 'sr_terminal_2m'
              : 'sr_terminal_30d'
          const tier =
            action === 'grant_1y'
              ? 'LEVEL_3_FUNDED_ELITE'
              : action === 'grant_60d'
              ? 'LEVEL_2_ADVANCED'
              : 'LEVEL_1_STARTER'
          const expIso = new Date(Date.now() + days * 86400000).toISOString()
          await setDoc(
            userRef,
            {
              uid,
              subscriptionStatus: 'PRO',
              subscriptionPlan: planId,
              subscriptionTier: tier,
              subscriptionStart: nowIso,
              subscriptionExpiry: expIso,
              autoPayEnabled: true,
              cancelAtPeriodEnd: false,
              isTrial: false,
              updatedAt: nowIso,
            },
            { merge: true }
          )
        } else if (action === 'revoke_pro') {
          await setDoc(
            userRef,
            {
              uid,
              subscriptionStatus: 'none',
              subscriptionPlan: 'none',
              subscriptionExpiry: null,
              autoPayEnabled: false,
              cancelAtPeriodEnd: false,
              isTrial: false,
              updatedAt: nowIso,
            },
            { merge: true }
          )
        } else if (action === 'unlock_freeze') {
          await setDoc(
            userRef,
            {
              uid,
              failedAttempts: 0,
              lockedUntil: 0,
              accountStatus: 'active',
              updatedAt: nowIso,
            },
            { merge: true }
          )
          if (email) {
            const logId = `acct_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
            await setDoc(
              doc(firestoreDb, 'security_logs', logId),
              {
                identifier: email.toLowerCase(),
                email: email.toLowerCase(),
                eventType: 'LOCKOUT_RESET',
                failedAttempts: 0,
                lockedUntil: 0,
                reason: 'Unlocked by Administrator from Admin Website',
                createdAt: nowIso,
              },
              { merge: true }
            )
          }
        } else if (action === 'ban_user' || action === 'unban_user') {
          await setDoc(
            userRef,
            {
              uid,
              accountStatus: action === 'ban_user' ? 'blocked' : 'active',
              updatedAt: nowIso,
            },
            { merge: true }
          )
        } else if (action === 'remove_user') {
          await deleteDoc(userRef)
        }
      } catch (fsErr) {
        console.warn('[Admin-Website] Firestore direct write notice:', fsErr)
      }
    }

    showDashboardToast(data.message || `Action ${action} executed for ${email || uid}.`)
    await fetchServerAdminOverview()
  } catch (err) {
    showDashboardToast(err?.message || 'Admin action failed.', true)
  } finally {
    btn.disabled = false
  }
})

// Unlock from Security Logs Table
document.getElementById('security-table-body').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-unlock-id]')
  if (!btn) return
  const identifier = btn.getAttribute('data-unlock-id')
  await unlockFrozenAccountOrIp(identifier)
})

document.getElementById('btn-manual-unlock').addEventListener('click', async () => {
  const input = document.getElementById('unlock-identifier-input')
  const val = (input?.value || '').trim()
  if (!val) return
  await unlockFrozenAccountOrIp(val)
  input.value = ''
})

async function unlockFrozenAccountOrIp(identifier) {
  try {
    const res = await fetch('/api/admin/unlock-freeze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ identifier }),
    })
    const data = await res.json().catch(() => ({}))

    if (firestoreDb && identifier) {
      try {
        const { doc, setDoc } = await import(
          'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js'
        )
        const cleanId = identifier.toLowerCase().replace(/[^a-z0-9]/g, '_')
        await setDoc(
          doc(firestoreDb, 'security_logs', `acct_${cleanId}`),
          {
            identifier: identifier.toLowerCase(),
            email: identifier.toLowerCase(),
            eventType: 'LOCKOUT_RESET',
            failedAttempts: 0,
            lockedUntil: 0,
            reason: 'Unlocked by Administrator',
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        )
      } catch {}
    }

    showDashboardToast(data.message || `Unlocked 5-minute freeze for ${identifier}.`)
    await fetchServerAdminOverview()
  } catch (err) {
    showDashboardToast(err?.message || 'Failed to unlock account/IP.', true)
  }
}

// 24/7 Closed-App FCM Lifecycle Push Buttons
document.querySelectorAll('.fcm-trigger-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const eventType = btn.getAttribute('data-lifecycle')
    btn.disabled = true
    try {
      const res = await fetch('/api/fcm/test-lifecycle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ eventType }),
      })
      const data = await res.json().catch(() => ({}))
      showDashboardToast(
        data.message || `Dispatched 24/7 Closed-App FCM Push (${eventType}) to all registered devices!`
      )
      await fetchServerAdminOverview()
    } catch (err) {
      showDashboardToast('Failed to dispatch FCM push notification.', true)
    } finally {
      btn.disabled = false
    }
  })
})

// Search & Filter Listeners
document.getElementById('user-search-input').addEventListener('input', () => renderDashboard())
document.getElementById('user-filter-select').addEventListener('change', () => renderDashboard())

// Tab Switcher
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    activeTab = btn.getAttribute('data-tab')
    ;['users-tab', 'security-tab', 'fcm-tab'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        if (id === activeTab) el.classList.remove('hidden')
        else el.classList.add('hidden')
      }
    })
  })
})

document.getElementById('btn-refresh-all').addEventListener('click', () => {
  void fetchServerAdminOverview()
})

document.getElementById('btn-admin-logout').addEventListener('click', () => {
  logoutAdmin()
})

function logoutAdmin() {
  adminToken = ''
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  dashboardScreen.classList.add('hidden')
  authScreen.classList.remove('hidden')
  step2Form.classList.add('hidden')
  step1Form.classList.remove('hidden')
  passwordInput.value = ''
  otpInput.value = ''
}

function enterDashboard() {
  authScreen.classList.add('hidden')
  dashboardScreen.classList.remove('hidden')
  void fetchServerAdminOverview()
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;')
}

// Startup Check
void checkInitialLockout()
if (adminToken) {
  void initDirectFirebaseAdminConnection('', '')
  enterDashboard()
}

setInterval(() => {
  if (adminToken) {
    void fetchServerAdminOverview()
  }
}, 10000)
