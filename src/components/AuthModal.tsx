import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone,
  Eye, 
  EyeOff, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'bn';
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialTab = 'signin',
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('soverixnet@gmail.com');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signInDemoVip } = useAuth();

  if (!isOpen) return null;

  const getTranslatedError = (error: any): string => {
    const code = error?.code || '';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return lang === 'bn' 
        ? 'ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন। অনুগ্রহ করে আবার চেষ্টা করুন।' 
        : 'Invalid email or password. Please try again.';
    }
    if (code === 'auth/email-already-in-use') {
      return lang === 'bn' 
        ? 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। সরাসরি সাইন ইন করুন।' 
        : 'This email is already registered. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return lang === 'bn' 
        ? 'পাসওয়ার্ড অত্যন্ত দুর্বল। কমপক্ষে ৬টি অক্ষর বা সংখ্যা দিন।' 
        : 'Password is too weak. Must be at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return lang === 'bn' 
        ? 'অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস প্রবেশ করান।' 
        : 'Please enter a valid email address.';
    }
    if (code === 'auth/network-request-failed' || code === 'auth/popup-blocked') {
      return lang === 'bn'
        ? 'ব্রাউজার পপআপ বা নেটওয়ার্ক সংযোগ বিঘ্নিত হয়েছে। "ইনস্ট্যান্ট VIP লগইন" ব্যবহার করুন।'
        : 'Browser popup or network was restricted. Use Instant VIP Access below.';
    }
    return error?.message || (lang === 'bn' ? 'অথেনটিকেশনে ত্রুটি হয়েছে।' : 'Authentication failed.');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg(lang === 'bn' ? 'সবগুলো ঘর পূরণ করুন।' : 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      onClose();
    } catch (err: any) {
      setErrorMsg(getTranslatedError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg(lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড প্রদান করুন।' : 'Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(name.trim(), email.trim(), password, phone.trim());
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
      onClose();
    } catch (err: any) {
      setErrorMsg(getTranslatedError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      onClose();
    } catch (err: any) {
      setErrorMsg(getTranslatedError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVipAuth = async () => {
    setLoading(true);
    try {
      await signInDemoVip();
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      onClose();
    } catch (err: any) {
      setErrorMsg(getTranslatedError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg(lang === 'bn' ? 'আপনার অ্যাকাউন্টের ইমেইল দিন।' : 'Please enter your account email.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccessMsg(
        lang === 'bn'
          ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স চেক করুন।'
          : 'Password reset link sent to your email. Check your inbox.'
      );
    } catch (err: any) {
      setErrorMsg(getTranslatedError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0a1226] via-[#050b18] to-[#02050e] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        
        {/* Cyber glow orb */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center relative z-10 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30 border border-cyan-300/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-wide">
            Soverixnet VIP Portal
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {lang === 'bn' 
              ? 'কোয়ান্টাম এনক্রিপশন ও অটো গুগল শিট সিঙ্ক' 
              : 'Quantum-Encrypted Access & Auto Cloud Sync'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5 relative z-10">
            <button
              onClick={() => {
                setTab('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'signin'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সাইন ইন / লগইন' : 'Sign In'}</span>
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সাইন আপ / নতুন একাউন্ট' : 'Sign Up'}</span>
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Area */}
        <div className="relative z-10">
          
          {/* Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. soverixnet@gmail.com"
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সাইন ইন করুন' : 'Sign In with Soverix ID'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Soverix Master"
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-2.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Mobile Phone'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01700-112233"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-2.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Pass'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat pass"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {lang === 'bn' 
                    ? 'অ্যাকাউন্ট খোলার সাথে সাথে আপনার ইমেইল ও তথ্য স্বয়ংক্রিয়ভাবে ডাটাবেসে সিঙ্ক হবে।' 
                    : 'Your account and email are automatically secured and synced with cloud roster.'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'নতুন একাউন্ট তৈরি করুন' : 'Create Soverix Account'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <p className="text-xs text-slate-400">
                {lang === 'bn' 
                  ? 'আপনার অ্যাকাউন্টের ইমেইল প্রবেশ করান। আমরা একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়ে দেব।' 
                  : 'Enter your registered email address to receive a secure password reset link.'}
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. soverixnet@gmail.com"
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {lang === 'bn' ? 'ফিরে যান' : 'Back to Login'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : (lang === 'bn' ? 'লিংক পাঠান' : 'Send Link')}
                </button>
              </div>
            </form>
          )}

          {/* Social Auth & Quick VIP Options */}
          {tab !== 'forgot' && (
            <>
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#070e1e] px-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider absolute">
                  {lang === 'bn' ? 'অথবা' : 'OR'}
                </span>
              </div>

              <div className="space-y-2">
                {/* One-Click Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm hover:border-slate-500"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  <span>
                    {tab === 'signup' 
                      ? (lang === 'bn' ? 'গুগল দিয়ে দ্রুত সাইন আপ' : 'Sign Up with Google') 
                      : (lang === 'bn' ? 'গুগল দিয়ে এক-ক্লিকে সাইন ইন' : 'Continue with Google')}
                  </span>
                </button>

                {/* Instant VIP Access for restricted browsers/iframe */}
                <button
                  type="button"
                  onClick={handleQuickVipAuth}
                  disabled={loading}
                  className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {lang === 'bn' ? '১-ক্লিকে সরাসরি VIP মোড চালু করুন (soverixnet@gmail.com)' : 'Instant VIP Access (soverixnet@gmail.com)'}
                  </span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
