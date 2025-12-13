import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import { mockUser, mockLinks } from '@/lib/mock-data'

interface PublicProfileLayoutProps {
  username: string
}

export function PublicProfileLayout({ username }: PublicProfileLayoutProps) {
  const user = mockUser
  const links = mockLinks.filter(link => link.active)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold font-display mb-2">{user.name}</h1>
            <p className="text-muted-foreground">@{username}</p>
          </div>
          
          {user.bio && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {user.bio}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <Card
              key={link.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between"
              >
                <span className="font-medium group-hover:text-primary transition-colors">
                  {link.title}
                </span>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </Card>
          ))}
        </div>

        {links.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Belum ada tautan yang tersedia</p>
          </Card>
        )}
      </div>
    </div>
  )
}
