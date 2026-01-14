import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Barang } from '@/app/lib/types';

const dataPath = path.join(process.cwd(), 'app/data/barang.json');

async function readBarang(): Promise<Barang[]> {
  const data = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(data);
}

async function writeBarang(barang: Barang[]): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify(barang, null, 2));
}

export async function GET() {
  const barang = await readBarang();
  return NextResponse.json(barang);
}

export async function POST(request: NextRequest) {
  const newBarang: Barang = await request.json();
  const barangList = await readBarang();
  if (barangList.some(b => b.kode === newBarang.kode)) {
    return NextResponse.json({ success: false, message: 'Kode barang sudah ada' }, { status: 400 });
  }
  barangList.push(newBarang);
  await writeBarang(barangList);
  return NextResponse.json({ success: true, data: newBarang });
}

export async function PUT(request: NextRequest) {
  const updatedBarang: Barang = await request.json();
  const barangList = await readBarang();
  const index = barangList.findIndex(b => b.kode === updatedBarang.kode);
  if (index === -1) {
    return NextResponse.json({ success: false, message: 'Barang tidak ditemukan' }, { status: 404 });
  }
  barangList[index] = updatedBarang;
  await writeBarang(barangList);
  return NextResponse.json({ success: true, data: updatedBarang });
}

export async function DELETE(request: NextRequest) {
  const { kode } = await request.json();
  const barangList = await readBarang();
  const filtered = barangList.filter(b => b.kode !== kode);
  if (filtered.length === barangList.length) {
    return NextResponse.json({ success: false, message: 'Barang tidak ditemukan' }, { status: 404 });
  }
  await writeBarang(filtered);
  return NextResponse.json({ success: true });
}
