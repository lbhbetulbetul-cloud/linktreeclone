import { z } from 'zod';

export const linkFormSchema = z.object({
  title: z.string().min(1, 'Judul diperlukan').max(200),
  url: z.string().url('URL tidak valid'),
  deskripsi: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  warna_tombol: z.string().default('#3b82f6'),
  gaya_tombol: z.enum(['solid', 'outline', 'ghost']).default('solid'),
  thumbnail_url: z.string().optional().nullable(),
  preview_title: z.string().optional().nullable(),
  preview_description: z.string().optional().nullable(),
  share_twitter: z.boolean().default(false),
  share_facebook: z.boolean().default(false),
  share_linkedin: z.boolean().default(false),
  share_whatsapp: z.boolean().default(false),
  status: z.enum(['aktif', 'draf']).default('aktif'),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  timezone: z.string().default('UTC'),
  group_id: z.string().optional().nullable(),
});

export type LinkFormData = z.infer<typeof linkFormSchema>;

export const groupFormSchema = z.object({
  name: z.string().min(1, 'Nama grup diperlukan').max(200),
  color: z.string().default('#8b5cf6'),
  icon: z.string().optional().nullable(),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

export const importDataSchema = z.object({
  type: z.enum(['csv', 'json']),
  data: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      deskripsi: z.string().optional(),
      group_name: z.string().optional(),
    })
  ),
});

export type ImportData = z.infer<typeof importDataSchema>;
