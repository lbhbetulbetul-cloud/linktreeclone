'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupFormSchema, GroupFormData } from '@/lib/validation';
import { i18n } from '@/lib/i18n';
import { ICON_PRESETS } from '@/lib/constants';
import { useState } from 'react';

interface GroupFormProps {
  onSubmit: (data: GroupFormData) => Promise<void>;
  initialData?: Partial<GroupFormData>;
  isLoading?: boolean;
}

export function GroupForm({
  onSubmit,
  initialData,
  isLoading,
}: GroupFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || '#8b5cf6',
      icon: initialData?.icon || '📱',
    },
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const color = watch('color');
  const icon = watch('icon');

  const handleFormSubmit = async (data: GroupFormData) => {
    try {
      await onSubmit(data);
      reset({
        name: '',
        color: '#8b5cf6',
        icon: '📱',
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleIconSelect = (emoji: string) => {
    setValue('icon', emoji);
    setIconPickerOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.groupName}</h3>
        <input
          {...register('name')}
          placeholder={i18n.groupName}
          className="w-full"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.groupColor}</h3>
        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="h-10 w-10 rounded-lg border-2 border-gray-300 transition-all"
              style={{ backgroundColor: color }}
            />
            {colorPickerOpen && (
              <div className="absolute top-12 left-0 z-10 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <input
                  type="color"
                  {...register('color')}
                  value={color}
                  className="h-20 w-20 cursor-pointer rounded"
                />
              </div>
            )}
          </div>
          <input
            {...register('color')}
            type="text"
            className="flex-1"
            placeholder="#8b5cf6"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">{i18n.groupIcon}</h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIconPickerOpen(!iconPickerOpen)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-2xl hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {icon || '📱'}
          </button>
          {iconPickerOpen && (
            <div className="grid grid-cols-4 gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
              {ICON_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleIconSelect(emoji)}
                  className="flex h-8 w-full items-center justify-center rounded text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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
