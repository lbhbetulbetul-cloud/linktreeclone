import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { AuthPage } from "@/pages/auth/AuthPage";
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";

function HomeRedirect() {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;
  return <Navigate to={user ? "/dashboard/profile" : "/auth"} replace />;
}

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Link yang Anda buka tidak tersedia.
      </p>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
