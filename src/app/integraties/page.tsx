'use client';

import { useState } from 'react';
import {
  Link2,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Settings,
  FileText,
  HardDrive,
  Receipt,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { usePipelineStore } from '@/store/pipelineStore';
import { offorteService } from '@/services/offorte';
import { googleDriveService } from '@/services/googleDrive';
import { moneybirdService } from '@/services/moneybird';
import { cn, formatDatum } from '@/lib/utils';

type IntegratieType = 'offorte' | 'googleDrive' | 'moneybird';

interface IntegratieInfo {
  id: IntegratieType;
  naam: string;
  beschrijving: string;
  icoon: any;
  kleur: string;
  website: string;
  velden: {
    naam: string;
    key: string;
    type: 'text' | 'password';
    placeholder: string;
    required: boolean;
  }[];
}

const integraties: IntegratieInfo[] = [
  {
    id: 'offorte',
    naam: 'Offorte',
    beschrijving: 'Maak professionele offertes en volg de status in real-time',
    icoon: FileText,
    kleur: 'bg-purple-500',
    website: 'https://www.offorte.com',
    velden: [
      {
        naam: 'API Key',
        key: 'apiKey',
        type: 'password',
        placeholder: 'Voer je Offorte API key in',
        required: true,
      },
    ],
  },
  {
    id: 'googleDrive',
    naam: 'Google Drive',
    beschrijving: 'Sla documenten automatisch op en organiseer ze per deal',
    icoon: HardDrive,
    kleur: 'bg-blue-500',
    website: 'https://drive.google.com',
    velden: [
      {
        naam: 'Access Token',
        key: 'accessToken',
        type: 'password',
        placeholder: 'OAuth access token',
        required: true,
      },
    ],
  },
  {
    id: 'moneybird',
    naam: 'Moneybird',
    beschrijving: 'Verstuur facturen en houd betalingen bij',
    icoon: Receipt,
    kleur: 'bg-green-500',
    website: 'https://www.moneybird.nl',
    velden: [
      {
        naam: 'API Key',
        key: 'apiKey',
        type: 'password',
        placeholder: 'Voer je Moneybird API key in',
        required: true,
      },
      {
        naam: 'Administratie ID',
        key: 'administratieId',
        type: 'text',
        placeholder: 'Je administratie ID',
        required: true,
      },
    ],
  },
];

export default function IntegratiesPage() {
  const { integratieConfig, updateIntegratieConfig } = usePipelineStore();
  const [actieveModal, setActieveModal] = useState<IntegratieType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResultaat, setTestResultaat] = useState<'success' | 'error' | null>(null);

  const openConfiguratie = (integratie: IntegratieType) => {
    const config = integratieConfig[integratie];
    const initialData: Record<string, string> = {};

    // Vul bestaande waarden in
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === 'string') {
        initialData[key] = value;
      }
    });

    setFormData(initialData);
    setTestResultaat(null);
    setActieveModal(integratie);
  };

  const handleOpslaan = async () => {
    if (!actieveModal) return;

    setIsLoading(true);
    setTestResultaat(null);

    try {
      // Test de verbinding eerst
      let isSucces = false;

      switch (actieveModal) {
        case 'offorte':
          offorteService.setConfig({ apiKey: formData.apiKey });
          isSucces = await offorteService.testVerbinding();
          break;
        case 'googleDrive':
          googleDriveService.setConfig({ accessToken: formData.accessToken });
          isSucces = await googleDriveService.testVerbinding();
          break;
        case 'moneybird':
          moneybirdService.setConfig({
            apiKey: formData.apiKey,
            administratieId: formData.administratieId,
          });
          isSucces = await moneybirdService.testVerbinding();
          break;
      }

      if (isSucces) {
        // Sla configuratie op
        updateIntegratieConfig(actieveModal, {
          aangesloten: true,
          ...formData,
          laatstGesynchroniseerd: new Date(),
        } as any);

        setTestResultaat('success');
        setTimeout(() => {
          setActieveModal(null);
        }, 1500);
      } else {
        setTestResultaat('error');
      }
    } catch (error) {
      console.error('Verbindingsfout:', error);
      setTestResultaat('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOntkoppelen = (integratie: IntegratieType) => {
    if (confirm('Weet je zeker dat je deze integratie wilt ontkoppelen?')) {
      updateIntegratieConfig(integratie, {
        aangesloten: false,
        apiKey: undefined,
        accessToken: undefined,
        refreshToken: undefined,
        administratieId: undefined,
        hoofdMapId: undefined,
        laatstGesynchroniseerd: undefined,
      } as any);
    }
  };

  const actieveIntegratie = integraties.find((i) => i.id === actieveModal);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Integraties</h1>
            <p className="text-gray-500 mt-1">
              Koppel je favoriete tools om je workflow te optimaliseren
            </p>
          </div>

          {/* Integratie cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integraties.map((integratie) => {
              const config = integratieConfig[integratie.id];
              const isAangesloten = config.aangesloten;

              return (
                <div key={integratie.id} className="card overflow-hidden">
                  {/* Header met kleur */}
                  <div className={cn('h-2', integratie.kleur)} />

                  <div className="p-6">
                    {/* Logo en status */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center text-white',
                          integratie.kleur
                        )}
                      >
                        <integratie.icoon className="w-7 h-7" />
                      </div>
                      <Badge variant={isAangesloten ? 'success' : 'default'}>
                        {isAangesloten ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Aangesloten
                          </>
                        ) : (
                          'Niet aangesloten'
                        )}
                      </Badge>
                    </div>

                    {/* Info */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {integratie.naam}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{integratie.beschrijving}</p>

                    {/* Sync info */}
                    {isAangesloten && config.laatstGesynchroniseerd && (
                      <p className="text-xs text-gray-400 mb-4">
                        Laatst gesynchroniseerd: {formatDatum(config.laatstGesynchroniseerd)}
                      </p>
                    )}

                    {/* Acties */}
                    <div className="flex items-center gap-3">
                      {isAangesloten ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openConfiguratie(integratie.id)}
                          >
                            <Settings className="w-4 h-4" />
                            Instellingen
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOntkoppelen(integratie.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Ontkoppelen
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => openConfiguratie(integratie.id)}>
                          <Link2 className="w-4 h-4" />
                          Koppelen
                        </Button>
                      )}
                      <a
                        href={integratie.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
                        title="Ga naar website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info sectie */}
          <div className="mt-8 card">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Over integraties
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Integraties maken het mogelijk om je sales pipeline te verbinden met externe
                    tools. Je API keys worden veilig opgeslagen in je browser en worden alleen
                    gebruikt om te communiceren met de betreffende diensten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Configuratie modal */}
      {actieveModal && actieveIntegratie && (
        <Modal
          open={true}
          onClose={() => setActieveModal(null)}
          titel={`${actieveIntegratie.naam} configureren`}
          grootte="sm"
        >
          <div className="space-y-6">
            {/* Velden */}
            {actieveIntegratie.velden.map((veld) => (
              <Input
                key={veld.key}
                label={veld.naam}
                type={veld.type}
                placeholder={veld.placeholder}
                value={formData[veld.key] || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [veld.key]: e.target.value }))
                }
                required={veld.required}
              />
            ))}

            {/* Test resultaat */}
            {testResultaat && (
              <div
                className={cn(
                  'p-4 rounded-lg flex items-center gap-3',
                  testResultaat === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                {testResultaat === 'success' ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Verbinding succesvol! Integratie wordt opgeslagen...</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    <span>Verbinding mislukt. Controleer je gegevens en probeer opnieuw.</span>
                  </>
                )}
              </div>
            )}

            {/* Help tekst */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Waar vind ik mijn API key?</strong>
                <br />
                Ga naar{' '}
                <a
                  href={actieveIntegratie.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {actieveIntegratie.naam}
                </a>{' '}
                en navigeer naar de API-instellingen in je account.
              </p>
            </div>

            {/* Acties */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setActieveModal(null)}>
                Annuleren
              </Button>
              <Button onClick={handleOpslaan} loading={isLoading}>
                {isLoading ? 'Verbinding testen...' : 'Opslaan & testen'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
