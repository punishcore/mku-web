'use client';

import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, ClipboardList, Search, Receipt, AlertTriangle, Wallet, TrendingUp, DollarSign, Minus, CheckCircle } from 'lucide-react';
import { Spinner } from '../components';
import { Card } from '../components/molecules';
import { Barang, Transaksi } from '../lib/types';
import { storage } from '../lib/storage';

const menuItems = [
  { href: '/dashboard/master', label: 'Master Barang', icon: Package, desc: 'Kelola inventaris', color: 'from-blue-500 to-blue-600' },
  { href: '/dashboard/transaksi', label: 'Transaksi', icon: ShoppingCart, desc: 'Penjualan baru', color: 'from-emerald-500 to-emerald-600' },
  { href: '/dashboard/riwayat', label: 'Riwayat', icon: ClipboardList, desc: 'Histori transaksi', color: 'from-purple-500 to-purple-600' },
  { href: '/dashboard/pencarian', label: 'Pencarian', icon: Search, desc: 'Cari produk', color: 'from-amber-500 to-amber-600' },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [barang, setBarang] = useState<Barang[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    setBarang(storage.getBarang());
    setTransaksi(storage.getTransaksi());
  }, []);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const filtered = transaksi.filter(t => {
    const date = new Date(t.tanggal);
    if (filter === 'today') return date >= today;
    if (filter === 'week') return date >= weekAgo;
    if (filter === 'month') return date >= monthAgo;
    return true;
  });

  const todayTrx = transaksi.filter(t => new Date(t.tanggal).toDateString() === today.toDateString());
  const totalPendapatan = filtered.reduce((sum, t) => sum + t.total, 0);
  const totalTransaksi = filtered.length;
  const totalPajak = filtered.reduce((sum, t) => sum + t.pajak, 0);
  const totalDiskon = filtered.reduce((sum, t) => sum + t.diskon, 0);
  const rataRata = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;

  const dailyData: Record<string, { total: number; count: number }> = {};
  filtered.forEach(t => {
    const date = new Date(t.tanggal).toLocaleDateString('id-ID');
    if (!dailyData[date]) dailyData[date] = { total: 0, count: 0 };
    dailyData[date].total += t.total;
    dailyData[date].count += 1;
  });
  const maxDaily = Math.max(...Object.values(dailyData).map(d => d.total), 1);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Selamat Datang, {user.nama}!</h2>
        <p className="text-slate-500 text-sm lg:text-base mt-1">Kelola bisnis Anda dengan mudah</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-500">Total Produk</p>
              <p className="text-xl lg:text-2xl font-bold text-slate-900 mt-1">{barang.length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-500">Total Transaksi</p>
              <p className="text-xl lg:text-2xl font-bold text-slate-900 mt-1">{transaksi.length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-500">Hari Ini</p>
              <p className="text-lg lg:text-2xl font-bold text-emerald-600 mt-1">Rp {todayTrx.reduce((s, t) => s + t.total, 0).toLocaleString('id-ID')}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-500">Stok Rendah</p>
              <p className="text-xl lg:text-2xl font-bold text-rose-600 mt-1">{barang.filter(b => b.stok < 10).length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Menu Utama</h3>
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 lg:p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm lg:text-base group-hover:text-blue-600 transition-colors">{item.label}</h3>
            <p className="text-slate-500 text-xs lg:text-sm mt-1 hidden sm:block">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900">Laporan</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="all">Semua</option>
          <option value="today">Hari Ini</option>
          <option value="week">7 Hari</option>
          <option value="month">30 Hari</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
        <Card className="p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-slate-500">Pendapatan</p>
          <p className="text-base lg:text-xl font-bold text-emerald-600 mt-1">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600"><TrendingUp className="w-3 h-3" />Bersih</div>
        </Card>
        <Card className="p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-slate-500">Transaksi</p>
          <p className="text-base lg:text-xl font-bold text-blue-600 mt-1">{totalTransaksi}</p>
          <div className="text-xs text-slate-500 mt-2">Total</div>
        </Card>
        <Card className="p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-slate-500">Rata-rata</p>
          <p className="text-base lg:text-xl font-bold text-purple-600 mt-1">Rp {rataRata.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
          <div className="text-xs text-slate-500 mt-2">Per transaksi</div>
        </Card>
        <Card className="p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-slate-500">Pajak</p>
          <p className="text-base lg:text-xl font-bold text-amber-600 mt-1">Rp {totalPajak.toLocaleString('id-ID')}</p>
          <div className="text-xs text-slate-500 mt-2">Terkumpul</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6">
          <h4 className="font-semibold text-slate-900 text-sm lg:text-base mb-3 lg:mb-4">Pendapatan Harian</h4>
          {Object.entries(dailyData).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(dailyData).slice(-5).map(([date, data]) => (
                <div key={date}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs lg:text-sm text-slate-600">{date}</span>
                    <span className="text-xs lg:text-sm font-semibold text-slate-900">Rp {data.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${(data.total / maxDaily) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 text-sm">Tidak ada data</div>
          )}
        </Card>

        <Card className="p-4 lg:p-6">
          <h4 className="font-semibold text-slate-900 text-sm lg:text-base mb-3 lg:mb-4">Ringkasan</h4>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between p-2 lg:p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><DollarSign className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-600" /></div>
                <div><p className="text-[10px] lg:text-xs text-slate-500">Kotor</p><p className="font-semibold text-slate-900 text-xs lg:text-sm">Rp {(totalPendapatan + totalDiskon).toLocaleString('id-ID')}</p></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 lg:p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-red-100 rounded-lg flex items-center justify-center"><Minus className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" /></div>
                <div><p className="text-[10px] lg:text-xs text-slate-500">Diskon</p><p className="font-semibold text-red-600 text-xs lg:text-sm">-Rp {totalDiskon.toLocaleString('id-ID')}</p></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 lg:p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" /></div>
                <div><p className="text-[10px] lg:text-xs text-emerald-600">Bersih</p><p className="font-bold text-emerald-700 text-xs lg:text-sm">Rp {totalPendapatan.toLocaleString('id-ID')}</p></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
