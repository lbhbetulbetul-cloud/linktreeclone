# Linktree Clone MVP

Platform bio link yang komprehensif dengan fitur manajemen tautan, analitik detail, dan sistem autentikasi yang aman. Dibuat dengan teknologi modern untuk memberikan pengalaman pengguna terbaik.

## 🚀 Teknologi yang Digunakan

### Frontend
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

### Backend & Database
- **Supabase** - Backend-as-a-Service dengan PostgreSQL
- **Row Level Security (RLS)** - Keamanan data tingkat baris
- **PostgreSQL** - Database relasional yang robust
- **Real-time subscriptions** - Update data real-time
- **Edge Functions** - Functions serverless untuk logic kompleks

## ✨ Fitur Utama MVP

### 🔐 Autentikasi & Profil
- **Sistem autentikasi lengkap** - Login, registrasi, dan manajemen sesi
- **Profil pengguna yang dapat dikustomisasi** - Bio, foto, dan informasi kontak
- **Upload avatar** - Manajemen gambar profil yang aman
- **Tema kustomisasi** - Warna, font, dan gaya tombol yang dapat disesuaikan

### 🔗 Manajemen Tautan
- **CRUD tautan lengkap** - Tambah, edit, hapus, dan organise tautan
- **Grup tautan terorganisir** - Kategorisasi tautan dengan urutan drag-and-drop
- **Sistem tautan cerdas** - Status aktif/nonaktif dan penjadwalan
- **Bulk import/export** - Operasi data dalam jumlah besar
- **Public profile** - Halaman profil publik yang dapat dibagikan

### 📊 Analitik & Engagement
- **Pelacakan klik detail** - Informasi perangkat, lokasi, dan referrer
- **Dashboard analitik** - Visualisasi data engagement yang komprehensif
- **QR codes** - Generate QR code untuk setiap tautan
- **Contact forms** - Formulir kontak dinamis dengan schema JSONB

### 🌐 Pengalaman Pengguna
- **Desain responsif** - Mobile, tablet, dan desktop optimized
- **Mode terang & gelap** - Theme switching yang smooth
- **Internasionalisasi** - Dukungan multi-bahasa ( Bahasa Indonesia )
- **Drag & drop interface** - Reordering tautan yang intuitif

## 📁 Struktur Proyek

```
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── layouts/             # Layout utama (Dashboard, Public Profile)
│   │   ├── providers/           # Provider (Theme, Query, dll)
│   │   └── ui/                  # Komponen UI (Button, Card, Input, dll)
│   ├── hooks/                   # Custom hooks (useMediaQuery, dll)
│   ├── i18n/                    # Konfigurasi internasionalisasi
│   │   ├── config.ts           # Setup i18next
│   │   └── locales/            # File terjemahan
│   │       └── id.json         # Terjemahan Bahasa Indonesia
│   ├── lib/                     # Utilities dan helper functions
│   │   ├── utils.ts            # Fungsi utility (cn, dll)
│   │   └── mock-data.ts        # Data placeholder untuk development
│   ├── pages/                   # Halaman aplikasi
│   │   ├── auth/               # Halaman autentikasi
│   │   ├── dashboard/          # Halaman dashboard
│   │   └── public-profile.tsx  # Halaman profil publik
│   └── App.tsx                  # Root component dengan routing
│
├── supabase/                    # Backend configuration
│   ├── migrations/             # Database migration files
│   │   └── 001_initial_schema.sql
│   ├── seed.sql                # Sample data untuk development
│   ├── validate_schema.sql     # Schema validation queries
│   └── SCHEMA_DOCUMENTATION.md # Dokumentasi database
│
├── public/                      # Static assets
│   └── vite.svg               # Logo aplikasi
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies dan scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── vercel.json                # Vercel deployment configuration
└── README.md                  # Project documentation
```

## 🗄️ Database Schema

Platform ini menggunakan skema PostgreSQL yang dirancang dengan baik dengan 8 tabel utama:

