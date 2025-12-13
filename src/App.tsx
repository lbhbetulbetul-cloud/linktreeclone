import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { LinksPage } from '@/pages/dashboard/links'
import { AnalyticsPage } from '@/pages/dashboard/analytics'
import { PublicProfilePage } from '@/pages/public-profile'
import '@/i18n/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="linktree-theme">
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<LinksPage />} />
                <Route path="profile" element={<LinksPage />} />
                <Route path="appearance" element={<LinksPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<LinksPage />} />
              </Route>

              <Route path="/:username" element={<PublicProfilePage />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
