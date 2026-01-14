export interface Barang {
  kode: string;
  nama: string;
  harga: number;
  stok: number;
}

export interface TransaksiItem {
  kode: string;
  nama: string;
  harga: number;
  jumlah: number;
  subtotal: number;
}

export interface Transaksi {
  id_transaksi: string;
  tanggal: string;
  items: TransaksiItem[];
  subtotal: number;
  pajak: number;
  diskon: number;
  total: number;
}
