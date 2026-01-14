'use client';

import Link from 'next/link';
import { useAuth } from '@/app/lib/AuthContext';
import { Calculator, LogOut, ChevronLeft } from 'lucide-react';
import { Button } from '../atoms';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, showBack = false, backHref = '/dashboard', actions }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showBack ? (
              <Link href={backHref} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Calculator className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {actions}
            {!showBack && user && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.nama}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.nama.charAt(0)}
                </div>
                <Button variant="ghost" onClick={logout} className="text-red-600 hover:bg-red-50">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
