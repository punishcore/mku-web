import { ReactNode } from 'react';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ title, subtitle, actions, children }: PageLayoutProps) {
  return (
    <div>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h1 className="text-2xl font-bold text-slate-900">{title}</h1>}
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
