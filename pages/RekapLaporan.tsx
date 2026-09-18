
import React from 'react';
// Added Target, Upload, Cloud to the import list from lucide-react
import { FileText, Download, School, Info, CheckCircle2, Target, Upload, Cloud } from 'lucide-react';
import { AppData, Sekolah } from '../types';
import { DESKRIPSI_STRATEGI } from '../constants';
import { exportService } from '../services/exportService';
import { googleDriveService } from '../services/googleDriveService';

interface RekapLaporanProps {
  data: AppData;
}

const RekapLaporan: React.FC<RekapLaporanProps> = ({ data }) => {
  const { sekolahs } = data;
  const [isUploadingToDrive, setIsUploadingToDrive] = React.useState(false);

  const handleSaveRekapToDrive = async () => {
    if (!googleDriveService.isAuthenticated()) {
      alert("Silakan hubungkan akun Google Drive Anda di Dashboard terlebih dahulu.");
      return;
    }
    setIsUploadingToDrive(true);
    try {
      const folderId = await googleDriveService.getOrCreateFolder();
      const { blob, fileName } = exportService.getRekapWordData(sekolahs, data.user!);
      await googleDriveService.uploadFile(fileName, 'application/msword', blob, [folderId]);
      alert(`Berhasil menyimpan rekap "${fileName}" ke Google Drive!`);
    } catch (err: any) {
      console.error("Gagal menyimpan rekap ke Google Drive:", err);
      alert(`Gagal menyimpan ke Google Drive: ${err.message || err}`);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const generateTransformasi = (s: Sekolah) => {
    const t1 = s.tahap1?.instrumen1;
    const t1Rencana = s.tahap1?.rencana;
    const t4 = s.tahap4;
    
    if (!t1) return "Data perencanaan belum lengkap.";

    let text = `${s.nama} menunjukkan transformasi dari kondisi awal kesadaran "${t1.tingkatKesadaran}" dan kapasitas "${t1.tingkatKapasitas}". `;
    text += `Target perubahan yang ditetapkan adalah "${t1Rencana?.targetPerubahan || 'Peningkatan mutu' }". `;
    
    if (t4?.kondisiSesudah) {
      text += `Progres saat ini: ${t4.kondisiSesudah}`;
    } else {
      text += "Saat ini sekolah sedang dalam proses implementasi program kerja sesuai strategi yang telah disepakati.";
    }
    
    return text;
  };

  const generateRekomendasi = (s: Sekolah) => {
    const t4 = s.tahap4;
    const t1Rencana = s.tahap1?.rencana;

    if (t4?.rekomendasiTindakLanjut) return t4.rekomendasiTindakLanjut;

    if (t1Rencana) {
      return `Melanjutkan pendampingan dengan metode ${t1Rencana.metode} dan strategi ${t1Rencana.strategi}. Fokus pada pencapaian target: ${t1Rencana.targetPerubahan || 'Peningkatan kualitas pembelajaran'}.`;
    }

    return "Melanjutkan siklus pendampingan sesuai RKT/RKAS yang telah disusun.";
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">Rekap Hasil Pendampingan</h1>
          <p className="text-slate-500 text-sm mt-1">Rekapitulasi otomatis untuk seluruh satuan pendidikan dampingan Kabupaten Lebak.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => exportService.exportRekapToWord(sekolahs, data.user!)}
            className="bg-blue-900 hover:bg-blue-850 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-200 text-xs font-display active:scale-95"
          >
            <Download size={16} /> Ekspor Rekap Word
          </button>
          {googleDriveService.isAuthenticated() && (
            <button 
              onClick={handleSaveRekapToDrive}
              disabled={isUploadingToDrive}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-200 text-xs font-display disabled:opacity-50 active:scale-95"
            >
              <Upload size={16} /> {isUploadingToDrive ? 'Menyimpan...' : 'Simpan Rekap ke Drive'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {sekolahs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <School size={48} className="mx-auto text-slate-200 mb-4 animate-pulse" />
            <h3 className="text-slate-700 font-bold font-display">Belum ada data sekolah untuk direkap.</h3>
            <p className="text-slate-400 text-sm mt-1">Pastikan sekolah binaan telah memiliki rekaman pendampingan.</p>
          </div>
        ) : (
          sekolahs.map((s, idx) => (
            <section key={s.id} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden break-inside-avoid hover:shadow-md transition-all duration-300">
              <div className="bg-slate-900 p-5 text-white flex justify-between items-center relative overflow-hidden">
                {/* Visual decoration */}
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-sm font-display">
                    {idx + 1}
                  </div>
                  <div>
                    <h2 className="font-extrabold uppercase tracking-tight text-white font-display text-sm">{s.nama}</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">Siklus: <span className="font-bold text-white">{s.tahunSiklus}</span> • KS: <span className="font-bold text-white">{s.kepalaSekolah}</span></p>
                  </div>
                </div>
                <div className="text-right no-print relative z-10">
                   <span className="text-[9px] font-black tracking-wider uppercase bg-slate-800 border border-slate-700 text-amber-500 px-3 py-1.5 rounded-xl">
                     Tahap {s.currentStep} / 4
                   </span>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Identitas & Catatan Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
                      <Info size={14} className="text-blue-500" /> Catatan Pendampingan
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs space-y-2.5">
                      <p className="flex justify-between border-b border-slate-150 pb-1.5"><span className="text-slate-400">Strategi Pendampingan:</span> <span className="font-black text-slate-800">{s.tahap1?.rencana.strategi || '-'}</span></p>
                      <p className="flex justify-between border-b border-slate-150 pb-1.5"><span className="text-slate-400">Metode Intervensi:</span> <span className="font-black text-slate-800">{s.tahap1?.rencana.metode || '-'}</span></p>
                      <p className="text-[11px] leading-relaxed italic text-slate-500 mt-2 bg-white p-2.5 rounded-lg border border-slate-200/45">{s.tahap1?.rencana.strategi ? DESKRIPSI_STRATEGI[s.tahap1.rencana.strategi] : '-'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
                      <CheckCircle2 size={14} className="text-emerald-500" /> Pelaksanaan Program
                    </h3>
                    <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 text-xs">
                      <p className="text-emerald-800 leading-relaxed">
                        Pendampingan berjalan secara aktif melalui sebanyak <b className="text-emerald-950">{s.tahap3?.diskusi.length || 0} kali diskusi periodik</b> bersama tim pengembang sekolah. Status validasi RKAS & RKT berada pada tingkat <b className="text-emerald-950 uppercase tracking-wider">{s.tahap2?.statusValidasi || 'Draft'}</b>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hasil & Rekomendasi Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
                      <FileText size={14} className="text-amber-500" /> Hasil dan Transformasi (Otomatis)
                    </h3>
                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed text-justify">
                      {generateTransformasi(s)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
                      <Target size={14} className="text-blue-500" /> Rekomendasi & Tindak Lanjut
                    </h3>
                    <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed text-justify">
                      {generateRekomendasi(s)}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))
        )}
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 rounded-2xl text-white flex flex-col items-center text-center space-y-4 no-print relative overflow-hidden group border border-slate-800">
         <div className="absolute -right-16 -bottom-16 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-125 transition-all duration-700"></div>
         <h2 className="text-xl font-bold font-display tracking-tight text-white relative z-10">Butuh Cetak Rekapitulasi Kolektif?</h2>
         <p className="text-slate-300 text-xs max-w-lg leading-relaxed relative z-10">Unduh dokumen rekapitulasi komprehensif dari seluruh sekolah binaan Anda. Format dokumen Microsoft Word (.doc) terstruktur rapi sesuai standar regulasi yang berlaku.</p>
         <div className="flex gap-3 flex-wrap justify-center relative z-10">
           <button 
             onClick={() => exportService.exportRekapToWord(sekolahs, data.user!)}
             className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:shadow-lg transition-all text-xs font-display active:scale-95"
           >
             <Download size={16} /> Ekspor Laporan Rekap (.doc)
           </button>
           {googleDriveService.isAuthenticated() && (
             <button 
               onClick={handleSaveRekapToDrive}
               disabled={isUploadingToDrive}
               className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all text-xs font-display disabled:opacity-50 active:scale-95"
             >
               <Cloud size={16} /> {isUploadingToDrive ? 'Menyimpan...' : 'Simpan Rekap ke Google Drive'}
             </button>
           )}
         </div>
      </div>
    </div>
  );
};

export default RekapLaporan;
