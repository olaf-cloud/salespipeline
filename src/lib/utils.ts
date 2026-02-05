import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBedrag(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(bedrag);
}

export function formatDatum(datum: Date | string): string {
  const d = typeof datum === 'string' ? new Date(datum) : datum;
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatDatumKort(datum: Date | string): string {
  const d = typeof datum === 'string' ? new Date(datum) : datum;
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatRelatieveDatum(datum: Date | string): string {
  const d = typeof datum === 'string' ? new Date(datum) : datum;
  const nu = new Date();
  const verschilMs = nu.getTime() - d.getTime();
  const verschilDagen = Math.floor(verschilMs / (1000 * 60 * 60 * 24));

  if (verschilDagen === 0) {
    return 'Vandaag';
  } else if (verschilDagen === 1) {
    return 'Gisteren';
  } else if (verschilDagen < 7) {
    return `${verschilDagen} dagen geleden`;
  } else if (verschilDagen < 30) {
    const weken = Math.floor(verschilDagen / 7);
    return `${weken} ${weken === 1 ? 'week' : 'weken'} geleden`;
  } else {
    return formatDatumKort(d);
  }
}

export function genereerId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function berekenVerwachteOmzet(waarde: number, kans: number): number {
  return waarde * (kans / 100);
}

export function getStatusKleur(status: string): string {
  const kleuren: Record<string, string> = {
    lead: 'bg-gray-100 text-gray-700 border-gray-300',
    contact: 'bg-blue-100 text-blue-700 border-blue-300',
    offerte: 'bg-purple-100 text-purple-700 border-purple-300',
    onderhandeling: 'bg-amber-100 text-amber-700 border-amber-300',
    gewonnen: 'bg-green-100 text-green-700 border-green-300',
    verloren: 'bg-red-100 text-red-700 border-red-300',
  };
  return kleuren[status] || 'bg-gray-100 text-gray-700';
}

export function getStatusNaam(status: string): string {
  const namen: Record<string, string> = {
    lead: 'Lead',
    contact: 'Contact gelegd',
    offerte: 'Offerte verstuurd',
    onderhandeling: 'In onderhandeling',
    gewonnen: 'Gewonnen',
    verloren: 'Verloren',
  };
  return namen[status] || status;
}

export function getBronNaam(bron: string): string {
  const namen: Record<string, string> = {
    website: 'Website',
    referral: 'Doorverwijzing',
    'cold-call': 'Cold call',
    linkedin: 'LinkedIn',
    anders: 'Anders',
  };
  return namen[bron] || bron;
}

export function getActiviteitIcoon(type: string): string {
  const iconen: Record<string, string> = {
    email: 'Mail',
    telefoon: 'Phone',
    vergadering: 'Calendar',
    taak: 'CheckSquare',
    notitie: 'FileText',
  };
  return iconen[type] || 'Circle';
}

export function sorteerDeals<T extends { [key: string]: any }>(
  items: T[],
  veld: string,
  richting: 'oplopend' | 'aflopend'
): T[] {
  return [...items].sort((a, b) => {
    let waardeA = a[veld];
    let waardeB = b[veld];

    if (waardeA instanceof Date) waardeA = waardeA.getTime();
    if (waardeB instanceof Date) waardeB = waardeB.getTime();

    if (typeof waardeA === 'string') {
      return richting === 'oplopend'
        ? waardeA.localeCompare(waardeB)
        : waardeB.localeCompare(waardeA);
    }

    return richting === 'oplopend' ? waardeA - waardeB : waardeB - waardeA;
  });
}
