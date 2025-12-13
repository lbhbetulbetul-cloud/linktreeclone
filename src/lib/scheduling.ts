import { Database } from '@/types/database.types';
import { i18n } from './i18n';

type Link = Database['public']['Tables']['links']['Row'];

export function isLinkWithinSchedule(link: Link): boolean {
  if (link.status !== 'aktif') return false;
  if (!link.start_date && !link.end_date) return true;

  const now = new Date();
  const startDate = link.start_date ? new Date(link.start_date) : null;
  const endDate = link.end_date ? new Date(link.end_date) : null;

  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;

  return true;
}

export function formatScheduleDisplay(link: Link): string | null {
  if (!link.start_date && !link.end_date) return null;

  const parts: string[] = [];

  if (link.start_date) {
    parts.push(
      `${i18n.startDate}: ${new Date(link.start_date).toLocaleDateString('id-ID')}`
    );
  }

  if (link.end_date) {
    parts.push(
      `${i18n.endDate}: ${new Date(link.end_date).toLocaleDateString('id-ID')}`
    );
  }

  return parts.join(' - ');
}

export function getScheduleWarning(link: Link): string | null {
  if (link.status !== 'aktif') return null;
  if (isLinkWithinSchedule(link)) return null;

  const now = new Date();
  const startDate = link.start_date ? new Date(link.start_date) : null;
  const endDate = link.end_date ? new Date(link.end_date) : null;

  if (startDate && now < startDate) {
    return `${i18n.schedulingWarning}: akan aktif pada ${startDate.toLocaleDateString('id-ID')}`;
  }

  if (endDate && now > endDate) {
    return `${i18n.schedulingWarning}: berakhir pada ${endDate.toLocaleDateString('id-ID')}`;
  }

  return i18n.schedulingWarning;
}
