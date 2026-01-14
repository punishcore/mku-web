'use client';

import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, ClipboardList, Search, ChevronRight, Receipt, AlertTriangle, Wallet, TrendingUp, DollarSign, Minus, CheckCircle } from 'lucide-react';
import { Spinner } from '../components';
import { Card } from '../components/molecules';
import { Barang, Transaksi } from '../lib/types';

const menuItems = [
  { href: '/dashboard/master', label: 'Master Barang', icon: Package, desc: 'Kelola inventaris produk', color: 'from-blue-500 to-blue-600' },
  { href: '/dashboard/transaksi', label: 'Transaksi Baru', icon: ShoppingCart, desc: 'Buat penjualan baru', color: 'from-emerald-500 to-emerald-600' },
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
    Promise.all([fetch('/api/barang'), fetch('/api/transaksi')])
      .then(([b, t]) => Promise.all([b.json(), t.json()]))
      .then(([b, t]) => { setBarang(b); setTransaksi(t); });
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Selamat Datang, {user.nama}!</h2>
        <p className="text-slate-500 mt-1">Kelola bisnis Anda dengan mudah</p>
      </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Produk</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{barang.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Transaksi</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{transaksi.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">Rp {todayTrx.reduce((s, t) => s + t.total, 0).toLocaleString('id-ID')}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Stok Rendah</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{barang.filter(b => b.stok < 10).length}</p>
              </div>
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-4">Menu Utama</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.label}</h3>
              <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Laporan Pendapatan</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-sm text-slate-500">Total Pendapatan</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600"><TrendingUp className="w-3 h-3" />Bersih</div>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Jumlah Transaksi</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{totalTransaksi}</p>
            <div className="text-xs text-slate-500 mt-2">Transaksi</div>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Rata-rata</p>
            <p className="text-xl font-bold text-purple-600 mt-1">Rp {rataRata.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
            <div className="text-xs text-slate-500 mt-2">Per transaksi</div>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total Pajak</p>
            <p className="text-xl font-bold text-amber-600 mt-1">Rp {totalPajak.toLocaleString('id-ID')}</p>
            <div className="text-xs text-slate-500 mt-2">Terkumpul</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h4 className="font-semibold text-slate-900 mb-4">Pendapatan Harian</h4>
            {Object.entries(dailyData).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(dailyData).slice(-7).map(([date, data]) => (
                  <div key={date}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{date}</span>
                      <span className="text-sm font-semibold text-slate-900">Rp {data.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${(data.total / maxDaily) * 100}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{data.count} transaksi</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">Tidak ada data</div>
            )}
          </Card>

          <Card>
            <h4 className="font-semibold text-slate-900 mb-4">Ringkasan Keuangan</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-emerald-600" /></div>
                  <div><p className="text-xs text-slate-500">Pendapatan Kotor</p><p className="font-semibold text-slate-900 text-sm">Rp {(totalPendapatan + totalDiskon).toLocaleString('id-ID')}</p></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><Minus className="w-4 h-4 text-red-600" /></div>
                  <div><p className="text-xs text-slate-500">Total Diskon</p><p className="font-semibold text-red-600 text-sm">-Rp {totalDiskon.toLocaleString('id-ID')}</p></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><Receipt className="w-4 h-4 text-amber-600" /></div>
                  <div><p className="text-xs text-slate-500">Pajak Terkumpul</p><p className="font-semibold text-amber-600 text-sm">Rp {totalPajak.toLocaleString('id-ID')}</p></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs text-emerald-600">Pendapatan Bersih</p><p className="font-bold text-emerald-700">Rp {totalPendapatan.toLocaleString('id-ID')}</p></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
  );
}
