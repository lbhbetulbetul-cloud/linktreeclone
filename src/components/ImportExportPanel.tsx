'use client';

import { useState } from 'react';
import { i18n } from '@/lib/i18n';
import {
  exportToJSON,
  exportToCSV,
  parseCSV,
  parseJSON,
  validateImportData,
  detectDuplicates,
} from '@/lib/import-export';
import { Database } from '@/types/database.types';
import { Download, Upload, AlertCircle } from 'lucide-react';

type Link = Database['public']['Tables']['links']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

interface ImportExportPanelProps {
  links: Link[];
  groups: Group[];
  onImport: (data: any[]) => Promise<void>;
  isLoading?: boolean;
}

export function ImportExportPanel({
  links,
  groups,
  onImport,
  isLoading,
}: ImportExportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const [duplicates, setDuplicates] = useState<{ [key: string]: string[] }>({});
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const handleExportJSON = () => {
    const json = exportToJSON(links, groups);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `links-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(links, groups);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `links-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportErrors([]);
    setImportedData(null);
    setDuplicates({});

    try {
      const content = await file.text();
      let data: any[] = [];

      if (file.name.endsWith('.json')) {
        const json = parseJSON(content);
        data = json.links || [];
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(content);
      } else {
        setImportErrors(['Format file tidak didukung']);
        setImporting(false);
        return;
      }

      const validation = validateImportData(data);
      if (!validation.valid) {
        setImportErrors(validation.errors);
        setImporting(false);
        return;
      }

      const foundDuplicates = detectDuplicates(data, links);
      if (Object.keys(foundDuplicates).length > 0) {
        setDuplicates(foundDuplicates);
      }

      setImportedData(data);
    } catch (error) {
      setImportErrors([`Gagal membaca file: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async (skipDuplicates = true) => {
    if (!importedData) return;

    setImporting(true);
    setProgress(0);

    try {
      const dataToImport = skipDuplicates
        ? importedData.filter((item) => !Object.keys(duplicates).includes(item.url))
        : importedData;

      for (let i = 0; i < dataToImport.length; i++) {
        await onImport(dataToImport.slice(i, i + 1));
        setProgress(Math.round(((i + 1) / dataToImport.length) * 100));
      }

      setImportedData(null);
      setDuplicates({});
    } catch (error) {
      setImportErrors([
        `Gagal mengimpor: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  if (importedData) {
    return (
      <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 className="font-semibold">{i18n.importProgress}</h3>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{i18n.imported}: {importedData.length}</span>
            {Object.keys(duplicates).length > 0 && (
              <span className="text-orange-600">{i18n.duplicates}: {Object.keys(duplicates).length}</span>
            )}
          </div>

          {progress > 0 && (
            <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {Object.keys(duplicates).length > 0 && (
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-800 dark:text-orange-200">
                <p className="font-medium">{i18n.duplicates}:</p>
                <ul className="mt-1 space-y-1">
                  {Object.entries(duplicates)
                    .slice(0, 3)
                    .map(([url, items]) => (
                      <li key={url}>• {items[0]}</li>
                    ))}
                  {Object.keys(duplicates).length > 3 && (
                    <li>... dan {Object.keys(duplicates).length - 3} lagi</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleConfirmImport(true)}
            disabled={importing}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {i18n.skipDuplicates}
          </button>
          <button
            onClick={() => handleConfirmImport(false)}
            disabled={importing}
            className="flex-1 rounded-lg border border-blue-500 px-4 py-2 font-medium text-blue-500 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-950"
          >
            {i18n.importAll}
          </button>
          <button
            onClick={() => {
              setImportedData(null);
              setDuplicates({});
            }}
            disabled={importing}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {i18n.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          <Download className="h-4 w-4" />
          {i18n.exportJSON}
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          <Download className="h-4 w-4" />
          {i18n.exportCSV}
        </button>

        <label className="flex items-center justify-center gap-2 flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 cursor-pointer">
          <Upload className="h-4 w-4" />
          {i18n.importLinks}
          <input
            type="file"
            accept=".csv,.json"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImport(e.target.files[0]);
              }
            }}
            disabled={importing || isLoading}
            className="hidden"
          />
        </label>
      </div>

      {importErrors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium">{i18n.importErrors}</p>
              <ul className="mt-1 space-y-1">
                {importErrors.slice(0, 5).map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