### Tabel Utama
1. **users** - Profil pengguna dan informasi media sosial
2. **user_themes** - Kustomisasi tampilan (warna, font, gaya tombol)
3. **link_groups** - Organisasi tautan dalam kategori
4. **links** - Tautan utama dengan status dan penjadwalan
5. **link_clicks** - Data analitik detail untuk setiap klik
6. **contact_form_submissions** - Submisi formulir dengan schema dinamis
7. **bulk_import_jobs** - Pekerjaan import batch
8. **bulk_import_records** - Record individual dalam import batch

### Keamanan Database
- **Row Level Security (RLS)** diaktifkan pada semua tabel
- Isolasi data pengguna - pengguna hanya dapat mengakses data mereka sendiri
- Profil publik dapat diakses tanpa otentikasi untuk konten yang dipublikasikan
- Hashing IP address untuk privasi dalam pelacakan analitik

### Fungsi Helper (RPC)
- `record_link_click()` - Mencatat klik tautan dengan data analitik lengkap
- `update_link_ordering()` - Update urutan tautan via drag-and-drop
- `update_link_group_ordering()` - Update urutan grup tautan
- `get_user_public_profile()` - API untuk mengambil profil publik

## 🚀 Instalasi & Setup

### Prasyarat
- Node.js 18+ dan npm
- Akun Supabase (untuk deployment database)

### Langkah Instalasi

1. **Clone repository ini:**
```bash
git clone https://github.com/lbhbetulbetul-cloud/linktreeclone.git
cd linktreeclone
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local dengan konfigurasi Supabase Anda
```

4. **Setup database:**
```bash
# Jalankan migration di Supabase SQL Editor
# Copy isi file supabase/migrations/001_initial_schema.sql
# Paste ke Supabase SQL Editor dan jalankan

# Untuk seed data (optional)
psql "postgresql://postgres:password@localhost:5432/postgres" -f supabase/seed.sql
```

5. **Jalankan development server:**
```bash
npm run dev
```

6. **Buka browser dan akses:**
```
http://localhost:5173
```

### Environment Variables

Buat file `.env.local` dengan variabel berikut:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Untuk development lokal
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
VITE_APP_URL=http://localhost:5173
```

## 🛠️ Perintah yang Tersedia

### Development
- `npm run dev` - Menjalankan development server
- `npm run build` - Build aplikasi untuk production
- `npm run preview` - Preview build production
- `npm run lint` - Menjalankan ESLint
- `npm run type-check` - Menjalankan TypeScript compiler check

### Database
- `supabase db reset` - Reset local database
- `supabase db push` - Push migrations ke remote database
- `supabase gen types` - Generate TypeScript types

## 🎨 Theming System

Sistem theming yang fleksibel memungkinkan kustomisasi lengkap:

### Color Palette
- **Primary**: Warna utama (hijau Linktree-style)
- **Secondary**: Warna sekunder
- **Accent**: Warna aksen
- **Background & Foreground**: Latar belakang dan teks
- **Custom colors**: Dukungan warna kustom per pengguna

### Typography
- **Heading Font**: Poppins (untuk judul)
- **Body Font**: Inter (untuk teks biasa)
- **Font sizes**: Sistema scaling yang konsisten

### Button Styles
- **Shape**: Sharp atau rounded
- **Size**: Small, medium, large
- **Animations**: Hover effects dan transitions

## 📊 Analytics System

Sistem analitik komprehensif yang melacak:

### Device Information
- **Device Type**: Desktop, mobile, tablet
- **Operating System**: Windows, macOS, iOS, Android, dll
- **Browser**: Chrome, Firefox, Safari, Edge, dll

### Location & Referrer
- **Country**: Berdasarkan IP address
- **Referrer Domain**: Sumber traffic
- **UTM Parameters**: Campaign tracking

### Click Patterns
- **Frequency**: Jumlah klik per periode
- **Time-based Analysis**: Kapan tautan paling banyak diklik
- **Trend Analysis**: Perubahan engagement dari waktu ke waktu

## 🌐 Internacionalisasi

Aplikasi ini mendukung multi-bahasa menggunakan i18next:

### Bahasa yang Didukung
- **Bahasa Indonesia** (default)
- **English** (siap untuk ditambahkan)

### Menambahkan Bahasa Baru

1. Buat file JSON baru di `src/i18n/locales/`
2. Salin struktur dari `id.json` dan terjemahkan
3. Import dan daftarkan di `src/i18n/config.ts`

## 🔒 Keamanan

### Frontend Security
- **Input validation**: Validasi form di client dan server
- **XSS Protection**: Sanitasi input pengguna
- **CSRF Protection**: Protection terhadap cross-site attacks

### Database Security
- **Row Level Security**: Isolasi data antar pengguna
- **Input Sanitization**: Pembersihan input database
- **Rate Limiting**: Pembatasan request untuk mencegah abuse

### Privacy
- **IP Hashing**: Alamat IP di-hash untuk privasi
- **Data Encryption**: Data sensitif dienkripsi
- **GDPR Compliance**: Menyiapkan compliance dengan regulasi privacy

## 📱 Responsif Design

Aplikasi sepenuhnya responsif dengan breakpoint berikut:

- **xs**: 480px (Mobile kecil)
- **sm**: 640px (Mobile)
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop kecil)
- **xl**: 1280px (Desktop)
- **2xl**: 1400px (Desktop besar)

### Layout Adaptif
- **Mobile**: Hamburger menu, single column layout
- **Tablet**: Collapsible sidebar, medium layout
- **Desktop**: Full sidebar, multi-column layout

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel dashboard
```

