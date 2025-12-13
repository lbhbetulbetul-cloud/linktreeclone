'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { linkFormSchema, LinkFormData } from '@/lib/validation';
import { i18n } from '@/lib/i18n';
import { ICON_PRESETS, TIMEZONES } from '@/lib/constants';
import { Database } from '@/types/database.types';
import { useState } from 'react';

type Group = Database['public']['Tables']['groups']['Row'];

interface LinkFormProps {
  onSubmit: (data: LinkFormData) => Promise<void>;
  initialData?: Partial<LinkFormData>;
  groups: Group[];
  isLoading?: boolean;
}

export function LinkForm({
  onSubmit,
  initialData,
  groups,
  isLoading,
}: LinkFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      url: initialData?.url || '',
      deskripsi: initialData?.deskripsi || '',
      icon: initialData?.icon || '',
      warna_tombol: initialData?.warna_tombol || '#3b82f6',
      gaya_tombol: initialData?.gaya_tombol || 'solid',
      status: initialData?.status || 'aktif',
      timezone: initialData?.timezone || 'UTC',
      share_twitter: initialData?.share_twitter || false,
      share_facebook: initialData?.share_facebook || false,
      share_linkedin: initialData?.share_linkedin || false,
      share_whatsapp: initialData?.share_whatsapp || false,
      group_id: initialData?.group_id || '',
    },
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const warna_tombol = watch('warna_tombol');
  const gaya_tombol = watch('gaya_tombol');
  const icon = watch('icon');

  const handleFormSubmit = async (data: LinkFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getButtonClass = (color: string, style: string) => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors';
    if (style === 'solid') {
      return `${baseClass} text-white`;
    } else if (style === 'outline') {
      return `${baseClass} border-2`;
    } else {
      return `${baseClass} hover:bg-gray-100 dark:hover:bg-gray-800`;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.title}</h3>
        <input
          {...register('title')}
          placeholder={i18n.titlePlaceholder}
          className="w-full"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.url}</h3>
        <input
          {...register('url')}
          placeholder={i18n.urlPlaceholder}
          type="url"
          className="w-full"
        />
        {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.deskripsi}</h3>
        <textarea
          {...register('deskripsi')}
          placeholder={i18n.deskripsiPlaceholder}
          rows={3}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.icon}</h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIconPickerOpen(!iconPickerOpen)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-2xl hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {icon || '🔗'}
          </button>
          {iconPickerOpen && (
            <div className="grid grid-cols-4 gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
              {ICON_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setValue('icon', emoji);
                    setIconPickerOpen(false);
                  }}
                  className="flex h-8 w-full items-center justify-center rounded text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Styling */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">{i18n.colorButton}</h3>
        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="h-10 w-10 rounded-lg border-2 border-gray-300 transition-all"
              style={{ backgroundColor: warna_tombol }}
            />
            {colorPickerOpen && (
              <div className="absolute top-12 left-0 z-10 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <input
                  type="color"
                  {...register('warna_tombol')}
                  value={warna_tombol}
                  className="h-20 w-20 cursor-pointer rounded"
                />
              </div>
            )}
          </div>
          <input
            {...register('warna_tombol')}
            type="text"
            className="flex-1"
            placeholder="#3b82f6"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.buttonStyle}</h3>
        <select {...register('gaya_tombol')} className="w-full">
          <option value="solid">{i18n.solid}</option>
          <option value="outline">{i18n.outline}</option>
          <option value="ghost">{i18n.ghost}</option>
        </select>
      </div>

      {/* Preview */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">{i18n.preview}</h3>
        <button
          type="button"
          className={getButtonClass(warna_tombol, gaya_tombol)}
          style={{
            backgroundColor: gaya_tombol === 'solid' ? warna_tombol : 'transparent',
            color: gaya_tombol === 'outline' ? warna_tombol : undefined,
            borderColor: gaya_tombol === 'outline' ? warna_tombol : undefined,
          }}
        >
          {i18n.preview}
        </button>
      </div>

      {/* Social Share */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">{i18n.socialShare}</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('share_twitter')} />
            {i18n.twitter}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('share_facebook')} />
            {i18n.facebook}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('share_linkedin')} />
            {i18n.linkedin}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('share_whatsapp')} />
            {i18n.whatsapp}
          </label>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">{i18n.status}</h3>
        <select {...register('status')} className="w-full">
          <option value="aktif">{i18n.active}</option>
          <option value="draf">{i18n.draft}</option>
        </select>
      </div>

      {/* Scheduling */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">{i18n.scheduling}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">{i18n.startDate}</label>
            <input type="date" {...register('start_date')} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">{i18n.endDate}</label>
            <input type="date" {...register('end_date')} className="w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">{i18n.timezone}</label>
          <select {...register('timezone')} className="w-full">
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Group Assignment */}
      {groups.length > 0 && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold">{i18n.group}</h3>
          <select {...register('group_id')} className="w-full">
            <option value="">{i18n.noGroup}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? i18n.loading : i18n.save}
      </button>
    </form>
  );
}
