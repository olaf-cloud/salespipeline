'use client';

import { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Euro,
  Percent,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { Deal, DealStatus, Activiteit } from '@/types';
import { formatBedrag, formatDatum, formatRelatieveDatum, getStatusNaam, getStatusKleur, cn } from '@/lib/utils';
import { usePipelineStore } from '@/store/pipelineStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface DealModalProps {
  deal: Deal;
  onClose: () => void;
}

type TabType = 'overzicht' | 'activiteiten' | 'notities' | 'documenten' | 'integraties';

export function DealModal({ deal, onClose }: DealModalProps) {
  const [actieveTab, setActieveTab] = useState<TabType>('overzicht');
  const [isBewerken, setIsBewerken] = useState(false);
  const [nieuweNotitie, setNieuweNotitie] = useState('');

  const { werkDealBij, verwijderDeal, voegNotitieToe, verwijderNotitie } = usePipelineStore();

  const tabs: { id: TabType; naam: string; icoon: any }[] = [
    { id: 'overzicht', naam: 'Overzicht', icoon: FileText },
    { id: 'activiteiten', naam: 'Activiteiten', icoon: Clock },
    { id: 'notities', naam: 'Notities', icoon: MessageSquare },
    { id: 'documenten', naam: 'Documenten', icoon: FileText },
    { id: 'integraties', naam: 'Integraties', icoon: ExternalLink },
  ];

  const statusOpties: { value: DealStatus; label: string }[] = [
    { value: 'lead', label: 'Lead' },
    { value: 'contact', label: 'Contact gelegd' },
    { value: 'offerte', label: 'Offerte verstuurd' },
    { value: 'onderhandeling', label: 'In onderhandeling' },
    { value: 'gewonnen', label: 'Gewonnen' },
    { value: 'verloren', label: 'Verloren' },
  ];

  const handleNotitieToevoegen = () => {
    if (nieuweNotitie.trim()) {
      voegNotitieToe(deal.id, nieuweNotitie);
      setNieuweNotitie('');
    }
  };

  const handleVerwijderen = () => {
    if (confirm('Weet je zeker dat je deze deal wilt verwijderen?')) {
      verwijderDeal(deal.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-content animate-scale-in max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{deal.titel}</h2>
              <Badge className={getStatusKleur(deal.status)}>
                {getStatusNaam(deal.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Euro className="w-4 h-4" />
                {formatBedrag(deal.waarde)}
              </span>
              <span className="flex items-center gap-1.5">
                <Percent className="w-4 h-4" />
                {deal.kans}% kans
              </span>
              <span>Aangemaakt {formatRelatieveDatum(deal.aangemaakt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="danger" size="sm" onClick={handleVerwijderen}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActieveTab(tab.id)}
              className={cn(
                'tab-button flex items-center gap-2',
                actieveTab === tab.id && 'tab-button-active'
              )}
            >
              <tab.icoon className="w-4 h-4" />
              {tab.naam}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {actieveTab === 'overzicht' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Contact informatie */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-900">Contact</h3>
                </div>
                <div className="card-body space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {deal.contact.naam.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{deal.contact.naam}</p>
                      {deal.contact.functie && (
                        <p className="text-sm text-gray-500">{deal.contact.functie}</p>
                      )}
                    </div>
                  </div>
                  {deal.contact.bedrijf && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {deal.contact.bedrijf}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${deal.contact.email}`} className="text-primary-600 hover:underline">
                      {deal.contact.email}
                    </a>
                  </div>
                  {deal.contact.telefoon && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${deal.contact.telefoon}`} className="text-primary-600 hover:underline">
                        {deal.contact.telefoon}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Deal details */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-900">Details</h3>
                </div>
                <div className="card-body space-y-4">
                  <Select
                    label="Status"
                    value={deal.status}
                    onChange={(e) => werkDealBij(deal.id, { status: e.target.value as DealStatus })}
                    options={statusOpties}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Waarde</label>
                      <p className="text-lg font-semibold text-gray-900">{formatBedrag(deal.waarde)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Winstkans</label>
                      <p className="text-lg font-semibold text-gray-900">{deal.kans}%</p>
                    </div>
                  </div>
                  {deal.verwachteSluitdatum && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Verwachte sluiting: {formatDatum(deal.verwachteSluitdatum)}
                    </div>
                  )}
                </div>
              </div>

              {/* Beschrijving */}
              {deal.beschrijving && (
                <div className="card col-span-2">
                  <div className="card-header">
                    <h3 className="font-semibold text-gray-900">Beschrijving</h3>
                  </div>
                  <div className="card-body">
                    <p className="text-gray-600 whitespace-pre-wrap">{deal.beschrijving}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {actieveTab === 'activiteiten' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Activiteiten</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Activiteit toevoegen
                </Button>
              </div>
              {deal.activiteiten.length > 0 ? (
                <div className="space-y-3">
                  {deal.activiteiten.map((activiteit) => (
                    <div
                      key={activiteit.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          activiteit.voltooid ? 'bg-green-100' : 'bg-gray-200'
                        )}
                      >
                        {activiteit.voltooid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium', activiteit.voltooid && 'line-through text-gray-400')}>
                          {activiteit.titel}
                        </p>
                        {activiteit.beschrijving && (
                          <p className="text-sm text-gray-500 mt-1">{activiteit.beschrijving}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDatum(activiteit.datum)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nog geen activiteiten</p>
                  <p className="text-sm">Voeg een activiteit toe om de voortgang bij te houden</p>
                </div>
              )}
            </div>
          )}

          {actieveTab === 'notities' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Schrijf een notitie..."
                  value={nieuweNotitie}
                  onChange={(e) => setNieuweNotitie(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleNotitieToevoegen} disabled={!nieuweNotitie.trim()}>
                  Toevoegen
                </Button>
              </div>
              {deal.notities.length > 0 ? (
                <div className="space-y-3">
                  {[...deal.notities].reverse().map((notitie) => (
                    <div key={notitie.id} className="p-4 bg-gray-50 rounded-lg group">
                      <div className="flex items-start justify-between">
                        <p className="text-gray-700 whitespace-pre-wrap">{notitie.inhoud}</p>
                        <button
                          onClick={() => verwijderNotitie(deal.id, notitie.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatRelatieveDatum(notitie.aangemaakt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nog geen notities</p>
                </div>
              )}
            </div>
          )}

          {actieveTab === 'documenten' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Documenten</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Document uploaden
                </Button>
              </div>
              {deal.documenten.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {deal.documenten.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.naam}</p>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nog geen documenten</p>
                  <p className="text-sm">Upload documenten of koppel ze vanuit Google Drive</p>
                </div>
              )}
            </div>
          )}

          {actieveTab === 'integraties' && (
            <div className="grid grid-cols-3 gap-4">
              {/* Offorte */}
              <div className="card">
                <div className="card-header bg-purple-50">
                  <h3 className="font-semibold text-purple-900">Offorte</h3>
                </div>
                <div className="card-body">
                  {deal.offorteOfferte ? (
                    <div className="space-y-2">
                      <Badge variant="info">{deal.offorteOfferte.status}</Badge>
                      <p className="font-medium">{formatBedrag(deal.offorteOfferte.totaalBedrag)}</p>
                      <a
                        href={deal.offorteOfferte.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                      >
                        Bekijk offerte <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">Geen offerte gekoppeld</p>
                      <Button size="sm" variant="secondary">
                        Offerte maken
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Drive */}
              <div className="card">
                <div className="card-header bg-blue-50">
                  <h3 className="font-semibold text-blue-900">Google Drive</h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">{deal.documenten.length} documenten</p>
                    <Button size="sm" variant="secondary">
                      Map openen
                    </Button>
                  </div>
                </div>
              </div>

              {/* Moneybird */}
              <div className="card">
                <div className="card-header bg-green-50">
                  <h3 className="font-semibold text-green-900">Moneybird</h3>
                </div>
                <div className="card-body">
                  {deal.moneybirdFactuur ? (
                    <div className="space-y-2">
                      <Badge variant="success">{deal.moneybirdFactuur.status}</Badge>
                      <p className="font-medium">{formatBedrag(deal.moneybirdFactuur.totaalBedrag)}</p>
                      <a
                        href={deal.moneybirdFactuur.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                      >
                        Bekijk factuur <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">Geen factuur gekoppeld</p>
                      <Button size="sm" variant="secondary">
                        Factuur maken
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
