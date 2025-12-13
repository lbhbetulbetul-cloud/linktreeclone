'use client';

import { useMemo, useState } from 'react';
import { Database, Json } from '@/types/database.types';
import { i18n } from '@/lib/i18n';

type ProfileForm = Database['public']['Tables']['profile_forms']['Row'];

type FieldType = 'text' | 'email' | 'tel' | 'textarea';

export type ProfileFormField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
};

function normalizeFields(fields: Json): ProfileFormField[] {
  if (!Array.isArray(fields)) return [];
  return (fields as any[])
    .map((f) => ({
      id: String(f?.id ?? ''),
      name: String(f?.name ?? ''),
      label: String(f?.label ?? ''),
      type: (f?.type as FieldType) || 'text',
      required: Boolean(f?.required),
      placeholder: f?.placeholder ? String(f.placeholder) : undefined,
    }))
    .filter((f) => f.id && f.name && f.label);
}

export function PublicContactForm({ form }: { form: ProfileForm }) {
  const fields = useMemo(() => {
    const normalized = normalizeFields(form.fields);

    if (normalized.length > 0) return normalized;

    return [
      {
        id: 'nama',
        name: 'nama',
        label: 'Nama',
        type: 'text' as const,
        required: true,
        placeholder: 'Nama Anda',
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        required: true,
        placeholder: 'nama@email.com',
      },
      {
        id: 'pesan',
        name: 'pesan',
        label: 'Pesan',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Tulis pesan Anda (opsional)',
      },
    ];
  }, [form.fields]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          data: values,
          source: 'profil',
          referrer: window.location.href,
        }),
      });

      if (!res.ok) throw new Error('Gagal mengirim');

      setStatus('success');
      setValues({});
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{form.title || i18n.contactFormTitle}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {form.description || i18n.contactFormHint}
        </p>
      </div>

      {status === 'success' && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
          {i18n.formSubmitSuccess}
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
          {i18n.formSubmitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => {
          const value = values[field.name] || '';
          const commonProps = {
            id: field.id,
            name: field.name,
            value,
            required: field.required,
            placeholder: field.placeholder,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setValues((prev) => ({ ...prev, [field.name]: e.target.value })),
            className:
              'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white',
          };

          return (
            <div key={field.id}>
              <label htmlFor={field.id} className="mb-1 block text-sm font-medium">
                {field.label}
                {field.required ? <span className="text-red-500"> *</span> : null}
              </label>

              {field.type === 'textarea' ? (
                <textarea rows={4} {...commonProps} />
              ) : (
                <input type={field.type} {...commonProps} />
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? i18n.loading : i18n.submit}
        </button>
      </form>
    </div>
  );
}
