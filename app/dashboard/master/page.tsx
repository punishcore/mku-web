'use client';

import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Input, Spinner, Badge } from '@/app/components';
import { Modal, Toast } from '@/app/components/molecules';
import { PageLayout, DataTable } from '@/app/components';
import { Barang } from '@/app/lib/types';

export default function MasterBarangPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [barang, setBarang] = useState<Barang[]>([]);
  const [form, setForm] = useState<Barang>({ kode: '', nama: '', harga: 0, stok: 0 });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { fetchBarang(); }, []);

  const fetchBarang = async () => {
    const res = await fetch('/api/barang');
    setBarang(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.kode.length < 3 || form.nama.length < 2) {
      setMessage({ text: 'Kode minimal 3 karakter, nama minimal 2 karakter', type: 'error' });
      return;
    }
    const res = await fetch('/api/barang', {
      method: editMode ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ text: editMode ? 'Barang berhasil diupdate' : 'Barang berhasil ditambah', type: 'success' });
      resetForm();
      fetchBarang();
    } else {
      setMessage({ text: data.message, type: 'error' });
    }
  };

  const handleEdit = (b: Barang) => {
    setForm(b);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (b: Barang) => {
    if (!confirm('Hapus barang ini?')) return;
    await fetch('/api/barang', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kode: b.kode }) });
    setMessage({ text: 'Barang berhasil dihapus', type: 'success' });
    fetchBarang();
  };

  const resetForm = () => {
    setForm({ kode: '', nama: '', harga: 0, stok: 0 });
    setEditMode(false);
    setShowForm(false);
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const columns = [
    { key: 'kode' as const, header: 'Kode', render: (b: Barang) => <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{b.kode}</span> },
    { key: 'nama' as const, header: 'Nama Barang', render: (b: Barang) => <span className="font-medium text-slate-900">{b.nama}</span> },
    { key: 'harga' as const, header: 'Harga', align: 'right' as const, render: (b: Barang) => `Rp ${b.harga.toLocaleString('id-ID')}` },
    { key: 'stok' as const, header: 'Stok', align: 'right' as const, render: (b: Barang) => <Badge variant={b.stok < 10 ? 'danger' : b.stok < 50 ? 'warning' : 'success'}>{b.stok}</Badge> },
    { key: 'actions' as const, header: 'Aksi', align: 'center' as const },
  ];

  return (
    <PageLayout
      title="Master Barang"
      subtitle="Kelola inventaris produk"
      showBack
      actions={
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Barang</span>
        </Button>
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

      <DataTable
        columns={columns}
        data={barang}
        keyField="kode"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Belum ada data barang"
        footer={<p className="text-sm text-slate-500">Total: {barang.length} barang</p>}
      />
    </PageLayout>
  );
}
