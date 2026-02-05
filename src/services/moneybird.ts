/**
 * Moneybird API Service
 *
 * Moneybird is Nederlandse boekhoudsoftware.
 * API documentatie: https://developer.moneybird.com/
 */

import { MoneybirdFactuur, Deal, Contact } from '@/types';

const MONEYBIRD_API_BASE = 'https://moneybird.com/api/v2';

interface MoneybirdConfig {
  apiKey: string;
  administratieId: string;
}

interface MoneybirdApiFactuur {
  id: string;
  invoice_id: string;
  state: 'draft' | 'open' | 'scheduled' | 'pending_payment' | 'late' | 'paid' | 'uncollectible';
  total_price_incl_tax: string;
  total_tax: string;
  total_unpaid: string;
  invoice_date: string;
  due_date: string;
  paid_at?: string;
  url: string;
}

interface MoneybirdApiContact {
  id: string;
  company_name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}

interface MoneybirdNieuwFactuurData {
  contactId: string;
  regels: {
    beschrijving: string;
    aantal: number;
    prijs: number;
    btwPercentage?: number;
  }[];
  factuurdatum?: Date;
  betalingstermijn?: number;
  referentie?: string;
}

interface MoneybirdNieuwContactData {
  bedrijfsnaam?: string;
  voornaam: string;
  achternaam?: string;
  email: string;
  telefoon?: string;
}

class MoneybirdService {
  private apiKey: string | null = null;
  private administratieId: string | null = null;

  setConfig(config: MoneybirdConfig) {
    this.apiKey = config.apiKey;
    this.administratieId = config.administratieId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey || !this.administratieId) {
      throw new Error('Moneybird API niet geconfigureerd');
    }

