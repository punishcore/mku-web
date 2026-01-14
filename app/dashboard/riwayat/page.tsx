'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Spinner, Badge, Button } from '@/app/components';
import { Card, SearchInput, Modal } from '@/app/components/molecules';
import { PageLayout, Struk } from '@/app/components';
import { Transaksi } from '@/app/lib/types';
import { storage } from '@/app/lib/storage';

export default function RiwayatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [selected, setSelected] = useState<Transaksi | null>(null);
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { setTransaksi(storage.getTransaksi()); }, []);

  const filtered = transaksi.filter(t => t.id_transaksi.toLowerCase().includes(search.toLowerCase()) || t.items.some(i => i.nama.toLowerCase().includes(search.toLowerCase())));

  const handleSelect = (t: Transaksi) => {
    setSelected(t);
    setShowDetail(true);
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <PageLayout title="Riwayat" subtitle="Histori transaksi"
      actions={<Button variant="outline" size="sm" onClick={storage.downloadTransaksiCSV}><Download className="w-4 h-4" /><span className="hidden sm:inline">Export</span></Button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="p-3 lg:p-4 border-b border-slate-200 bg-slate-50">
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi..." />
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] lg:max-h-[600px] overflow-y-auto">
              {filtered.map((t) => (
                <div key={t.id_transaksi} onClick={() => handleSelect(t)} className={`p-3 lg:p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selected?.id_transaksi === t.id_transaksi ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm lg:text-base">{t.id_transaksi}</p>
                      <p className="text-xs lg:text-sm text-slate-500">{new Date(t.tanggal).toLocaleString('id-ID')}</p>
                      <p className="text-[10px] lg:text-xs text-slate-400 mt-1">{t.items.length} item</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm lg:text-base">Rp {t.total.toLocaleString('id-ID')}</p>
                      <Badge variant="success">Selesai</Badge>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="py-8 lg:py-12 text-center text-slate-500 text-sm">Tidak ada transaksi</div>}
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-3 lg:px-4 py-2 lg:py-3">
              <p className="text-xs lg:text-sm text-slate-500">{filtered.length} dari {transaksi.length} transaksi</p>
            </div>
          </Card>
        </div>

        {/* Desktop detail */}
        <div className="hidden lg:block">
          <Card className="sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Detail</h2>
            {selected ? <Struk transaksi={selected} /> : <div className="text-center py-8 text-slate-500 text-sm">Pilih transaksi</div>}
          </Card>
        </div>
      </div>

      {/* Mobile detail modal */}
      <Modal isOpen={showDetail && !!selected} onClose={() => setShowDetail(false)} title="Detail Transaksi">
        {selected && <Struk transaksi={selected} />}
      </Modal>
    </PageLayout>
  );
}
