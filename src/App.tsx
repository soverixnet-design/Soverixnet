import React, { useState, useEffect } from 'react';
import { 
  ConnectionStatus, 
  VPNServer, 
  VPNProtocol, 
  SecuritySettings 
} from './types';
import { SERVERS_DATA } from './data/servers';
import { TRANSLATIONS } from './data/translations';
import { Navbar } from './components/Navbar';
import { MainConnectView } from './components/MainConnectView';
import { BenefitsView } from './components/BenefitsView';
import { VipPlansView } from './components/VipPlansView';
import { ServerListModal } from './components/ServerListModal';
import { WorldMapVisualizer } from './components/WorldMapVisualizer';
import { SpeedTestView } from './components/SpeedTestView';
import { SecurityToolsView } from './components/SecurityToolsView';
import { ConfigGeneratorModal } from './components/ConfigGeneratorModal';
import { AccountView } from './components/AccountView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { LiveConsoleLogs } from './components/LiveConsoleLogs';
import { AuthModal } from './components/AuthModal';
import { soundEffects } from './services/soundEffects';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { 
  ShieldCheck, 
  Globe2, 
  X, 
  Sliders
} from 'lucide-react';

const THEME_STORAGE_KEY = 'soverix_app_theme';

function AppContent() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [theme, setTheme] = useState<'dark' | 'cyber-light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return (saved === 'cyber-light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState<VPNServer>(SERVERS_DATA[0]);
  const [activeProtocol, setActiveProtocol] = useState<VPNProtocol>('wireguard');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const { user, updateUserPreferences, saveConnectionSession } = useAuth();

  const [settings, setSettings] = useState<SecuritySettings>({
    killSwitch: true,
    cleanNetAdBlock: true,
    malwareShield: true,
    antiPhishing: true,
    preventDnsLeaks: true,
    preventWebRtcLeaks: true,
    splitTunnelingEnabled: true,
    autoConnectOnUntrustedWifi: true,
    stealthObfuscation: false,
    mtuSize: 1420,
    dnsProvider: 'soverix_secure',
    customDnsIp: '',
    quantumSafeKyber: true,
  });

  const t = TRANSLATIONS[lang];

  // Sync theme changes with localStorage and HTML root element
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
    if (theme === 'cyber-light') {
      document.documentElement.classList.add('cyber-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('cyber-light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const handleOpenAuthModal = (initialTab: 'signin' | 'signup' = 'signin') => {
    soundEffects.playClick();
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundEffects.setEnabled(enabled);
  };

  const handleToggleConnect = () => {
    soundEffects.playClick();

    if (status === 'connected') {
      if (sessionStartTime) {
        const durationSecs = Math.round((Date.now() - sessionStartTime) / 1000);
        const dlMB = +(durationSecs * 18.5).toFixed(1);
        const ulMB = +(durationSecs * 9.2).toFixed(1);
        saveConnectionSession(
          selectedServer.id,
          selectedServer.name,
          activeProtocol,
          durationSecs,
          dlMB,
          ulMB
        );
      }

      setStatus('disconnecting');
      soundEffects.playDisconnected();
      setSessionStartTime(null);

      setTimeout(() => {
        setStatus('disconnected');
      }, 600);
    } else if (status === 'disconnected') {
      setStatus('connecting');
      soundEffects.playConnecting();

      setTimeout(() => {
        setStatus('handshaking');
        setTimeout(() => {
          setStatus('connected');
          setSessionStartTime(Date.now());
          soundEffects.playConnected();
        }, 800);
      }, 700);
    }
  };

  const handleSelectServer = (server: VPNServer) => {
    soundEffects.playClick();
    setSelectedServer(server);
    if (status === 'connected') {
      setStatus('handshaking');
      soundEffects.playConnecting();
      setTimeout(() => {
        setStatus('connected');
        soundEffects.playConnected();
      }, 700);
    }
  };

  const handleSelectProtocol = (proto: VPNProtocol) => {
    soundEffects.playClick();
    setActiveProtocol(proto);
    if (user) {
      updateUserPreferences(settings, proto);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<SecuritySettings>) => {
    soundEffects.playShieldToggle();
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user) {
      updateUserPreferences(updated, activeProtocol);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'cyber-light' ? 'bg-[#f8fafc] text-slate-900 cyber-light' : 'bg-[#030712] text-slate-100 dark'} flex flex-col selection:bg-cyan-500 selection:text-black relative transition-colors duration-300`}>
      
      {/* Background Ambient Glow & Grid */}
      <div className="fixed inset-0 bg-cyber-grid opacity-25 pointer-events-none z-0" />
      <div className={`fixed top-0 left-1/4 w-96 h-96 ${theme === 'cyber-light' ? 'bg-cyan-500/10' : 'bg-cyan-600/10'} rounded-full blur-[140px] pointer-events-none z-0`} />
      <div className={`fixed bottom-0 right-1/4 w-96 h-96 ${theme === 'cyber-light' ? 'bg-indigo-400/10' : 'bg-indigo-600/10'} rounded-full blur-[140px] pointer-events-none z-0`} />

      {/* Main Top Navbar with Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        status={status}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleToggleSound}
        killSwitchActive={settings.killSwitch}
        onOpenQuickSettings={() => setIsQuickSettingsOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <MainConnectView
            status={status}
            onToggleConnect={handleToggleConnect}
            selectedServer={selectedServer}
            onOpenServerModal={() => setIsServerModalOpen(true)}
            activeProtocol={activeProtocol}
            onSelectProtocol={handleSelectProtocol}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            lang={lang}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* VIP Plans & Pricing Tab */}
        {activeTab === 'vipPlans' && (
          <VipPlansView
            lang={lang}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {/* Why Soverixnet / Benefits Tab */}
        {activeTab === 'benefits' && (
          <BenefitsView
            lang={lang}
            onConnectNow={() => {
              setActiveTab('dashboard');
              if (status === 'disconnected') {
                handleToggleConnect();
              }
            }}
          />
        )}

        {/* Server Nodes Tab */}
        {activeTab === 'servers' && (
          <ServerListModal
            selectedServer={selectedServer}
            onSelectServer={handleSelectServer}
            lang={lang}
          />
        )}

        {/* Interactive World Map Tab */}
        {activeTab === 'worldMap' && (
          <WorldMapVisualizer
            selectedServer={selectedServer}
            onSelectServer={handleSelectServer}
            status={status}
            lang={lang}
            onToggleConnect={handleToggleConnect}
          />
        )}

        {/* Speed Test & Diagnostics Tab */}
        {activeTab === 'speedTest' && (
          <SpeedTestView
            selectedServer={selectedServer}
            status={status}
            lang={lang}
          />
        )}

        {/* Security Shield & Split Tunneling Tab */}
        {activeTab === 'security' && (
          <SecurityToolsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            lang={lang}
          />
        )}

        {/* Config & Profile Exporter Tab */}
        {activeTab === 'configs' && (
          <ConfigGeneratorModal
            selectedServer={selectedServer}
            activeProtocol={activeProtocol}
            lang={lang}
          />
        )}

        {/* VIP Account Tab */}
        {activeTab === 'account' && (
          <AccountView 
            lang={lang} 
            onOpenAuthModal={handleOpenAuthModal} 
          />
        )}

        {/* Master Admin Console Tab */}
        {activeTab === 'admin' && (
          <AdminConsoleView lang={lang} />
        )}

        {/* Live Cyber Logs Tab */}
        {activeTab === 'logs' && (
          <LiveConsoleLogs
            status={status}
            activeProtocol={activeProtocol}
            selectedServer={selectedServer}
            lang={lang}
          />
        )}

      </main>

      {/* Auth Modal (Sign In / Sign Up / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        initialTab={authModalTab}
      />

      {/* Global Server Selector Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#050b18] border border-cyan-500/30 rounded-3xl p-6 overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'সার্ভার লোকেশন পরিবর্তন করুন' : 'Change Server Node Location'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'আপনার পছন্দের দ্রুততম সার্ভারটি সিলেক্ট করুন' : 'Select an ultra-fast sovereign node worldwide'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ServerListModal
              selectedServer={selectedServer}
              onSelectServer={(server) => {
                handleSelectServer(server);
                setIsServerModalOpen(false);
              }}
              lang={lang}
              onClose={() => setIsServerModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Quick Settings Drawer Modal */}
      {isQuickSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#050b18] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'দ্রুত নিরাপত্তা সেটিংস' : 'Quick Protection Controls'}
                </h4>
              </div>
              <button
                onClick={() => setIsQuickSettingsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{t.killSwitch}</h5>
                  <p className="text-[10px] text-slate-400">{t.killSwitchDesc}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.killSwitch} 
                  onChange={(e) => handleUpdateSettings({ killSwitch: e.target.checked })} 
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{t.cleanNet}</h5>
                  <p className="text-[10px] text-slate-400">{t.cleanNetDesc}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.cleanNetAdBlock} 
                  onChange={(e) => handleUpdateSettings({ cleanNetAdBlock: e.target.checked })} 
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{t.stealthMode}</h5>
                  <p className="text-[10px] text-slate-400">{t.stealthModeDesc}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.stealthObfuscation} 
                  onChange={(e) => handleUpdateSettings({ stealthObfuscation: e.target.checked })} 
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setIsQuickSettingsOpen(false);
                setActiveTab('security');
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all text-center block cursor-pointer"
            >
              {lang === 'bn' ? 'সকল অ্যাডভান্সড সিকিউরিটি টুলস দেখুন ➔' : 'View Full Security Suite ➔'}
            </button>
          </div>
        </div>
      )}

      {/* Cyber Sleek Footer with SEO Authority Keywords */}
      <footer className="w-full border-t border-slate-800/80 bg-[#02050c] py-8 px-4 sm:px-6 lg:px-8 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-500">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm">Soverixnet VPN (সোভারিক্সনেট)</span>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn' ? 'কোয়ান্টাম-রেজিস্ট্যান্ট ক্রিপ্টোগ্রাফিক শিল্ড ও আল্ট্রা-ফাস্ট গ্লোবাল নেটওয়ার্ক' : 'Quantum-Resistant Encrypted Network & Zero-Log Anonymity'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Zero-Logs RAM Verified
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-bold">{user?.email || 'soverixnet@gmail.com'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">v4.30-{theme.toUpperCase()}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 text-center text-[10px] text-slate-600 leading-relaxed max-w-4xl mx-auto">
            © 2026 <strong>Soverixnet VPN</strong>. All Rights Reserved. Official Portal for Soverixnet, Soverix net, WireGuard VPN, V2Ray VLESS Reality, Low Ping Gaming VPN Bangladesh, 4K Streaming Accelerator & Military-Grade Online Privacy Gateway.
          </div>

        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
