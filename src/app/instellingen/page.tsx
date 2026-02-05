'use client';

import { useState } from 'react';
import {
  User,
  Building2,
  Bell,
  Palette,
  Shield,
  Database,
  Download,
  Trash2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePipelineStore } from '@/store/pipelineStore';
import { cn } from '@/lib/utils';

type TabType = 'profiel' | 'meldingen' | 'weergave' | 'data';

export default function InstellingenPage() {
  const { deals, contacten } = usePipelineStore();
  const [actieveTab, setActieveTab] = useState<TabType>('profiel');
  const [opgeslagen, setOpgeslagen] = useState(false);

  const [profielData, setProfielData] = useState({
    naam: '',
    email: '',
    bedrijf: '',
    telefoon: '',
  });

  const [meldingInstellingen, setMeldingInstellingen] = useState({
    emailMeldingen: true,
    dealUpdates: true,
    offerteStatus: true,
    factuurStatus: true,
    dagelijksOverzicht: false,
  });

  const [weergaveInstellingen, setWeergaveInstellingen] = useState({
    taal: 'nl',
    datumFormaat: 'dd-mm-yyyy',
    valuta: 'EUR',
    startPagina: 'dashboard',
  });

  const tabs = [
    { id: 'profiel' as TabType, naam: 'Profiel', icoon: User },
    { id: 'meldingen' as TabType, naam: 'Meldingen', icoon: Bell },
    { id: 'weergave' as TabType, naam: 'Weergave', icoon: Palette },
    { id: 'data' as TabType, naam: 'Data beheer', icoon: Database },
  ];

  const handleOpslaan = () => {
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 2000);
  };

  const exporteerData = () => {
    const data = {
      deals,
      contacten,
      exportDatum: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-pipeline-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wisAlleData = () => {
    if (
      confirm(
        'WAARSCHUWING: Dit verwijdert al je deals en contacten permanent. Ben je zeker?'
      )
    ) {
      if (confirm('Dit kan niet ongedaan worden gemaakt. Laatste kans om te annuleren.')) {
        localStorage.removeItem('sales-pipeline-storage');
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Instellingen</h1>
            <p className="text-gray-500 mt-1">Beheer je account en voorkeuren</p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar tabs */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActieveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                      actieveTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <tab.icoon className="w-5 h-5" />
                    {tab.naam}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              {actieveTab === 'profiel' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-gray-900">Profiel instellingen</h3>
                  </div>
                  <div className="card-body space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-primary-600" />
                      </div>
                      <div>
                        <Button variant="secondary" size="sm">
                          Foto wijzigen
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG of GIF. Max 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Naam"
                        value={profielData.naam}
                        onChange={(e) =>
                          setProfielData((prev) => ({ ...prev, naam: e.target.value }))
                        }
                        placeholder="Je volledige naam"
                      />
                      <Input
                        label="E-mail"
                        type="email"
                        value={profielData.email}
                        onChange={(e) =>
                          setProfielData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="je@email.nl"
                      />
                      <Input
                        label="Bedrijf"
                        value={profielData.bedrijf}
                        onChange={(e) =>
                          setProfielData((prev) => ({ ...prev, bedrijf: e.target.value }))
                        }
                        placeholder="Je bedrijfsnaam"
                      />
                      <Input
                        label="Telefoon"
                        type="tel"
                        value={profielData.telefoon}
                        onChange={(e) =>
                          setProfielData((prev) => ({ ...prev, telefoon: e.target.value }))
                        }
                        placeholder="+31 6 12345678"
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button onClick={handleOpslaan}>
                        <Save className="w-4 h-4" />
                        {opgeslagen ? 'Opgeslagen!' : 'Opslaan'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {actieveTab === 'meldingen' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-gray-900">Melding voorkeuren</h3>
                  </div>
                  <div className="card-body space-y-4">
                    {[
                      { key: 'emailMeldingen', label: 'E-mail meldingen', desc: 'Ontvang meldingen via e-mail' },
                      { key: 'dealUpdates', label: 'Deal updates', desc: 'Wanneer een deal van status verandert' },
                      { key: 'offerteStatus', label: 'Offerte status', desc: 'Wanneer een offerte wordt bekeken of geaccepteerd' },
                      { key: 'factuurStatus', label: 'Factuur status', desc: 'Wanneer een factuur wordt betaald' },
                      { key: 'dagelijksOverzicht', label: 'Dagelijks overzicht', desc: 'Ontvang elke ochtend een samenvatting' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={meldingInstellingen[item.key as keyof typeof meldingInstellingen]}
                            onChange={(e) =>
                              setMeldingInstellingen((prev) => ({
                                ...prev,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleOpslaan}>
                        <Save className="w-4 h-4" />
                        {opgeslagen ? 'Opgeslagen!' : 'Opslaan'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {actieveTab === 'weergave' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-gray-900">Weergave instellingen</h3>
                  </div>
                  <div className="card-body space-y-4">
                    <Select
                      label="Taal"
                      value={weergaveInstellingen.taal}
                      onChange={(e) =>
                        setWeergaveInstellingen((prev) => ({ ...prev, taal: e.target.value }))
                      }
                      options={[
                        { value: 'nl', label: 'Nederlands' },
                        { value: 'en', label: 'English' },
                      ]}
                    />

                    <Select
                      label="Datum formaat"
                      value={weergaveInstellingen.datumFormaat}
                      onChange={(e) =>
                        setWeergaveInstellingen((prev) => ({
                          ...prev,
                          datumFormaat: e.target.value,
                        }))
                      }
                      options={[
                        { value: 'dd-mm-yyyy', label: 'DD-MM-JJJJ (31-12-2024)' },
                        { value: 'mm-dd-yyyy', label: 'MM-DD-JJJJ (12-31-2024)' },
                        { value: 'yyyy-mm-dd', label: 'JJJJ-MM-DD (2024-12-31)' },
                      ]}
                    />

                    <Select
                      label="Valuta"
                      value={weergaveInstellingen.valuta}
                      onChange={(e) =>
                        setWeergaveInstellingen((prev) => ({ ...prev, valuta: e.target.value }))
                      }
                      options={[
                        { value: 'EUR', label: 'Euro (€)' },
                        { value: 'USD', label: 'US Dollar ($)' },
                        { value: 'GBP', label: 'Brits Pond (£)' },
                      ]}
                    />

                    <Select
                      label="Start pagina"
                      value={weergaveInstellingen.startPagina}
                      onChange={(e) =>
                        setWeergaveInstellingen((prev) => ({
                          ...prev,
                          startPagina: e.target.value,
                        }))
                      }
                      options={[
                        { value: 'dashboard', label: 'Dashboard' },
                        { value: 'pipeline', label: 'Pipeline' },
                        { value: 'contacten', label: 'Contacten' },
                      ]}
                    />

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button onClick={handleOpslaan}>
                        <Save className="w-4 h-4" />
                        {opgeslagen ? 'Opgeslagen!' : 'Opslaan'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {actieveTab === 'data' && (
                <div className="space-y-6">
                  {/* Statistieken */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="font-semibold text-gray-900">Data overzicht</h3>
                    </div>
                    <div className="card-body">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-3xl font-bold text-gray-900">{deals.length}</p>
                          <p className="text-sm text-gray-500">Deals</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-3xl font-bold text-gray-900">{contacten.length}</p>
                          <p className="text-sm text-gray-500">Contacten</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="font-semibold text-gray-900">Exporteer data</h3>
                    </div>
                    <div className="card-body">
                      <p className="text-gray-500 mb-4">
                        Download al je data als JSON bestand. Dit kan worden gebruikt als backup of
                        om te importeren in andere applicaties.
                      </p>
                      <Button variant="secondary" onClick={exporteerData}>
                        <Download className="w-4 h-4" />
                        Exporteer als JSON
                      </Button>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="card border-red-200">
                    <div className="card-header bg-red-50">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="font-semibold">Gevaarlijke zone</h3>
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="text-gray-500 mb-4">
                        Let op: Deze actie is permanent en kan niet ongedaan worden gemaakt. Al je
                        deals, contacten en instellingen worden verwijderd.
                      </p>
                      <Button variant="danger" onClick={wisAlleData}>
                        <Trash2 className="w-4 h-4" />
                        Wis alle data
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
