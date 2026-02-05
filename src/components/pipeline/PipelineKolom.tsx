'use client';

import { useDroppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Deal, PipelineKolom } from '@/types';
import { formatBedrag, cn } from '@/lib/utils';
import { DraggableDealCard } from '@/components/deals/DealCard';

interface PipelineKolomProps {
  kolom: PipelineKolom;
  deals: Deal[];
  totaleWaarde: number;
  icoon: React.ReactNode;
  onDealClick: (deal: Deal) => void;
  onNieuweDeal: () => void;
}

export function PipelineKolomComponent({
  kolom,
  deals,
  totaleWaarde,
  icoon,
  onDealClick,
  onNieuweDeal,
}: PipelineKolomProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: kolom.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'pipeline-column transition-colors duration-200',
        isOver && 'bg-primary-50 ring-2 ring-primary-300 ring-inset'
      )}
    >
      {/* Kolom header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', kolom.kleur)}>
            {icoon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{kolom.naam}</h3>
            <p className="text-xs text-gray-500">
              {deals.length} deal{deals.length !== 1 && 's'} - {formatBedrag(totaleWaarde)}
            </p>
          </div>
        </div>
        <button
          onClick={onNieuweDeal}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          title="Nieuwe deal toevoegen"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Deals */}
      <div className="space-y-3">
        {deals.map((deal, index) => (
          <DraggableDealCard
            key={deal.id}
            deal={deal}
            index={index}
            onClick={() => onDealClick(deal)}
          />
        ))}

        {deals.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">Geen deals in deze fase</p>
            <button
              onClick={onNieuweDeal}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Deal toevoegen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
