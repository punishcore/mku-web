import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Transaksi, Barang } from '@/app/lib/types';

const csvPath = path.join(process.cwd(), 'app/data/transaksi.csv');
const barangPath = path.join(process.cwd(), 'app/data/barang.json');

async function readTransaksi(): Promise<Transaksi[]> {
  const data = await fs.readFile(csvPath, 'utf-8');
  const lines = data.trim().split('\n').slice(1);
  return lines.filter(line => line.trim()).map(line => {
    const [id_transaksi, tanggal, items, subtotal, pajak, diskon, total] = line.split(',');
    return {
      id_transaksi,
      tanggal,
      items: JSON.parse(decodeURIComponent(items)),
      subtotal: parseFloat(subtotal),
      pajak: parseFloat(pajak),
      diskon: parseFloat(diskon),
      total: parseFloat(total),
    };
  });
}

async function appendTransaksi(transaksi: Transaksi): Promise<void> {
  const itemsEncoded = encodeURIComponent(JSON.stringify(transaksi.items));
  const line = `${transaksi.id_transaksi},${transaksi.tanggal},${itemsEncoded},${transaksi.subtotal},${transaksi.pajak},${transaksi.diskon},${transaksi.total}\n`;
  await fs.appendFile(csvPath, line);
}

async function readBarang(): Promise<Barang[]> {
  const data = await fs.readFile(barangPath, 'utf-8');
  return JSON.parse(data);
}

async function writeBarang(barang: Barang[]): Promise<void> {
  await fs.writeFile(barangPath, JSON.stringify(barang, null, 2));
}

export async function GET() {
  const transaksi = await readTransaksi();
  return NextResponse.json(transaksi);
}

export async function POST(request: NextRequest) {
  const transaksi: Transaksi = await request.json();
  const barangList = await readBarang();
  
  for (const item of transaksi.items) {
    const barang = barangList.find(b => b.kode === item.kode);
    if (!barang) {
      return NextResponse.json({ success: false, message: `Barang ${item.kode} tidak ditemukan` }, { status: 400 });
    }
    if (barang.stok < item.jumlah) {
      return NextResponse.json({ success: false, message: `Stok ${item.nama} tidak cukup` }, { status: 400 });
    }
  }
  
  for (const item of transaksi.items) {
    const barang = barangList.find(b => b.kode === item.kode);
    if (barang) barang.stok -= item.jumlah;
  }
  
  await writeBarang(barangList);
  await appendTransaksi(transaksi);
  return NextResponse.json({ success: true, data: transaksi });
}
