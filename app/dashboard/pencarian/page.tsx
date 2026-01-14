'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Spinner, Badge } from '@/app/components';
import { Card } from '@/app/components/molecules';
import { PageLayout } from '@/app/components';
import { Barang } from '@/app/lib/types';
import { storage } from '@/app/lib/storage';

export default function PencarianPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [barang, setBarang] = useState<Barang[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { setBarang(storage.getBarang()); }, []);

  const filtered = barang.filter(b => b.kode.toLowerCase().includes(search.toLowerCase()) || b.nama.toLowerCase().includes(search.toLowerCase()));

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <PageLayout title="Pencarian" subtitle="Cari produk">
      <Card padding={false}>
        <div className="p-4 lg:p-6 border-b border-slate-200">
          <div className="relative max-w-xl">
            <Search className="w-5 h-5 lg:w-6 lg:h-6 absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ketik kode atau nama..." className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 text-base lg:text-lg border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" autoFocus />
          </div>
        </div>
        {search ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-4 lg:p-6">
              {filtered.map((b) => (
                <Card key={b.kode} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[10px] lg:text-xs bg-slate-100 px-1.5 py-0.5 rounded">{b.kode}</span>
                      <h3 className="font-semibold text-slate-900 text-sm lg:text-base mt-2 truncate">{b.nama}</h3>
                      <p className="text-base lg:text-lg font-bold text-emerald-600 mt-1">Rp {b.harga.toLocaleString('id-ID')}</p>
                    </div>
                    <Badge variant={b.stok < 10 ? 'danger' : b.stok < 50 ? 'warning' : 'success'}>{b.stok}</Badge>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-8 lg:py-12 text-center text-slate-500">
                  <Search className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">Tidak ditemukan &quot;{search}&quot;</p>
                </div>
              )}
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 lg:px-6 py-2 lg:py-3">
              <p className="text-xs lg:text-sm text-slate-500">{filtered.length} barang</p>
            </div>
          </>
        ) : (
          <div className="py-12 lg:py-16 text-center text-slate-500">
            <Search className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 text-slate-300" />
            <p className="text-base lg:text-lg">Mulai ketik untuk mencari</p>
            <p className="text-xs lg:text-sm mt-1">Cari berdasarkan kode atau nama</p>
          </div>
        )}
      </Card>
    </PageLayout>
  );
}
