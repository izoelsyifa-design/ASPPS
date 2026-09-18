
import { Sekolah, User } from '../types';
import { DESKRIPSI_STRATEGI } from '../constants';
import * as XLSX from 'xlsx';

export const exportService = {
  exportSekolahsToCSV: (sekolahs: Sekolah[]) => {
    const headers = [
      'Nama Sekolah',
      'Jenjang',
      'Kepala Sekolah',
      'Tahun Siklus',
      'Tahap Sekarang',
      'Tingkat Kesadaran',
      'Tingkat Kapasitas',
      'Strategi Pendampingan',
      'Metode',
      'Terakhir Update'
    ];

    const rows = sekolahs.map(s => [
      s.nama,
      s.jenjang,
      s.kepalaSekolah,
      s.tahunSiklus,
      `Tahap ${s.currentStep}`,
      s.tahap1?.instrumen1.tingkatKesadaran || '-',
      s.tahap1?.instrumen1.tingkatKapasitas || '-',
      s.tahap1?.rencana.strategi || '-',
      s.tahap1?.rencana.metode || '-',
      new Date(s.updatedAt).toLocaleString('id-ID')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => {
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `data_pendampingan_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadExcelTemplate: () => {
    const worksheetData = [
      ['Nama Sekolah', 'Jenjang', 'Kepala Sekolah', 'Tahun'],
      ['SD Negeri 01 Contoh', 'SD', 'Budi Santoso, S.Pd', '2026'],
      ['SMP Merdeka', 'SMP', 'Siti Aminah, M.Pd', '2026'],
      ['SMA Harapan', 'SMA', 'Dr. Ahmad Fauzi', '2026']
    ];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Data_Sekolah");
    XLSX.writeFile(wb, "Template_Impor_ASPPS.xlsx");
  },

  getSekolahWordData: (sekolah: Sekolah): { blob: Blob; fileName: string } => {
    const fileName = `Laporan_Pendampingan_${sekolah.nama.replace(/\s+/g, '_')}.doc`;
    const reportData = sekolah.tahap4 || { kondisiSesudah: '', evaluasi: '', rekomendasiTindakLanjut: '' };
    
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Laporan Pendampingan</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
          h1 { font-size: 18pt; text-transform: uppercase; margin: 0; }
          h2 { font-size: 14pt; margin: 5px 0; }
          h4 { font-size: 12pt; border-bottom: 1px solid #1e40af; color: #1e40af; padding-bottom: 5px; margin-top: 20px; }
          p { font-size: 11pt; text-align: justify; margin: 10px 0; }
          .label { font-weight: bold; width: 150px; display: inline-block; }
          .box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px; margin: 10px 0; }
          .footer { margin-top: 50px; float: right; width: 250px; text-align: center; }
          .signature-space { height: 80px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Hasil Pendampingan</h1>
          <h2 style="color: #1e40af;">TAHUN SIKLUS ${sekolah.tahunSiklus}</h2>
          <h2>${sekolah.nama}</h2>
        </div>

        <h4>1. Identitas Satuan Pendidikan</h4>
        <p><span class="label">Nama Sekolah</span> : ${sekolah.nama}</p>
        <p><span class="label">Jenjang</span> : ${sekolah.jenjang}</p>
        <p><span class="label">Kepala Sekolah</span> : ${sekolah.kepalaSekolah}</p>
        <p><span class="label">Tahun Siklus</span> : ${sekolah.tahunSiklus}</p>

        <h4>2. Catatan Pendampingan</h4>
        <p>
          Berdasarkan hasil refleksi awal, Satuan Pendidikan berada pada tingkat kesadaran <b>${sekolah.tahap1?.instrumen1.tingkatKesadaran || 'Berkembang'}</b> 
          dengan kapasitas memimpin perubahan <b>${sekolah.tahap1?.instrumen1.tingkatKapasitas || 'Rendah'}</b>. 
          Sesuai regulasi, sekolah dikategorikan dalam <b>Prioritas ${sekolah.tahap1?.rencana.prioritas || 'Utama'}</b>. 
          Strategi pendampingan yang diterapkan adalah <b>${sekolah.tahap1?.rencana.strategi || 'Penyemai Perubahan'}</b>.
        </p>
        <p><i>Keterangan Strategi: ${sekolah.tahap1?.rencana.strategi ? DESKRIPSI_STRATEGI[sekolah.tahap1.rencana.strategi] : '-'}</i></p>

        <h4>3. Pelaksanaan Pendampingan</h4>
        <p>
          Pendampingan dilaksanakan menggunakan metode <b>${sekolah.tahap1?.rencana.metode || 'Training'}</b>. 
          Selama siklus berjalan, telah dilakukan pemantauan melalui <b>${sekolah.tahap3?.diskusi.length || 0} kali pertemuan</b> diskusi periodik. 
          Penyusunan RKAS/RKT telah divalidasi dengan status akhir: <b>${sekolah.tahap2?.statusValidasi || 'Draft'}</b>.
        </p>

        <h4>4. Hasil dan Transformasi</h4>
        <p><b>Kondisi Sebelum:</b></p>
        <div class="box">
          <p>Tingkat Kesadaran ${sekolah.tahap1?.instrumen1.tingkatKesadaran} & Kapasitas ${sekolah.tahap1?.instrumen1.tingkatKapasitas}. Target Perubahan: ${sekolah.tahap1?.rencana.targetPerubahan || '-'}</p>
        </div>
        
        <p><b>Kondisi Sesudah:</b></p>
        <div class="box">
          <p>${reportData.kondisiSesudah || 'Belum diisi.'}</p>
        </div>

        <p><b>Evaluasi:</b></p>
        <div class="box">
          <p>${reportData.evaluasi || 'Belum diisi.'}</p>
        </div>

        <h4>5. Rekomendasi dan Tindak Lanjut</h4>
        <p>${reportData.rekomendasiTindakLanjut || 'Disarankan untuk melanjutkan program prioritas berbasis data.'}</p>

        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Pengawas Sekolah,</p>
          <div class="signature-space"></div>
          <p><b>__________________________</b></p>
          <p>NIP. .................................</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword'
    });

    return { blob, fileName };
  },

  exportSekolahToWord: (sekolah: Sekolah) => {
    const { blob, fileName } = exportService.getSekolahWordData(sekolah);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getRekapWordData: (sekolahs: Sekolah[], user: User): { blob: Blob; fileName: string } => {
    const fileName = `Rekap_Pendampingan_Pengawas_${user.nama.replace(/\s+/g, '_')}.doc`;
    
    let schoolSections = '';

    sekolahs.forEach((s, idx) => {
      const t1 = s.tahap1?.instrumen1;
      const t1Rencana = s.tahap1?.rencana;
      const t4 = s.tahap4;
      
      const transformasi = t1 
        ? `${s.nama} menunjukkan transformasi dari kondisi awal kesadaran "${t1.tingkatKesadaran}" dan kapasitas "${t1.tingkatKapasitas}". Target: "${t1Rencana?.targetPerubahan || '-' }". ${t4?.kondisiSesudah || 'Sedang proses implementasi.'}`
        : 'Data belum lengkap.';

      const rekomendasi = t4?.rekomendasiTindakLanjut || 
        (t1Rencana ? `Melanjutkan pendampingan metode ${t1Rencana.metode} strategi ${t1Rencana.strategi}. Fokus: ${t1Rencana.targetPerubahan || '-'}` : 'Melanjutkan siklus pendampingan.');

      schoolSections += `
        <div style="page-break-after: always; margin-bottom: 30px; border: 1px solid #ddd; padding: 15px;">
          <h2 style="background: #1e40af; color: white; padding: 10px; margin: 0;">${idx + 1}. ${s.nama}</h2>
          <p><b>Identitas:</b> Jenjang ${s.jenjang} | KS: ${s.kepalaSekolah} | Tahun: ${s.tahunSiklus}</p>
          
          <h4 style="color: #1e40af; border-bottom: 1px solid #1e40af;">Catatan Pendampingan</h4>
          <p>Strategi: ${t1Rencana?.strategi || '-'} | Metode: ${t1Rencana?.metode || '-'}</p>
          
          <h4 style="color: #1e40af; border-bottom: 1px solid #1e40af;">Hasil dan Transformasi</h4>
          <p style="text-align: justify;">${transformasi}</p>
          
          <h4 style="color: #1e40af; border-bottom: 1px solid #1e40af;">Rekomendasi dan Tindak Lanjut</h4>
          <p style="text-align: justify;">${rekomendasi}</p>
        </div>
      `;
    });

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Rekap Laporan Pendampingan</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.5; }
          .header { text-align: center; border-bottom: 3px double black; padding-bottom: 10px; margin-bottom: 20px; }
          h1 { font-size: 20pt; text-transform: uppercase; }
          h2 { font-size: 14pt; }
          p { font-size: 11pt; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rekapitulasi Hasil Pendampingan Satuan Pendidikan</h1>
          <p><b>Pengawas: ${user.nama} | NIP: ${user.nip}</b></p>
          <p>Tahun Siklus: ${new Date().getFullYear()}</p>
        </div>

        ${schoolSections}

        <div style="margin-top: 50px; text-align: right;">
          <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</p>
          <br/><br/><br/>
          <p><b>${user.nama}</b></p>
          <p>NIP. ${user.nip}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    return { blob, fileName };
  },

  exportRekapToWord: (sekolahs: Sekolah[], user: User) => {
    const { blob, fileName } = exportService.getRekapWordData(sekolahs, user);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
