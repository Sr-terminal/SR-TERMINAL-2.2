import React, { useState, useEffect } from 'react';
import {
  Activity,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { resetPasswordWithToken } from '../lib/authService';
import { toUserFriendlyError } from '../lib/errorSanitizer';

interface ResetPasswordScreenProps {
  onBackToLogin: () => void;
}

export function ResetPasswordScreen({ onBackToLogin }: ResetPasswordScreenProps) {
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let urlToken = searchParams.get('token') || searchParams.get('reset_token') || '';
    if (!urlToken && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1] || '';
      const hashParams = new URLSearchParams(hashQuery);
      urlToken = hashParams.get('token') || hashParams.get('reset_token') || '';
    }
    setToken(urlToken.trim());
    if (!urlToken.trim()) {
      setError('This reset link has expired or was already used. Please request a new one.');
    }
  }, []);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError('This reset link has expired or was already used. Please request a new one.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordWithToken(token, newPassword);
      setSuccessMessage(result.message || 'Your password has been updated. Redirecting to Sign In...');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onBackToLogin();
      }, 2200);
    } catch (err: any) {
      setError(
        toUserFriendlyError(
          err,
          'This reset link has expired or was already used. Please request a new one.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinLength = newPassword.length >= 8;
  const hasMatch = newPassword.length >= 8 && newPassword === confirmPassword;

  return (
    <div
      id="sr-terminal-reset-password"
      className="min-h-screen bg-[#02050A] text-white flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-emerald-500/30"
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
              SR TERMINAL
            </span>
            <span className="block text-[9px] text-emerald-400 font-mono tracking-widest uppercase">
              ACCOUNT SECURITY & PASSWORD RECOVERY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>1-HOUR SINGLE-USE LINK</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="w-full bg-[#090E17]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono uppercase tracking-wider mb-3">
              <KeyRound className="w-3 h-3" />
              Reset Terminal Password
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Set a New Password</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Create a strong new password for your SR Terminal account. For your protection, this reset link can only be used once.
            </p>
          </div>

          {error && (
            <div
              id="reset-password-error"
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs leading-relaxed break-words overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 break-words overflow-hidden">{error}</div>
            </div>
          )}

          {successMessage && (
            <div
              id="reset-password-success"
              className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs leading-relaxed break-words overflow-hidden"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 break-words overflow-hidden">
                <p className="font-bold text-emerald-200 mb-0.5">Password Reset Complete</p>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {!successMessage ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  New Password (Min 8 Characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reset-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    disabled={!token || isLoading}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#04070D] border border-white/10 focus:border-emerald-500/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    disabled={!token || isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-[#04070D] border border-white/10 focus:border-emerald-500/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasMinLength ? 'bg-emerald-400' : 'bg-gray-600'
                    }`}
                  />
                  <span className={hasMinLength ? 'text-emerald-300' : 'text-gray-400'}>
                    At least 8 characters long
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasMatch ? 'bg-emerald-400' : 'bg-gray-600'
                    }`}
                  />
                  <span className={hasMatch ? 'text-emerald-300' : 'text-gray-400'}>
                    Both password fields match
                  </span>
                </div>
              </div>

              <button
                id="btn-reset-password-submit"
                type="submit"
                disabled={isLoading || !token}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>UPDATING PASSWORD...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SAVE NEW PASSWORD</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>CONTINUE TO SIGN IN</span>
            </button>
          )}

          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <button
              id="btn-back-to-login"
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full border-t border-white/5 py-3 px-6 text-center text-[11px] text-gray-500 font-mono">
        SR TERMINAL • INSTITUTIONAL ALGORITHMIC TRADING WORKSTATION
      </footer>
    </div>
  );
}
