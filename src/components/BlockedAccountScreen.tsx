import { ShieldOff, Mail, LogOut, Terminal } from 'lucide-react'
import { signOutUser, type UserProfile } from '../lib/authService'
import { BUILD, BUILD_LABEL } from '../lib/version'

interface BlockedAccountScreenProps {
  userProfile: UserProfile
  onLoggedOut: () => void
}

export default function BlockedAccountScreen({ userProfile, onLoggedOut }: BlockedAccountScreenProps) {
  const handleSignOut = async () => {
    await signOutUser()
    onLoggedOut()
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#FFFFFF] flex flex-col justify-between p-4 select-none font-sans fadein">
      <header className="w-full max-w-md mx-auto pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-[#F23645]" />
          <span className="text-xs tracking-wider text-[#F23645] uppercase font-semibold">
            Security Compliance
          </span>
        </div>
        <span className="text-[11px] text-[#787B86] font-semibold tabular-nums">
          {BUILD_LABEL}
        </span>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="p-6 bg-[#131722] border border-[#1E222D] rounded-[12px] text-center relative">
          <div className="w-13 h-13 mx-auto mb-4 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] flex items-center justify-center text-[#F23645]">
            <ShieldOff size={24} />
          </div>

          <div className="text-[11px] font-semibold text-[#F23645] mb-1">
            Status: {userProfile.accountStatus.toUpperCase()}
          </div>

          <h1 className="text-lg font-bold tracking-tight text-[#FFFFFF] mb-2">
            Account Access Restricted
          </h1>

          <p className="text-xs text-[#787B86] leading-relaxed mb-5">
            Your SR Terminal account has been {userProfile.accountStatus} by the compliance administrator. Access to live algorithmic charts, models, and journal features is temporarily suspended.
          </p>

          <div className="p-3.5 rounded-[12px] bg-[#0B0E14] border border-[#1E222D] text-left text-xs space-y-1.5 mb-5 text-[#D1D4DC] tabular-nums">
            <div>
              <span className="text-[#787B86]">Trader:</span> {userProfile.name || 'Terminal Trader'}
            </div>
            <div>
              <span className="text-[#787B86]">UID:</span> <span className="text-[#787B86]">{userProfile.uid}</span>
            </div>
            {userProfile.email && (
              <div>
                <span className="text-[#787B86]">Email:</span> {userProfile.email}
              </div>
            )}
            {userProfile.phone && (
              <div>
                <span className="text-[#787B86]">Phone:</span> {userProfile.phone}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <a
              href="mailto:surajrayxyz09@gmail.com?subject=SR%20Terminal%20Account%20Review%20Request"
              className="w-full py-3 px-4 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E2E4E9] text-[#0B0E14] text-xs font-semibold smooth-ui active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail size={14} />
              <span>Contact Compliance Admin</span>
            </a>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-3 px-4 rounded-[12px] bg-[#0B0E14] hover:bg-[#181C27] border border-[#1E222D] text-[#F23645] text-xs font-semibold smooth-ui active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out & Return to Login</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-md mx-auto pb-4 text-center text-[11px] text-[#787B86] tabular-nums">
        SR Terminal Security Discipline · Build {BUILD}
      </footer>
    </div>
  )
}
