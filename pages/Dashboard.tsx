
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  School, TrendingUp, CheckCircle, Clock, Download, 
  Database, HardDrive, FileJson, Upload, FileSpreadsheet,
  Cloud, CloudUpload, CloudDownload, Trash2, RefreshCw, Loader2, LogOut, Check
} from 'lucide-react';
import { AppData, Sekolah } from '../types';
import { exportService } from '../services/exportService';
import { storageService } from '../services/storageService';
import { googleDriveService } from '../services/googleDriveService';

interface DashboardProps {
  data: AppData;
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onRefresh }) => {
  const { sekolahs } = data;
  const restoreInputRef = React.useRef<HTMLInputElement>(null);

  // Google Drive state
  const [isGoogleAuth, setIsGoogleAuth] = React.useState(googleDriveService.isAuthenticated());
  const [gUser, setGUser] = React.useState<any>(googleDriveService.getCurrentUser());
  const [backups, setBackups] = React.useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const fetchBackups = async () => {
    if (!googleDriveService.getAccessToken()) return;
    setLoadingBackups(true);
    try {
      const folderId = await googleDriveService.getOrCreateFolder();
      const files = await googleDriveService.listBackups(folderId);
      setBackups(files);
    } catch (err) {
      console.error("Gagal mengambil daftar cadangan:", err);
    } finally {
      setLoadingBackups(false);
    }
  };

  React.useEffect(() => {
    const unsubscribe = googleDriveService.initAuth(
      (user, token) => {
        setIsGoogleAuth(true);
        setGUser(user);
        fetchBackups();
      },
      () => {
        setIsGoogleAuth(false);
        setGUser(null);
      }
    );
    if (googleDriveService.isAuthenticated()) {
      fetchBackups();
    }
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setSyncing(true);
    try {
      const result = await googleDriveService.signIn();
      if (result) {
        setIsGoogleAuth(true);
        setGUser(result.user);
        setTimeout(() => fetchBackups(), 500);
      }
    } catch (err: any) {
      console.error("Gagal login Google:", err);
      alert(`Gagal login: ${err.message || err}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleDriveService.logout();
      setIsGoogleAuth(false);
      setGUser(null);
      setBackups([]);
    } catch (err) {
      console.error("Gagal logout Google:", err);
    }
  };

  const handleGoogleBackup = async () => {
    setSyncing(true);
    try {
      const folderId = await googleDriveService.getOrCreateFolder();
      const currentData = storageService.getData();
      
      const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_aspps_${timestamp}.json`;
      
      await googleDriveService.uploadFile(fileName, 'application/json', blob, [folderId]);
      alert("Database berhasil dicadangkan ke Google Drive!");
      await fetchBackups();
    } catch (err: any) {
      console.error("Gagal backup ke Google Drive:", err);
      alert(`Gagal mencadangkan: ${err.message || err}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleGoogleRestore = async (fileId: string, fileName: string) => {
    if (!confirm(`Apakah Anda yakin ingin memulihkan database dari cadangan "${fileName}"? Seluruh data saat ini akan digantikan.`)) {
      return;
    }
    setSyncing(true);
    try {
      const backupData = await googleDriveService.downloadBackup(fileId);
      if (storageService.restoreDatabase(JSON.stringify(backupData))) {
        alert("Database berhasil dipulihkan dari Google Drive!");
        if (onRefresh) onRefresh();
      } else {
        alert("File cadangan dari Google Drive tidak valid.");
      }
    } catch (err: any) {
      console.error("Gagal restore dari Google Drive:", err);
      alert(`Gagal memulihkan: ${err.message || err}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleGoogleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus file cadangan "${fileName}" dari Google Drive?`)) {
      return;
    }
    setSyncing(true);
    try {
      await googleDriveService.deleteFile(fileId);
      alert("File cadangan berhasil dihapus dari Google Drive.");
      await fetchBackups();
    } catch (err: any) {
      console.error("Gagal menghapus cadangan dari Google Drive:", err);
      alert(`Gagal menghapus: ${err.message || err}`);
    } finally {
      setSyncing(false);
    }
  };

  const stats = [
    { label: 'Total Sekolah', value: sekolahs.length, icon: School, color: 'blue' },
    { label: 'Tahap Perencanaan', value: sekolahs.filter(s => s.currentStep === 1).length, icon: Clock, color: 'amber' },
    { label: 'Tahap Pelaksanaan', value: sekolahs.filter(s => s.currentStep === 3).length, icon: TrendingUp, color: 'emerald' },
    { label: 'Selesai Siklus', value: sekolahs.filter(s => s.currentStep === 4).length, icon: CheckCircle, color: 'indigo' },
  ];

  const chartData = [
    { name: 'Tahap 1', total: sekolahs.filter(s => s.currentStep === 1).length },
    { name: 'Tahap 2', total: sekolahs.filter(s => s.currentStep === 2).length },
    { name: 'Tahap 3', total: sekolahs.filter(s => s.currentStep === 3).length },
    { name: 'Tahap 4', total: sekolahs.filter(s => s.currentStep === 4).length },
  ];

  const commitmentData = [
    { name: 'Berkembang', value: sekolahs.filter(s => s.tahap1?.instrumen1.tingkatKesadaran === 'Berkembang').length },
    { name: 'Berdaya', value: sekolahs.filter(s => s.tahap1?.instrumen1.tingkatKesadaran === 'Berdaya').length },
  ];

  const COLORS = ['#D4AF37', '#1e40af'];

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.restoreDatabase(content)) {
        alert("Database berhasil dipulihkan!");
        if (onRefresh) onRefresh();
      } else {
        alert("Format file cadangan tidak valid.");
      }
    };
    reader.readAsText(file);
    if (restoreInputRef.current) restoreInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 bg-clip-text text-transparent">Dashboard Pengawas</h1>
          <p className="text-slate-500 text-sm mt-1">Ringkasan status pendampingan seluruh satuan pendidikan Kabupaten Lebak.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => exportService.downloadExcelTemplate()}
             className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 px-4 py-2.5 rounded-xl text-xs font-black border border-emerald-200/60 flex items-center gap-2 hover:shadow-sm active:scale-95 transition-all duration-200"
           >
             <FileSpreadsheet size={16} /> Unduh Template Excel
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 group">
            <div className={`p-4 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight font-display">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 font-display mb-6">Progress Siklus Pendampingan</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                <Bar dataKey="total" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Local Database Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between flex-1 relative overflow-hidden group">
            {/* Ambient subtle light inside card */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500"></div>
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Database size={22} className="text-amber-500" />
                <h2 className="text-base font-bold font-display tracking-tight text-white">Database Lokal</h2>
              </div>
              <p className="text-slate-300 text-xs mb-4 leading-relaxed">
                Seluruh data tersimpan aman secara lokal di browser Anda. Sangat disarankan mencadangkan basis data secara berkala guna mengantisipasi kegagalan cache.
              </p>
            </div>
            <div className="space-y-2 relative z-10">
              <button 
                onClick={() => storageService.backupDatabase()}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-950 py-2.5 rounded-xl text-xs font-black hover:bg-amber-400 transition-all shadow-md active:scale-95 font-display"
              >
                <HardDrive size={16} /> Backup ke Hardisk (.json)
              </button>
              <label className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-white py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700/80 cursor-pointer active:scale-95 font-display">
                <Upload size={16} /> Restore dari Cadangan
                <input 
                  type="file" 
                  ref={restoreInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleRestore} 
                />
              </label>
            </div>
          </div>

          {/* Google Drive Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between flex-1 relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cloud size={22} className="text-blue-600" />
                  <h2 className="text-base font-bold font-display tracking-tight text-slate-800">Google Drive Sync</h2>
                </div>
                {isGoogleAuth && (
                  <button 
                    onClick={handleGoogleLogout} 
                    title="Putuskan sambungan Google Drive"
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>

              {!isGoogleAuth ? (
                <div className="space-y-4">
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Hubungkan akun Google Anda untuk mengaktifkan sinkronisasi cloud otomatis, pencadangan basis data, dan ekspor laporan digital secara aman langsung ke drive Anda.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={syncing}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50 text-xs font-display"
                  >
                    {syncing ? <Loader2 size={18} className="animate-spin" /> : <Cloud size={18} />}
                    Hubungkan Google Drive
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                    {gUser?.photoURL ? (
                      <img src={gUser.photoURL} alt={gUser.displayName} className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {gUser?.displayName?.charAt(0) || 'G'}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-700 truncate">{gUser?.displayName || 'Google Account'}</p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">{gUser?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleGoogleBackup}
                      disabled={syncing}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 font-display"
                    >
                      {syncing ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                      Cadangkan Database Sekarang
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-display">Daftar Cadangan Cloud</p>
                      <button 
                        onClick={fetchBackups} 
                        disabled={loadingBackups || syncing}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <RefreshCw size={12} className={loadingBackups ? "animate-spin" : ""} />
                      </button>
                    </div>

                    {loadingBackups ? (
                      <div className="py-4 flex justify-center">
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                      </div>
                    ) : backups.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-50 rounded-xl border border-dashed border-slate-100">Belum ada cadangan di Google Drive.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {backups.slice(0, 3).map((b) => (
                          <div key={b.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all text-[11px]">
                            <div className="overflow-hidden pr-2">
                              <p className="font-bold text-slate-700 truncate text-[10px]" title={b.name}>{b.name.replace('backup_aspps_', '')}</p>
                              <p className="text-[9px] text-slate-400 font-mono">{new Date(b.createdTime).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => handleGoogleRestore(b.id, b.name)}
                                disabled={syncing}
                                title="Pulihkan dari cadangan ini"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                              >
                                <CloudDownload size={14} />
                              </button>
                              <button
                                onClick={() => handleGoogleDelete(b.id, b.name)}
                                disabled={syncing}
                                title="Hapus cadangan"
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 font-display">Sekolah Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Nama Sekolah</th>
                  <th className="px-6 py-4">Tahap</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sekolahs.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{s.nama}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                        Tahap {s.currentStep}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full inline-block ${s.currentStep === 4 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        <span className="text-xs font-semibold text-slate-600">{s.currentStep === 4 ? 'Selesai' : 'Aktif'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {sekolahs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic text-sm">Belum ada data sekolah.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 font-display mb-6">Tingkat Komitmen Perubahan</h2>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={commitmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {commitmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
