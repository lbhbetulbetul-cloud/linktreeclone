import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Link Manager',
  description: 'Manage and share your links easily',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
