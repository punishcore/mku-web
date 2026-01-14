'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Plus, Minus, Trash2, CheckCircle, Printer } from 'lucide-react';
import { Button, Input, Spinner } from '@/app/components';
import { Card, Toast, Modal } from '@/app/components/molecules';
import { PageLayout, Struk } from '@/app/components';
import { Barang, TransaksiItem, Transaksi } from '@/app/lib/types';
import { storage } from '@/app/lib/storage';

export default function TransaksiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [barang, setBarang] = useState<Barang[]>([]);
  const [cart, setCart] = useState<TransaksiItem[]>([]);
  const [kode, setKode] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [diskon, setDiskon] = useState(0);
  const [pajak, setPajak] = useState(10);
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [struk, setStruk] = useState<Transaksi | null>(null);
  const strukRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { setBarang(storage.getBarang()); }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const pajakNominal = subtotal * (pajak / 100);
  const diskonNominal = subtotal * (diskon / 100);
  const total = subtotal + pajakNominal - diskonNominal;

  const addToCart = () => {
    const item = barang.find(b => b.kode === kode);
    if (!item) { setMessage({ text: 'Pilih barang terlebih dahulu', type: 'error' }); return; }
    if (item.stok < jumlah) { setMessage({ text: 'Stok tidak mencukupi', type: 'error' }); return; }
    const existing = cart.find(c => c.kode === kode);
    if (existing) {
      if (item.stok < existing.jumlah + jumlah) { setMessage({ text: 'Stok tidak mencukupi', type: 'error' }); return; }
      setCart(cart.map(c => c.kode === kode ? { ...c, jumlah: c.jumlah + jumlah, subtotal: (c.jumlah + jumlah) * c.harga } : c));
    } else {
      setCart([...cart, { kode: item.kode, nama: item.nama, harga: item.harga, jumlah, subtotal: item.harga * jumlah }]);
    }
    setKode(''); setJumlah(1); setMessage({ text: '', type: '' });
  };

  const updateQty = (kode: string, newQty: number) => {
    const item = barang.find(b => b.kode === kode);
    if (!item || newQty < 1 || newQty > item.stok) return;
    setCart(cart.map(c => c.kode === kode ? { ...c, jumlah: newQty, subtotal: newQty * c.harga } : c));
  };

  const removeFromCart = (kode: string) => setCart(cart.filter(c => c.kode !== kode));

  const processTransaction = () => {
    if (cart.length === 0) { setMessage({ text: 'Keranjang masih kosong', type: 'error' }); return; }
    const now = Date.now();
    const transaksi: Transaksi = { id_transaksi: `TRX${now}`, tanggal: new Date(now).toISOString(), items: cart, subtotal, pajak: pajakNominal, diskon: diskonNominal, total };
    const list = storage.getBarang();
    cart.forEach(item => { const b = list.find(x => x.kode === item.kode); if (b) b.stok -= item.jumlah; });
    storage.setBarang(list);
    storage.addTransaksi(transaksi);
    setStruk(transaksi); setCart([]); setDiskon(0); setBarang(storage.getBarang());
  };

  const printStruk = () => {
    if (strukRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Struk</title><style>body{font-family:'Courier New',monospace;font-size:12px;width:280px;margin:20px auto;}</style></head><body>`);
        printWindow.document.write(strukRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <PageLayout title="Transaksi Baru" subtitle="Buat penjualan baru">
      {message.text && <Toast message={message.text} type={message.type as 'success' | 'error'} onClose={() => setMessage({ text: '', type: '' })} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <Card className="p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Tambah Item</h2>
            <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:flex-wrap">
              <div className="flex-1 lg:min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Barang</label>
                <select value={kode} onChange={(e) => setKode(e.target.value)} className="w-full px-3 lg:px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">-- Pilih Barang --</option>
                  {barang.filter(b => b.stok > 0).map(b => <option key={b.kode} value={b.kode}>{b.nama} - Rp {b.harga.toLocaleString('id-ID')} ({b.stok})</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="w-20 lg:w-28">
                  <Input label="Jumlah" type="number" value={jumlah} onChange={(e) => setJumlah(parseInt(e.target.value) || 1)} min={1} size="sm" />
                </div>
                <div className="flex items-end">
                  <Button onClick={addToCart} size="sm"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Tambah</span></Button>
                </div>
              </div>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-3 lg:p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900 text-sm lg:text-base">Keranjang ({cart.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2 lg:py-3 px-3 lg:px-4 text-[10px] lg:text-xs font-semibold text-slate-500 uppercase">Barang</th>
                    <th className="text-right py-2 lg:py-3 px-2 lg:px-4 text-[10px] lg:text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Harga</th>
                    <th className="text-center py-2 lg:py-3 px-2 lg:px-4 text-[10px] lg:text-xs font-semibold text-slate-500 uppercase">Qty</th>
                    <th className="text-right py-2 lg:py-3 px-2 lg:px-4 text-[10px] lg:text-xs font-semibold text-slate-500 uppercase">Subtotal</th>
                    <th className="py-2 lg:py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <tr key={item.kode}>
                      <td className="py-2 lg:py-3 px-3 lg:px-4">
                        <p className="font-medium text-slate-900 text-sm">{item.nama}</p>
                        <p className="text-xs text-slate-500 sm:hidden">Rp {item.harga.toLocaleString('id-ID')}</p>
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-4 text-right text-slate-700 text-sm hidden sm:table-cell">Rp {item.harga.toLocaleString('id-ID')}</td>
                      <td className="py-2 lg:py-3 px-2 lg:px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(item.kode, item.jumlah - 1)} className="w-6 h-6 lg:w-8 lg:h-8 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center"><Minus className="w-3 h-3 lg:w-4 lg:h-4" /></button>
                          <span className="w-6 lg:w-10 text-center font-medium text-sm">{item.jumlah}</span>
                          <button onClick={() => updateQty(item.kode, item.jumlah + 1)} className="w-6 h-6 lg:w-8 lg:h-8 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center"><Plus className="w-3 h-3 lg:w-4 lg:h-4" /></button>
                        </div>
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold text-slate-900 text-xs lg:text-sm">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                      <td className="py-2 lg:py-3 px-2"><button onClick={() => removeFromCart(item.kode)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                  {cart.length === 0 && <tr><td colSpan={5} className="py-8 lg:py-12 text-center text-slate-500 text-sm">Keranjang kosong</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card className="lg:sticky lg:top-24 p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Pembayaran</h2>
            <div className="space-y-2 lg:space-y-3 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-medium text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Pajak (%)</span>
                <input type="number" value={pajak} onChange={(e) => setPajak(parseFloat(e.target.value) || 0)} className="w-16 lg:w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-right text-sm" min={0} />
              </div>
              <div className="flex justify-between text-slate-600"><span>Pajak</span><span>Rp {pajakNominal.toLocaleString('id-ID')}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Diskon (%)</span>
                <input type="number" value={diskon} onChange={(e) => setDiskon(parseFloat(e.target.value) || 0)} className="w-16 lg:w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-right text-sm" min={0} max={100} />
              </div>
              <div className="flex justify-between text-slate-600"><span>Diskon</span><span className="text-red-600">-Rp {diskonNominal.toLocaleString('id-ID')}</span></div>
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl lg:text-2xl font-bold text-emerald-600">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            <Button variant="success" onClick={processTransaction} disabled={cart.length === 0} className="w-full mt-4 lg:mt-6" size="lg">
              <CheckCircle className="w-5 h-5" />Proses
            </Button>
          </Card>
        </div>
      </div>

      <Modal isOpen={!!struk} onClose={() => setStruk(null)} title="Struk">
        {struk && (
          <>
            <div ref={strukRef}><Struk transaksi={struk} /></div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setStruk(null)} className="flex-1">Tutup</Button>
              <Button onClick={printStruk} className="flex-1"><Printer className="w-4 h-4" />Cetak</Button>
            </div>
          </>
        )}
      </Modal>
    </PageLayout>
  );
}
