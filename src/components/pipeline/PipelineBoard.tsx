'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@hello-pangea/dnd';
import { Plus, Users, TrendingUp, UserPlus, FileText, Handshake, Trophy, XCircle } from 'lucide-react';
import { DealStatus, Deal, PipelineKolom } from '@/types';
import { usePipelineStore } from '@/store/pipelineStore';
import { formatBedrag, cn } from '@/lib/utils';
import { PipelineKolomComponent } from './PipelineKolom';
import { DealCard } from '@/components/deals/DealCard';
import { DealModal } from '@/components/deals/DealModal';
import { NieuweDealModal } from '@/components/deals/NieuweDealModal';

const kolommen: PipelineKolom[] = [
  { id: 'lead', naam: 'Lead', kleur: 'bg-gray-500', icoon: 'UserPlus' },
  { id: 'contact', naam: 'Contact gelegd', kleur: 'bg-blue-500', icoon: 'Users' },
  { id: 'offerte', naam: 'Offerte verstuurd', kleur: 'bg-purple-500', icoon: 'FileText' },
  { id: 'onderhandeling', naam: 'In onderhandeling', kleur: 'bg-amber-500', icoon: 'Handshake' },
  { id: 'gewonnen', naam: 'Gewonnen', kleur: 'bg-green-500', icoon: 'Trophy' },
  { id: 'verloren', naam: 'Verloren', kleur: 'bg-red-500', icoon: 'XCircle' },
];

const icoonMap: Record<string, any> = {
  UserPlus,
  Users,
  FileText,
  Handshake,
  Trophy,
  XCircle,
};

export function PipelineBoard() {
  const { deals, verplaatsDeal, geselecteerdeDeal, selecteerDeal } = usePipelineStore();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [nieuweDealModal, setNieuweDealModal] = useState<{ open: boolean; status?: DealStatus }>({
    open: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const nieuweStatus = over.id as DealStatus;

    // Controleer of het een geldige kolom is
    if (kolommen.some((k) => k.id === nieuweStatus)) {
      verplaatsDeal(dealId, nieuweStatus);
    }
  };

  const getDealsVoorKolom = (status: DealStatus) => {
    return deals.filter((deal) => deal.status === status);
  };

  const berekenKolomWaarde = (status: DealStatus) => {
    return getDealsVoorKolom(status).reduce((sum, deal) => sum + deal.waarde, 0);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
          {kolommen.map((kolom) => {
            const kolomDeals = getDealsVoorKolom(kolom.id);
            const kolomWaarde = berekenKolomWaarde(kolom.id);
            const IcoonComponent = icoonMap[kolom.icoon];

            return (
              <PipelineKolomComponent
                key={kolom.id}
                kolom={kolom}
                deals={kolomDeals}
                totaleWaarde={kolomWaarde}
                icoon={<IcoonComponent className="w-4 h-4" />}
                onDealClick={(deal) => selecteerDeal(deal)}
                onNieuweDeal={() => setNieuweDealModal({ open: true, status: kolom.id })}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && <DealCard deal={activeDeal} onClick={() => {}} isDragging />}
        </DragOverlay>
      </DndContext>

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
