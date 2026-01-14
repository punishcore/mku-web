'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button, Input, Spinner, Badge } from '@/app/components';
import { Modal, Toast } from '@/app/components/molecules';
import { PageLayout, DataTable } from '@/app/components';
import { Barang } from '@/app/lib/types';
import { storage } from '@/app/lib/storage';

export default function MasterBarangPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [barang, setBarang] = useState<Barang[]>([]);
  const [form, setForm] = useState<Barang>({ kode: '', nama: '', harga: 0, stok: 0 });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [showForm, setShowForm] = useState(false);

  const loadBarang = useCallback(() => setBarang(storage.getBarang()), []);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { loadBarang(); }, [loadBarang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.kode.length < 3 || form.nama.length < 2) {
      setMessage({ text: 'Kode minimal 3 karakter, nama minimal 2 karakter', type: 'error' });
      return;
    }
    const list = storage.getBarang();
    if (editMode) {
      const idx = list.findIndex(b => b.kode === form.kode);
      if (idx !== -1) list[idx] = form;
      setMessage({ text: 'Barang berhasil diupdate', type: 'success' });
    } else {
      if (list.some(b => b.kode === form.kode)) {
        setMessage({ text: 'Kode barang sudah ada', type: 'error' });
        return;
      }
      list.push(form);
      setMessage({ text: 'Barang berhasil ditambah', type: 'success' });
    }
    storage.setBarang(list);
    resetForm();
    loadBarang();
  };

  const handleEdit = (b: Barang) => { setForm(b); setEditMode(true); setShowForm(true); };

  const handleDelete = (b: Barang) => {
    if (!confirm('Hapus barang ini?')) return;
    const list = storage.getBarang().filter(x => x.kode !== b.kode);
    storage.setBarang(list);
    setMessage({ text: 'Barang berhasil dihapus', type: 'success' });
    loadBarang();
  };

  const resetForm = () => { setForm({ kode: '', nama: '', harga: 0, stok: 0 }); setEditMode(false); setShowForm(false); };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const columns = [
    { key: 'kode' as const, header: 'Kode', render: (b: Barang) => <span className="font-mono text-xs lg:text-sm bg-slate-100 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded">{b.kode}</span> },
    { key: 'nama' as const, header: 'Nama', render: (b: Barang) => <span className="font-medium text-slate-900 text-sm lg:text-base">{b.nama}</span> },
    { key: 'harga' as const, header: 'Harga', align: 'right' as const, render: (b: Barang) => <span className="text-xs lg:text-sm">Rp {b.harga.toLocaleString('id-ID')}</span> },
    { key: 'stok' as const, header: 'Stok', align: 'right' as const, render: (b: Barang) => <Badge variant={b.stok < 10 ? 'danger' : b.stok < 50 ? 'warning' : 'success'}>{b.stok}</Badge> },
    { key: 'actions' as const, header: '', align: 'center' as const },
  ];

  return (
    <PageLayout title="Master Barang" subtitle="Kelola inventaris produk"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={storage.downloadBarangJSON} className="hidden sm:flex"><Download className="w-4 h-4" />Export</Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="w-4 h-4" /><span className="hidden sm:inline">Tambah</span></Button>
        </div>
      }
    >
      {message.text && <Toast message={message.text} type={message.type as 'success' | 'error'} onClose={() => setMessage({ text: '', type: '' })} />}
      
      <Modal isOpen={showForm} onClose={resetForm} title={editMode ? 'Edit Barang' : 'Tambah Barang Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Kode Barang" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })} disabled={editMode} placeholder="Contoh: BRG001" required />
          <Input label="Nama Barang" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama produk" required />
          <Input label="Harga (Rp)" type="number" value={form.harga || ''} onChange={(e) => setForm({ ...form, harga: parseFloat(e.target.value) || 0 })} placeholder="0" required min={0} />
          <Input label="Stok" type="number" value={form.stok || ''} onChange={(e) => setForm({ ...form, stok: parseInt(e.target.value) || 0 })} placeholder="0" required min={0} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Batal</Button>
            <Button type="submit" className="flex-1">{editMode ? 'Update' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <DataTable columns={columns} data={barang} keyField="kode" onEdit={handleEdit} onDelete={handleDelete} emptyMessage="Belum ada data barang" footer={<p className="text-xs lg:text-sm text-slate-500">Total: {barang.length} barang</p>} />
    </PageLayout>
  );
}
