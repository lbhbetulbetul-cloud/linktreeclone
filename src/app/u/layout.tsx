import { ReactNode } from 'react';
import { PublicProvider } from '@/components/providers/PublicProvider';

export const metadata = {
  title: 'Profil Publik - Link Manager',
  description: 'Lihat profil pengguna',
};

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PublicProvider>{children}</PublicProvider>;
}
