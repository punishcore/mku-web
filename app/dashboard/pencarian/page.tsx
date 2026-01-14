'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Spinner, Badge } from '@/app/components';
import { Card } from '@/app/components/molecules';
import { PageLayout } from '@/app/components';
import { Barang } from '@/app/lib/types';

export default function PencarianPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [barang, setBarang] = useState<Barang[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { fetch('/api/barang').then(res => res.json()).then(setBarang); }, []);

  const filtered = barang.filter(b => b.kode.toLowerCase().includes(search.toLowerCase()) || b.nama.toLowerCase().includes(search.toLowerCase()));

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <PageLayout title="Pencarian Barang" subtitle="Cari produk dengan cepat" showBack>
      <Card padding={false}>
        <div className="p-6 border-b border-slate-200">
          <div className="relative max-w-xl">
            <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik kode atau nama barang..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>
        {search ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filtered.map((b) => (
                <Card key={b.kode}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{b.kode}</span>
                      <h3 className="font-semibold text-slate-900 mt-2">{b.nama}</h3>
                      <p className="text-lg font-bold text-emerald-600 mt-1">Rp {b.harga.toLocaleString('id-ID')}</p>
                    </div>
                    <Badge variant={b.stok < 10 ? 'danger' : b.stok < 50 ? 'warning' : 'success'}>Stok: {b.stok}</Badge>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  Tidak ada barang ditemukan untuk &quot;{search}&quot;
                </div>
              )}
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3">
              <p className="text-sm text-slate-500">Ditemukan {filtered.length} barang</p>
            </div>
          </>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg">Mulai ketik untuk mencari barang</p>
            <p className="text-sm mt-1">Cari berdasarkan kode atau nama barang</p>
          </div>
        )}
      </Card>
    </PageLayout>
  );
}
