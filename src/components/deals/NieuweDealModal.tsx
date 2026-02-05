'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { DealStatus } from '@/types';
import { usePipelineStore } from '@/store/pipelineStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

interface NieuweDealModalProps {
  onClose: () => void;
  initielStatus?: DealStatus;
}

export function NieuweDealModal({ onClose, initielStatus = 'lead' }: NieuweDealModalProps) {
  const { voegDealToe, voegContactToe } = usePipelineStore();

  const [formData, setFormData] = useState({
    // Deal info
    titel: '',
    waarde: '',
    status: initielStatus,
    beschrijving: '',
    kans: '20',
    verwachteSluitdatum: '',
    bronType: '' as '' | 'website' | 'referral' | 'cold-call' | 'linkedin' | 'anders',

    // Contact info
    contactNaam: '',
    contactEmail: '',
    contactTelefoon: '',
    contactBedrijf: '',
    contactFunctie: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOpties = [
    { value: 'lead', label: 'Lead' },
    { value: 'contact', label: 'Contact gelegd' },
    { value: 'offerte', label: 'Offerte verstuurd' },
    { value: 'onderhandeling', label: 'In onderhandeling' },
  ];

  const bronOpties = [
    { value: '', label: 'Selecteer bron...' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Doorverwijzing' },
    { value: 'cold-call', label: 'Cold call' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'anders', label: 'Anders' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titel.trim()) {
      newErrors.titel = 'Titel is verplicht';
    }
    if (!formData.waarde || parseFloat(formData.waarde) <= 0) {
      newErrors.waarde = 'Voer een geldige waarde in';
    }
    if (!formData.contactNaam.trim()) {
      newErrors.contactNaam = 'Contactnaam is verplicht';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Voer een geldig e-mailadres in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Maak eerst het contact aan
    const contact = voegContactToe({
      naam: formData.contactNaam,
      email: formData.contactEmail,
      telefoon: formData.contactTelefoon || undefined,
      bedrijf: formData.contactBedrijf || undefined,
      functie: formData.contactFunctie || undefined,
    });

    // Maak de deal aan
    voegDealToe({
      titel: formData.titel,
      waarde: parseFloat(formData.waarde),
      status: formData.status as DealStatus,
      beschrijving: formData.beschrijving || undefined,
      kans: parseInt(formData.kans),
      verwachteSluitdatum: formData.verwachteSluitdatum
        ? new Date(formData.verwachteSluitdatum)
        : undefined,
      bronType: formData.bronType || undefined,
      contact,
    });

    onClose();
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-content animate-scale-in max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nieuwe deal</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Deal informatie */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Deal informatie
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Titel"
                  placeholder="bijv. Website redesign voor Bedrijf X"
                  value={formData.titel}
                  onChange={(e) => updateField('titel', e.target.value)}
                  error={errors.titel}
                  required
                />
              </div>

              <Input
                label="Waarde"
                type="number"
                placeholder="0.00"
                value={formData.waarde}
                onChange={(e) => updateField('waarde', e.target.value)}
                error={errors.waarde}
                required
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                options={statusOpties}
              />

              <Input
                label="Winstkans (%)"
                type="number"
                min="0"
                max="100"
                value={formData.kans}
                onChange={(e) => updateField('kans', e.target.value)}
              />

              <Input
                label="Verwachte sluitdatum"
                type="date"
                value={formData.verwachteSluitdatum}
                onChange={(e) => updateField('verwachteSluitdatum', e.target.value)}
              />

              <div className="col-span-2">
                <Select
                  label="Bron"
                  value={formData.bronType}
                  onChange={(e) => updateField('bronType', e.target.value)}
                  options={bronOpties}
                />
              </div>

              <div className="col-span-2">
                <Textarea
                  label="Beschrijving"
                  placeholder="Voeg extra details toe over deze deal..."
                  value={formData.beschrijving}
                  onChange={(e) => updateField('beschrijving', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact informatie */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Contact informatie
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Naam"
                placeholder="Jan Jansen"
                value={formData.contactNaam}
                onChange={(e) => updateField('contactNaam', e.target.value)}
                error={errors.contactNaam}
                required
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="jan@bedrijf.nl"
                value={formData.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                error={errors.contactEmail}
                required
              />

              <Input
                label="Telefoon"
                type="tel"
                placeholder="+31 6 12345678"
                value={formData.contactTelefoon}
                onChange={(e) => updateField('contactTelefoon', e.target.value)}
              />

              <Input
                label="Bedrijf"
                placeholder="Bedrijfsnaam"
                value={formData.contactBedrijf}
                onChange={(e) => updateField('contactBedrijf', e.target.value)}
              />

              <div className="col-span-2">
                <Input
                  label="Functie"
                  placeholder="CEO, Marketing Manager, etc."
                  value={formData.contactFunctie}
                  onChange={(e) => updateField('contactFunctie', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actie knoppen */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit">Deal aanmaken</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
