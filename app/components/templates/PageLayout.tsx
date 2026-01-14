import { ReactNode } from 'react';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return <div>{children}</div>;
}
