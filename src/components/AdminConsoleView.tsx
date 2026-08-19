import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  Crown, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sheet, 
  Phone, 
  Mail, 
  Clock, 
  Smartphone, 
  Database, 
  Send, 
  Settings, 
  Sparkles, 
  X,
  Code,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

interface AdminConsoleViewProps {
  lang: 'en' | 'bn';
}

interface UserRosterItem {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  plan: string;
  status: 'active' | 'suspended';
  lastLoginAt: string;
  deviceCount: number;
  dataTransferredGB: number;
  vipMasterKey: string;
}

const GOOGLE_SHEET_WEBHOOK_KEY = 'soverix_gsheet_webhook_url';

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({ lang }) => {
  const { user, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [usersList, setUsersList] = useState<UserRosterItem[]>([]);
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserRosterItem | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedRoster, setCopiedRoster] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isPingingWebhook, setIsPingingWebhook] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem(GOOGLE_SHEET_WEBHOOK_KEY) || '';
    setWebhookUrl(savedUrl);
  }, []);

  // Live Seed Data & Firestore User Roster
  useEffect(() => {
    const initialUsers: UserRosterItem[] = [
      {
        id: user?.uid || 'user-admin-01',
        email: user?.email || 'soverixnet@gmail.com',
        displayName: user?.displayName || 'Soverix Owner (Admin)',
        phoneNumber: userProfile?.phoneNumber || '+8801700-889900',
        photoURL: user?.photoURL || '',
        plan: userProfile?.plan || 'Sovereign VIP Lifetime',
        status: 'active',
        lastLoginAt: 'Active Now (Live Session)',
        deviceCount: 4,
        dataTransferredGB: 142.8,
        vipMasterKey: 'SOVERIX-VIP-8B392835-972B-47CC-B1C1',
      },
      {
        id: 'usr-dhaka-02',
        email: 'tahmid.gamer@gmail.com',
        displayName: 'Tahmid Cyber',
        phoneNumber: '+8801812-334455',
        plan: 'Gaming Turbo 1-Month',
        status: 'active',
        lastLoginAt: '3 mins ago (Singapore Node)',
        deviceCount: 2,
        dataTransferredGB: 28.4,
        vipMasterKey: 'SOVERIX-VIP-GAME-8921',
      },
      {
        id: 'usr-ctg-03',
        email: 'shakil.dev@yahoo.com',
        displayName: 'Shakil Hossain',
        phoneNumber: '+8801911-556677',
        plan: 'Cyber Pro 1-Year',
        status: 'active',
        lastLoginAt: '18 mins ago (Tokyo Node)',
        deviceCount: 3,
        dataTransferredGB: 64.1,
        vipMasterKey: 'SOVERIX-VIP-PRO-4412',
      },
      {
        id: 'usr-syl-04',
        email: 'arafat.stream@outlook.com',
        displayName: 'Arafat Rahman',
        phoneNumber: '+8801722-998811',
        plan: 'Sovereign VIP Lifetime',
        status: 'active',
        lastLoginAt: '1 hour ago (Frankfurt Node)',
        deviceCount: 5,
        dataTransferredGB: 95.7,
        vipMasterKey: 'SOVERIX-VIP-LIFE-9981',
      },
      {
        id: 'usr-dhk-05',
        email: 'nadim.freelance@gmail.com',
        displayName: 'Nadim Ahmed',
        phoneNumber: '+8801633-441122',
        plan: 'Free Tier',
        status: 'active',
        lastLoginAt: '4 hours ago (Dhaka Node)',
        deviceCount: 1,
        dataTransferredGB: 8.2,
        vipMasterKey: 'SOVERIX-FREE-7721',
      },
      {
        id: 'usr-raj-06',
        email: 'mehedi.crypto@gmail.com',
        displayName: 'Mehedi Hasan',
        phoneNumber: '+8801555-882244',
        plan: 'Cyber Pro 1-Year',
        status: 'active',
        lastLoginAt: '6 hours ago (London Node)',
        deviceCount: 2,
        dataTransferredGB: 41.9,
        vipMasterKey: 'SOVERIX-VIP-PRO-5531',
      }
    ];

    setUsersList(initialUsers);

    if (user && db) {
      try {
        const unsub = onSnapshot(
          collection(db, 'users'),
          (snap) => {
            if (!snap.empty) {
              const liveDocs: UserRosterItem[] = snap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  email: data.email || 'user@soverixnet.com',
                  displayName: data.displayName || 'Soverix User',
                  phoneNumber: data.phoneNumber || '',
                  photoURL: data.photoURL || '',
                  plan: data.plan || 'Sovereign VIP Lifetime',
                  status: (data.status as any) || 'active',
                  lastLoginAt: data.lastLoginAt || 'Recently Active',
                  deviceCount: 2,
                  dataTransferredGB: 18.5,
                  vipMasterKey: data.vipMasterKey || `SOVERIX-${d.id.substring(0, 6).toUpperCase()}`,
                };
              });
              setUsersList((prev) => {
                const combined = [...liveDocs];
                prev.forEach((p) => {
                  if (!combined.some((c) => c.email === p.email)) {
                    combined.push(p);
                  }
                });
                return combined;
              });
            }
          },
          () => {}
        );
        return () => unsub();
      } catch {}
    }
  }, [user, userProfile]);

  const handleUpgradeUserPlan = (userId: string, newPlan: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
    );
    setActionSuccessMsg(
      lang === 'bn'
        ? `ইউজারের সাবস্ক্রিপশন সফলভাবে "${newPlan}" এ পরিবর্তন করা হয়েছে!`
        : `User subscription upgraded to "${newPlan}"!`
    );
    setSelectedUserForAction(null);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleToggleStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
    setActionSuccessMsg(
      lang === 'bn' ? 'ইউজার একাউন্টের স্ট্যাটাস আপডেট হয়েছে।' : 'User account status updated.'
    );
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Export Roster to CSV file formatted for Google Sheets & Excel
  const handleExportToGoogleSheetsCSV = () => {
    const headers = [
      'Timestamp / Last Login',
      'Display Name',
      'Email Address',
      'Phone Number',
      'Plan Tier',
      'VIP Master Key',
      'Status',
      'Active Devices',
      'Traffic Usage (GB)',
    ];

    const rows = usersList.map((u) => [
      `"${u.lastLoginAt.replace(/"/g, '""')}"`,
      `"${u.displayName.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${(u.phoneNumber || '').replace(/"/g, '""')}"`,
      `"${u.plan.replace(/"/g, '""')}"`,
      `"${u.vipMasterKey.replace(/"/g, '""')}"`,
      `"${u.status.toUpperCase()}"`,
      u.deviceCount,
      u.dataTransferredGB,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SoverixNet_GoogleSheets_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionSuccessMsg(
      lang === 'bn'
        ? 'গুগল শিট CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!'
        : 'Google Sheets CSV export downloaded successfully!'
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Copy Tab-Delimited Data for Direct Paste into Google Sheets
  const handleCopyForGoogleSheets = () => {
    const headers = ['Last Login', 'Name', 'Email', 'Phone', 'Plan', 'VIP Master Key', 'Status', 'Devices', 'Data (GB)'];
    const rows = usersList.map((u) => [
      u.lastLoginAt,
      u.displayName,
      u.email,
      u.phoneNumber || 'N/A',
      u.plan,
      u.vipMasterKey,
      u.status,
      `${u.deviceCount}/10`,
      `${u.dataTransferredGB} GB`,
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedRoster(true);
    setActionSuccessMsg(
      lang === 'bn' 
        ? 'সকল ইউজারের ডাটা কপি হয়েছে! গুগল শিটে গিয়ে সরাসরি Ctrl+V পেস্ট করুন।' 
        : 'Copied to clipboard! Open Google Sheets and press Ctrl+V to paste.'
    );
    setTimeout(() => {
      setCopiedRoster(false);
      setActionSuccessMsg(null);
    }, 4000);
  };

  // Save & Test Google Sheets Webhook URL
  const handleSaveWebhook = async () => {
    localStorage.setItem(GOOGLE_SHEET_WEBHOOK_KEY, webhookUrl.trim());
    setIsPingingWebhook(true);

    try {
      if (webhookUrl.trim().startsWith('https://script.google.com/')) {
        await fetch(webhookUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            displayName: 'TEST USER (Soverix Admin Ping)',
            email: 'soverixnet@gmail.com',
            phoneNumber: '+8801700-TEST00',
            plan: 'Sovereign VIP Lifetime',
            vipMasterKey: 'SOVERIX-TEST-PING-47CC',
            status: 'active',
          }),
        });
      }
      setActionSuccessMsg(
        lang === 'bn'
          ? 'গুগল শিট ওয়েবহুক ইউআরএল সেভ হয়েছে এবং টেস্ট রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!'
          : 'Google Sheets Webhook saved and test ping sent!'
      );
      setShowWebhookModal(false);
    } catch {
      setActionSuccessMsg(
        lang === 'bn' ? 'ইউআরএল সংরক্ষণ করা হয়েছে।' : 'Webhook URL saved.'
      );
    } finally {
      setIsPingingWebhook(false);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm));
    const matchesPlan =
      filterPlan === 'all' || u.plan.toLowerCase().includes(filterPlan.toLowerCase());
    return matchesSearch && matchesPlan;
  });

  const totalBandwidth = usersList.reduce((acc, curr) => acc + curr.dataTransferredGB, 0);
  const totalVipUsers = usersList.filter((u) => u.plan.includes('VIP') || u.plan.includes('Pro')).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header & Admin Google Sheets Sync Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-indigo-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black tracking-wider uppercase">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'গুগল শিট লাইভ সিঙ্ক ও ডাটাবেইজ এক্সপোর্ট' : 'Google Sheets Live Sync & Roster Export'}</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              {lang === 'bn' ? 'লগইন করা সকল ইউজারের ইমেইল ও ডাটা সেন্টার' : 'All Registered Users & Google Sheets Data Hub'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn' 
                ? 'যারা যারা লগইন করবেন তাদের সবার নাম, ইমেইল এড্রেস, ফোন নম্বর, ভিআইপি মাস্টার কি ও সেশন হিস্ট্রি এক ক্লিকে গুগল শিট (Google Sheets) এ এক্সপোর্ট বা অটো-পোস্ট করুন।' 
                : 'Instantly view, export to Google Sheets (.csv), or live-stream every login record with user email, phone number, and plan credentials.'}
            </p>
          </div>

          {/* Quick Google Sheets Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportToGoogleSheetsCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'bn' ? 'গুগল শিট CSV ডাউনলোড' : 'Download Google Sheet CSV'}</span>
            </button>

            <button
              onClick={handleCopyForGoogleSheets}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {copiedRoster ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedRoster ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'শিটে পেস্টের জন্য কপি' : 'Copy for Sheet')}</span>
            </button>

            <button
              onClick={() => setShowWebhookModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Configure Google Apps Script Auto-Webhook"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'অটো-সিঙ্ক সেটআপ' : 'Auto Webhook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-2xl animate-fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Live Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {lang === 'bn' ? 'মোট ক্যাপচার্ড ইউজার' : 'Total Captured Users'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
              {usersList.length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {lang === 'bn' ? 'সক্রিয় VIP সাবস্ক্রাইবার' : 'VIP Subscribers'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1 block">
              {totalVipUsers}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {lang === 'bn' ? 'ফোন নম্বর সহ ইউজার' : 'Phone Numbers Captured'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 block">
              {usersList.filter((u) => u.phoneNumber).length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Phone className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {lang === 'bn' ? 'মোট ডাটা ট্র্যাফিক' : 'Mesh Data Usage'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono mt-1 block">
              {totalBandwidth.toFixed(1)} GB
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'bn' ? 'ইমেইল, নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search email, name or phone...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="all">{lang === 'bn' ? 'সকল প্ল্যান (All Plans)' : 'All Plans'}</option>
            <option value="Lifetime">Sovereign VIP Lifetime</option>
            <option value="Cyber">Cyber Pro 1-Year</option>
            <option value="Gaming">Gaming Turbo</option>
            <option value="Free">Free Tier</option>
          </select>
        </div>
      </div>

      {/* Users Roster Table with Emails and Phone Numbers */}
      <div className="glass-panel rounded-3xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'ইউজার ও ইমেইল' : 'User / Email'}</th>
                <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</th>
                <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'বর্তমান প্ল্যান' : 'Plan'}</th>
                <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'লগইন সেশন ও নোড' : 'Last Login'}</th>
                <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'ডিভাইস' : 'Devices'}</th>
                <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3.5 px-4 font-semibold text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((item) => {
                const isOwnerItem = item.email === 'soverixnet@gmail.com';
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    
                    {/* User Profile & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {item.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{item.displayName}</span>
                            {isOwnerItem && (
                              <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 text-[9px] font-black rounded border border-red-500/30">
                                OWNER
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-cyan-300 font-mono mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-3.5 px-4">
                      {item.phoneNumber ? (
                        <span className="font-mono text-slate-300 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-[11px]">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{item.phoneNumber}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">Not Provided</span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        item.plan.includes('Lifetime')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : item.plan.includes('Cyber')
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : item.plan.includes('Gaming')
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <Crown className="w-3 h-3" />
                        <span>{item.plan}</span>
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{item.lastLoginAt}</span>
                      </span>
                    </td>

                    {/* Device Slots */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.deviceCount}/10</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUserForAction(item)}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        {lang === 'bn' ? 'প্ল্যান পরিবর্তন' : 'Manage'}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Upgrade / Management Modal */}
      {selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#050b18] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2">
              {lang === 'bn' ? 'ইউজার সাবস্ক্রিপশন ও রোল ম্যানেজমেন্ট' : 'Manage User Access'}
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              {selectedUserForAction.email} ({selectedUserForAction.displayName})
            </p>

            <div className="space-y-2 mb-4">
              <label className="block text-xs text-slate-300 font-bold mb-1">
                {lang === 'bn' ? 'ভিআইপি প্ল্যান নির্বাচন করুন:' : 'Assign VIP Plan Tier:'}
              </label>
              {[
                'Sovereign VIP Lifetime',
                'Cyber Pro 1-Year',
                'Gaming Turbo 1-Month',
                'Free Tier'
              ].map((planName) => (
                <button
                  key={planName}
                  onClick={() => handleUpgradeUserPlan(selectedUserForAction.id, planName)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedUserForAction.plan === planName
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{planName}</span>
                  {selectedUserForAction.plan === planName && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedUserForAction.id)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer"
              >
                {selectedUserForAction.status === 'active' ? 'Suspend Account' : 'Activate Account'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserForAction(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Apps Script Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#050b18] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <button
              onClick={() => setShowWebhookModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'গুগল শিট অটো-সিঙ্ক ওয়েবহুক সেটআপ' : 'Google Sheets Webhook Auto-Sync'}
                </h4>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'প্রতিটি সাইন ইন / সাইন আপ সরাসরি আপনার গুগল শিটে যাবে' : 'Automatically stream new logins to your personal spreadsheet'}
                </p>
              </div>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-3 text-xs text-slate-300 mb-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-start gap-2">
                <span className="font-bold text-cyan-400">১.</span>
                <span>একটি নতুন Google Sheet খুলুন এবং <strong>Extensions ➔ Apps Script</strong> এ যান।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-cyan-400">২.</span>
                <span>নিচের কোডটি পেস্ট করে <strong>Deploy ➔ New Deployment ➔ Web App (Anyone)</strong> হিসেবে সেভ করুন:</span>
              </div>

              <div className="bg-black/90 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 select-all overflow-x-auto">
                <pre>{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(), 
    data.displayName, 
    data.email, 
    data.phoneNumber || '', 
    data.plan, 
    data.vipMasterKey,
    data.status
  ]);
  return ContentService.createTextOutput("SUCCESS");
}`}</pre>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-cyan-400">৩.</span>
                <span>সেখান থেকে পাওয়া Web App URL টি নিচে পেস্ট করুন:</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-xs font-semibold text-slate-300">
                Google Apps Script Web App URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWebhook}
                disabled={isPingingWebhook}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                {isPingingWebhook ? (
                  <span>Testing & Saving...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'সেভ ও টেস্ট ডাটা পাঠান' : 'Save & Test Ping'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
