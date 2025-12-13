import { useParams } from 'react-router-dom'
import { PublicProfileLayout } from '@/components/layouts/public-profile-layout'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { t } = useTranslation()

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{t('profile.notFound')}</CardTitle>
            <CardDescription>{t('profile.notFoundDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return <PublicProfileLayout username={username} />
}
