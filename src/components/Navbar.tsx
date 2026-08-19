import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Gauge, 
  Shield, 
  FileCode2, 
  User, 
  Terminal, 
  Volume2, 
  VolumeX, 
  Flame, 
  Radio, 
  Sliders, 
  Sparkles, 
  LogIn, 
  Crown,
  Sun,
  Moon
} from 'lucide-react';
import { ConnectionStatus } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useAuth } from '../firebase/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  theme: 'dark' | 'cyber-light';
  setTheme: (theme: 'dark' | 'cyber-light') => void;
  status: ConnectionStatus;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  killSwitchActive: boolean;
  onOpenQuickSettings: () => void;
  onOpenAuthModal: (tab?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  setTheme,
  status,
  soundEnabled,
  setSoundEnabled,
  killSwitchActive,
  onOpenQuickSettings,
  onOpenAuthModal,
}) => {
  const t = TRANSLATIONS[lang];
  const isConnected = status === 'connected';
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t.tabs.dashboard, icon: Radio },
    { id: 'vipPlans', label: t.tabs.vipPlans, icon: Crown, highlight: true },
    { id: 'benefits', label: t.tabs.benefits, icon: Sparkles },
    { id: 'servers', label: t.tabs.servers, icon: Globe },
    { id: 'worldMap', label: t.tabs.worldMap, icon: Sliders },
    { id: 'speedTest', label: t.tabs.speedTest, icon: Gauge },
    { id: 'security', label: t.tabs.security, icon: Shield },
    { id: 'configs', label: t.tabs.configs, icon: FileCode2 },
    { id: 'account', label: t.tabs.account, icon: User },
    { id: 'admin', label: t.tabs.admin, icon: ShieldAlert, adminOnly: true },
    { id: 'logs', label: t.tabs.logs, icon: Terminal },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'cyber-light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#030712]/90 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/50 transition-all duration-300 transform group-hover:scale-105 border border-cyan-300/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              {isConnected && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#030712]"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Soverixnet
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-md">
                  VPN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {lang === 'bn' ? 'কোয়ান্টাম সাইবার শিল্ড ও প্রাইভেসি' : 'Quantum Privacy & Cyber Shield'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            {navItems.slice(0, 7).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : item.highlight
                      ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* VIP Plans Button Pill */}
            <button
              onClick={() => setActiveTab('vipPlans')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-400/20 hover:from-amber-500/30 hover:to-yellow-400/30 border border-amber-500/40 text-amber-300 text-xs font-black transition-all cursor-pointer shadow-sm shadow-amber-500/10"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'VIP প্ল্যান' : 'VIP Plans'}</span>
            </button>

            {/* Admin Console Shortcut for Owner */}
            <button
              onClick={() => setActiveTab('admin')}
              title={lang === 'bn' ? 'এডমিন মনিটরিং কনসোল' : 'Admin Operations Center'}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-red-500/20 border-red-400 text-red-300 shadow-md shadow-red-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-300 hover:border-red-500/40'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-xs font-black text-red-400 hidden xl:inline">ADMIN</span>
            </button>

            {/* Global Theme Toggle: Dark <-> Cyber-Light */}
            <button
              onClick={toggleTheme}
              title={
                theme === 'dark' 
                  ? (lang === 'bn' ? 'হাই-কনট্রাস্ট সাইবার-লাইট মোডে স্যুইচ করুন' : 'Switch to Cyber-Light Mode')
                  : (lang === 'bn' ? 'সাইবার ডার্ক মোডে স্যুইচ করুন' : 'Switch to Dark Mode')
              }
              className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                theme === 'cyber-light'
                  ? 'bg-amber-400/20 border-amber-400 text-amber-600 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 border-slate-700/80 text-cyan-400 hover:border-cyan-400 shadow-sm'
              }`}
            >
              {theme === 'cyber-light' ? (
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Sounds' : 'Enable Cyber Sounds'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-900 border-slate-700 text-cyan-400'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Login / Profile Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('account')}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 hover:border-amber-400 transition-all cursor-pointer shadow-sm"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="User Avatar" 
                      className="w-5 h-5 rounded-full object-cover border border-amber-400" 
                    />
                  ) : (
                    <Flame className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="text-xs font-bold hidden sm:inline truncate max-w-[90px]">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'VIP'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'bn' ? 'লগইন' : 'Sign In'}</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation Horizontal Bar */}
        <div className="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : item.highlight
                    ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30'
                    : item.adminOnly
                    ? 'text-red-300 bg-red-950/30 border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : item.adminOnly ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
