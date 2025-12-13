# Linktree Clone

Aplikasi web modern untuk mengelola semua tautan Anda dalam satu tempat, terinspirasi dari Linktree.

## 🚀 Teknologi yang Digunakan

- **Vite** - Build tool modern dan cepat
- **React 18** - Library UI untuk membangun antarmuka pengguna
- **TypeScript** - JavaScript dengan type safety
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Komponen UI yang dapat diakses dan disesuaikan
- **React Router** - Routing untuk aplikasi single-page
- **TanStack Query** - Manajemen state server dan caching
- **i18next** - Internasionalisasi (i18n)
- **Sonner** - Notifikasi toast yang indah
- **Lucide React** - Ikon modern

## ✨ Fitur

- 🔐 Autentikasi (Login & Registrasi)
- 📊 Dashboard dengan sidebar responsif
- 🔗 Kelola tautan (Tambah, Edit, Hapus)
- 📈 Analitik tautan (Views, Clicks, CTR)
- 🎨 Kustomisasi tampilan profil
- 👤 Halaman profil publik
- 🌓 Mode terang & gelap
- 📱 Desain responsif (Mobile & Desktop)
- 🌐 Dukungan Bahasa Indonesia

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── layouts/          # Layout utama (Dashboard, Public Profile)
│   ├── providers/        # Provider (Theme, Query, dll)
│   └── ui/              # Komponen UI (Button, Card, Input, dll)
├── hooks/               # Custom hooks (useMediaQuery, dll)
├── i18n/                # Konfigurasi internasionalisasi
│   ├── config.ts        # Setup i18next
│   └── locales/         # File terjemahan
│       └── id.json      # Terjemahan Bahasa Indonesia
├── lib/                 # Utilities dan helper functions
│   ├── utils.ts         # Fungsi utility (cn, dll)
│   └── mock-data.ts     # Data placeholder untuk development
├── pages/               # Halaman aplikasi
│   ├── auth/            # Halaman autentikasi
│   ├── dashboard/       # Halaman dashboard
│   └── public-profile.tsx
└── App.tsx              # Root component dengan routing
```

## 🚀 Instalasi & Setup

### Prasyarat

- Node.js 18+ dan npm

### Langkah Instalasi

1. Clone repository ini:
```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser dan akses:
```
http://localhost:5173
```

## 🛠️ Perintah yang Tersedia

- `npm run dev` - Menjalankan development server
- `npm run build` - Build aplikasi untuk production
- `npm run preview` - Preview build production
- `npm run lint` - Menjalankan ESLint

## 🎨 Tema & Styling

Aplikasi ini menggunakan sistem desain berbasis token CSS custom properties yang dapat disesuaikan:

### Color Tokens

Semua warna didefinisikan dalam `src/index.css` menggunakan HSL color space:
- `--primary` - Warna utama (hijau Linktree-style)
- `--secondary` - Warna sekunder
- `--accent` - Warna aksen
- `--destructive` - Warna untuk aksi destruktif
- `--muted` - Warna untuk elemen yang dibisukan
- `--background` - Warna latar belakang
- `--foreground` - Warna teks utama

### Breakpoints Responsif

- `xs`: 480px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px

### Font

- **Sans**: Inter (untuk body text)
- **Display**: Poppins (untuk heading)

## 🌐 Internasionalisasi (i18n)

Aplikasi ini menggunakan i18next untuk mendukung multi-bahasa. Saat ini, Bahasa Indonesia adalah bahasa default.

### Menambahkan Bahasa Baru

1. Buat file JSON baru di `src/i18n/locales/`, misalnya `en.json`
2. Salin struktur dari `id.json` dan terjemahkan semua string
3. Import dan daftarkan di `src/i18n/config.ts`:

```typescript
import id from './locales/id.json'
import en from './locales/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en }
    },
    lng: 'id',
    fallbackLng: 'id',
    // ...
  })
```

### Menggunakan Terjemahan

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <p>{t('dashboard.links.title')}</p>
    </div>
  )
}
```

### Struktur File Terjemahan

File `id.json` terorganisir berdasarkan fitur:
- `app.*` - Informasi aplikasi umum
- `nav.*` - Label navigasi
- `auth.*` - Teks autentikasi
- `dashboard.*` - Teks dashboard dan fitur-fiturnya
- `profile.*` - Teks profil publik
- `common.*` - Label umum (simpan, batal, dll)
- `validation.*` - Pesan validasi form
- `toast.*` - Pesan notifikasi

## 🧩 Komponen UI

Aplikasi ini menggunakan komponen dari shadcn/ui yang sudah disesuaikan:

- `Button` - Tombol dengan berbagai varian
- `Card` - Container card dengan header, content, footer
- `Input` - Input field dengan styling konsisten
- `Dialog` - Modal dialog
- `Tooltip` - Tooltip dengan Radix UI
- `Avatar` - Komponen avatar dengan fallback
- `Sonner` - Toast notifications

Semua komponen mendukung dark mode dan mengikuti design system yang telah ditetapkan.

## 🎯 Routing

Aplikasi menggunakan React Router dengan struktur route berikut:

- `/auth/login` - Halaman login
- `/auth/register` - Halaman registrasi
- `/dashboard` - Dashboard utama (menampilkan tautan)
- `/dashboard/profile` - Edit profil
- `/dashboard/appearance` - Kustomisasi tampilan
- `/dashboard/analytics` - Analitik
- `/dashboard/settings` - Pengaturan
- `/:username` - Profil publik pengguna

## 📱 Responsif

Aplikasi sepenuhnya responsif dengan layout yang berbeda untuk:

- **Mobile** (< 768px): Sidebar tersembunyi, menu hamburger
- **Tablet** (768px - 1024px): Layout sedang
- **Desktop** (> 1024px): Sidebar permanen, layout penuh

Gunakan custom hooks untuk mendeteksi ukuran layar:

```tsx
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/use-media-query'

function MyComponent() {
  const isMobile = useIsMobile()
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  )
}
```

## 📊 State Management

- **TanStack Query** - Untuk data fetching dan caching (siap digunakan)
- **React Context** - Untuk theme management
- **useState/useReducer** - Untuk state lokal komponen

## 🔒 Catatan Keamanan

Aplikasi ini adalah prototype/demo. Untuk production:

- Implementasikan autentikasi yang aman (JWT, OAuth, dll)
- Tambahkan validasi server-side
- Implementasikan rate limiting
- Gunakan HTTPS
- Tambahkan CSRF protection

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Lisensi

MIT License - bebas digunakan untuk proyek pribadi maupun komersial.

## 🙏 Acknowledgments

- [Linktree](https://linktr.ee) - Inspirasi desain
- [shadcn/ui](https://ui.shadcn.com) - Komponen UI
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Radix UI](https://www.radix-ui.com) - Primitif UI

---

Dibuat dengan ❤️ menggunakan React & TypeScript
