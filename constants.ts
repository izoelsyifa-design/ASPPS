
import { Kesadaran, Kapasitas, Strategi, Metode } from './types';

export const PERTANYAAN_KESADARAN = [
  {
    pertanyaan: "Apa kelemahan dan kekuatan Satuan Pendidikan Anda?",
    indikator: [
      { id: 'k_berkembang_1', text: '(Kepala Sekolah) belum mengakui kelemahan apa adanya dan menjelaskan dampaknya pada kualitas pembelajaran.', level: 'Berkembang' as Kesadaran },
      { id: 'k_berkembang_2', text: '(Kepala Sekolah) belum mengetahui dan menunjukkan keinginan mengoptimalkan kekuatan Satuan Pendidikan.', level: 'Berkembang' as Kesadaran }
    ]
  },
  {
    pertanyaan: "Bagaimana Anda mengantisipasi kelemahan dan kekuatan tersebut?",
    indikator: [
      { id: 'k_berdaya_1', text: '(Kepala Sekolah) mengakui kelemahan apa adanya dan menjelaskan dampaknya pada kualitas pembelajaran.', level: 'Berdaya' as Kesadaran },
      { id: 'k_berdaya_2', text: '(Kepala Sekolah) mengetahui dan menunjukkan keinginan mengoptimalkan kekuatan Satuan Pendidikan.', level: 'Berdaya' as Kesadaran }
    ]
  }
];

export const PERTANYAAN_KAPASITAS = [
  {
    pertanyaan: "Bagaimana Anda menyusun program kerja dan anggaran Satuan Pendidikan?",
    indikator: [
      { id: 'kp_rendah_1', text: '(Kepala Sekolah) tidak melakukan perubahan program/kegiatan apapun dalam 3 tahun terakhir (monoton).', level: 'Rendah' as Kapasitas },
      { id: 'kp_rendah_2', text: '(Kepala Sekolah) belum mampu menjelaskan perubahan berdasarkan perencanaan berbasis data.', level: 'Rendah' as Kapasitas }
    ]
  },
  {
    pertanyaan: "Apa perbedaan program/kegiatan Satuan Pendidikan tahun lalu dengan tahun sebelumnya?",
    indikator: [
      { id: 'kp_sedang_1', text: '(Kepala Sekolah) melakukan perubahan kegiatan/program dalam 3 tahun terakhir tapi belum efektif.', level: 'Sedang' as Kapasitas },
      { id: 'kp_sedang_2', text: '(Kepala Sekolah) mampu menjelaskan perubahan berdasarkan perencanaan berbasis data.', level: 'Sedang' as Kapasitas },
      { id: 'kp_tinggi_1', text: '(Kepala Sekolah) melakukan perubahan kegiatan/program dalam 3 tahun terakhir yang berdampak.', level: 'Tinggi' as Kapasitas },
      { id: 'kp_tinggi_2', text: '(Kepala Sekolah) mampu menjelaskan dan mencoba perubahan berdasarkan perencanaan berbasis data.', level: 'Tinggi' as Kapasitas }
    ]
  }
];

export const PERTANYAAN_INSTRUMEN_4 = [
  { 
    id: 'i4_1', 
    konteks: 'Identifikasi', 
    teks: 'Berdasarkan data Rapor Pendidikan, indikator apa yang sudah mencapai level "Baik" dan apa yang masih perlu ditingkatkan?' 
  },
  { 
    id: 'i4_2', 
    konteks: 'Refleksi', 
    teks: 'Apa akar masalah utama yang menyebabkan indikator tersebut masih berada di level rendah?' 
  },
  { 
    id: 'i4_3', 
    konteks: 'Benahi', 
    teks: 'Bagaimana rencana program/kegiatan (Benahi) yang paling relevan untuk menjawab akar masalah tersebut dalam RKT/RKAS?' 
  },
  { 
    id: 'i4_4', 
    konteks: 'Dukungan', 
    teks: 'Dukungan apa yang paling Anda butuhkan dari Pengawas Sekolah untuk memastikan program tersebut berjalan efektif?' 
  }
];

export const STRATEGI_MATRIX: Record<string, Strategi> = {
  'Berkembang-Rendah': 'Penyemai Perubahan',
  'Berkembang-Sedang': 'Perubahan Berangsur',
  'Berkembang-Tinggi': 'Perubahan Segera',
  'Berdaya-Rendah': 'Pemicu Perubahan',
  'Berdaya-Sedang': 'Penguatan Perubahan',
  'Berdaya-Tinggi': 'Perubahan Berkelanjutan'
};

export const PRIORITAS_STRATEGI: Record<Strategi, 'Utama' | 'Menengah' | 'Akhir'> = {
  'Penyemai Perubahan': 'Utama',
  'Perubahan Segera': 'Menengah',
  'Penguatan Perubahan': 'Menengah',
  'Perubahan Berangsur': 'Menengah',
  'Pemicu Perubahan': 'Akhir',
  'Perubahan Berkelanjutan': 'Akhir'
};

export const REKOMENDASI_METODE: Record<Strategi, Metode> = {
  'Penyemai Perubahan': 'Training',
  'Perubahan Berangsur': 'Mentoring',
  'Perubahan Segera': 'Consulting',
  'Pemicu Perubahan': 'Coaching',
  'Penguatan Perubahan': 'Facilitating',
  'Perubahan Berkelanjutan': 'Coaching'
};

export const DESKRIPSI_STRATEGI: Record<Strategi, string> = {
  'Penyemai Perubahan': 'Meninggalkan praktik lama dan berubah ke praktik baru. Fokus pada pembelajaran.',
  'Perubahan Berangsur': 'Melakukan perbaikan bertahap sesuai prioritas. Mendukung KS dalam merencanakan program.',
  'Perubahan Segera': 'Melakukan perubahan segera dalam meningkatkan kapasitas untuk melakukan perubahan.',
  'Pemicu Perubahan': 'Membangun kesadaran tentang perubahan yang berkelanjutan melalui percakapan reflektif.',
  'Penguatan Perubahan': 'Menemukan dan menguatkan praktik baru. Mengenalkan aktor penggerak perubahan.',
  'Perubahan Berkelanjutan': 'Melakukan pelembagaan perubahan melalui penyesuaian anggaran dan kebijakan.'
};
