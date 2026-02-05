import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Deal,
  DealStatus,
  Contact,
  Notitie,
  Activiteit,
  Document,
  FilterOpties,
  SorteerOpties,
  IntegratieConfig,
  DashboardStats,
} from '@/types';
import { genereerId, berekenVerwachteOmzet } from '@/lib/utils';

interface PipelineState {
  // Data
  deals: Deal[];
  contacten: Contact[];

  // UI State
  geselecteerdeDeal: Deal | null;
  filterOpties: FilterOpties;
  sorteerOpties: SorteerOpties;
  zoekterm: string;

  // Integraties
  integratieConfig: IntegratieConfig;

  // Deal acties
  voegDealToe: (deal: Omit<Deal, 'id' | 'aangemaakt' | 'bijgewerkt' | 'notities' | 'activiteiten' | 'documenten'>) => void;
  werkDealBij: (id: string, updates: Partial<Deal>) => void;
  verwijderDeal: (id: string) => void;
  verplaatsDeal: (dealId: string, nieuweStatus: DealStatus) => void;

  // Contact acties
  voegContactToe: (contact: Omit<Contact, 'id' | 'aangemaakt' | 'bijgewerkt'>) => Contact;
  werkContactBij: (id: string, updates: Partial<Contact>) => void;
  verwijderContact: (id: string) => void;

  // Notitie acties
  voegNotitieToe: (dealId: string, inhoud: string) => void;
  verwijderNotitie: (dealId: string, notitieId: string) => void;

  // Activiteit acties
  voegActiviteitToe: (dealId: string, activiteit: Omit<Activiteit, 'id'>) => void;
  werkActiviteitBij: (dealId: string, activiteitId: string, updates: Partial<Activiteit>) => void;
  verwijderActiviteit: (dealId: string, activiteitId: string) => void;

  // Document acties
  voegDocumentToe: (dealId: string, document: Omit<Document, 'id' | 'geupload'>) => void;
  verwijderDocument: (dealId: string, documentId: string) => void;

  // UI acties
  selecteerDeal: (deal: Deal | null) => void;
  setFilterOpties: (opties: Partial<FilterOpties>) => void;
  setSorteerOpties: (opties: SorteerOpties) => void;
  setZoekterm: (term: string) => void;

  // Integratie acties
  updateIntegratieConfig: (integratie: keyof IntegratieConfig, config: Partial<IntegratieConfig[keyof IntegratieConfig]>) => void;

  // Computed
  getGefilterdeDeals: () => Deal[];
  getDashboardStats: () => DashboardStats;
  getDealsVoorStatus: (status: DealStatus) => Deal[];
}

