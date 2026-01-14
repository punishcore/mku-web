import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  valueColor?: string;
}

export function StatCard({ title, value, icon: Icon, iconBg = 'bg-blue-100', valueColor = 'text-slate-900' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-slate-700" />
        </div>
      </div>
    </div>
  );
}
