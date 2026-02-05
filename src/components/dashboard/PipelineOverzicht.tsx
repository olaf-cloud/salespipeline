'use client';

import { DashboardStats, DealStatus } from '@/types';
import { formatBedrag, getStatusNaam, cn } from '@/lib/utils';

interface PipelineOverzichtProps {
  stats: DashboardStats;
}

const statusKleuren: Record<DealStatus, string> = {
  lead: 'bg-gray-500',
  contact: 'bg-blue-500',
  offerte: 'bg-purple-500',
  onderhandeling: 'bg-amber-500',
  gewonnen: 'bg-green-500',
  verloren: 'bg-red-500',
};

export function PipelineOverzicht({ stats }: PipelineOverzichtProps) {
  const statussen: DealStatus[] = ['lead', 'contact', 'offerte', 'onderhandeling', 'gewonnen', 'verloren'];
  const maxDeals = Math.max(...Object.values(stats.dealsPerStatus), 1);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-gray-900">Pipeline overzicht</h3>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {statussen.map((status) => {
            const aantalDeals = stats.dealsPerStatus[status];
            const waarde = stats.waardePerStatus[status];
            const percentage = (aantalDeals / maxDeals) * 100;

            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{getStatusNaam(status)}</span>
                  <span className="text-gray-500">
                    {aantalDeals} deal{aantalDeals !== 1 && 's'} - {formatBedrag(waarde)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', statusKleuren[status])}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
