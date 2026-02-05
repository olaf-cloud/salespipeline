'use client';

import { useState } from 'react';
import {
  Search,
  Upload,
  FolderOpen,
  FileText,
  File,
  Image,
  Film,
  Music,
  Archive,
  ExternalLink,
  Download,
  Trash2,
  MoreVertical,
  Grid,
  List,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { usePipelineStore } from '@/store/pipelineStore';
import { formatDatum, formatRelatieveDatum, cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

function getBestandIcoon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf')) return FileText;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  return File;
}

function formatGrootte(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentenPage() {
  const { deals } = usePipelineStore();
  const [zoekterm, setZoekterm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Verzamel alle documenten van alle deals
  const alleDocumenten = deals.flatMap((deal) =>
    deal.documenten.map((doc) => ({
      ...doc,
      dealTitel: deal.titel,
      dealId: deal.id,
    }))
  );

  const gefilterdeDocumenten = alleDocumenten.filter(
    (doc) =>
      doc.naam.toLowerCase().includes(zoekterm.toLowerCase()) ||
      doc.dealTitel.toLowerCase().includes(zoekterm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documenten</h1>
              <p className="text-gray-500 mt-1">
                {alleDocumenten.length} document{alleDocumenten.length !== 1 && 'en'} in totaal
              </p>
            </div>
            <Button>
              <Upload className="w-4 h-4" />
              Upload document
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek documenten..."
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Documenten */}
          {gefilterdeDocumenten.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gefilterdeDocumenten.map((doc) => {
                  const Icoon = getBestandIcoon(doc.type);
                  return (
                    <div
                      key={doc.id}
                      className="card p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icoon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 truncate mb-1" title={doc.naam}>
                        {doc.naam}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{doc.dealTitel}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatRelatieveDatum(doc.geupload)} - {formatGrootte(doc.grootte)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Naam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Deal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Grootte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Geupload
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gefilterdeDocumenten.map((doc) => {
                      const Icoon = getBestandIcoon(doc.type);
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Icoon className="w-5 h-5 text-gray-500" />
                              </div>
                              <span className="font-medium text-gray-900">{doc.naam}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{doc.dealTitel}</td>
                          <td className="px-6 py-4 text-gray-500">{formatGrootte(doc.grootte)}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {formatDatum(doc.geupload)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="card">
              <div className="p-12 text-center">
                <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Geen documenten</h3>
                <p className="text-gray-500 mb-4">
                  {zoekterm
                    ? 'Geen documenten gevonden voor deze zoekterm'
                    : 'Upload documenten bij je deals of koppel ze vanuit Google Drive'}
                </p>
                <Button>
                  <Upload className="w-4 h-4" />
                  Upload je eerste document
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
