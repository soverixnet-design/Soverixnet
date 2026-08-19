import React, { useEffect, useState } from 'react';
import { 
  Power, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Globe2, 
  Zap, 
  Lock, 
  Activity, 
  Sparkles, 
  RefreshCw,
  EyeOff,
  ChevronRight,
  Cpu,
  TrendingUp,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { ConnectionStatus, VPNServer, VPNProtocol, SecuritySettings, LiveTrafficData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PROTOCOL_INFO } from '../data/servers';
import confetti from 'canvas-confetti';

interface MainConnectViewProps {
  status: ConnectionStatus;
  onToggleConnect: () => void;
  selectedServer: VPNServer;
  onOpenServerModal: () => void;
  activeProtocol: VPNProtocol;
  onSelectProtocol: (proto: VPNProtocol) => void;
  settings: SecuritySettings;
  onUpdateSettings: (newSettings: Partial<SecuritySettings>) => void;
  lang: 'en' | 'bn';
  onNavigateTab: (tab: string) => void;
}

// Custom Cyber Tooltip Component for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  lang: 'en' | 'bn';
}

const CyberChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, lang }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-[#030712]/95 border border-cyan-500/40 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs z-50">
        <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-3">
          <span>{label}</span>
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TLS 1.3
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-cyan-300">
            <span className="text-[11px] flex items-center gap-1.5 font-sans font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {lang === 'bn' ? 'ডাউনলোড গতি:' : 'Download:'}
            </span>
            <span className="font-bold text-cyan-300">{payload[0]?.value} Mbps</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-300">
            <span className="text-[11px] flex items-center gap-1.5 font-sans font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {lang === 'bn' ? 'আপলোড গতি:' : 'Upload:'}
            </span>
            <span className="font-bold text-emerald-300">{payload[1]?.value} Mbps</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const MainConnectView: React.FC<MainConnectViewProps> = ({
  status,
  onToggleConnect,
  selectedServer,
  onOpenServerModal,
  activeProtocol,
  onSelectProtocol,
  settings,
  onUpdateSettings,
  lang,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[lang];
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'handshaking';

  // Live session timer
  const [durationSeconds, setDurationSeconds] = useState(0);
  // Real-time speed numbers
  const [currentDownload, setCurrentDownload] = useState(0);
  const [currentUpload, setCurrentUpload] = useState(0);
  const [peakDownload, setPeakDownload] = useState(0);
  const [dataSentMB, setDataSentMB] = useState(14.2);
  const [dataRecvMB, setDataRecvMB] = useState(88.6);
  const [adsBlockedCount, setAdsBlockedCount] = useState(142);

  // Initial stream chart data
  const [trafficHistory, setTrafficHistory] = useState<LiveTrafficData[]>(() => {
    const initialPoints: LiveTrafficData[] = [];
    const now = Date.now();
    for (let i = 12; i >= 0; i--) {
      const timeStr = new Date(now - i * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      initialPoints.push({ time: timeStr, download: 0, upload: 0 });
    }
    return initialPoints;
  });

  // Timer effect and live traffic generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);

        // Generate realistic dynamic speed fluctuations based on protocol and ping
        const baseDl = activeProtocol === 'wireguard' ? 185 : activeProtocol === 'hysteria2' ? 220 : 140;
        const dlJitter = (Math.random() * 44 - 22);
        const newDl = Math.max(15, +(baseDl + dlJitter).toFixed(1));

        const baseUl = activeProtocol === 'wireguard' ? 95 : 75;
        const ulJitter = (Math.random() * 26 - 13);
        const newUl = Math.max(8, +(baseUl + ulJitter).toFixed(1));

        setCurrentDownload(newDl);
        setCurrentUpload(newUl);
        setPeakDownload((prev) => Math.max(prev, newDl));

        setDataRecvMB((prev) => +(prev + newDl / (8 * 10)).toFixed(2));
        setDataSentMB((prev) => +(prev + newUl / (8 * 10)).toFixed(2));

        if (Math.random() > 0.6) {
          setAdsBlockedCount((prev) => prev + 1);
        }

        setTrafficHistory((prev) => {
          const nowTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const updated = [...prev, { time: nowTime, download: newDl, upload: newUl }];
          if (updated.length > 20) updated.shift();
          return updated;
        });
      }, 1000);
    } else {
      setDurationSeconds(0);
      setCurrentDownload(0);
      setCurrentUpload(0);
      // Reset data points gracefully when disconnected
      setTrafficHistory((prev) =>
        prev.map((pt) => ({ ...pt, download: 0, upload: 0 }))
      );
    }
    return () => clearInterval(interval);
  }, [isConnected, activeProtocol]);

  // Trigger celebration on initial connection
  useEffect(() => {
    if (status === 'connected') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#06b6d4', '#10b981', '#6366f1']
        });
      } catch {}
    }
  }, [status]);

  // Format Duration HH:MM:SS
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const protocolData = PROTOCOL_INFO[activeProtocol];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Banner Status Bar with Entry Slide & Fade */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#030712] shadow-2xl">
        {/* Glow ambient background orbs */}
        <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
          isConnected ? 'bg-emerald-500/20' : isConnecting ? 'bg-amber-500/20' : 'bg-cyan-500/10'
        }`} />
        <div className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
          isConnected ? 'bg-cyan-500/20' : 'bg-indigo-500/10'
        }`} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Power Button Center / Hero with Scale Animation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center animate-fade-in-scale">
            
            <div className="relative my-4 flex items-center justify-center">
              
              {/* Outer Pulsing Rings */}
              {isConnected && (
                <>
                  <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-emerald-500/30 animate-pulse-ring pointer-events-none" />
                  <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-cyan-500/20 animate-ping opacity-25 pointer-events-none" />
                </>
              )}

              {isConnecting && (
                <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-amber-400 animate-spin pointer-events-none opacity-60" />
              )}

              {/* Glowing Outer Track */}
              <div className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2.5 transition-all duration-500 relative flex items-center justify-center ${
                isConnected
                  ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-[0_0_50px_rgba(16,185,129,0.35)]'
                  : isConnecting
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse'
                  : 'bg-gradient-to-tr from-slate-800 via-slate-700 to-cyan-900/60 shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]'
              }`}>
                
                {/* Inner Clickable Power Core */}
                <button
                  onClick={onToggleConnect}
                  disabled={isConnecting}
                  className={`w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 group focus:outline-none cursor-pointer ${
                    isConnected
                      ? 'bg-slate-950/90 text-emerald-400 border border-emerald-400/40 hover:bg-slate-900'
                      : isConnecting
                      ? 'bg-slate-950/90 text-amber-400 border border-amber-400/40 cursor-wait'
                      : 'bg-slate-950/90 text-slate-300 border border-cyan-500/30 hover:border-cyan-400/80 hover:text-cyan-300'
                  }`}
                >
                  <div className="relative">
                    {isConnecting ? (
                      <RefreshCw className="w-12 h-12 sm:w-14 sm:h-14 animate-spin text-amber-400" />
                    ) : (
                      <Power className={`w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ${
                        isConnected 
                          ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-110' 
                          : 'text-cyan-400/80 group-hover:text-cyan-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                      }`} />
                    )}
                  </div>

                  <span className={`mt-2 text-[11px] sm:text-xs font-extrabold tracking-widest uppercase ${
                    isConnected ? 'text-emerald-400' : isConnecting ? 'text-amber-400' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}>
                    {isConnected ? t.tapToDisconnect : isConnecting ? t.statusConnecting : t.tapToConnect}
                  </span>
                </button>
              </div>
            </div>

            {/* Connection Subtitle & Duration Timer */}
            <div className="mt-3">
              <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                isConnected ? 'text-emerald-400' : isConnecting ? 'text-amber-400' : 'text-slate-300'
              }`}>
                {isConnected 
                  ? t.statusConnected 
                  : isConnecting 
                  ? t.statusHandshaking 
                  : t.statusDisconnected}
              </h3>
              
              {isConnected ? (
                <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-slate-400 font-mono">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>{t.duration}:</span>
                  <span className="text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    {formatTime(durationSeconds)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {t.unprotectedSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Node Info & IP Shield Summary */}
          <div className="lg:col-span-7 space-y-4 animate-fade-in-up delay-100">
            
            {/* Selected Server Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-cyan-500/20 relative group">
              <div className="flex items-center justify-between gap-4">
                
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
                    {selectedServer.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {lang === 'bn' ? selectedServer.countryBn : selectedServer.country}
                      </h4>
                      {selectedServer.isVip && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          VIP
                        </span>
                      )}
                      {selectedServer.capabilities.includes('double_vpn') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          DOUBLE HOP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{lang === 'bn' ? selectedServer.cityBn : selectedServer.city}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-cyan-400">{selectedServer.speed}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ping Badge */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedServer.ping < 50 ? 'bg-emerald-400' : selectedServer.ping < 120 ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {selectedServer.ping} ms
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Load {selectedServer.load}%
                    </span>
                  </div>

                  {/* Change Server Button */}
                  <button
                    onClick={onOpenServerModal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-sm"
                  >
                    <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">{lang === 'bn' ? 'পরিবর্তন' : 'Change'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* IP Comparison bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    {isConnected ? t.virtualIp : t.realIp}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    {isConnected ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 truncate">{selectedServer.ip}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-rose-300 truncate">103.14.28.18 (Exposed)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    {t.protocol} & {t.encryption}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-cyan-300 font-bold truncate">
                      {protocolData.name}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                      ({protocolData.cipher.split('+')[0]})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Throughput Metrics (Staggered Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up delay-150">
              
              {/* Download Speed */}
              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-semibold">{t.downloadSpeed}</span>
                  <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono font-extrabold text-cyan-300">
                    {isConnected ? currentDownload : 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Mbps</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {isConnected ? `${dataRecvMB} MB` : '0 MB'}
                </span>
              </div>

              {/* Upload Speed */}
              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-semibold">{t.uploadSpeed}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono font-extrabold text-emerald-300">
                    {isConnected ? currentUpload : 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Mbps</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {isConnected ? `${dataSentMB} MB` : '0 MB'}
                </span>
              </div>

              {/* CleanNet AdBlock */}
              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-semibold">CleanNet</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono font-extrabold text-indigo-300">
                    {isConnected ? adsBlockedCount : 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Blocked</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                  Shield 100%
                </span>
              </div>

              {/* Quantum Armor */}
              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-semibold">Kyber-1024</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    Post-Quantum
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  NIST FIPS 203
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Real-Time Recharts Data Visualization Section */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                {lang === 'bn' ? 'রিয়েল-টাইম ট্র্যাফিক গতি ভিজ্যুয়ালাইজেশন (Recharts)' : 'Real-Time Traffic Speed Graph (Mbps)'}
              </span>
              {isConnected && (
                <span className="flex h-2 w-2 relative ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-cyan-400 to-blue-500 inline-block shadow-sm" />
                <span className="text-cyan-300 font-semibold">{t.downloadSpeed} (Incoming)</span>
                {isConnected && <span className="text-white font-bold">{currentDownload} Mbps</span>}
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-emerald-400 to-teal-500 inline-block shadow-sm" />
                <span className="text-emerald-300 font-semibold">{t.uploadSpeed} (Outgoing)</span>
                {isConnected && <span className="text-white font-bold">{currentUpload} Mbps</span>}
              </div>
              {isConnected && (
                <div className="hidden md:flex items-center gap-1 text-amber-300">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Peak: {peakDownload} Mbps</span>
                </div>
              )}
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="h-44 w-full bg-[#02050e]/90 rounded-2xl overflow-hidden border border-cyan-500/20 p-2 relative shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trafficHistory}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  {/* Download Cyan Gradient */}
                  <linearGradient id="downloadCyberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Upload Emerald Gradient */}
                  <linearGradient id="uploadCyberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255, 255, 255, 0.05)" 
                  vertical={false} 
                />

                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickFormatter={(val) => val.split(':').slice(1).join(':')}
                />

                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  domain={[0, 'auto']}
                  unit="M"
                />

                <Tooltip 
                  content={<CyberChartTooltip lang={lang} />} 
                />

                {/* Download Traffic Area (Cyan) */}
                <Area
                  type="monotone"
                  dataKey="download"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#downloadCyberGradient)"
                  isAnimationActive={false}
                />

                {/* Upload Traffic Area (Emerald) */}
                <Area
                  type="monotone"
                  dataKey="upload"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#uploadCyberGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Offline Status Overlay */}
            {!isConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[2px] z-10 select-none">
                <Activity className="w-6 h-6 text-slate-500 mb-1" />
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  {lang === 'bn' ? 'ভিপিএন সংযুক্ত হলে রিয়েল-টাইম গ্রাফ সক্রিয় হবে' : 'Live Recharts telemetry activates upon VPN connection'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  10 Gbps WireGuard & V2Ray Reality monitoring
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Quick-Switcher Bar with Subtle Entry Animation */}
      <div className="animate-fade-in-up delay-200 glass-panel p-4 rounded-2xl border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-200">
              {lang === 'bn' ? 'ভিপিএন প্রোটোকল নির্বাচন' : 'VPN Protocol Engine'}
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            {lang === 'bn' ? 'আপনার নেটওয়ার্ক অনুযায়ী প্রোটোকল পরিবর্তন করুন' : 'Switch engine according to your censorship & speed needs'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(['wireguard', 'v2ray', 'hysteria2', 'shadowsocks', 'trojan', 'openvpn_udp', 'openvpn_tcp'] as VPNProtocol[]).map((proto) => {
            const isSelected = activeProtocol === proto;
            const pInfo = PROTOCOL_INFO[proto];
            return (
              <button
                key={proto}
                onClick={() => onSelectProtocol(proto)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500/20 to-blue-600/10 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold truncate">{pInfo.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
                <span className="text-[10px] text-slate-500 block truncate font-mono">
                  {pInfo.port}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fast Action Cards Grid with Staggered Slide In */}
      <div className="animate-fade-in-up delay-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kill Switch Toggle */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.killSwitch} 
                onChange={(e) => onUpdateSettings({ killSwitch: e.target.checked })} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>
          <div className="mt-3">
            <h5 className="text-xs font-bold text-slate-200">{t.killSwitch}</h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t.killSwitchDesc}</p>
          </div>
        </div>

        {/* CleanNet AdBlock */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.cleanNetAdBlock} 
                onChange={(e) => onUpdateSettings({ cleanNetAdBlock: e.target.checked })} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          <div className="mt-3">
            <h5 className="text-xs font-bold text-slate-200">{t.cleanNet}</h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t.cleanNetDesc}</p>
          </div>
        </div>

        {/* Stealth Obfuscation */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <EyeOff className="w-4 h-4" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.stealthObfuscation} 
                onChange={(e) => onUpdateSettings({ stealthObfuscation: e.target.checked })} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
          <div className="mt-3">
            <h5 className="text-xs font-bold text-slate-200">{t.stealthMode}</h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t.stealthModeDesc}</p>
          </div>
        </div>

        {/* Quantum-Safe Kyber Key Exchange */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.quantumSafeKyber} 
                onChange={(e) => onUpdateSettings({ quantumSafeKyber: e.target.checked })} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <div className="mt-3">
            <h5 className="text-xs font-bold text-slate-200">Quantum Kyber-1024</h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {lang === 'bn' ? 'ভবিষ্যতের কোয়ান্টাম কম্পিউটার ডিক্রিপশন আক্রমণ প্রতিরোধ' : 'Shields against post-quantum decryption attacks'}
            </p>
          </div>
        </div>

      </div>

      {/* Fast Navigation Quick Links with Entry Stagger */}
      <div className="animate-fade-in-up delay-400 grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigateTab('benefits')}
          className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {lang === 'bn' ? 'কেন সোভারিক্সনেট? (লাভ)' : 'Why Soverixnet (Benefits)'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'সব সুবিধা ও নিরাপত্তা স্কোর' : 'Explore full advantages & risk test'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('worldMap')}
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {lang === 'bn' ? 'ইন্টারেক্টিভ সাইবার ম্যাপ' : 'Interactive Cyber Map'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'বিশ্বজুড়ে নোড লোকেশন দেখুন' : 'Explore worldwide nodes visually'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('speedTest')}
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                {lang === 'bn' ? 'স্পিড ও লিক টেস্ট' : 'Speed & Leak Diagnostics'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'DNS ও WebRTC টেস্ট করুন' : 'Verify Zero-Leak Shield'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('configs')}
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                {lang === 'bn' ? 'মোবাইল কনফিগ এক্সপোর্টার' : 'Export Mobile Configs'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'QR কোড ও vless লিঙ্ক নিন' : 'WireGuard, V2Ray QR generator'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
        </button>
      </div>

    </div>
  );
};
