
import React from 'react';
import { School } from 'lucide-react';
import { storageService } from './services/storageService';
import { AppData, Sekolah, User } from './types';
import logoLebak from './src/assets/images/logo_lebak.png';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SekolahList from './pages/SekolahList';
import SekolahDetail from './pages/SekolahDetail';
import RekapLaporan from './pages/RekapLaporan';

const App: React.FC = () => {
  const [data, setData] = React.useState<AppData>(storageService.getData());
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [selectedSekolah, setSelectedSekolah] = React.useState<Sekolah | null>(null);

  const refreshData = () => {
    setData(storageService.getData());
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user: User = {
      nama: formData.get('nama') as string,
      nip: formData.get('nip') as string,
    };
    storageService.saveUser(user);
    refreshData();
  };

  const handleLogout = () => {
    storageService.logout();
    setData({ ...data, user: null });
  };

  const handleAddSekolah = (sekolahData: Partial<Sekolah>) => {
    const newSekolah: Sekolah = {
      id: Date.now().toString(),
      nama: sekolahData.nama || 'Sekolah Baru',
      jenjang: sekolahData.jenjang || 'SD',
      kepalaSekolah: sekolahData.kepalaSekolah || 'Nama Kepala Sekolah',
      tahunSiklus: sekolahData.tahunSiklus || new Date().getFullYear().toString(),
      currentStep: 1,
      updatedAt: new Date().toISOString(),
    };
    storageService.addSekolah(newSekolah);
    refreshData();
  };

  const handleDeleteSekolah = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data sekolah ini?')) {
      storageService.deleteSekolah(id);
      refreshData();
    }
  };

  const handleUpdateSekolah = (updated: Sekolah) => {
    storageService.updateSekolah(updated);
    refreshData();
    setSelectedSekolah(updated);
  };

  if (!data.user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-blue-900 p-8 text-center space-y-4">
            <div className="w-24 h-24 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg p-2.5 border-2 border-amber-500">
               <img 
                 src={logoLebak} 
                 alt="Logo Kabupaten Lebak" 
                 className="object-contain h-full w-full"
                 referrerPolicy="no-referrer"
               />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white leading-none">ASPPS</h2>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Kabupaten Lebak</p>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed max-w-xs mx-auto">
              Aplikasi Siklus Pendampingan Pengawas Sekolah<br/>
              Perdirjen GTK No. 4831/B/HK.03.01/2023
            </p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap Pengawas</label>
                <input 
                  name="nama"
                  type="text" 
                  required
                  placeholder="Zulfian Yusmana, M.Pd"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-900 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NIP</label>
                <input 
                  name="nip"
                  type="text" 
                  required
                  placeholder="1982xxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-900 text-slate-800"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl transform active:scale-95"
            >
              Mulai Pendampingan
            </button>
            <div className="text-center pt-4 border-t border-slate-100 space-y-1">
              <p className="text-[11px] text-slate-400 font-medium">Aplikasi ini dikembangkan oleh:</p>
              <p className="text-xs font-bold text-slate-700">Zulfian Yusmana, M.Pd</p>
              <p className="text-[10px] text-slate-400">Copyright © 2026 • Lebak</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={data.user} 
      activeTab={activeTab} 
      setActiveTab={(tab) => { setActiveTab(tab); setSelectedSekolah(null); refreshData(); }} 
      onLogout={handleLogout}
    >
      {selectedSekolah ? (
        <SekolahDetail 
          sekolah={selectedSekolah} 
          user={data.user}
          onBack={() => setSelectedSekolah(null)} 
          onUpdate={handleUpdateSekolah}
        />
      ) : activeTab === 'dashboard' ? (
        <Dashboard data={data} onRefresh={refreshData} />
      ) : activeTab === 'rekap' ? (
        <RekapLaporan data={data} />
      ) : (
        <SekolahList 
          sekolahs={data.sekolahs} 
          onAdd={handleAddSekolah}
          onEdit={() => {}} 
          onDelete={handleDeleteSekolah}
          onSelect={setSelectedSekolah}
          onRefresh={refreshData}
        />
      )}
    </Layout>
  );
};

export default App;
