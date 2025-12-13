import { Database } from '@/types/database.types';

type Link = Database['public']['Tables']['links']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

interface ExportData {
  version: string;
  exportDate: string;
  links: Array<
    Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
      groupName?: string;
    }
  >;
}

export function exportToJSON(
  links: Link[],
  groups: Group[]
): string {
  const groupMap = new Map(groups.map((g) => [g.id, g.name]));

  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    links: links.map((link) => ({
      ...link,
      group_id: undefined,
      user_id: undefined,
      created_at: undefined,
      updated_at: undefined,
      groupName: link.group_id ? groupMap.get(link.group_id) : undefined,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function exportToCSV(
  links: Link[],
  groups: Group[]
): string {
  const groupMap = new Map(groups.map((g) => [g.id, g.name]));

  const headers = [
    'title',
    'url',
    'deskripsi',
    'group',
    'icon',
    'warna_tombol',
    'gaya_tombol',
    'status',
    'start_date',
    'end_date',
  ];

  const rows = links.map((link) => [
    `"${link.title.replace(/"/g, '""')}"`,
    `"${link.url}"`,
    `"${(link.deskripsi || '').replace(/"/g, '""')}"`,
    `"${(link.group_id ? groupMap.get(link.group_id) : '').replace(/"/g, '""')}"`,
    `"${link.icon || ''}"`,
    link.warna_tombol,
    link.gaya_tombol,
    link.status,
    link.start_date || '',
    link.end_date || '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

interface CSVRow {
  title: string;
  url: string;
  deskripsi?: string;
  group?: string;
  [key: string]: string | undefined;
}

export function parseCSV(csv: string): CSVRow[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().toLowerCase());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim();
    });

    if (row.title && row.url) {
      rows.push(row);
    }
  }

  return rows;
}

export function parseJSON(json: string): ExportData {
  return JSON.parse(json);
}

export function validateImportData(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  data.forEach((item, index) => {
    if (!item.title) errors.push(`Baris ${index + 1}: Judul diperlukan`);
    if (!item.url)
      errors.push(`Baris ${index + 1}: URL diperlukan`);
    else {
      try {
        new URL(item.url);
      } catch {
        errors.push(`Baris ${index + 1}: URL tidak valid`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function detectDuplicates(
  importedData: any[],
  existingLinks: Link[]
): { [key: string]: string[] } {
  const existingUrls = new Set(existingLinks.map((l) => l.url));
  const duplicates: { [key: string]: string[] } = {};

  importedData.forEach((item, index) => {
    if (existingUrls.has(item.url)) {
      const key = item.url;
      if (!duplicates[key]) duplicates[key] = [];
      duplicates[key].push(`Baris ${index + 1}: ${item.title}`);
    }
  });

  return duplicates;
}
