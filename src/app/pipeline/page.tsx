'use client';

import { useState } from 'react';
import { Search, Filter, Plus, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { NieuweDealModal } from '@/components/deals/NieuweDealModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePipelineStore } from '@/store/pipelineStore';
import { formatBedrag } from '@/lib/utils';
import { cn } from '@/lib/utils';

type ViewMode = 'board' | 'list';

export default function PipelinePage() {
  const { deals, zoekterm, setZoekterm, getDashboardStats } = usePipelineStore();
  const [nieuweDealOpen, setNieuweDealOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
              <p className="text-gray-500 mt-1">
                {stats.totaalDeals} deal{stats.totaalDeals !== 1 && 's'} met een totale waarde van{' '}
                {formatBedrag(stats.totaleWaarde)}
              </p>
            </div>
            <Button onClick={() => setNieuweDealOpen(true)}>
              <Plus className="w-4 h-4" />
              Nieuwe deal
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Zoeken */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek deals, contacten of bedrijven..."
                  value={zoekterm}
                  onChange={(e) => setZoekterm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Filters */}
              <Button variant="secondary">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('board')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                title="Kanban weergave"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                title="Lijst weergave"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pipeline board */}
          <PipelineBoard />
        </div>
      </main>

      {/* Nieuwe deal modal */}
      {nieuweDealOpen && (
        <NieuweDealModal onClose={() => setNieuweDealOpen(false)} />
      )}
    </div>
  );
}
