'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  titel: string;
  waarde: string | number;
  icoon: React.ReactNode;
  verandering?: number;
  veranderingLabel?: string;
  kleur?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  titel,
  waarde,
  icoon,
  verandering,
  veranderingLabel,
  kleur = 'default',
}: StatCardProps) {
  const kleurClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', kleurClasses[kleur])}>
          {icoon}
        </div>
        {verandering !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              verandering >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {verandering >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(verandering)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="stat-value">{waarde}</p>
        <p className="stat-label">{titel}</p>
        {veranderingLabel && <p className="text-xs text-gray-400 mt-1">{veranderingLabel}</p>}
      </div>
    </div>
  );
}
