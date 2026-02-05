/**
 * Offorte API Service
 *
 * Offorte is een Nederlandse offerte software.
 * API documentatie: https://api.offorte.com/docs
 */

import { OfforteOfferte, Deal, Contact } from '@/types';

const OFFORTE_API_BASE = 'https://api.offorte.com/v2';

interface OfforteConfig {
  apiKey: string;
}

interface OfforteApiOfferte {
  id: string;
  number: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  total: number;
  tax: number;
  url: string;
  sent_at?: string;
  expires_at?: string;
  accepted_at?: string;
  created_at: string;
}

interface OfforteNieuwOfferteData {
  contact: {
    name: string;
    email: string;
    company?: string;
  };
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
  }[];
  expiration_days?: number;
  introduction?: string;
  notes?: string;
}

class OfforteService {
  private apiKey: string | null = null;

  setConfig(config: OfforteConfig) {
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Offorte API key niet geconfigureerd');
    }

    const response = await fetch(`${OFFORTE_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Offorte API fout: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Haal alle offertes op
   */
  async getOffertes(): Promise<OfforteOfferte[]> {
    const response = await this.request<{ proposals: OfforteApiOfferte[] }>('/proposals');

    return response.proposals.map(this.mapToOfforteOfferte);
  }

  /**
   * Haal een specifieke offerte op
   */
  async getOfferte(id: string): Promise<OfforteOfferte> {
    const response = await this.request<{ proposal: OfforteApiOfferte }>(`/proposals/${id}`);

    return this.mapToOfforteOfferte(response.proposal);
  }

  /**
   * Maak een nieuwe offerte aan
   */
  async maakOfferte(data: OfforteNieuwOfferteData): Promise<OfforteOfferte> {
    const response = await this.request<{ proposal: OfforteApiOfferte }>('/proposals', {
      method: 'POST',
      body: JSON.stringify({
        contact: data.contact,
        items: data.items,
        expiration_days: data.expiration_days || 14,
        introduction: data.introduction,
        notes: data.notes,
      }),
    });

    return this.mapToOfforteOfferte(response.proposal);
  }

  /**
   * Maak een offerte aan vanuit een deal
   */
  async maakOfferteVanDeal(deal: Deal, items?: OfforteNieuwOfferteData['items']): Promise<OfforteOfferte> {
    const offerteItems = items || [
      {
        description: deal.titel,
        quantity: 1,
        unit_price: deal.waarde,
        tax_rate: 21,
      },
    ];

    return this.maakOfferte({
      contact: {
        name: deal.contact.naam,
        email: deal.contact.email,
        company: deal.contact.bedrijf,
      },
      items: offerteItems,
      introduction: deal.beschrijving,
    });
  }

  /**
   * Verstuur een offerte
   */
  async verstuurOfferte(offerteId: string, bericht?: string): Promise<OfforteOfferte> {
    const response = await this.request<{ proposal: OfforteApiOfferte }>(
      `/proposals/${offerteId}/send`,
      {
        method: 'POST',
        body: JSON.stringify({ message: bericht }),
      }
    );

    return this.mapToOfforteOfferte(response.proposal);
  }

  /**
   * Download offerte als PDF
   */
  async downloadPdf(offerteId: string): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('Offorte API key niet geconfigureerd');
    }

    const response = await fetch(`${OFFORTE_API_BASE}/proposals/${offerteId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Kan PDF niet downloaden: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Test de API verbinding
   */
  async testVerbinding(): Promise<boolean> {
    try {
      await this.request('/me');
      return true;
    } catch {
      return false;
    }
  }

  private mapToOfforteOfferte(apiOfferte: OfforteApiOfferte): OfforteOfferte {
    const statusMap: Record<string, OfforteOfferte['status']> = {
      draft: 'concept',
      sent: 'verzonden',
      viewed: 'bekeken',
      accepted: 'geaccepteerd',
      declined: 'afgewezen',
      expired: 'verlopen',
    };

    return {
      id: `offorte-${apiOfferte.id}`,
      externeId: apiOfferte.id,
      nummer: apiOfferte.number,
      status: statusMap[apiOfferte.status] || 'concept',
      totaalBedrag: apiOfferte.total,
      btw: apiOfferte.tax,
      url: apiOfferte.url,
      verzenddatum: apiOfferte.sent_at ? new Date(apiOfferte.sent_at) : undefined,
      vervaldatum: apiOfferte.expires_at ? new Date(apiOfferte.expires_at) : undefined,
      geaccepteerdOp: apiOfferte.accepted_at ? new Date(apiOfferte.accepted_at) : undefined,
      aangemaakt: new Date(apiOfferte.created_at),
    };
  }
}

export const offorteService = new OfforteService();

// Export types voor gebruik in componenten
export type { OfforteNieuwOfferteData };
