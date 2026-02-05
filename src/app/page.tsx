'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Euro,
  Target,
  Users,
  Calendar,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecenteDeals } from '@/components/dashboard/RecenteDeals';
import { PipelineOverzicht } from '@/components/dashboard/PipelineOverzicht';
import { DealModal } from '@/components/deals/DealModal';
import { NieuweDealModal } from '@/components/deals/NieuweDealModal';
import { Button } from '@/components/ui/Button';
import { usePipelineStore } from '@/store/pipelineStore';
import { formatBedrag } from '@/lib/utils';

export default function DashboardPage() {
  const { deals, getDashboardStats, selecteerDeal, geselecteerdeDeal } = usePipelineStore();
  const [nieuweDealOpen, setNieuweDealOpen] = useState(false);

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welkom terug! Hier is een overzicht van je sales pipeline.</p>
            </div>
            <Button onClick={() => setNieuweDealOpen(true)}>
              <Plus className="w-4 h-4" />
              Nieuwe deal
            </Button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              titel="Totale waarde"
              waarde={formatBedrag(stats.totaleWaarde)}
              icoon={<Euro className="w-6 h-6" />}
              kleur="primary"
            />
            <StatCard
              titel="Open deals"
              waarde={stats.openDeals}
              icoon={<Target className="w-6 h-6" />}
              kleur="warning"
            />
            <StatCard
              titel="Gewonnen waarde"
              waarde={formatBedrag(stats.gewonnenWaarde)}
              icoon={<TrendingUp className="w-6 h-6" />}
              kleur="success"
            />
            <StatCard
              titel="Verwachte omzet"
              waarde={formatBedrag(stats.verwachteOmzet)}
              icoon={<ArrowUpRight className="w-6 h-6" />}
              kleur="default"
            />
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recente deals - 2 kolommen breed */}
            <div className="lg:col-span-2">
              <RecenteDeals deals={deals} onDealClick={(deal) => selecteerDeal(deal)} />
            </div>

            {/* Pipeline overzicht */}
            <div>
              <PipelineOverzicht stats={stats} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-8">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">Snelle acties</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setNieuweDealOpen(true)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Nieuwe deal</span>
                  </button>

                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Contact toevoegen</span>
                  </button>

                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Activiteit plannen</span>
                  </button>

                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Rapporten bekijken</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {geselecteerdeDeal && (
        <DealModal deal={geselecteerdeDeal} onClose={() => selecteerDeal(null)} />
      )}

      {nieuweDealOpen && (
        <NieuweDealModal onClose={() => setNieuweDealOpen(false)} />
      )}
    </div>
  );
}
