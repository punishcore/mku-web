import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200/60 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}
