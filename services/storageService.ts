
import { AppData, Sekolah, User } from '../types';

const STORAGE_KEY = 'pendampingan_pengawas_data';

export const storageService = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { user: null, sekolahs: [] };
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  saveUser: (user: User) => {
    const data = storageService.getData();
    data.user = user;
    storageService.saveData(data);
  },

  addSekolah: (sekolah: Sekolah) => {
    const data = storageService.getData();
    data.sekolahs.push(sekolah);
    storageService.saveData(data);
  },

  importSekolahs: (newSekolahs: Sekolah[]) => {
    const data = storageService.getData();
    // Menghindari duplikasi berdasarkan nama
    const existingNames = new Set(data.sekolahs.map(s => s.nama.toLowerCase()));
    const uniqueNew = newSekolahs.filter(s => !existingNames.has(s.nama.toLowerCase()));
    
    data.sekolahs = [...data.sekolahs, ...uniqueNew];
    storageService.saveData(data);
    return uniqueNew.length;
  },

  updateSekolah: (updatedSekolah: Sekolah) => {
    const data = storageService.getData();
    data.sekolahs = data.sekolahs.map(s => s.id === updatedSekolah.id ? updatedSekolah : s);
    storageService.saveData(data);
  },

  deleteSekolah: (id: string) => {
    const data = storageService.getData();
    data.sekolahs = data.sekolahs.filter(s => s.id !== id);
    storageService.saveData(data);
  },

  logout: () => {
    const data = storageService.getData();
    data.user = null;
    storageService.saveData(data);
  },

  // Fitur Hardisk Lokal: Export Full Database
  backupDatabase: () => {
    const data = storageService.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_aspps_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Fitur Hardisk Lokal: Restore Full Database
  restoreDatabase: (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      if (data && (data.user || data.sekolahs)) {
        storageService.saveData(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Gagal restore database", e);
      return false;
    }
  }
};