const defaultIntegratieConfig: IntegratieConfig = {
  offorte: { aangesloten: false },
  googleDrive: { aangesloten: false },
  moneybird: { aangesloten: false },
};

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      // Initial state
      deals: [],
      contacten: [],
      geselecteerdeDeal: null,
      filterOpties: {},
      sorteerOpties: { veld: 'aangemaakt', richting: 'aflopend' },
      zoekterm: '',
      integratieConfig: defaultIntegratieConfig,

      // Deal acties
      voegDealToe: (dealData) => {
        const nieuweDeal: Deal = {
          ...dealData,
          id: genereerId(),
          notities: [],
          activiteiten: [],
          documenten: [],
          aangemaakt: new Date(),
          bijgewerkt: new Date(),
        };
        set((state) => ({
          deals: [...state.deals, nieuweDeal],
        }));
      },

      werkDealBij: (id, updates) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === id
              ? { ...deal, ...updates, bijgewerkt: new Date() }
              : deal
          ),
          geselecteerdeDeal:
            state.geselecteerdeDeal?.id === id
              ? { ...state.geselecteerdeDeal, ...updates, bijgewerkt: new Date() }
              : state.geselecteerdeDeal,
        }));
      },

      verwijderDeal: (id) => {
        set((state) => ({
          deals: state.deals.filter((deal) => deal.id !== id),
          geselecteerdeDeal:
            state.geselecteerdeDeal?.id === id ? null : state.geselecteerdeDeal,
        }));
      },

      verplaatsDeal: (dealId, nieuweStatus) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? { ...deal, status: nieuweStatus, bijgewerkt: new Date() }
              : deal
          ),
        }));
      },

      // Contact acties
      voegContactToe: (contactData) => {
        const nieuwContact: Contact = {
          ...contactData,
          id: genereerId(),
          aangemaakt: new Date(),
          bijgewerkt: new Date(),
        };
        set((state) => ({
          contacten: [...state.contacten, nieuwContact],
        }));
        return nieuwContact;
      },

      werkContactBij: (id, updates) => {
        set((state) => ({
          contacten: state.contacten.map((contact) =>
            contact.id === id
              ? { ...contact, ...updates, bijgewerkt: new Date() }
              : contact
          ),
        }));
      },

      verwijderContact: (id) => {
        set((state) => ({
          contacten: state.contacten.filter((contact) => contact.id !== id),
        }));
      },

      // Notitie acties
      voegNotitieToe: (dealId, inhoud) => {
        const nieuweNotitie: Notitie = {
          id: genereerId(),
          inhoud,
          aangemaakt: new Date(),
          bijgewerkt: new Date(),
        };
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  notities: [...deal.notities, nieuweNotitie],
                  bijgewerkt: new Date(),
                }
              : deal
          ),
        }));
      },

      verwijderNotitie: (dealId, notitieId) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  notities: deal.notities.filter((n) => n.id !== notitieId),
                  bijgewerkt: new Date(),
                }
              : deal
          ),
        }));
      },

      // Activiteit acties
      voegActiviteitToe: (dealId, activiteitData) => {
        const nieuweActiviteit: Activiteit = {
          ...activiteitData,
          id: genereerId(),
        };
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  activiteiten: [...deal.activiteiten, nieuweActiviteit],
                  bijgewerkt: new Date(),
                }
              : deal
          ),
        }));
      },

      werkActiviteitBij: (dealId, activiteitId, updates) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  activiteiten: deal.activiteiten.map((a) =>
                    a.id === activiteitId ? { ...a, ...updates } : a
                  ),
                  bijgewerkt: new Date(),
                }
              : deal
          ),
        }));
      },

      verwijderActiviteit: (dealId, activiteitId) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  activiteiten: deal.activiteiten.filter(
                    (a) => a.id !== activiteitId
                  ),
                  bijgewerkt: new Date(),
                }
              : deal
          ),
        }));
      },

      // Document acties
      voegDocumentToe: (dealId, documentData) => {
        const nieuwDocument: Document = {
          ...documentData,
          id: genereerId(),
          geupload: new Date(),
        };
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  documenten: [...deal.documenten, nieuwDocument],
                  bijgewerkt: new Date(),
                }
              : deal
          ),
        }));
      },

      verwijderDocument: (dealId, documentId) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  documenten: deal.documenten.filter((d) => d.id !== documentId),
                  bijgewerkt: new Date(),
                }
              : deal
          ),
        }));
      },

      // UI acties
      selecteerDeal: (deal) => {
        set({ geselecteerdeDeal: deal });
      },

      setFilterOpties: (opties) => {
        set((state) => ({
          filterOpties: { ...state.filterOpties, ...opties },
        }));
      },

      setSorteerOpties: (opties) => {
        set({ sorteerOpties: opties });
      },

      setZoekterm: (term) => {
        set({ zoekterm: term });
      },

      // Integratie acties
      updateIntegratieConfig: (integratie, config) => {
        set((state) => ({
          integratieConfig: {
            ...state.integratieConfig,
            [integratie]: {
              ...state.integratieConfig[integratie],
              ...config,
            },
          },
        }));
      },

      // Computed
      getGefilterdeDeals: () => {
        const { deals, filterOpties, zoekterm, sorteerOpties } = get();
        let gefilterd = [...deals];

        // Zoekterm filter
        if (zoekterm) {
          const term = zoekterm.toLowerCase();
          gefilterd = gefilterd.filter(
            (deal) =>
              deal.titel.toLowerCase().includes(term) ||
              deal.contact.naam.toLowerCase().includes(term) ||
              deal.contact.bedrijf?.toLowerCase().includes(term)
          );
        }

        // Status filter
        if (filterOpties.status && filterOpties.status.length > 0) {
          gefilterd = gefilterd.filter((deal) =>
            filterOpties.status!.includes(deal.status)
          );
        }

        // Waarde filters
        if (filterOpties.minWaarde !== undefined) {
          gefilterd = gefilterd.filter(
            (deal) => deal.waarde >= filterOpties.minWaarde!
          );
        }
        if (filterOpties.maxWaarde !== undefined) {
          gefilterd = gefilterd.filter(
            (deal) => deal.waarde <= filterOpties.maxWaarde!
          );
        }

        // Sorteer
        gefilterd.sort((a, b) => {
          let waardeA: any = a[sorteerOpties.veld as keyof Deal];
          let waardeB: any = b[sorteerOpties.veld as keyof Deal];

          if (waardeA instanceof Date) waardeA = waardeA.getTime();
          if (waardeB instanceof Date) waardeB = waardeB.getTime();

          if (typeof waardeA === 'string') {
            return sorteerOpties.richting === 'oplopend'
              ? waardeA.localeCompare(waardeB)
              : waardeB.localeCompare(waardeA);
          }

          return sorteerOpties.richting === 'oplopend'
            ? waardeA - waardeB
            : waardeB - waardeA;
        });

        return gefilterd;
      },

      getDashboardStats: () => {
        const { deals } = get();
        const openStatussen: DealStatus[] = ['lead', 'contact', 'offerte', 'onderhandeling'];

        const stats: DashboardStats = {
          totaalDeals: deals.length,
          totaleWaarde: deals.reduce((sum, d) => sum + d.waarde, 0),
          gewonnenWaarde: deals
            .filter((d) => d.status === 'gewonnen')
            .reduce((sum, d) => sum + d.waarde, 0),
          openDeals: deals.filter((d) => openStatussen.includes(d.status)).length,
          gemiddeldeKans:
            deals.length > 0
              ? deals.reduce((sum, d) => sum + d.kans, 0) / deals.length
              : 0,
          verwachteOmzet: deals
            .filter((d) => openStatussen.includes(d.status))
            .reduce((sum, d) => sum + berekenVerwachteOmzet(d.waarde, d.kans), 0),
          dealsPerStatus: {
            lead: deals.filter((d) => d.status === 'lead').length,
            contact: deals.filter((d) => d.status === 'contact').length,
            offerte: deals.filter((d) => d.status === 'offerte').length,
            onderhandeling: deals.filter((d) => d.status === 'onderhandeling').length,
            gewonnen: deals.filter((d) => d.status === 'gewonnen').length,
            verloren: deals.filter((d) => d.status === 'verloren').length,
          },
          waardePerStatus: {
            lead: deals.filter((d) => d.status === 'lead').reduce((sum, d) => sum + d.waarde, 0),
            contact: deals.filter((d) => d.status === 'contact').reduce((sum, d) => sum + d.waarde, 0),
            offerte: deals.filter((d) => d.status === 'offerte').reduce((sum, d) => sum + d.waarde, 0),
            onderhandeling: deals.filter((d) => d.status === 'onderhandeling').reduce((sum, d) => sum + d.waarde, 0),
            gewonnen: deals.filter((d) => d.status === 'gewonnen').reduce((sum, d) => sum + d.waarde, 0),
            verloren: deals.filter((d) => d.status === 'verloren').reduce((sum, d) => sum + d.waarde, 0),
          },
        };

        return stats;
      },

      getDealsVoorStatus: (status) => {
        return get().deals.filter((deal) => deal.status === status);
      },
    }),
    {
      name: 'sales-pipeline-storage',
      partialize: (state) => ({
        deals: state.deals,
        contacten: state.contacten,
        integratieConfig: state.integratieConfig,
      }),
    }
  )
);