    const url = `${MONEYBIRD_API_BASE}/${this.administratieId}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Moneybird API fout: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Haal alle facturen op
   */
  async getFacturen(): Promise<MoneybirdFactuur[]> {
    const facturen = await this.request<MoneybirdApiFactuur[]>('/sales_invoices');

    return facturen.map(this.mapToMoneybirdFactuur);
  }

  /**
   * Haal een specifieke factuur op
   */
  async getFactuur(id: string): Promise<MoneybirdFactuur> {
    const factuur = await this.request<MoneybirdApiFactuur>(`/sales_invoices/${id}`);

    return this.mapToMoneybirdFactuur(factuur);
  }

  /**
   * Maak een nieuwe factuur aan
   */
  async maakFactuur(data: MoneybirdNieuwFactuurData): Promise<MoneybirdFactuur> {
    const factuurData = {
      sales_invoice: {
        contact_id: data.contactId,
        reference: data.referentie,
        invoice_date: data.factuurdatum
          ? this.formatDatum(data.factuurdatum)
          : this.formatDatum(new Date()),
        payment_conditions: `${data.betalingstermijn || 14} dagen`,
        details_attributes: data.regels.map((regel) => ({
          description: regel.beschrijving,
          amount: regel.aantal.toString(),
          price: regel.prijs.toString(),
          tax_rate_id: this.getBtwRateId(regel.btwPercentage || 21),
        })),
      },
    };

    const factuur = await this.request<MoneybirdApiFactuur>('/sales_invoices', {
      method: 'POST',
      body: JSON.stringify(factuurData),
    });

    return this.mapToMoneybirdFactuur(factuur);
  }

  /**
   * Maak een factuur aan vanuit een deal
   */
  async maakFactuurVanDeal(deal: Deal): Promise<MoneybirdFactuur> {
    // Eerst contact zoeken of aanmaken
    let contactId = await this.zoekContactOpEmail(deal.contact.email);

    if (!contactId) {
      const nieuwContact = await this.maakContact({
        bedrijfsnaam: deal.contact.bedrijf,
        voornaam: deal.contact.naam.split(' ')[0],
        achternaam: deal.contact.naam.split(' ').slice(1).join(' '),
        email: deal.contact.email,
        telefoon: deal.contact.telefoon,
      });
      contactId = nieuwContact.id;
    }

    return this.maakFactuur({
      contactId,
      regels: [
        {
          beschrijving: deal.titel,
          aantal: 1,
          prijs: deal.waarde,
          btwPercentage: 21,
        },
      ],
      referentie: `Deal: ${deal.id}`,
    });
  }

  /**
   * Verstuur een factuur per e-mail
   */
  async verstuurFactuur(factuurId: string, bericht?: string): Promise<void> {
    await this.request(`/sales_invoices/${factuurId}/send_invoice`, {
      method: 'PATCH',
      body: JSON.stringify({
        sales_invoice_sending: {
          delivery_method: 'Email',
          email_message: bericht,
        },
      }),
    });
  }

  /**
   * Registreer een betaling
   */
  async registreerBetaling(
    factuurId: string,
    bedrag: number,
    datum?: Date
  ): Promise<void> {
    await this.request(`/sales_invoices/${factuurId}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        payment: {
          payment_date: this.formatDatum(datum || new Date()),
          price: bedrag.toString(),
        },
      }),
    });
  }

  /**
   * Maak een nieuw contact aan
   */
  async maakContact(data: MoneybirdNieuwContactData): Promise<{ id: string }> {
    const contact = await this.request<MoneybirdApiContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        contact: {
          company_name: data.bedrijfsnaam,
          firstname: data.voornaam,
          lastname: data.achternaam,
          email: data.email,
          phone: data.telefoon,
        },
      }),
    });

    return { id: contact.id };
  }

  /**
   * Zoek een contact op e-mailadres
   */
  async zoekContactOpEmail(email: string): Promise<string | null> {
    const contacts = await this.request<MoneybirdApiContact[]>(
      `/contacts?query=${encodeURIComponent(email)}`
    );

    const match = contacts.find((c) => c.email === email);
    return match?.id || null;
  }

  /**
   * Download factuur als PDF
   */
  async downloadPdf(factuurId: string): Promise<Blob> {
    if (!this.apiKey || !this.administratieId) {
      throw new Error('Moneybird API niet geconfigureerd');
    }

    const response = await fetch(
      `${MONEYBIRD_API_BASE}/${this.administratieId}/sales_invoices/${factuurId}/download_pdf`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

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
      await this.request('/contacts?per_page=1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Haal de lijst van administraties op
   */
  async getAdministraties(): Promise<{ id: string; name: string }[]> {
    if (!this.apiKey) {
      throw new Error('Moneybird API key niet geconfigureerd');
    }

    const response = await fetch(`${MONEYBIRD_API_BASE}/administrations`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Kan administraties niet ophalen: ${response.status}`);
    }

    return response.json();
  }

  private mapToMoneybirdFactuur(apiFactuur: MoneybirdApiFactuur): MoneybirdFactuur {
    const statusMap: Record<string, MoneybirdFactuur['status']> = {
      draft: 'concept',
      open: 'open',
      scheduled: 'open',
      pending_payment: 'open',
      late: 'verlopen',
      paid: 'betaald',
      uncollectible: 'oninbaar',
    };

    return {
      id: `moneybird-${apiFactuur.id}`,
      externeId: apiFactuur.id,
      factuurnummer: apiFactuur.invoice_id,
      status: statusMap[apiFactuur.state] || 'concept',
      totaalBedrag: parseFloat(apiFactuur.total_price_incl_tax),
      btw: parseFloat(apiFactuur.total_tax),
      openstaandBedrag: parseFloat(apiFactuur.total_unpaid),
      factuurdatum: new Date(apiFactuur.invoice_date),
      vervaldatum: new Date(apiFactuur.due_date),
      betaaldOp: apiFactuur.paid_at ? new Date(apiFactuur.paid_at) : undefined,
      url: apiFactuur.url,
    };
  }

  private formatDatum(datum: Date): string {
    return datum.toISOString().split('T')[0];
  }

  private getBtwRateId(percentage: number): string {
    // Dit zijn standaard Moneybird BTW-tarief IDs
    // In productie zou je deze dynamisch moeten ophalen
    const rates: Record<number, string> = {
      21: '1', // Standaard BTW
      9: '2',  // Laag tarief
      0: '3',  // Geen BTW
    };
    return rates[percentage] || '1';
  }
}

export const moneybirdService = new MoneybirdService();

// Export types
export type { MoneybirdNieuwFactuurData, MoneybirdNieuwContactData };
