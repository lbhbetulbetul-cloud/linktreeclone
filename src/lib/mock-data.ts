export const mockUser = {
  id: '1',
  username: 'johndoe',
  name: 'John Doe',
  bio: 'Pengembang web & desainer. Pecinta kopi ☕️',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
  email: 'john@example.com',
  theme: 'light' as const,
  views: 1234
}

export const mockLinks = [
  {
    id: '1',
    title: 'Website Portofolio',
    url: 'https://example.com',
    active: true,
    clicks: 156
  },
  {
    id: '2',
    title: 'Instagram',
    url: 'https://instagram.com/johndoe',
    active: true,
    clicks: 342
  },
  {
    id: '3',
    title: 'GitHub',
    url: 'https://github.com/johndoe',
    active: true,
    clicks: 89
  },
  {
    id: '4',
    title: 'LinkedIn',
    url: 'https://linkedin.com/in/johndoe',
    active: false,
    clicks: 23
  }
]

export const mockAnalytics = {
  totalViews: 1234,
  totalClicks: 610,
  clickThroughRate: 49.4,
  topLinks: [
    { title: 'Instagram', clicks: 342 },
    { title: 'Website Portofolio', clicks: 156 },
    { title: 'GitHub', clicks: 89 },
    { title: 'LinkedIn', clicks: 23 }
  ],
  recentActivity: [
    { date: '2024-12-13', views: 45, clicks: 23 },
    { date: '2024-12-12', views: 38, clicks: 19 },
    { date: '2024-12-11', views: 52, clicks: 28 },
    { date: '2024-12-10', views: 41, clicks: 21 },
    { date: '2024-12-09', views: 35, clicks: 18 }
  ]
}
