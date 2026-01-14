import { Transaksi } from '@/app/lib/types';

interface StrukProps {
  transaksi: Transaksi;
}

export function Struk({ transaksi }: StrukProps) {
  return (
    <div className="font-mono text-sm text-slate-900 bg-slate-50 p-4 rounded-lg">
      <div className="text-center mb-3">
        <div className="font-bold text-lg">KASIR PRO</div>
        <div className="text-xs text-slate-500">Point of Sale System</div>
        <div className="text-xs mt-1">{new Date(transaksi.tanggal).toLocaleString('id-ID')}</div>
        <div className="text-xs">{transaksi.id_transaksi}</div>
      </div>
      <div className="border-t border-dashed border-slate-300 my-3" />
      {transaksi.items.map((item, i) => (
        <div key={i} className="flex justify-between text-xs mb-1">
          <span className="flex-1">{item.nama} x{item.jumlah}</span>
          <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
        </div>
      ))}
      <div className="border-t border-dashed border-slate-300 my-3" />
      <div className="flex justify-between text-xs"><span>Subtotal</span><span>Rp {transaksi.subtotal.toLocaleString('id-ID')}</span></div>
      <div className="flex justify-between text-xs"><span>Pajak</span><span>Rp {transaksi.pajak.toLocaleString('id-ID')}</span></div>
      <div className="flex justify-between text-xs"><span>Diskon</span><span>-Rp {transaksi.diskon.toLocaleString('id-ID')}</span></div>
      <div className="border-t border-dashed border-slate-300 my-3" />
      <div className="flex justify-between font-bold"><span>TOTAL</span><span>Rp {transaksi.total.toLocaleString('id-ID')}</span></div>
      <div className="text-center text-xs mt-3 text-slate-500">Terima Kasih</div>
    </div>
  );
}
