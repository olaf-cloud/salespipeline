'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  User,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { usePipelineStore } from '@/store/pipelineStore';
import { formatDatum, cn } from '@/lib/utils';
import { Contact } from '@/types';

export default function ContactenPage() {
  const { contacten, deals, voegContactToe, werkContactBij, verwijderContact } =
    usePipelineStore();
  const [zoekterm, setZoekterm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [bewerkContact, setBewerkContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: '',
    bedrijf: '',
    functie: '',
    notities: '',
  });

  const gefilterdeContacten = contacten.filter(
    (contact) =>
      contact.naam.toLowerCase().includes(zoekterm.toLowerCase()) ||
      contact.email.toLowerCase().includes(zoekterm.toLowerCase()) ||
      contact.bedrijf?.toLowerCase().includes(zoekterm.toLowerCase())
  );

  const getDealsVoorContact = (contactId: string) => {
    return deals.filter((deal) => deal.contact.id === contactId);
  };

  const openNieuwContact = () => {
    setBewerkContact(null);
    setFormData({
      naam: '',
      email: '',
      telefoon: '',
      bedrijf: '',
      functie: '',
      notities: '',
    });
    setModalOpen(true);
  };

  const openBewerkContact = (contact: Contact) => {
    setBewerkContact(contact);
    setFormData({
      naam: contact.naam,
      email: contact.email,
      telefoon: contact.telefoon || '',
      bedrijf: contact.bedrijf || '',
      functie: contact.functie || '',
      notities: contact.notities || '',
    });
    setModalOpen(true);
  };

  const handleOpslaan = () => {
    if (bewerkContact) {
      werkContactBij(bewerkContact.id, {
        naam: formData.naam,
        email: formData.email,
        telefoon: formData.telefoon || undefined,
        bedrijf: formData.bedrijf || undefined,
        functie: formData.functie || undefined,
        notities: formData.notities || undefined,
      });
    } else {
      voegContactToe({
        naam: formData.naam,
        email: formData.email,
        telefoon: formData.telefoon || undefined,
        bedrijf: formData.bedrijf || undefined,
        functie: formData.functie || undefined,
        notities: formData.notities || undefined,
      });
    }
    setModalOpen(false);
  };

  const handleVerwijder = (id: string) => {
    if (confirm('Weet je zeker dat je dit contact wilt verwijderen?')) {
      verwijderContact(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacten</h1>
              <p className="text-gray-500 mt-1">
                {contacten.length} contact{contacten.length !== 1 && 'en'}
              </p>
            </div>
            <Button onClick={openNieuwContact}>
              <Plus className="w-4 h-4" />
              Nieuw contact
            </Button>
          </div>

          {/* Zoeken */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek op naam, e-mail of bedrijf..."
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Contacten tabel */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Bedrijf
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contactgegevens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Deals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Toegevoegd
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gefilterdeContacten.length > 0 ? (
                    gefilterdeContacten.map((contact) => {
                      const contactDeals = getDealsVoorContact(contact.id);
                      return (
                        <tr
                          key={contact.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-semibold">
                                  {contact.naam.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {contact.naam}
                                </p>
                                {contact.functie && (
                                  <p className="text-sm text-gray-500">
                                    {contact.functie}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {contact.bedrijf ? (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {contact.bedrijf}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                              >
                                <Mail className="w-4 h-4 text-gray-400" />
                                {contact.email}
                              </a>
                              {contact.telefoon && (
                                <a
                                  href={`tel:${contact.telefoon}`}
                                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                                >
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {contact.telefoon}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                contactDeals.length > 0
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-gray-100 text-gray-600'
                              )}
                            >
                              {contactDeals.length} deal
                              {contactDeals.length !== 1 && 's'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDatum(contact.aangemaakt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openBewerkContact(contact)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Bewerken"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleVerwijder(contact.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Verwijderen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Geen contacten gevonden</p>
                        {zoekterm && (
                          <p className="text-sm text-gray-400 mt-1">
                            Probeer een andere zoekterm
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Contact modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        titel={bewerkContact ? 'Contact bewerken' : 'Nieuw contact'}
        grootte="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Naam"
              placeholder="Jan Jansen"
              value={formData.naam}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, naam: e.target.value }))
              }
              required
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="jan@bedrijf.nl"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefoon"
              type="tel"
              placeholder="+31 6 12345678"
              value={formData.telefoon}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telefoon: e.target.value }))
              }
            />
            <Input
              label="Bedrijf"
              placeholder="Bedrijfsnaam"
              value={formData.bedrijf}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bedrijf: e.target.value }))
              }
            />
          </div>

          <Input
            label="Functie"
            placeholder="CEO, Marketing Manager, etc."
            value={formData.functie}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, functie: e.target.value }))
            }
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleOpslaan}
              disabled={!formData.naam || !formData.email}
            >
              {bewerkContact ? 'Opslaan' : 'Toevoegen'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
