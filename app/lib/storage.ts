import { Barang, Transaksi } from './types';
import initialBarang from '../data/barang.json';

const BARANG_KEY = 'kasir_barang';
const TRANSAKSI_KEY = 'kasir_transaksi';

export const storage = {
  getBarang: (): Barang[] => {
    if (typeof window === 'undefined') return initialBarang;
    const data = localStorage.getItem(BARANG_KEY);
    return data ? JSON.parse(data) : initialBarang;
  },

  setBarang: (barang: Barang[]) => {
    localStorage.setItem(BARANG_KEY, JSON.stringify(barang));
  },

  getTransaksi: (): Transaksi[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(TRANSAKSI_KEY);
    return data ? JSON.parse(data) : [];
  },

  setTransaksi: (transaksi: Transaksi[]) => {
    localStorage.setItem(TRANSAKSI_KEY, JSON.stringify(transaksi));
  },

  addTransaksi: (t: Transaksi) => {
    const list = storage.getTransaksi();
    list.push(t);
    storage.setTransaksi(list);
  },

  downloadBarangJSON: () => {
    const data = JSON.stringify(storage.getBarang(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barang.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadTransaksiCSV: () => {
    const transaksi = storage.getTransaksi();
    const header = 'id_transaksi,tanggal,items,subtotal,pajak,diskon,total\n';
    const rows = transaksi.map(t => 
      `${t.id_transaksi},${t.tanggal},${encodeURIComponent(JSON.stringify(t.items))},${t.subtotal},${t.pajak},${t.diskon},${t.total}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaksi.csv';
    a.click();
    URL.revokeObjectURL(url);
  },

  resetToDefault: () => {
    localStorage.setItem(BARANG_KEY, JSON.stringify(initialBarang));
    localStorage.removeItem(TRANSAKSI_KEY);
  }
};
