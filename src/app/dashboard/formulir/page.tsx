'use client';

import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { i18n } from '@/lib/i18n';
import {
  useAuthenticatedUser,
  useFormSubmissions,
  useProfileForm,
  useUpsertProfileForm,
  useUpdateSubmissionStatus,
} from '@/lib/queries';
import { Database, Json } from '@/types/database.types';

type ProfileForm = Database['public']['Tables']['profile_forms']['Row'];
type FormSubmission = Database['public']['Tables']['form_submissions']['Row'];

type FieldType = 'text' | 'email' | 'tel' | 'textarea';

type FormField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
};

function normalizeFields(fields: Json): FormField[] {
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

function toCsv(rows: Record<string, any>[]) {
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const escape = (value: any) => {
    const str = String(value ?? '');
    if (/[\n",]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const header = keys.map(escape).join(',');
  const lines = rows.map((row) => keys.map((k) => escape(row[k])).join(','));
  return [header, ...lines].join('\n');
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FormsPage() {
  const { data: user, isPending } = useAuthenticatedUser();
  const { data: savedForm } = useProfileForm(user?.id || null);

  const upsertForm = useUpsertProfileForm();
  const updateSubmissionStatus = useUpdateSubmissionStatus();

  const fieldsFromDb = useMemo(
    () => (savedForm ? normalizeFields(savedForm.fields) : []),
    [savedForm]
  );

  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (savedForm) {
      setEnabled(Boolean(savedForm.enabled));
      setTitle(savedForm.title || '');
      setDescription(savedForm.description || '');
      setFields(fieldsFromDb);
      return;
    }

    setEnabled(false);
    setTitle(i18n.contactFormTitleDefault);
    setDescription(i18n.contactFormHintDefault);
    setFields([
      {
        id: 'nama',
        name: 'nama',
        label: 'Nama',
        type: 'text',
        required: true,
        placeholder: 'Nama Anda',
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'nama@email.com',
      },
      {
        id: 'pesan',
        name: 'pesan',
        label: 'Pesan',
        type: 'textarea',
        required: false,
        placeholder: 'Tulis pesan Anda (opsional)',
      },
    ]);
  }, [savedForm, fieldsFromDb]);

  const formId = savedForm?.id || null;

  const { data: submissions = [] } = useFormSubmissions({
    userId: user?.id || null,
    formId,
  });

  const handleSave = async () => {
    if (!user) return;

    const payload: Partial<ProfileForm> & { user_id: string } = {
      user_id: user.id,
      enabled,
      title: title || null,
      description: description || null,
      fields: fields as any,
    };

    await upsertForm.mutateAsync(payload);
  };

  const handleExportCsv = () => {
    const rows = submissions.map((s: FormSubmission) => {
      const values = (s.data as any) || {};
      return {
        waktu: new Date(s.created_at).toLocaleString('id-ID'),
        status: s.status,
        ...values,
      };
    });

    const csv = toCsv(rows);
    downloadFile('submisi-formulir.csv', csv);
  };

  if (isPending && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <p>{i18n.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <p>{i18n.mustLogin}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{i18n.forms}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {i18n.formsHint}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Builder */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">{i18n.formBuilder}</h2>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
            <div>
              <p className="font-medium">{i18n.enableForm}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {i18n.enableFormHint}
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-5 w-5"
            />
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">{i18n.formTitle}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                placeholder={i18n.formTitlePlaceholder}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{i18n.formDescription}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                placeholder={i18n.formDescriptionPlaceholder}
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{i18n.formFields}</h3>
                <button
                  type="button"
                  onClick={() =>
                    setFields((prev) => [
                      ...prev,
                      {
                        id: uuidv4(),
                        name: `field_${prev.length + 1}`,
                        label: `Bidang ${prev.length + 1}`,
                        type: 'text',
                        required: false,
                      },
                    ])
                  }
                  className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  {i18n.addField}
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium">{i18n.fieldLabel}</label>
                        <input
                          value={field.label}
                          onChange={(e) =>
                            setFields((prev) =>
                              prev.map((f) =>
                                f.id === field.id ? { ...f, label: e.target.value } : f
                              )
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium">{i18n.fieldName}</label>
                        <input
                          value={field.name}
                          onChange={(e) =>
                            setFields((prev) =>
                              prev.map((f) =>
                                f.id === field.id ? { ...f, name: e.target.value } : f
                              )
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium">{i18n.fieldType}</label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            setFields((prev) =>
                              prev.map((f) =>
                                f.id === field.id
                                  ? { ...f, type: e.target.value as FieldType }
                                  : f
                              )
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="text">Teks</option>
                          <option value="email">Email</option>
                          <option value="tel">Telepon</option>
                          <option value="textarea">Paragraf</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium">{i18n.fieldRequired}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(field.required)}
                            onChange={(e) =>
                              setFields((prev) =>
                                prev.map((f) =>
                                  f.id === field.id
                                    ? { ...f, required: e.target.checked }
                                    : f
                                )
                              )
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{i18n.required}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {i18n.fieldNumber} {idx + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFields((prev) => prev.filter((f) => f.id !== field.id))
                        }
                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        {i18n.delete}
                      </button>
                    </div>
                  </div>
                ))}

                {fields.length === 0 ? (
                  <p className="text-sm text-gray-500">{i18n.noFields}</p>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={upsertForm.isPending}
            className="mt-6 w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {upsertForm.isPending ? i18n.loading : i18n.saveForm}
          </button>

          {upsertForm.isError ? (
            <p className="mt-3 text-sm text-red-600">{i18n.saveFailed}</p>
          ) : null}
          {upsertForm.isSuccess ? (
            <p className="mt-3 text-sm text-green-600">{i18n.saved}</p>
          ) : null}
        </div>

        {/* Submissions */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{i18n.submissions}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {i18n.submissionsHint}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
              disabled={submissions.length === 0}
            >
              {i18n.exportCSV}
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">{i18n.time}</th>
                  <th className="py-2 pr-4">{i18n.status}</th>
                  <th className="py-2 pr-4">{i18n.data}</th>
                  <th className="py-2">{i18n.actions}</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 50).map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(s.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        value={s.status}
                        onChange={(e) =>
                          updateSubmissionStatus.mutate({
                            id: s.id,
                            status: e.target.value as any,
                            userId: user.id,
                          })
                        }
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950"
                      >
                        <option value="baru">Baru</option>
                        <option value="diproses">Diproses</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <pre className="max-w-[420px] overflow-x-auto whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400">
                        {JSON.stringify(s.data, null, 2)}
                      </pre>
                    </td>
                    <td className="py-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {i18n.submissionId}: {s.id.slice(0, 8)}
                      </span>
                    </td>
                  </tr>
                ))}

                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      {i18n.noData}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {formId ? null : (
            <p className="mt-4 text-sm text-gray-500">{i18n.noFormSavedYet}</p>
          )}
        </div>
      </div>
    </div>
  );
}
