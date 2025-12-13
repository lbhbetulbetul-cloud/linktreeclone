import { ReactNode } from 'react';
import { DashboardProvider } from '@/components/providers/DashboardProvider';
import { DashboardShell } from '@/components/DashboardShell';

export const metadata = {
  title: 'Dasbor - Link Manager',
  description: 'Kelola tautan Anda',
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