### Manual Deployment
```bash
# Build untuk production
npm run build

# Serve folder dist/ dengan web server pilihan Anda
```

### Environment Variables untuk Production
```bash
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key
VITE_APP_URL=https://yourdomain.com
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Registrasi dan login pengguna
- [ ] CRUD operations untuk tautan
- [ ] Drag & drop reordering
- [ ] Public profile accessibility
- [ ] Analytics data collection
- [ ] Theme switching
- [ ] Responsive design di berbagai device

### Database Testing
```sql
-- Test RLS policies
SELECT * FROM links WHERE auth.uid() = user_id;

-- Test RPC functions
SELECT record_link_click('link-uuid', 'https://google.com', 'desktop', 'Windows', 'Chrome', 'US');
```

## 📈 Performance

### Optimization Features
- **Code splitting**: Lazy loading untuk komponen
- **Image optimization**: Responsive images dengan lazy loading
- **Caching**: Browser caching dan Supabase caching
- **Bundle optimization**: Tree shaking dan minification

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan:

1. **Fork repository**
2. **Buat branch fitur** (`git checkout -b feature/AmazingFeature`)
3. **Commit perubahan** (`git commit -m 'Add some AmazingFeature'`)
4. **Push ke branch** (`git push origin feature/AmazingFeature`)
5. **Buat Pull Request**

### Development Guidelines
- Gunakan TypeScript untuk type safety
- Ikuti konvensi penamaan yang sudah ada
- Tambahkan tests untuk fitur baru
- Update dokumentasi jika diperlukan

## 🐛 Troubleshooting

### Common Issues

**Build fails dengan error TypeScript:**
```bash
npm run type-check
npm run lint --fix
```

**Database connection issues:**
- Pastikan environment variables benar
- Periksa URL Supabase dan API keys
- Pastikan RLS policies sudah di-setup

**Styling issues:**
- Periksa tailwind.config.js
- Pastikan CSS classes yang digunakan valid
- Clear browser cache

## 📝 Changelog

### MVP Release (v1.0.0)
- ✅ Initial React + Vite + TypeScript setup
- ✅ Supabase database schema dan RLS
- ✅ Autentikasi dan profil manajemen
- ✅ Link manager dengan CRUD operations
- ✅ Analytics dan click tracking
- ✅ Public profile system
- ✅ Bulk import/export functionality
- ✅ QR code generation
- ✅ Contact forms dengan dynamic schema
- ✅ Responsive design
- ✅ Dark/Light theme
- ✅ Indonesian localization

## 📄 Lisensi

MIT License - bebas digunakan untuk proyek pribadi maupun komersial.

## 🙏 Acknowledgments

- [Linktree](https://linktr.ee) - Inspirasi desain dan fitur
- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - Komponen UI yang beautiful
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS yang powerful
- [Radix UI](https://www.radix-ui.com) - Primitif UI yang accessible

---

Dibuat dengan ❤️ menggunakan React, TypeScript, dan Supabase