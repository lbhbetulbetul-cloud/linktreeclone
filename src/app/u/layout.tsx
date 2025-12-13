import { ReactNode } from 'react';
import { PublicProvider } from '@/components/providers/PublicProvider';

export const metadata = {
  title: 'Public Profile - Link Manager',
  description: 'View user profile',
};

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PublicProvider>{children}</PublicProvider>;
}
