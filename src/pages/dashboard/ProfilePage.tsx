import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { InfoTip } from "@/components/InfoTip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { UserProfile, UserTheme } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";

import { ProfilePreview, type PreviewSocialLinks } from "./ProfilePreview";

const AVATAR_BUCKET = "avatars";

const themePresets = {
  minimal: {
    preset: "minimal",
    font_family: "Inter",
    background: "#ffffff",
    button_shape: "rounded",
    button_color: "#111827",
    button_radius: 12,
  },
  soft: {
    preset: "soft",
    font_family: "ui-sans-serif, system-ui",
    background: "#f5f3ff",
    button_shape: "pill",
    button_color: "#6d28d9",
    button_radius: 999,
  },
  gelap: {
    preset: "gelap",
    font_family: "Inter",
    background: "#0b1220",
    button_shape: "rounded",
    button_color: "#f59e0b",
    button_radius: 12,
  },
} as const;

const urlOrEmpty = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => !v || /^https?:\/\//i.test(v), {
    message: "Gunakan URL lengkap, contoh: https://...",
  });

const formSchema = z.object({
  nama: z.string().trim().min(2, { message: "Nama minimal 2 karakter." }),
  bio: z.string().trim().max(160, { message: "Bio maksimal 160 karakter." }).optional(),
  lokasi: z.string().trim().optional(),
  pekerjaan: z.string().trim().optional(),
  username: z.string().trim().optional(),

  social: z.object({
    website: urlOrEmpty,
    instagram: urlOrEmpty,
    twitter: urlOrEmpty,
    linkedin: urlOrEmpty,
    youtube: urlOrEmpty,
  }),

  domainsText: z.string().optional(),

  theme: z.object({
    preset: z.string().optional(),
    font_family: z.string().trim().min(1, { message: "Pilih font." }),
    background: z.string().trim().min(1, { message: "Isi background." }),
    button_shape: z.string().trim().min(1, { message: "Pilih bentuk tombol." }),
    button_color: z.string().trim().min(1, { message: "Isi warna tombol." }),
    button_radius: z.coerce
      .number()
      .min(0, { message: "Minimal 0." })
      .max(999, { message: "Terlalu besar." }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

function safeSocialLinks(value: unknown): PreviewSocialLinks {
  if (!value || typeof value !== "object") return {};
  const obj = value as Record<string, unknown>;
  const get = (key: string) => (typeof obj[key] === "string" ? obj[key] : undefined);
  return {
    website: get("website"),
    instagram: get("instagram"),
    twitter: get("twitter"),
    linkedin: get("linkedin"),
    youtube: get("youtube"),
  };
}

function parseDomains(domainsText: string | undefined) {
  if (!domainsText) return [];
  return domainsText
    .split(/\r?\n/)
    .map((d) => d.trim())
    .filter(Boolean);
}

function compactSocialLinks(social: PreviewSocialLinks) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(social)) {
    if (typeof v === "string" && v.trim().length > 0) out[k] = v.trim();
  }
  return out;
}

export function ProfilePage() {
  const { user, profile, theme, supabase, profileLoading, themeLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userId = user?.id;

  const existingSocial = safeSocialLinks(profile?.social_links);
  const existingDomains = (profile?.custom_domains ?? []).join("\n");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: profile?.nama ?? "",
      bio: profile?.bio ?? "",
      lokasi: profile?.lokasi ?? "",
      pekerjaan: profile?.pekerjaan ?? "",
      username: profile?.username ?? "",
      social: {
        website: existingSocial.website ?? "",
        instagram: existingSocial.instagram ?? "",
        twitter: existingSocial.twitter ?? "",
        linkedin: existingSocial.linkedin ?? "",
        youtube: existingSocial.youtube ?? "",
      },
      domainsText: existingDomains,
      theme: {
        preset: theme?.preset ?? "minimal",
        font_family: theme?.font_family ?? "Inter",
        background: theme?.background ?? "#ffffff",
        button_shape: theme?.button_shape ?? "rounded",
        button_color: theme?.button_color ?? "#111827",
        button_radius: theme?.button_radius ?? 12,
      },
    },
  });

  React.useEffect(() => {
    if (!profile || !theme) return;

    const social = safeSocialLinks(profile.social_links);

    form.reset({
      nama: profile.nama ?? "",
      bio: profile.bio ?? "",
      lokasi: profile.lokasi ?? "",
      pekerjaan: profile.pekerjaan ?? "",
      username: profile.username ?? "",
      social: {
        website: social.website ?? "",
        instagram: social.instagram ?? "",
        twitter: social.twitter ?? "",
        linkedin: social.linkedin ?? "",
        youtube: social.youtube ?? "",
      },
      domainsText: (profile.custom_domains ?? []).join("\n"),
      theme: {
        preset: theme.preset ?? "minimal",
        font_family: theme.font_family ?? "Inter",
        background: theme.background ?? "#ffffff",
        button_shape: theme.button_shape ?? "rounded",
        button_color: theme.button_color ?? "#111827",
        button_radius: theme.button_radius ?? 12,
      },
    });
  }, [form, profile, theme]);

  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarLocalUrl, setAvatarLocalUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!avatarFile) {
      if (avatarLocalUrl) URL.revokeObjectURL(avatarLocalUrl);
      setAvatarLocalUrl(null);
      return;
    }

    const url = URL.createObjectURL(avatarFile);
    setAvatarLocalUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  const avatarSignedUrlQuery = useQuery({
    queryKey: ["avatarSignedUrl", profile?.avatar_path ?? null],
    queryFn: async () => {
      if (!profile?.avatar_path) return null;
      const { data, error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(profile.avatar_path, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!profile?.avatar_path,
    staleTime: 30_000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Partial<UserProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from("users")
        .upsert(payload, { onConflict: "id" })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (payload) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: ["profile", userId] });
      const previous = queryClient.getQueryData<UserProfile>(["profile", userId]);
      if (previous) {
        queryClient.setQueryData<UserProfile>(["profile", userId], {
          ...previous,
          ...payload,
        });
      }
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (!userId) return;
      if (ctx?.previous) {
        queryClient.setQueryData(["profile", userId], ctx.previous);
      }
    },
    onSuccess: (data) => {
      if (!userId) return;
      queryClient.setQueryData(["profile", userId], data);
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (payload: Partial<UserTheme> & { user_id: string }) => {
      const { data, error } = await supabase
        .from("user_themes")
        .upsert(payload, { onConflict: "user_id" })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (payload) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: ["theme", userId] });
      const previous = queryClient.getQueryData<UserTheme>(["theme", userId]);
      if (previous) {
        queryClient.setQueryData<UserTheme>(["theme", userId], {
          ...previous,
          ...payload,
        });
      }
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (!userId) return;
      if (ctx?.previous) {
        queryClient.setQueryData(["theme", userId], ctx.previous);
      }
    },
    onSuccess: (data) => {
      if (!userId) return;
      queryClient.setQueryData(["theme", userId], data);
    },
  });

  const watched = form.watch();
  const previewSocial = watched.social as PreviewSocialLinks;
  const previewDomains = parseDomains(watched.domainsText);
  const previewTheme = watched.theme;

  const busy =
    updateProfileMutation.isPending ||
    updateThemeMutation.isPending ||
    avatarSignedUrlQuery.isFetching;

  if (!userId) return null;

  if (profileLoading || themeLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Memuat profil...
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Profil</h1>
            <p className="text-sm text-muted-foreground">
              Ubah biodata, avatar, tautan sosial, domain, dan tampilan.
            </p>
          </div>

          <Button
            onClick={form.handleSubmit(async (values) => {
              try {
                let avatar_path = profile?.avatar_path ?? null;

                if (avatarFile) {
                  const ext = avatarFile.name.split(".").pop() || "png";
                  const filePath = `${userId}/avatar.${ext}`;

                  const { error: uploadError } = await supabase.storage
                    .from(AVATAR_BUCKET)
                    .upload(filePath, avatarFile, {
                      upsert: true,
                      contentType: avatarFile.type,
                    });
                  if (uploadError) throw uploadError;

                  avatar_path = filePath;
                }

                await Promise.all([
                  updateProfileMutation.mutateAsync({
                    id: userId,
                    nama: values.nama,
                    bio: values.bio ?? null,
                    lokasi: values.lokasi ?? null,
                    pekerjaan: values.pekerjaan ?? null,
                    username: values.username ?? null,
                    avatar_path,
                    custom_domains: parseDomains(values.domainsText),
                    social_links: compactSocialLinks(values.social),
                  }),
                  updateThemeMutation.mutateAsync({
                    user_id: userId,
                    preset: values.theme.preset ?? null,
                    font_family: values.theme.font_family,
                    background: values.theme.background,
                    button_shape: values.theme.button_shape,
                    button_color: values.theme.button_color,
                    button_radius: values.theme.button_radius,
                  }),
                ]);

                toast({
                  title: "Perubahan tersimpan",
                  description: "Profil dan tampilan Anda sudah diperbarui.",
                });
                setAvatarFile(null);
              } catch (e) {
                const message =
                  e instanceof Error
                    ? e.message
                    : "Gagal menyimpan perubahan.";
                toast({ title: "Gagal", description: message });
              }
            })}
            disabled={busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan perubahan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biodata</CardTitle>
            <CardDescription>
              Data ini akan tampil di profil publik Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="nama">Nama</Label>
                <InfoTip text="Nama yang tampil sebagai judul profil." />
              </div>
              <Input id="nama" placeholder="Nama Anda" {...form.register("nama")} />
              {form.formState.errors.nama?.message ? (
                <p className="text-sm text-destructive">{form.formState.errors.nama.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="bio">Bio</Label>
                <InfoTip text="Deskripsi singkat (maks 160 karakter) untuk menjelaskan siapa Anda." />
              </div>
              <Textarea
                id="bio"
                placeholder="Contoh: Product designer yang suka membangun produk bermanfaat."
                {...form.register("bio")}
              />
              {form.formState.errors.bio?.message ? (
                <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="lokasi">Lokasi</Label>
                  <InfoTip text="Kota/negara (opsional)." />
                </div>
                <Input id="lokasi" placeholder="Jakarta" {...form.register("lokasi")} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="pekerjaan">Pekerjaan</Label>
                  <InfoTip text="Peran utama Anda (opsional)." />
                </div>
                <Input
                  id="pekerjaan"
                  placeholder="Pengembang Perangkat Lunak"
                  {...form.register("pekerjaan")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="username">Username</Label>
                <InfoTip text="Nama pengguna untuk URL publik (opsional, tergantung konfigurasi backend)." />
              </div>
              <Input id="username" placeholder="mis: budi" {...form.register("username")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>
              Upload foto profil ke Supabase Storage. Pratinjau akan langsung berubah.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="avatar">File avatar</Label>
                  <InfoTip text="Gunakan PNG/JPG. Ukuran kecil lebih cepat dimuat." />
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setAvatarFile(f);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAvatarFile(null)}
                disabled={!avatarFile}
              >
                <Upload className="h-4 w-4" />
                Batalkan
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Avatar saat ini memakai signed URL (berlaku 1 jam). Setelah Anda menyimpan perubahan, avatar di database akan diperbarui.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tautan sosial</CardTitle>
            <CardDescription>
              Link ini akan menjadi tombol di profil publik Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://..." {...form.register("social.website")} />
                {form.formState.errors.social?.website?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.social.website.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/..."
                  {...form.register("social.instagram")}
                />
                {form.formState.errors.social?.instagram?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.social.instagram.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">X/Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="https://x.com/..."
                  {...form.register("social.twitter")}
                />
                {form.formState.errors.social?.twitter?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.social.twitter.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/..."
                  {...form.register("social.linkedin")}
                />
                {form.formState.errors.social?.linkedin?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.social.linkedin.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                placeholder="https://youtube.com/@..."
                {...form.register("social.youtube")}
              />
              {form.formState.errors.social?.youtube?.message ? (
                <p className="text-sm text-destructive">{form.formState.errors.social.youtube.message}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain kustom</CardTitle>
            <CardDescription>
              Tambahkan satu domain per baris. Pengaturan DNS/verifikasi tergantung backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="domainsText">Daftar domain</Label>
              <InfoTip text="Contoh: saya.com (satu per baris)." />
            </div>
            <Textarea
              id="domainsText"
              placeholder="saya.com\nprofil.saya.com"
              {...form.register("domainsText")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tampilan</CardTitle>
            <CardDescription>
              Pilih preset, font, background, dan gaya tombol.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Preset</Label>
                  <InfoTip text="Preset akan mengubah beberapa opsi sekaligus agar cepat." />
                </div>
                <Controller
                  control={form.control}
                  name="theme.preset"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "minimal"}
                      onValueChange={(v) => {
                        field.onChange(v);
                        const preset = themePresets[v as keyof typeof themePresets];
                        if (preset) {
                          form.setValue("theme.font_family", preset.font_family);
                          form.setValue("theme.background", preset.background);
                          form.setValue("theme.button_shape", preset.button_shape);
                          form.setValue("theme.button_color", preset.button_color);
                          form.setValue("theme.button_radius", preset.button_radius);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih preset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="soft">Lembut</SelectItem>
                        <SelectItem value="gelap">Gelap</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Font</Label>
                  <InfoTip text="Ini mempengaruhi tipografi di profil publik. Pastikan font tersedia di browser." />
                </div>
                <Controller
                  control={form.control}
                  name="theme.font_family"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="ui-sans-serif, system-ui">Sistem</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="\"Plus Jakarta Sans\", system-ui">Plus Jakarta Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.theme?.font_family?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.theme.font_family.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="background">Background</Label>
                  <InfoTip text="Bisa warna (#ffffff) atau CSS background (contoh: linear-gradient(...))." />
                </div>
                <Input id="background" placeholder="#ffffff" {...form.register("theme.background")} />
                {form.formState.errors.theme?.background?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.theme.background.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Bentuk tombol</Label>
                  <InfoTip text="Mengatur radius tombol (membulat/pill/kotak)." />
                </div>
                <Controller
                  control={form.control}
                  name="theme.button_shape"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bentuk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Membulat</SelectItem>
                        <SelectItem value="pill">Pill</SelectItem>
                        <SelectItem value="square">Kotak</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.theme?.button_shape?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.theme.button_shape.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="button_color">Warna tombol</Label>
                  <InfoTip text="Warna tombol link di profil. Contoh: #111827" />
                </div>
                <div className="flex gap-2">
                  <Input
                    id="button_color"
                    placeholder="#111827"
                    {...form.register("theme.button_color")}
                  />
                  <Input
                    type="color"
                    aria-label="Picker warna tombol"
                    className="h-10 w-14 p-1"
                    value={watched.theme.button_color}
                    onChange={(e) => form.setValue("theme.button_color", e.target.value)}
                  />
                </div>
                {form.formState.errors.theme?.button_color?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.theme.button_color.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="button_radius">Radius tombol (px)</Label>
                  <InfoTip text="Atur radius spesifik. Untuk pill, gunakan 999." />
                </div>
                <Input
                  id="button_radius"
                  type="number"
                  min={0}
                  max={999}
                  {...form.register("theme.button_radius")}
                />
                {form.formState.errors.theme?.button_radius?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.theme.button_radius.message}</p>
                ) : null}
              </div>
            </div>

            <Separator />
            <p className="text-sm text-muted-foreground">
              Pratinjau di kanan akan mengikuti perubahan form secara real-time.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Pratinjau</h2>
          <p className="text-sm text-muted-foreground">
            Ini contoh tampilan profil publik dengan kondisi form saat ini.
          </p>
        </div>

        <ProfilePreview
          nama={watched.nama}
          bio={watched.bio}
          lokasi={watched.lokasi}
          pekerjaan={watched.pekerjaan}
          avatarUrl={avatarLocalUrl ?? avatarSignedUrlQuery.data ?? null}
          social={previewSocial}
          customDomains={previewDomains}
          theme={previewTheme}
        />

        <p className="text-xs text-muted-foreground">
          Catatan: Link di preview akan membuka tab baru. Jika Anda belum menyimpan perubahan, data di database belum berubah.
        </p>
      </div>
    </div>
  );
}
