'use client';

import { Database } from '@/types/database.types';
import { i18n } from '@/lib/i18n';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { isLinkWithinSchedule, formatScheduleDisplay } from '@/lib/scheduling';

type Link = Database['public']['Tables']['links']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

interface LinkItemProps {
  link: Link;
  group?: Group;
  onEdit: (link: Link) => void;
  onDelete: (linkId: string) => void;
  isDragging?: boolean;
}

export function LinkItem({
  link,
  group,
  onEdit,
  onDelete,
  isDragging,
}: LinkItemProps) {
  const isActive = isLinkWithinSchedule(link);
  const scheduleInfo = formatScheduleDisplay(link);

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all dark:border-gray-700 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${!isActive && link.status === 'aktif' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950' : ''}`}
    >
      <GripVertical className="h-5 w-5 flex-shrink-0 cursor-grab text-gray-400" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {link.title}
          </h3>
          <span
            className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
            style={{
              backgroundColor: group?.color || '#e5e7eb',
              color: group ? '#fff' : '#000',
            }}
          >
            {group?.name || i18n.noGroup}
          </span>
          {link.status === 'draf' && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 whitespace-nowrap">
              {i18n.draft}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
          {link.url}
        </p>

        {link.deskripsi && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
            {link.deskripsi}
          </p>
        )}

        {scheduleInfo && (
          <p
            className={`text-xs mt-2 ${
              !isActive && link.status === 'aktif' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {scheduleInfo}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(link)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={i18n.edit}
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (confirm(i18n.confirmDelete)) {
              onDelete(link.id);
            }
          }}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
          title={i18n.delete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}
