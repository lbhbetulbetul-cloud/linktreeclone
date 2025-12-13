import { ReactNode } from 'react';
import { DashboardProvider } from '@/components/providers/DashboardProvider';

export const metadata = {
  title: 'Dashboard - Link Manager',
  description: 'Manage your links',
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
