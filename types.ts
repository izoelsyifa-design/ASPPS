
export type Jenjang = 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK';

export type Kesadaran = 'Berkembang' | 'Berdaya';
export type Kapasitas = 'Rendah' | 'Sedang' | 'Tinggi';
export type Strategi = 
  | 'Penyemai Perubahan' 
  | 'Perubahan Berangsur' 
  | 'Perubahan Segera' 
  | 'Pemicu Perubahan' 
  | 'Penguatan Perubahan' 
  | 'Perubahan Berkelanjutan';

export type Metode = 'Training' | 'Mentoring' | 'Coaching' | 'Facilitating' | 'Consulting';

export interface User {
  nama: string;
  nip: string;
}

export interface Instrumen1 {
  kesadaranScores: Record<string, boolean>;
  kapasitasScores: Record<string, boolean>;
  tingkatKesadaran: Kesadaran;
  tingkatKapasitas: Kapasitas;
}

export interface RencanaPendampingan {
  prioritas: 'Utama' | 'Menengah' | 'Akhir';
  strategi: Strategi;
  metode: Metode;
  deskripsiKebutuhan: string;
  targetPerubahan: string;
}

export interface Instrumen4 {
  hasilAnalisis: {
    indikator: string;
    skor: string;
    capaian: 'Baik' | 'Cukup' | 'Perlu Peningkatan';
  }[];
  catatanDiskusi: Record<string, string>;
  fileName?: string;
}

export interface Tahap2Data {
  notulensi: string;
  checklist: string[];
  raporPendidikanUrl: string;
  statusValidasi: 'Draft' | 'Revisi' | 'Disetujui';
  umpanBalik: string;
  instrumen4?: Instrumen4;
}

export interface DiskusiPeriodik {
  id: string;
  tanggal: string;
  agenda: string;
  hasil: string;
  rekomendasi: string;
  strategiUmpanBalik: string;
}

export interface Tahap3Data {
  diskusi: DiskusiPeriodik[];
  unjukKerja: {
    indikator: string;
    catatan: string;
    skor: number;
    buktiUrl: string;
  };
}

export interface Tahap4Data {
  kondisiSesudah: string;
  evaluasi: string;
  rekomendasiTindakLanjut: string;
}

export interface Sekolah {
  id: string;
  nama: string;
  jenjang: Jenjang;
  kepalaSekolah: string;
  tahunSiklus: string;
  currentStep: number;
  tahap1?: {
    instrumen1: Instrumen1;
    rencana: RencanaPendampingan;
  };
  tahap2?: Tahap2Data;
  tahap3?: Tahap3Data;
  tahap4?: Tahap4Data;
  updatedAt: string;
}

export interface AppData {
  user: User | null;
  sekolahs: Sekolah[];
}
