'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { HealthBadge } from './HealthBadge';

const publicLinks = [
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            TaskFlow
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className={
                  pathname === '/dashboard'
                    ? 'font-medium text-indigo-600'
                    : 'text-zinc-600 hover:text-zinc-900'
                }
              >
                Dashboard
              </Link>
            ) : (
              publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    pathname === link.href
                      ? 'font-medium text-indigo-600'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }
                >
                  {link.label}
                </Link>
              ))
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <HealthBadge />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-zinc-600 sm:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
