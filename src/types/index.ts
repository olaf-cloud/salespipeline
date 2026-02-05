// Basis types voor de sales pipeline

export type DealStatus =
  | 'lead'
  | 'contact'
  | 'offerte'
  | 'onderhandeling'
  | 'gewonnen'
  | 'verloren';

export interface Contact {
  id: string;
  naam: string;
  email: string;
  telefoon?: string;
  bedrijf?: string;
  functie?: string;
  notities?: string;
  aangemaakt: Date;
  bijgewerkt: Date;
}

export interface Deal {
  id: string;
  titel: string;
  waarde: number;
  status: DealStatus;
  contact: Contact;
  beschrijving?: string;
  verwachteSluitdatum?: Date;
  kans: number; // percentage 0-100
  bronType?: 'website' | 'referral' | 'cold-call' | 'linkedin' | 'anders';
  notities: Notitie[];
  activiteiten: Activiteit[];
  documenten: Document[];
  offorteOfferte?: OfforteOfferte;
  moneybirdFactuur?: MoneybirdFactuur;
  aangemaakt: Date;
  bijgewerkt: Date;
}

export interface Notitie {
  id: string;
  inhoud: string;
  aangemaakt: Date;
  bijgewerkt: Date;
}

export interface Activiteit {
  id: string;
  type: 'email' | 'telefoon' | 'vergadering' | 'taak' | 'notitie';
  titel: string;
  beschrijving?: string;
  datum: Date;
  voltooid: boolean;
  herinnering?: Date;
}

export interface Document {
  id: string;
  naam: string;
  type: string;
  url: string;
  googleDriveId?: string;
  grootte?: number;
  geupload: Date;
}

// Offorte integratie types
export interface OfforteOfferte {
  id: string;
  externeId: string;
  nummer: string;
  status: 'concept' | 'verzonden' | 'bekeken' | 'geaccepteerd' | 'afgewezen' | 'verlopen';
  totaalBedrag: number;
  btw: number;
  url: string;
  verzenddatum?: Date;
  vervaldatum?: Date;
  geaccepteerdOp?: Date;
  aangemaakt: Date;
}

// Moneybird integratie types
export interface MoneybirdFactuur {
  id: string;
  externeId: string;
  factuurnummer: string;
  status: 'concept' | 'open' | 'betaald' | 'verlopen' | 'oninbaar';
  totaalBedrag: number;
  btw: number;
  openstaandBedrag: number;
  factuurdatum: Date;
  vervaldatum: Date;
  betaaldOp?: Date;
  url: string;
}

// Google Drive integratie types
export interface GoogleDriveMap {
  id: string;
  naam: string;
  url: string;
  bestanden: GoogleDriveBestand[];
}

export interface GoogleDriveBestand {
  id: string;
  naam: string;
  mimeType: string;
  url: string;
  grootte?: number;
  gewijzigd: Date;
}

// Pipeline kolom configuratie
export interface PipelineKolom {
  id: DealStatus;
  naam: string;
  kleur: string;
  icoon: string;
}

// Dashboard statistieken
export interface DashboardStats {
  totaalDeals: number;
  totaleWaarde: number;
  gewonnenWaarde: number;
  openDeals: number;
  gemiddeldeKans: number;
  verwachteOmzet: number;
  dealsPerStatus: Record<DealStatus, number>;
  waardePerStatus: Record<DealStatus, number>;
}

// Integratie configuratie
export interface IntegratieConfig {
  offorte: {
    aangesloten: boolean;
    apiKey?: string;
    laatstGesynchroniseerd?: Date;
  };
  googleDrive: {
    aangesloten: boolean;
    accessToken?: string;
    refreshToken?: string;
    hoofdMapId?: string;
    laatstGesynchroniseerd?: Date;
  };
  moneybird: {
    aangesloten: boolean;
    apiKey?: string;
    administratieId?: string;
    laatstGesynchroniseerd?: Date;
  };
}

// Filter en sorteer opties
export interface FilterOpties {
  status?: DealStatus[];
  minWaarde?: number;
  maxWaarde?: number;
  zoekterm?: string;
  startDatum?: Date;
  eindDatum?: Date;
}

export type SorteerVeld = 'titel' | 'waarde' | 'aangemaakt' | 'bijgewerkt' | 'verwachteSluitdatum' | 'kans';
export type SorteerRichting = 'oplopend' | 'aflopend';

export interface SorteerOpties {
  veld: SorteerVeld;
  richting: SorteerRichting;
}
