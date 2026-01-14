'use client';

import { useAuth } from '../lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, ClipboardList, Search, LogOut, LayoutDashboard, User, Menu, X } from 'lucide-react';
import { Spinner } from '../components';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/master', label: 'Master Barang', icon: Package },
  { href: '/dashboard/transaksi', label: 'Transaksi', icon: ShoppingCart },
  { href: '/dashboard/riwayat', label: 'Riwayat', icon: ClipboardList },
  { href: '/dashboard/pencarian', label: 'Pencarian', icon: Search },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return null;

  const currentPage = menuItems.find(item => item.href === pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 lg:p-6 border-b border-slate-700 flex items-center justify-between">
          <h1 className="text-lg lg:text-xl font-bold">Toko Jaya Abadi</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${pathname === item.href ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 lg:p-4 border-t border-slate-700">
          <button onClick={() => { logout(); router.push('/login'); }} className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 w-full text-slate-300 hover:bg-slate-800 rounded-lg transition-colors text-sm lg:text-base">
            <LogOut className="w-5 h-5" />Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-slate-900">{currentPage}</h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="text-xs lg:text-sm text-slate-600 hidden sm:block">{user.username}</span>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
