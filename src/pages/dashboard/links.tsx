import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, ExternalLink, Trash2, GripVertical } from 'lucide-react'
import { mockLinks } from '@/lib/mock-data'
import { toast } from 'sonner'

export function LinksPage() {
  const { t } = useTranslation()
  const [links, setLinks] = useState(mockLinks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '' })

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) {
      toast.error(t('validation.required'))
      return
    }

    setLinks([...links, {
      id: Date.now().toString(),
      title: newLink.title,
      url: newLink.url,
      active: true,
      clicks: 0
    }])
    
    setNewLink({ title: '', url: '' })
    setIsDialogOpen(false)
    toast.success(t('toast.linkAdded'))
  }

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id))
    toast.success(t('toast.linkDeleted'))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('dashboard.links.title')}</h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua tautan Anda
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.links.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard.links.addNew')}</DialogTitle>
              <DialogDescription>
                Tambahkan tautan baru ke profil Anda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  {t('dashboard.links.linkTitle')}
                </label>
                <Input
                  id="title"
                  placeholder="Instagram"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  {t('dashboard.links.linkUrl')}
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://instagram.com/username"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddLink}>
                {t('dashboard.links.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {links.length === 0 ? (
          <Card className="p-12 text-center">
            <CardTitle className="mb-2">{t('dashboard.links.noLinks')}</CardTitle>
            <CardDescription>{t('dashboard.links.noLinksDescription')}</CardDescription>
          </Card>
        ) : (
          links.map((link) => (
            <Card key={link.id} className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{link.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      link.active 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {link.active ? t('dashboard.links.active') : t('dashboard.links.inactive')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                  <p className="text-xs text-muted-foreground mt-1">{link.clicks} klik</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
