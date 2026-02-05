'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Plus, Users, UserPlus, FileText, MessageCircle, Trophy, XCircle } from 'lucide-react';
import { DealStatus, Deal, PipelineKolom } from '@/types';
import { usePipelineStore } from '@/store/pipelineStore';
import { formatBedrag, cn } from '@/lib/utils';
import { DealCard } from '@/components/deals/DealCard';
import { DealModal } from '@/components/deals/DealModal';
import { NieuweDealModal } from '@/components/deals/NieuweDealModal';

const kolommen: PipelineKolom[] = [
  { id: 'lead', naam: 'Lead', kleur: 'bg-gray-500', icoon: 'UserPlus' },
  { id: 'contact', naam: 'Contact gelegd', kleur: 'bg-blue-500', icoon: 'Users' },
  { id: 'offerte', naam: 'Offerte verstuurd', kleur: 'bg-purple-500', icoon: 'FileText' },
  { id: 'onderhandeling', naam: 'In onderhandeling', kleur: 'bg-amber-500', icoon: 'MessageCircle' },
  { id: 'gewonnen', naam: 'Gewonnen', kleur: 'bg-green-500', icoon: 'Trophy' },
  { id: 'verloren', naam: 'Verloren', kleur: 'bg-red-500', icoon: 'XCircle' },
];

const icoonMap: Record<string, any> = {
  UserPlus,
  Users,
  FileText,
  MessageCircle,
  Trophy,
  XCircle,
};

export function PipelineBoard() {
  const { deals, verplaatsDeal, geselecteerdeDeal, selecteerDeal } = usePipelineStore();
  const [nieuweDealModal, setNieuweDealModal] = useState<{ open: boolean; status?: DealStatus }>({
    open: false,
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const nieuweStatus = destination.droppableId as DealStatus;
    verplaatsDeal(draggableId, nieuweStatus);
  };

  const getDealsVoorKolom = (status: DealStatus) => {
    return deals.filter((deal) => deal.status === status);
  };

  const berekenKolomWaarde = (status: DealStatus) => {
    return getDealsVoorKolom(status).reduce((sum, deal) => sum + deal.waarde, 0);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
          {kolommen.map((kolom) => {
            const kolomDeals = getDealsVoorKolom(kolom.id);
            const kolomWaarde = berekenKolomWaarde(kolom.id);
            const IcoonComponent = icoonMap[kolom.icoon];

            return (
              <Droppable key={kolom.id} droppableId={kolom.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'pipeline-column transition-colors duration-200',
                      snapshot.isDraggingOver && 'bg-primary-50 ring-2 ring-primary-300 ring-inset'
                    )}
                  >
                    {/* Kolom header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', kolom.kleur)}>
                          <IcoonComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{kolom.naam}</h3>
                          <p className="text-xs text-gray-500">
                            {kolomDeals.length} deal{kolomDeals.length !== 1 && 's'} - {formatBedrag(kolomWaarde)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNieuweDealModal({ open: true, status: kolom.id })}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                        title="Nieuwe deal toevoegen"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Deals */}
                    <div className="space-y-3">
                      {kolomDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <DealCard
                                deal={deal}
                                onClick={() => selecteerDeal(deal)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {kolomDeals.length === 0 && (
                        <div className="py-8 text-center">
                          <p className="text-sm text-gray-400">Geen deals in deze fase</p>
                          <button
                            onClick={() => setNieuweDealModal({ open: true, status: kolom.id })}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            + Deal toevoegen
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Deal detail modal */}
      {geselecteerdeDeal && (
        <DealModal deal={geselecteerdeDeal} onClose={() => selecteerDeal(null)} />
      )}

      {/* Nieuwe deal modal */}
      {nieuweDealModal.open && (
        <NieuweDealModal
          onClose={() => setNieuweDealModal({ open: false })}
          initielStatus={nieuweDealModal.status}
        />
      )}
    </>
  );
}
