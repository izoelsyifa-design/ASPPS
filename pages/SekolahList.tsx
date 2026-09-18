
import React from 'react';
import { 
  Plus, Trash2, Edit3, Search, Filter, 
  ChevronRight, School, Download, Upload,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Sekolah, Jenjang } from '../types';
import { exportService } from '../services/exportService';
import { storageService } from '../services/storageService';

interface SekolahListProps {
  sekolahs: Sekolah[];
  onAdd: (sekolah: Partial<Sekolah>) => void;
  onEdit: (sekolah: Sekolah) => void;
  onDelete: (id: string) => void;
  onSelect: (sekolah: Sekolah) => void;
  onRefresh?: () => void;
}

const SekolahList: React.FC<SekolahListProps> = ({ sekolahs, onAdd, onEdit, onDelete, onSelect, onRefresh }) => {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [filterJenjang, setFilterJenjang] = React.useState<Jenjang | 'Semua'>('Semua');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [importStatus, setImportStatus] = React.useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredSekolahs = sekolahs.filter(s => {
    const matchesJenjang = filterJenjang === 'Semua' || s.jenjang === filterJenjang;
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.kepalaSekolah.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJenjang && matchesSearch;
  });

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const newSekolahs: Sekolah[] = data.map((row, idx) => ({
          id: `import-${Date.now()}-${idx}`,
          nama: row['Nama Sekolah'] || row['nama'] || row['Nama'] || `Sekolah Impor ${idx+1}`,
          jenjang: (row['Jenjang'] || row['jenjang'] || 'SD') as Jenjang,
          kepalaSekolah: row['Kepala Sekolah'] || row['kepala_sekolah'] || row['KS'] || '-',
          tahunSiklus: String(row['Tahun'] || row['tahun_siklus'] || new Date().getFullYear()),
          currentStep: 1,
          updatedAt: new Date().toISOString()
        }));

        if (newSekolahs.length > 0) {
          const count = storageService.importSekolahs(newSekolahs);
          setImportStatus({ msg: `${count} Sekolah baru berhasil diimpor!`, type: 'success' });
          if (onRefresh) onRefresh();
        } else {
          setImportStatus({ msg: 'Format file tidak sesuai atau data kosong.', type: 'error' });
        }
      } catch (err) {
        setImportStatus({ msg: 'Gagal membaca file Excel.', type: 'error' });
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsBinaryString(file);
  };

  const AddSekolahModal = () => {
    const [formData, setFormData] = React.useState({
      nama: '',
      jenjang: 'SD' as Jenjang,
      kepalaSekolah: '',
      tahunSiklus: new Date().getFullYear().toString()
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
          <div className="p-6 border-b bg-blue-900 text-white">
            <h3 className="text-xl font-bold">Tambah Satuan Pendidikan</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Satuan Pendidikan</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.jenjang}
                  onChange={e => setFormData({...formData, jenjang: e.target.value as Jenjang})}
                >
                  <option value="TK">TK</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Siklus</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.tahunSiklus}
                  onChange={e => setFormData({...formData, tahunSiklus: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.kepalaSekolah}
                onChange={e => setFormData({...formData, kepalaSekolah: e.target.value})}
              />
            </div>
          </div>
          <div className="p-6 bg-slate-50 flex gap-3 justify-end">
            <button 
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                onAdd(formData);
                setShowAddModal(false);
              }}
              className="px-6 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">Satuan Pendidikan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola dan pantau seluruh siklus pendampingan sekolah binaan.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Invisible File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleImportExcel} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-sm transition-all duration-200 text-xs active:scale-95"
          >
            <Upload size={16} /> Impor Excel
          </button>
          
          <button 
            onClick={() => exportService.exportSekolahsToCSV(filteredSekolahs)}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm text-xs active:scale-95"
          >
            <Download size={16} /> Ekspor Data
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 hover:bg-blue-850 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all shadow-md text-xs active:scale-95 font-display"
          >
            <Plus size={16} /> Tambah Sekolah
          </button>
        </div>
      </div>

      {importStatus && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-red-50 text-red-700 border border-red-200/60'}`}>
          {importStatus.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 animate-bounce" /> : <AlertCircle size={18} className="text-red-600 animate-pulse" />}
          <span className="text-sm font-bold">{importStatus.msg}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari nama sekolah atau kepala sekolah..." 
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200/80 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="border border-slate-200/80 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold text-slate-700 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
            value={filterJenjang}
            onChange={e => setFilterJenjang(e.target.value as Jenjang | 'Semua')}
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="TK">Jenjang TK</option>
            <option value="SD">Jenjang SD</option>
            <option value="SMP">Jenjang SMP</option>
            <option value="SMA">Jenjang SMA</option>
            <option value="SMK">Jenjang SMK</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSekolahs.map(s => (
          <div 
            key={s.id} 
            className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-slate-300 overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-0.5" 
            onClick={() => onSelect(s)}
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${
                  s.jenjang === 'SD' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                  s.jenjang === 'SMP' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  s.jenjang === 'SMA' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  s.jenjang === 'SMK' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {s.jenjang}
                </div>
                <div className="flex gap-1 no-print">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} 
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200"
                    title="Hapus Satuan Pendidikan"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-900 tracking-tight font-display transition-colors line-clamp-1">{s.nama}</h3>
              <p className="text-slate-500 text-xs mb-4 line-clamp-1 font-medium">Kepala Sekolah: {s.kepalaSekolah}</p>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-[10px] uppercase font-black tracking-wider">
                  <span className="text-slate-400">Progress Siklus</span>
                  <span className="text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded-md text-[9px]">Siklus {s.currentStep} / 4</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(s.currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50/80 border-t border-slate-100/80 flex justify-between items-center group-hover:bg-blue-50/30 transition-colors duration-300">
              <span className="text-[10px] font-mono text-slate-400 font-medium">Update: {new Date(s.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <div className="flex items-center text-blue-900 text-[10px] font-black uppercase tracking-wider gap-1 transition-all group-hover:translate-x-1">
                Detail Siklus <ChevronRight size={14} className="text-amber-500" />
              </div>
            </div>
          </div>
        ))}
        {filteredSekolahs.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <School size={48} className="mx-auto text-slate-200 mb-4 animate-pulse" />
            <h3 className="text-slate-700 font-bold font-display">Belum ada sekolah yang terdaftar.</h3>
            <p className="text-slate-400 text-sm mt-1">Klik tombol "Tambah Sekolah" atau "Impor Excel" untuk memulai.</p>
          </div>
        )}
      </div>

      {showAddModal && <AddSekolahModal />}
    </div>
  );
};

export default SekolahList;
