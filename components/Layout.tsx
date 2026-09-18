
import React from 'react';
import { 
  LayoutDashboard, 
  School, 
  LogOut, 
  Menu, 
  ChevronRight, 
  User as UserIcon,
  Settings,
  HelpCircle,
  FileBarChart,
  Download,
  Wifi,
  WifiOff,
  Monitor
} from 'lucide-react';
import { User } from '../types';
import logoLebak from '../src/assets/images/logo_lebak.png';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, children, activeTab, setActiveTab, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sekolah', label: 'Satuan Pendidikan', icon: School },
    { id: 'rekap', label: 'Rekap Laporan', icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col no-print border-r border-slate-800 shadow-xl relative z-50`}>
        {/* Glow accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600"></div>

        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 duration-300">
            <img 
              src={logoLebak} 
              alt="Logo Kabupaten Lebak" 
              className="object-contain h-8 w-8" 
              referrerPolicy="no-referrer"
            />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-black text-xl leading-none tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">ASPPS</span>
              <span className="text-[10px] text-amber-500 font-black tracking-widest mt-1 uppercase">LEBAK</span>
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/15' 
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <item.icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110 text-slate-950' : 'group-hover:scale-110 group-hover:text-amber-500'}`} />
                {isSidebarOpen && <span className="font-semibold text-sm tracking-wide font-display">{item.label}</span>}
                
                {/* Active indicator dot on collapsed sidebar */}
                {!isSidebarOpen && isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                )}
              </button>
            );
          })}
          
          {deferredPrompt && isSidebarOpen && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white mt-4 glow-active transition-all duration-300 shadow-md"
            >
              <Monitor size={20} className="animate-bounce" />
              <span className="font-bold text-xs tracking-wider uppercase font-display">Install Offline</span>
            </button>
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/80 space-y-4 bg-slate-950/40">
          {/* Connection Status */}
          {isSidebarOpen && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase border transition-all duration-300 ${
              isOnline 
                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
            }`}>
              {isOnline ? <Wifi size={12} className="text-emerald-400" /> : <WifiOff size={12} className="text-rose-400 animate-pulse" />}
              {isOnline ? 'Tersinkron Cloud' : 'Mode Lokal (Offline)'}
            </div>
          )}

          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center shadow-inner border border-slate-700 shrink-0">
              <UserIcon size={16} className="text-amber-500" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden animate-fade-in">
                <p className="text-xs font-bold text-slate-200 truncate">{user.nama}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">NIP. {user.nip}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-sm"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="font-medium">Keluar Sesi</span>}
          </button>

          {isSidebarOpen && (
            <div className="pt-2 text-center border-t border-slate-800/40">
              <p className="text-[9px] text-slate-600 font-medium">Inisiator Aplikasi:</p>
              <p className="text-[11px] font-bold text-amber-500/90 font-display">Zulfian Yusmana, M.Pd</p>
              <p className="text-[8px] text-slate-600 mt-0.5 font-mono">© 2026 • Kabupaten Lebak</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 glass-header border-b border-slate-100 flex items-center justify-between px-8 shrink-0 no-print sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 hover:bg-slate-100 text-slate-600 active:scale-95 rounded-xl transition-all border border-transparent hover:border-slate-200/60"
            aria-label="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase font-display leading-none">Siklus Pendampingan Pengawas Sekolah</p>
                <p className="text-sm font-black text-slate-900 leading-none mt-1.5 font-display bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Perdirjen GTK No. 4831/B/HK.03.01/2023</p>
             </div>
             <div className="h-9 w-9 bg-white p-1.5 rounded-xl border border-slate-200/60 flex items-center justify-center shrink-0 shadow-sm hover:rotate-3 transition-transform duration-300">
               <img 
                 src={logoLebak} 
                 alt="Logo Lebak" 
                 className="object-contain h-full w-full"
                 referrerPolicy="no-referrer"
               />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
