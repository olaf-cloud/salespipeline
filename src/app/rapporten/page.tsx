'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Target,
  PieChart,
  BarChart3,
  Calendar,
  Download,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/dashboard/StatCard';
import { usePipelineStore } from '@/store/pipelineStore';
import { formatBedrag, getStatusNaam, cn } from '@/lib/utils';
import { DealStatus } from '@/types';

type Periode = 'week' | 'maand' | 'kwartaal' | 'jaar' | 'alles';

const statusKleuren: Record<DealStatus, string> = {
  lead: '#6b7280',
  contact: '#3b82f6',
  offerte: '#8b5cf6',
  onderhandeling: '#f59e0b',
  gewonnen: '#22c55e',
  verloren: '#ef4444',
};

export default function RapportenPage() {
  const { deals, getDashboardStats } = usePipelineStore();
  const [periode, setPeriode] = useState<Periode>('maand');

  const stats = getDashboardStats();

  const periodeOpties = [
    { value: 'week', label: 'Deze week' },
    { value: 'maand', label: 'Deze maand' },
    { value: 'kwartaal', label: 'Dit kwartaal' },
    { value: 'jaar', label: 'Dit jaar' },
    { value: 'alles', label: 'Alle tijd' },
  ];

  // Bereken conversieratio
  const totaalAfgeslotenDeals = stats.dealsPerStatus.gewonnen + stats.dealsPerStatus.verloren;
  const conversieRatio =
    totaalAfgeslotenDeals > 0
      ? ((stats.dealsPerStatus.gewonnen / totaalAfgeslotenDeals) * 100).toFixed(1)
      : 0;

  // Gemiddelde dealwaarde
  const gemiddeldeDealwaarde = stats.totaalDeals > 0 ? stats.totaleWaarde / stats.totaalDeals : 0;

  // Status voor grafiek
  const statussen: DealStatus[] = ['lead', 'contact', 'offerte', 'onderhandeling', 'gewonnen', 'verloren'];
  const maxWaarde = Math.max(...Object.values(stats.waardePerStatus), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rapporten</h1>
              <p className="text-gray-500 mt-1">
                Analyseer je verkoopprestaties en trends
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={periode}
                onChange={(e) => setPeriode(e.target.value as Periode)}
                options={periodeOpties}
              />
              <Button variant="secondary">
                <Download className="w-4 h-4" />
                Exporteren
              </Button>
            </div>
          </div>

          {/* KPI's */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              titel="Totale pipelinewaarde"
              waarde={formatBedrag(stats.totaleWaarde)}
              icoon={<Euro className="w-6 h-6" />}
              kleur="primary"
            />
            <StatCard
              titel="Gewonnen waarde"
              waarde={formatBedrag(stats.gewonnenWaarde)}
              icoon={<TrendingUp className="w-6 h-6" />}
              kleur="success"
            />
            <StatCard
              titel="Conversieratio"
              waarde={`${conversieRatio}%`}
              icoon={<Target className="w-6 h-6" />}
              kleur="warning"
            />
            <StatCard
              titel="Gem. dealwaarde"
              waarde={formatBedrag(gemiddeldeDealwaarde)}
              icoon={<BarChart3 className="w-6 h-6" />}
              kleur="default"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Waarde per status */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">Waarde per status</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {statussen.map((status) => {
                    const waarde = stats.waardePerStatus[status];
                    const percentage = (waarde / maxWaarde) * 100;
                    const aantal = stats.dealsPerStatus[status];

                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {getStatusNaam(status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {aantal} deals - {formatBedrag(waarde)}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: statusKleuren[status],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Verdeling cirkeldiagram */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">Deal verdeling</h3>
              </div>
              <div className="card-body">
                <div className="flex items-center justify-center py-4">
                  {/* Simpele cirkel grafiek */}
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {(() => {
                        let cumulatief = 0;
                        return statussen.map((status) => {
                          const percentage =
                            stats.totaalDeals > 0
                              ? (stats.dealsPerStatus[status] / stats.totaalDeals) * 100
                              : 0;
                          const strokeDasharray = `${percentage} ${100 - percentage}`;
                          const strokeDashoffset = -cumulatief;
                          cumulatief += percentage;

                          return (
                            <circle
                              key={status}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={statusKleuren[status]}
                              strokeWidth="20"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              pathLength="100"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">{stats.totaalDeals}</p>
                        <p className="text-sm text-gray-500">deals</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legenda */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statussen.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: statusKleuren[status] }}
                      />
                      <span className="text-sm text-gray-600">
                        {getStatusNaam(status)} ({stats.dealsPerStatus[status]})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top deals */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Top 5 deals op waarde</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[...deals]
                .sort((a, b) => b.waarde - a.waarde)
                .slice(0, 5)
                .map((deal, index) => (
                  <div
                    key={deal.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{deal.titel}</p>
                        <p className="text-sm text-gray-500">
                          {deal.contact.bedrijf || deal.contact.naam}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatBedrag(deal.waarde)}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          deal.status === 'gewonnen'
                            ? 'bg-green-100 text-green-700'
                            : deal.status === 'verloren'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {getStatusNaam(deal.status)}
                      </span>
                    </div>
                  </div>
                ))}
              {deals.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto opacity-50 mb-3" />
                  <p>Nog geen deals om te analyseren</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
