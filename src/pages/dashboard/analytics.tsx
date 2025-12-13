import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, MousePointerClick, TrendingUp } from 'lucide-react'
import { mockAnalytics } from '@/lib/mock-data'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const stats = mockAnalytics

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">{t('dashboard.analytics.title')}</h1>
        <p className="text-muted-foreground mt-1">
          Lihat performa tautan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.analytics.totalViews')}
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.analytics.totalClicks')}
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +8% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.analytics.clickThroughRate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickThroughRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              -2% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.analytics.topLinks')}</CardTitle>
            <CardDescription>Tautan dengan klik terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{link.title}</span>
                  </div>
                  <span className="text-muted-foreground">{link.clicks} klik</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.analytics.recentActivity')}</CardTitle>
            <CardDescription>Aktivitas 5 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.clicks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
