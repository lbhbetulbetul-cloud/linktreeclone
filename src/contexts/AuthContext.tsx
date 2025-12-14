import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getEnv } from "@/lib/env";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type UserTheme = Database["public"]["Tables"]["user_themes"]["Row"];

export type AuthContextValue = {
  supabase: ReturnType<typeof getSupabaseBrowserClient>;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  theme: UserTheme | null;
  authLoading: boolean;
  profileLoading: boolean;
  themeLoading: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    nama?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (params: { email: string }) => Promise<void>;
  updatePassword: (params: { password: string }) => Promise<void>;
  refetchProfile: () => Promise<void>;
  refetchTheme: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User): Promise<UserProfile> {
  const supabase = getSupabaseBrowserClient();

  const { data: existing, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("users")
    .insert({
      id: user.id,
      email: user.email ?? null,
      nama:
        typeof user.user_metadata?.nama === "string"
          ? user.user_metadata.nama
          : null,
    })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return created;
}

async function ensureTheme(user: User): Promise<UserTheme> {
  const supabase = getSupabaseBrowserClient();

  const { data: existing, error: selectError } = await supabase
    .from("user_themes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("user_themes")
    .insert({
      user_id: user.id,
      preset: "minimal",
      font_family: "Inter",
      background: "#ffffff",
      button_shape: "rounded",
      button_color: "#111827",
      button_radius: 12,
    })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return created;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => getSupabaseBrowserClient(), []);

  const [session, setSession] = React.useState<Session | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setSession(null);
        } else {
          setSession(data.session);
        }
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const user = session?.user ?? null;

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return ensureProfile(user);
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  const themeQuery = useQuery({
    queryKey: ["theme", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return ensureTheme(user);
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  const login = React.useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    [supabase],
  );

  const register = React.useCallback(
    async ({ email, password, nama }: { email: string; password: string; nama?: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: nama ? { nama } : undefined,
        },
      });
      if (error) throw error;

      if (data.user) {
        await ensureProfile(data.user);
        await ensureTheme(data.user);
      }
    },
    [supabase],
  );

  const logout = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  const requestPasswordReset = React.useCallback(
    async ({ email }: { email: string }) => {
      const env = getEnv();
      const redirectTo = env.VITE_PUBLIC_APP_URL ?? window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectTo}/auth`,
      });
      if (error) throw error;
    },
    [supabase],
  );

  const updatePassword = React.useCallback(
    async ({ password }: { password: string }) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    [supabase],
  );

  const value: AuthContextValue = {
    supabase,
    session,
    user,
    profile: profileQuery.data ?? null,
    theme: themeQuery.data ?? null,
    authLoading,
    profileLoading: profileQuery.isLoading,
    themeLoading: themeQuery.isLoading,
    login,
    register,
    logout,
    requestPasswordReset,
    updatePassword,
    refetchProfile: async () => {
      await profileQuery.refetch();
    },
    refetchTheme: async () => {
      await themeQuery.refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return ctx;
}