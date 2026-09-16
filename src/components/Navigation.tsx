'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn, getImageUrl } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, userRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigationLinks = {
    member: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/spaces', label: 'Jelajah Ruangan' },
      { href: '/reservasi', label: 'Reservasiku' },
      { href: '/history', label: 'Riwayat' },
    ],
    admin_space: [
      { href: '/admin/dashboard', label: 'Overview' },
      { href: '/admin/spaces', label: 'Kelola Space' },
      { href: '/admin/members', label: 'Members' },
      { href: '/admin/promo', label: 'Voucher Promo' },
      { href: '/admin/reservasi', label: 'Data Reservasi' },
      { href: '/admin/reports', label: 'Laporan Financial' },
    ],
  };

  const links = isAuthenticated && userRole ? navigationLinks[userRole] : [];

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-[2px] shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <span className="text-white font-black font-heading text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-emerald-200">
                S
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold font-heading text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Space<span className="text-indigo-600 dark:text-indigo-400">Sync</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
              Coworking Ecosystem
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 relative',
                  isActive
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons / User Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="hidden sm:flex items-center gap-3 p-1.5 pr-3 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden flex-shrink-0 relative">
                  <span>
                    {user?.nama_member?.charAt(0) || user?.nama_coworking?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                  {(user?.foto_url || user?.foto) && (
                    <img
                      src={getImageUrl(user.foto_url || user.foto, 'avatar')}
                      alt={user?.nama_member || user?.nama_coworking || 'User'}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {user?.nama_member || user?.nama_coworking}
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded-full">
                    {userRole === 'member' ? 'Member Pro' : 'Space Owner'}
                  </span>
                </div>
              </Link>

              <UserMenu onLogout={handleLogout} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                Daftar Gratis
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-4 shadow-xl">
          <nav className="flex flex-col gap-1.5 mb-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2.5 text-sm font-semibold rounded-xl transition',
                  pathname === link.href
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full py-2.5 px-4 text-left text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl hover:bg-rose-100 transition"
            >
              Keluar / Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function UserMenu({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-300"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition"
            >
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Pengaturan Profil
            </Link>
            <Link
              href="/reservasi"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition"
            >
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Status Reservasi
            </Link>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Keluar Akun
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Sidebar({ items }: { items: Array<{ href: string; label: string; icon?: React.ReactNode }> }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-50/80 dark:bg-slate-900/80 border-r border-slate-200/60 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300',
              pathname === item.href
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            {item.icon && <span className="w-5 h-5">{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

