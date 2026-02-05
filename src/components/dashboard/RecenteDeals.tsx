'use client';

import { ArrowRight, Building2, Euro } from 'lucide-react';
import Link from 'next/link';
import { Deal } from '@/types';
import { formatBedrag, formatRelatieveDatum, getStatusNaam, getStatusKleur, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface RecenteDealsProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export function RecenteDeals({ deals, onDealClick }: RecenteDealsProps) {
  const recenteDeals = [...deals]
    .sort((a, b) => new Date(b.bijgewerkt).getTime() - new Date(a.bijgewerkt).getTime())
    .slice(0, 5);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recente deals</h3>
        <Link
          href="/pipeline"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          Bekijk alle <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {recenteDeals.length > 0 ? (
          recenteDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onDealClick(deal)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-gray-900 truncate">{deal.titel}</p>
                    <Badge className={cn(getStatusKleur(deal.status), 'text-xs')}>
                      {getStatusNaam(deal.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {deal.contact.bedrijf || deal.contact.naam}
                    </span>
                    <span>{formatRelatieveDatum(deal.bijgewerkt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-lg font-semibold text-gray-900 ml-4">
                  <Euro className="w-4 h-4 text-gray-400" />
                  {formatBedrag(deal.waarde).replace('€', '').trim()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>Nog geen deals</p>
            <Link
              href="/pipeline"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
            >
              Maak je eerste deal aan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
