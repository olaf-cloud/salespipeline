/**
 * Google Drive API Service
 *
 * Voor document management en opslag.
 * API documentatie: https://developers.google.com/drive/api/v3/reference
 */

import { GoogleDriveMap, GoogleDriveBestand, Deal } from '@/types';

const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

interface GoogleDriveConfig {
  accessToken: string;
  refreshToken?: string;
  hoofdMapId?: string;
}

interface GoogleDriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  size?: string;
  modifiedTime: string;
  parents?: string[];
}

interface GoogleDriveApiFolder {
  id: string;
  name: string;
  webViewLink: string;
}

class GoogleDriveService {
  private accessToken: string | null = null;
  private hoofdMapId: string | null = null;

  setConfig(config: GoogleDriveConfig) {
    this.accessToken = config.accessToken;
    this.hoofdMapId = config.hoofdMapId || null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Google Drive access token niet geconfigureerd');
    }

    const response = await fetch(`${GOOGLE_DRIVE_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Google Drive API fout: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Maak een map aan voor een deal
   */
  async maakDealMap(deal: Deal): Promise<GoogleDriveMap> {
    const mapNaam = `${deal.contact.bedrijf || deal.contact.naam} - ${deal.titel}`;

    const folder = await this.request<GoogleDriveApiFolder>('/files', {
      method: 'POST',
      body: JSON.stringify({
        name: mapNaam,
        mimeType: 'application/vnd.google-apps.folder',
        parents: this.hoofdMapId ? [this.hoofdMapId] : undefined,
      }),
    });

    return {
      id: folder.id,
      naam: folder.name,
      url: folder.webViewLink,
      bestanden: [],
    };
  }

  /**
   * Haal bestanden op uit een map
   */
  async getBestandenInMap(mapId: string): Promise<GoogleDriveBestand[]> {
    const response = await this.request<{ files: GoogleDriveApiFile[] }>(
      `/files?q='${mapId}'+in+parents&fields=files(id,name,mimeType,webViewLink,size,modifiedTime)`
    );

    return response.files.map(this.mapToGoogleDriveBestand);
  }

  /**
   * Upload een bestand naar een map
   */
  async uploadBestand(
    mapId: string,
    bestand: File
  ): Promise<GoogleDriveBestand> {
    if (!this.accessToken) {
      throw new Error('Google Drive access token niet geconfigureerd');
    }

    // Eerst metadata aanmaken
    const metadata = {
      name: bestand.name,
      parents: [mapId],
    };

    // Multipart upload
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', bestand);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload mislukt: ${response.status}`);
    }

    const file = await response.json();
    return this.mapToGoogleDriveBestand(file);
  }

  /**
   * Verwijder een bestand
   */
  async verwijderBestand(bestandId: string): Promise<void> {
    await this.request(`/files/${bestandId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Zoek bestanden
   */
  async zoekBestanden(zoekterm: string, mapId?: string): Promise<GoogleDriveBestand[]> {
    let query = `name contains '${zoekterm}'`;
    if (mapId) {
      query += ` and '${mapId}' in parents`;
    }

    const response = await this.request<{ files: GoogleDriveApiFile[] }>(
      `/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,size,modifiedTime)`
    );

    return response.files.map(this.mapToGoogleDriveBestand);
  }

  /**
   * Haal de hoofdmap op of maak deze aan
   */
  async getOfMaakHoofdMap(mapNaam: string = 'Sales Pipeline'): Promise<string> {
    // Zoek naar bestaande map
    const response = await this.request<{ files: GoogleDriveApiFolder[] }>(
      `/files?q=name='${mapNaam}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    );

    if (response.files.length > 0) {
      this.hoofdMapId = response.files[0].id;
      return this.hoofdMapId;
    }

    // Maak nieuwe map aan
    const folder = await this.request<GoogleDriveApiFolder>('/files', {
      method: 'POST',
      body: JSON.stringify({
        name: mapNaam,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    this.hoofdMapId = folder.id;
    return this.hoofdMapId;
  }

  /**
   * Test de API verbinding
   */
  async testVerbinding(): Promise<boolean> {
    try {
      await this.request('/about?fields=user');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Genereer OAuth URL voor autorisatie
   */
  static getOAuthUrl(clientId: string, redirectUri: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private mapToGoogleDriveBestand(file: GoogleDriveApiFile): GoogleDriveBestand {
    return {
      id: file.id,
      naam: file.name,
      mimeType: file.mimeType,
      url: file.webViewLink,
      grootte: file.size ? parseInt(file.size) : undefined,
      gewijzigd: new Date(file.modifiedTime),
    };
  }
}

export const googleDriveService = new GoogleDriveService();
