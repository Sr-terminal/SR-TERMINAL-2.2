import { Component, ReactNode, ErrorInfo, useState, useEffect } from 'react'
import NativeAppShell from './components/NativeAppShell'
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen'
import AuthScreen from './components/AuthScreen'
import BlockedAccountScreen from './components/BlockedAccountScreen'
import { ResetPasswordScreen } from './components/ResetPasswordScreen'
import { subscribeUserProfile, subscribeToUserDoc, getCachedUserProfile, signOutUser, type UserProfile } from './lib/authService'
import { toUserFriendlyError } from './lib/errorSanitizer'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  constructor(props: ErrorBoundaryProps) {
    super(props)
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('SR Terminal Recovery Notice:', error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0B0E14] text-[#FFFFFF] p-4 text-center">
          <div className="card p-6 max-w-sm w-full flex flex-col items-center overflow-hidden">
            <div className="w-11 h-11 rounded-[12px] bg-[#181C27] border border-[#1E222D] flex items-center justify-center mb-3 text-[#F23645] font-bold">
              !
            </div>
            <h1 className="text-base font-bold mb-1.5 tracking-tight text-[#FFFFFF]">SR Terminal Recovery</h1>
            <p className="text-xs text-[#787B86] mb-4 leading-relaxed break-words overflow-hidden max-w-full">
              {toUserFriendlyError(this.state.error, 'Something went wrong. Please try again in a moment.')}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-[12px] bg-[#FFFFFF] hover:bg-neutral-200 text-[#0B0E14] font-semibold text-xs cursor-pointer active:scale-98"
            >
              Restart Terminal
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getCachedUserProfile())
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(() => {
    if (typeof window === 'undefined') return false
    const path = window.location.pathname
    const hash = window.location.hash
    const search = new URLSearchParams(window.location.search)
    return (
      path.startsWith('/reset-password') ||
      hash.startsWith('#/reset-password') ||
      Boolean(search.get('reset_token'))
    )
  })

  // Handle immediate logout parameter (e.g. /?logout=true or #logout)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogoutRequested =
        window.location.search.includes('logout') ||
        window.location.hash.includes('logout')

      if (isLogoutRequested) {
        void signOutUser()
        setUserProfile(null)
        try {
          const cleanUrl = window.location.pathname
          window.history.replaceState(null, '', cleanUrl)
        } catch {}
      }
    }
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeUserProfile((profile) => {
      setUserProfile(profile)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOutUser()
    setUserProfile(null)
  }

  // MANDATORY FIRESTORE REAL-TIME LISTENER FOR LOGGED-IN USER
  useEffect(() => {
    if (!userProfile?.uid) return
    const activeUid = userProfile.uid
    const unsubscribeDoc = subscribeToUserDoc(activeUid, (updatedProfile) => {
      if (!updatedProfile) {
        setUserProfile(null)
      } else {
        setUserProfile(updatedProfile)
      }
    })
    return () => {
      unsubscribeDoc()
    }
  }, [userProfile?.uid])

  // Dedicated 1-Hour Single-Use Reset Password Page (/reset-password?token=...)
  if (showResetPassword) {
    return (
      <ResetPasswordScreen
        onBackToLogin={() => {
          setShowResetPassword(false)
          if (typeof window !== 'undefined') {
            try {
              window.history.replaceState(null, '', '/')
            } catch {}
            if (window.location.hash.startsWith('#/reset-password')) {
              window.location.hash = ''
            }
          }
        }}
      />
    )
  }

  const isPrivacyPage =
    showPrivacy ||
    (typeof window !== 'undefined' &&
      (window.location.hash.startsWith('#/privacy') || window.location.pathname.startsWith('/privacy')))

  if (isPrivacyPage) {
    return (
      <div className="min-h-screen bg-[#0B0E14]">
        <PrivacyPolicyScreen
          onBack={() => {
            setShowPrivacy(false)
            if (typeof window !== 'undefined') {
              if (window.location.hash.startsWith('#/privacy')) {
                window.location.hash = ''
              }
              if (window.location.pathname.startsWith('/privacy')) {
                try {
                  window.history.replaceState(null, '', '/')
                } catch {}
              }
            }
          }}
        />
      </div>
    )
  }

  // 1. Not Authenticated: Mandatory Login / Sign Up Screen
  if (!userProfile) {
    return (
      <AuthScreen
        onSuccess={(profile) => setUserProfile(profile)}
        onOpenPrivacyPolicy={() => setShowPrivacy(true)}
      />
    )
  }

  // 3. Account Status Check: Blocked or Suspended
  if (userProfile.accountStatus === 'blocked' || userProfile.accountStatus === 'suspended') {
    return (
      <BlockedAccountScreen
        userProfile={userProfile}
        onLoggedOut={() => setUserProfile(null)}
      />
    )
  }

  // 4. Authenticated & Active: Main SR TERMINAL App
  return (
    <ErrorBoundary>
      <NativeAppShell
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />
    </ErrorBoundary>
  )
}
