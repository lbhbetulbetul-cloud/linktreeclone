import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url({ message: "VITE_SUPABASE_URL harus berupa URL yang valid." }),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, { message: "VITE_SUPABASE_ANON_KEY wajib diisi." }),
  VITE_PUBLIC_APP_URL: z
    .string()
    .url({ message: "VITE_PUBLIC_APP_URL harus berupa URL yang valid." })
    .optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Konfigurasi environment tidak valid. Periksa file .env Anda.\n\n${details}`,
    );
  }

  cachedEnv = parsed.data;
  return parsed.data;
}