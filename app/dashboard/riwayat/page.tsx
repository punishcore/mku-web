'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner, Badge } from '@/app/components';
import { Card, SearchInput } from '@/app/components/molecules';
import { PageLayout, Struk } from '@/app/components';
import { Transaksi } from '@/app/lib/types';

export default function RiwayatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [selected, setSelected] = useState<Transaksi | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { fetch('/api/transaksi').then(res => res.json()).then(setTransaksi); }, []);

  const filtered = transaksi.filter(t => t.id_transaksi.toLowerCase().includes(search.toLowerCase()) || t.items.some(i => i.nama.toLowerCase().includes(search.toLowerCase())));

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <PageLayout title="Riwayat Transaksi" subtitle="Histori semua transaksi" showBack>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi..." />
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filtered.map((t) => (
                <div key={t.id_transaksi} onClick={() => setSelected(t)} className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selected?.id_transaksi === t.id_transaksi ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{t.id_transaksi}</p>
                      <p className="text-sm text-slate-500">{new Date(t.tanggal).toLocaleString('id-ID')}</p>
                      <p className="text-xs text-slate-400 mt-1">{t.items.length} item</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">Rp {t.total.toLocaleString('id-ID')}</p>
                      <Badge variant="success">Selesai</Badge>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="py-12 text-center text-slate-500">Tidak ada transaksi ditemukan</div>}
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">Menampilkan {filtered.length} dari {transaksi.length} transaksi</p>
            </div>
          </Card>
        </div>
        <div>
          <Card className="sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Detail Transaksi</h2>
            {selected ? (
              <Struk transaksi={selected} />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Pilih transaksi untuk melihat detail</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
