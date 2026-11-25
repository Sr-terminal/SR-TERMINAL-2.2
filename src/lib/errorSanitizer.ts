/**
 * SR TERMINAL — GLOBAL COMMERCIAL ERROR SANITIZER
 *
 * Strictly prevents raw database payloads, JSON strings ({...}), Firestore paths (users/...),
 * userIds, authInfo, updateDoc(), field names, stack traces, or provider names (Brevo, Twelve Data, Firestore)
 * from ever being shown to end users.
 */

const FORBIDDEN_TECHNICAL_PATTERNS: RegExp[] = [
  /\{[\s\S]*\}/, // Any JSON object block
  /updateDoc\s*\(/i,
  /setDoc\s*\(/i,
  /addDoc\s*\(/i,
  /getDoc\s*\(/i,
  /unsupported field value/i,
  /subscriptionTier/i,
  /authInfo/i,
  /operationType/i,
  /providerInfo/i,
  /users\/[A-Za-z0-9_-]+/i,
  /funded_accounts\/[A-Za-z0-9_-]+/i,
  /password_resets\/[A-Za-z0-9_-]+/i,
  /userId/i,
  /firestore/i,
  /firebase/i,
  /brevo/i,
  /twelve\s*data/i,
  /xkeysib-/i,
  /permission-denied/i,
  /missing or insufficient permissions/i,
  /at\s+[A-Za-z0-9_$.]+\s*\(/i, // stack trace lines
  /https?:\/\/[^\s]+/i, // internal URLs in stack traces
  /error\s*code\s*[:=]/i,
  /grpc/i,
]

function extractFreezeTimerMmSs(raw: string): string {
  const match = raw.match(/\b(\d{2}:\d{2})\b/)
  if (match && match[1]) {
    return match[1]
  }
  const secMatch = raw.match(/(\d+)\s*seconds?/i)
  if (secMatch && secMatch[1]) {
    const total = Math.max(1, Number(secMatch[1]) || 300)
    const mins = String(Math.floor(total / 60)).padStart(2, '0')
    const secs = String(total % 60).padStart(2, '0')
    return `${mins}:${secs}`
  }
  return '05:00'
}

export function toUserFriendlyError(
  err: unknown,
  fallback = 'Something went wrong. Please try again in a moment.'
): string {
  if (!err) return fallback

  let rawMessage = ''
  let errCode = ''

  if (typeof err === 'string') {
    rawMessage = err.trim()
  } else if (typeof err === 'object' && err !== null) {
    const anyErr = err as Record<string, any>
    errCode = String(anyErr.code || '').toLowerCase()
    rawMessage = String(anyErr.message || anyErr.error || '').trim()
  }

  const combinedLower = `${errCode} ${rawMessage}`.toLowerCase()

  // 1. 3-Attempt 5-Minute Brute-Force Freeze
  if (
    combinedLower.includes('too many failed attempts') ||
    combinedLower.includes('login frozen') ||
    combinedLower.includes('account frozen') ||
    combinedLower.includes('auth/too-many-requests') ||
    (typeof err === 'object' && err !== null && (err as any).locked === true)
  ) {
    const mmss = extractFreezeTimerMmSs(rawMessage)
    return `Too many failed attempts. Please try again in ${mmss}.`
  }

  // 2. Expired or Already-Used Password Reset Link
  if (
    combinedLower.includes('expired or was already used') ||
    combinedLower.includes('reset link has expired') ||
    combinedLower.includes('invalid or expired reset')
  ) {
    return 'This reset link has expired or was already used. Please request a new one.'
  }

  // 3. Wrong Credentials / Invalid Email or Password
  if (
    combinedLower.includes('auth/wrong-password') ||
    combinedLower.includes('auth/invalid-credential') ||
    combinedLower.includes('auth/user-not-found') ||
    combinedLower.includes('auth/invalid-email') ||
    combinedLower.includes('invalid email or password') ||
    combinedLower.includes('incorrect password') ||
    combinedLower.includes('invalid password') ||
    combinedLower.includes('invalid credentials')
  ) {
    return 'Invalid email or password. Please check your details and try again.'
  }

  // 4. Email Already Registered
  if (combinedLower.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Please sign in with your password.'
  }

  // 5. Incorrect or Expired 6-Digit Verification Code (OTP)
  if (
    combinedLower.includes('incorrect verification code') ||
    combinedLower.includes('invalid verification code')
  ) {
    return 'Incorrect verification code. Please check your email and try again.'
  }
  if (
    combinedLower.includes('verification code has expired') ||
    combinedLower.includes('no active verification code')
  ) {
    return 'Verification code has expired. Please request a new code.'
  }

  // 6. Rate Limit / Cooldown Wait
  if (combinedLower.includes('please wait') && combinedLower.includes('before requesting')) {
    const waitMatch = rawMessage.match(/(\d+)\s*s/i)
    const secs = waitMatch ? waitMatch[1] : '60'
    return `Please wait ${secs} seconds before requesting a new code.`
  }
  if (combinedLower.includes('rate limit exceeded')) {
    return 'Too many requests. Please wait a moment and try again.'
  }

  // 7. Network / Offline / Timeout Errors
  if (
    combinedLower.includes('auth/network-request-failed') ||
    combinedLower.includes('failed to fetch') ||
    combinedLower.includes('networkerror') ||
    combinedLower.includes('network error') ||
    combinedLower.includes('client is offline') ||
    combinedLower.includes('unable to connect') ||
    combinedLower.includes('load failed') ||
    combinedLower.includes('timeout') ||
    combinedLower.includes('aborted')
  ) {
    return 'Unable to connect. Please check your internet and try again.'
  }

  // 8. Popup Closed by User
  if (
    combinedLower.includes('auth/popup-closed-by-user') ||
    combinedLower.includes('auth/cancelled-popup-request')
  ) {
    return 'Sign-in was cancelled. Please try again.'
  }

  // 9. Strict Technical Leak Filter: if the message contains ANY raw JSON, Firestore path,
  // provider name, field name, or stack trace, immediately replace with the safe commercial fallback.
  if (!rawMessage || rawMessage.length > 180) {
    return fallback
  }

  for (const pattern of FORBIDDEN_TECHNICAL_PATTERNS) {
    if (pattern.test(rawMessage)) {
      return fallback
    }
  }

  return rawMessage
}

/**
 * Recursively strips all `undefined` values from an object before any Firestore write
 * so `updateDoc()` and `setDoc()` can never fail with `Unsupported field value: undefined`.
 */
export function stripUndefinedDeep<T>(input: T): T {
  if (input === null || input === undefined || typeof input !== 'object') {
    return input
  }
  if (Array.isArray(input)) {
    return input
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T
  }
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(input as Record<string, any>)) {
    if (value !== undefined) {
      result[key] =
        value !== null && typeof value === 'object' && !(value instanceof Date)
          ? stripUndefinedDeep(value)
          : value
    }
  }
  return result as T
}
