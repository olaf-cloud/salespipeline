'use client';

import { useSortable } from '@hello-pangea/dnd';
import { Building2, Calendar, User, Euro, Percent } from 'lucide-react';
import { Deal } from '@/types';
import { formatBedrag, formatDatumKort, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  isDragging?: boolean;
}

export function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  const kansKleur =
    deal.kans >= 70
      ? 'text-green-600'
      : deal.kans >= 40
      ? 'text-amber-600'
      : 'text-gray-500';

  return (
    <div
      onClick={onClick}
      className={cn(
        'deal-card group',
        isDragging && 'deal-card-dragging'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {deal.titel}
        </h4>
        <span className={cn('flex items-center gap-1 text-sm font-medium', kansKleur)}>
          <Percent className="w-3 h-3" />
          {deal.kans}%
        </span>
      </div>

      {/* Waarde */}
      <div className="flex items-center gap-2 mb-3">
        <Euro className="w-4 h-4 text-gray-400" />
        <span className="text-lg font-semibold text-gray-900">{formatBedrag(deal.waarde)}</span>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{deal.contact.naam}</span>
        </div>
        {deal.contact.bedrijf && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{deal.contact.bedrijf}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {deal.verwachteSluitdatum ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDatumKort(deal.verwachteSluitdatum)}</span>
          </div>
        ) : (
          <span />
        )}

        {/* Integratie badges */}
        <div className="flex items-center gap-1">
          {deal.offorteOfferte && (
            <Badge variant="info" size="sm">
              Offerte
            </Badge>
          )}
          {deal.moneybirdFactuur && (
            <Badge variant="success" size="sm">
              Factuur
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Draggable wrapper
interface DraggableDealCardProps {
  deal: Deal;
  index: number;
  onClick: () => void;
}

export function DraggableDealCard({ deal, index, onClick }: DraggableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: 'deal',
      deal,
    },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}
