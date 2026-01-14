'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Plus, Minus, Trash2, CheckCircle, Printer } from 'lucide-react';
import { Button, Input, Spinner } from '@/app/components';
import { Card, Toast, Modal } from '@/app/components/molecules';
import { PageLayout, Struk } from '@/app/components';
import { Barang, TransaksiItem, Transaksi } from '@/app/lib/types';

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

  useEffect(() => { fetch('/api/barang').then(res => res.json()).then(setBarang); }, []);

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
    setKode('');
    setJumlah(1);
    setMessage({ text: '', type: '' });
  };

  const updateQty = (kode: string, newQty: number) => {
    const item = barang.find(b => b.kode === kode);
    if (!item || newQty < 1 || newQty > item.stok) return;
    setCart(cart.map(c => c.kode === kode ? { ...c, jumlah: newQty, subtotal: newQty * c.harga } : c));
  };

  const removeFromCart = (kode: string) => setCart(cart.filter(c => c.kode !== kode));

  const processTransaction = async () => {
    if (cart.length === 0) { setMessage({ text: 'Keranjang masih kosong', type: 'error' }); return; }
    const transaksi: Transaksi = { id_transaksi: `TRX${Date.now()}`, tanggal: new Date().toISOString(), items: cart, subtotal, pajak: pajakNominal, diskon: diskonNominal, total };
    const res = await fetch('/api/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transaksi) });
    const data = await res.json();
    if (data.success) {
      setStruk(transaksi);
      setCart([]);
      setDiskon(0);
      fetch('/api/barang').then(res => res.json()).then(setBarang);
    } else {
      setMessage({ text: data.message, type: 'error' });
    }
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
    <PageLayout title="Transaksi Baru" subtitle="Buat penjualan baru" showBack>
      {message.text && <Toast message={message.text} type={message.type as 'success' | 'error'} onClose={() => setMessage({ text: '', type: '' })} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Tambah Item</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Barang</label>
                <select value={kode} onChange={(e) => setKode(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">-- Pilih Barang --</option>
                  {barang.filter(b => b.stok > 0).map(b => <option key={b.kode} value={b.kode}>{b.nama} - Rp {b.harga.toLocaleString('id-ID')} (Stok: {b.stok})</option>)}
                </select>
              </div>
              <div className="w-28">
                <Input label="Jumlah" type="number" value={jumlah} onChange={(e) => setJumlah(parseInt(e.target.value) || 1)} min={1} className="text-center" />
              </div>
              <div className="flex items-end">
                <Button onClick={addToCart}><Plus className="w-5 h-5" />Tambah</Button>
              </div>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900">Keranjang ({cart.length} item)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Barang</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Harga</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Subtotal</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <tr key={item.kode}>
                      <td className="py-3 px-4"><p className="font-medium text-slate-900">{item.nama}</p><p className="text-xs text-slate-500">{item.kode}</p></td>
                      <td className="py-3 px-4 text-right text-slate-700">Rp {item.harga.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(item.kode, item.jumlah - 1)} className="w-8 h-8 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                          <span className="w-10 text-center font-medium">{item.jumlah}</span>
                          <button onClick={() => updateQty(item.kode, item.jumlah + 1)} className="w-8 h-8 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4"><button onClick={() => removeFromCart(item.kode)} className="text-red-600 hover:text-red-800 p-2"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                  {cart.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-slate-500">Keranjang masih kosong</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan Pembayaran</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-medium text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Pajak (%)</span>
                <input type="number" value={pajak} onChange={(e) => setPajak(parseFloat(e.target.value) || 0)} className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-right text-sm" min={0} />
              </div>
              <div className="flex justify-between text-slate-600"><span>Pajak</span><span>Rp {pajakNominal.toLocaleString('id-ID')}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Diskon (%)</span>
                <input type="number" value={diskon} onChange={(e) => setDiskon(parseFloat(e.target.value) || 0)} className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-right text-sm" min={0} max={100} />
              </div>
              <div className="flex justify-between text-slate-600"><span>Diskon</span><span className="text-red-600">-Rp {diskonNominal.toLocaleString('id-ID')}</span></div>
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-emerald-600">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            <Button variant="success" onClick={processTransaction} disabled={cart.length === 0} className="w-full mt-6" size="lg">
              <CheckCircle className="w-5 h-5" />Proses Pembayaran
            </Button>
          </Card>
        </div>
      </div>

      <Modal isOpen={!!struk} onClose={() => setStruk(null)} title="Struk Pembayaran">
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
