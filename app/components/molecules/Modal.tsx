'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:rounded-xl shadow-lg sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg lg:text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
