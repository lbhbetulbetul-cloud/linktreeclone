'use client';

import { useMemo, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

export function QrCodeCard({
  title,
  value,
  filename,
  description,
}: {
  title: string;
  value: string;
  filename: string;
  description?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const safeFilename = useMemo(() => {
    const base = filename.trim() || 'qr-code';
    return base.replace(/[^a-z0-9\-_]+/gi, '-').toLowerCase();
  }, [filename]);

  const handleDownload = () => {
    const canvas = wrapperRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFilename}.png`;
    link.click();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Download className="h-4 w-4" />
          Unduh
        </button>
      </div>

      <div ref={wrapperRef} className="mt-4 flex justify-center">
        <QRCodeCanvas value={value} size={220} includeMargin />
      </div>

      <p className="mt-3 break-all text-xs text-gray-500 dark:text-gray-400">
        {value}
      </p>
    </div>
  );
}
