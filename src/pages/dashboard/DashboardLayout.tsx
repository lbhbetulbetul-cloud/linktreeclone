import { LogOut, User2 } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardLayout() {
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <User2 className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Dasbor</div>
              <div className="text-xs text-muted-foreground">
                {profile?.nama ?? user?.email ?? ""}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/dashboard/profile">Profil</Link>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await logout();
                  toast({
                    title: "Berhasil keluar",
                    description: "Anda sudah keluar dari akun.",
                  });
                } catch (e) {
                  const message =
                    e instanceof Error ? e.message : "Gagal keluar. Coba lagi.";
                  toast({
                    title: "Gagal keluar",
                    description: message,
                  });
                }
              }}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <Separator />

      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
