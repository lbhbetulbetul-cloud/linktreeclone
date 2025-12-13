import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Masukkan email yang valid." })
    .min(1, { message: "Email wajib diisi." }),
  password: z.string().min(6, { message: "Minimal 6 karakter." }),
});

const registerSchema = z
  .object({
    nama: z.string().min(2, { message: "Nama minimal 2 karakter." }),
    email: z
      .string()
      .email({ message: "Masukkan email yang valid." })
      .min(1, { message: "Email wajib diisi." }),
    password: z.string().min(6, { message: "Minimal 6 karakter." }),
    passwordConfirm: z.string().min(6, { message: "Minimal 6 karakter." }),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["passwordConfirm"],
  });

const resetRequestSchema = z.object({
  email: z
    .string()
    .email({ message: "Masukkan email yang valid." })
    .min(1, { message: "Email wajib diisi." }),
});

const resetUpdateSchema = z
  .object({
    password: z.string().min(6, { message: "Minimal 6 karakter." }),
    passwordConfirm: z.string().min(6, { message: "Minimal 6 karakter." }),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["passwordConfirm"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ResetRequestValues = z.infer<typeof resetRequestSchema>;
type ResetUpdateValues = z.infer<typeof resetUpdateSchema>;

function isRecoveryUrl(searchParams: URLSearchParams) {
  const typeParam = searchParams.get("type");
  if (typeParam === "recovery") return true;

  if (typeof window !== "undefined") {
    return window.location.hash.includes("type=recovery");
  }

  return false;
}

export function AuthPage() {
  const {
    user,
    authLoading,
    login,
    register,
    requestPasswordReset,
    updatePassword,
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const recoveryMode = React.useMemo(
    () => isRecoveryUrl(searchParams),
    [searchParams],
  );

  const redirect = searchParams.get("redirect") ?? "/dashboard/profile";

  React.useEffect(() => {
    if (!authLoading && user && !recoveryMode) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, navigate, redirect, recoveryMode, user]);

  const [tab, setTab] = React.useState<"masuk" | "daftar" | "reset">(
    recoveryMode ? "reset" : "masuk",
  );

  React.useEffect(() => {
    if (recoveryMode) setTab("reset");
  }, [recoveryMode]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nama: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const resetRequestForm = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: "" },
  });

  const resetUpdateForm = useForm<ResetUpdateValues>({
    resolver: zodResolver(resetUpdateSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  const [busy, setBusy] = React.useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Autentikasi</CardTitle>
          <CardDescription>
            Masuk, daftar, atau atur ulang kata sandi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="masuk">Masuk</TabsTrigger>
              <TabsTrigger value="daftar">Daftar</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="masuk">
              <form
                className="space-y-4"
                onSubmit={loginForm.handleSubmit(async (values) => {
                  setBusy(true);
                  try {
                    await login(values);
                    toast({
                      title: "Berhasil masuk",
                      description: "Selamat datang kembali!",
                    });
                    navigate(redirect, { replace: true });
                  } catch (e) {
                    const message =
                      e instanceof Error
                        ? e.message
                        : "Email/kata sandi salah.";
                    toast({ title: "Gagal masuk", description: message });
                  } finally {
                    setBusy(false);
                  }
                })}
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email?.message ? (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Kata sandi</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password?.message ? (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Masuk
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setTab("reset")}
                  >
                    Lupa kata sandi?
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="daftar">
              <form
                className="space-y-4"
                onSubmit={registerForm.handleSubmit(async (values) => {
                  setBusy(true);
                  try {
                    await register({
                      email: values.email,
                      password: values.password,
                      nama: values.nama,
                    });
                    toast({
                      title: "Pendaftaran berhasil",
                      description:
                        "Jika verifikasi email diaktifkan, cek inbox untuk konfirmasi.",
                    });
                    navigate(redirect, { replace: true });
                  } catch (e) {
                    const message =
                      e instanceof Error
                        ? e.message
                        : "Tidak bisa membuat akun.";
                    toast({ title: "Gagal daftar", description: message });
                  } finally {
                    setBusy(false);
                  }
                })}
              >
                <div className="space-y-2">
                  <Label htmlFor="register-nama">Nama</Label>
                  <Input
                    id="register-nama"
                    placeholder="Nama lengkap"
                    autoComplete="name"
                    {...registerForm.register("nama")}
                  />
                  {registerForm.formState.errors.nama?.message ? (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.nama.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email?.message ? (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Kata sandi</Label>
                    <Input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password?.message ? (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-passwordConfirm">
                      Konfirmasi
                    </Label>
                    <Input
                      id="register-passwordConfirm"
                      type="password"
                      autoComplete="new-password"
                      {...registerForm.register("passwordConfirm")}
                    />
                    {registerForm.formState.errors.passwordConfirm?.message ? (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.passwordConfirm.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Buat akun
                </Button>

                <div className="text-center text-sm">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setTab("masuk")}
                  >
                    Masuk
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              {recoveryMode ? (
                <form
                  className="space-y-4"
                  onSubmit={resetUpdateForm.handleSubmit(async (values) => {
                    setBusy(true);
                    try {
                      if (!user) {
                        throw new Error(
                          "Sesi pemulihan belum aktif. Buka ulang link reset dari email Anda.",
                        );
                      }

                      await updatePassword({ password: values.password });
                      toast({
                        title: "Kata sandi diperbarui",
                        description:
                          "Kata sandi baru sudah tersimpan. Silakan lanjut ke dasbor.",
                      });
                      navigate(redirect, { replace: true });
                    } catch (e) {
                      const message =
                        e instanceof Error
                          ? e.message
                          : "Tidak bisa memperbarui kata sandi.";
                      toast({ title: "Gagal", description: message });
                    } finally {
                      setBusy(false);
                    }
                  })}
                >
                  <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                    Anda membuka link pemulihan. Silakan buat kata sandi baru.
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Kata sandi baru</Label>
                      <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        {...resetUpdateForm.register("password")}
                      />
                      {resetUpdateForm.formState.errors.password?.message ? (
                        <p className="text-sm text-destructive">
                          {resetUpdateForm.formState.errors.password.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-passwordConfirm">Konfirmasi</Label>
                      <Input
                        id="new-passwordConfirm"
                        type="password"
                        autoComplete="new-password"
                        {...resetUpdateForm.register("passwordConfirm")}
                      />
                      {resetUpdateForm.formState.errors.passwordConfirm?.message ? (
                        <p className="text-sm text-destructive">
                          {resetUpdateForm.formState.errors.passwordConfirm.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Simpan kata sandi baru
                  </Button>
                </form>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={resetRequestForm.handleSubmit(async (values) => {
                    setBusy(true);
                    try {
                      await requestPasswordReset(values);
                      toast({
                        title: "Email terkirim",
                        description:
                          "Cek inbox untuk link reset kata sandi (jika email terdaftar).",
                      });
                      setTab("masuk");
                    } catch (e) {
                      const message =
                        e instanceof Error
                          ? e.message
                          : "Tidak bisa mengirim email reset.";
                      toast({ title: "Gagal", description: message });
                    } finally {
                      setBusy(false);
                    }
                  })}
                >
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      {...resetRequestForm.register("email")}
                    />
                    {resetRequestForm.formState.errors.email?.message ? (
                      <p className="text-sm text-destructive">
                        {resetRequestForm.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Kirim link reset
                  </Button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      className="text-primary underline-offset-4 hover:underline"
                      onClick={() => setTab("masuk")}
                    >
                      Kembali ke Masuk
                    </button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
