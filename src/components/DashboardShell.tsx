'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthenticatedUser } from '@/lib/queries';
import { i18n } from '@/lib/i18n';

const NAV_ITEMS = [
  { href: '/dashboard', label: i18n.dashboardLinks },
  { href: '/dashboard/analitik', label: i18n.analytics },
  { href: '/dashboard/formulir', label: i18n.forms },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useAuthenticatedUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="text-lg font-bold">
              {i18n.dashboard}
            </Link>

            {user?.username && (
              <Link
                href={`/u/${user.username}`}
                className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                target="_blank"
              >
                {i18n.viewPublicProfile}
              </Link>
            )}
          </div>

          <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {i18n.logout}
            </button>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
