'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  Users,
  FileText,
  Settings,
  Link2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    naam: 'Dashboard',
    icoon: LayoutDashboard,
    href: '/',
  },
  {
    naam: 'Pipeline',
    icoon: Kanban,
    href: '/pipeline',
  },
  {
    naam: 'Contacten',
    icoon: Users,
    href: '/contacten',
  },
  {
    naam: 'Rapporten',
    icoon: TrendingUp,
    href: '/rapporten',
  },
  {
    naam: 'Documenten',
    icoon: FileText,
    href: '/documenten',
  },
  {
    naam: 'Integraties',
    icoon: Link2,
    href: '/integraties',
  },
  {
    naam: 'Instellingen',
    icoon: Settings,
    href: '/instellingen',
  },
];

export function Sidebar() {
  const [ingeklapt, setIngeklapt] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40',
        ingeklapt ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          {!ingeklapt && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-gray-900">Sales Pipeline</h1>
              <p className="text-xs text-gray-500">Beheer je verkopen</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActief = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-link',
                  isActief && 'sidebar-link-active',
                  ingeklapt && 'justify-center px-3'
                )}
                title={ingeklapt ? item.naam : undefined}
              >
                <item.icoon className={cn('w-5 h-5 flex-shrink-0', isActief && 'text-primary-600')} />
                {!ingeklapt && <span className="animate-fade-in">{item.naam}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button */}
        <button
          onClick={() => setIngeklapt(!ingeklapt)}
          className="flex items-center justify-center gap-2 px-4 py-4 border-t border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {ingeklapt ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Inklappen</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
