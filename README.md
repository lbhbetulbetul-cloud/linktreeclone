# Supabase Link-in-Bio Platform

Platform bio link yang komprehensif dibangun dengan Supabase, menampilkan profil pengguna yang dapat dikustomisasi, analitik tautan detail, dan sistem manajemen konten yang aman.

## 🎯 Fitur Utama

- **Profil Pengguna yang Dapat Disesuaikan** - Bio, foto, dan handle media sosial
- **Grup Tautan Terorganisir** - Kategorisasi tautan dengan urutan drag-and-drop
- **Sistem Tautan Cerdas** - Status aktif/nonaktif, penjadwalan, dan tampilan khusus
- **Analitik Komprehensif** - Pelacakan klik dengan informasi perangkat, lokasi, dan referrer
- **Formulir Kontak Dinamis** - Schema JSONB yang fleksibel untuk berbagai jenis formulir
- **Sistem Import Bulk** - Operasi import data dalam jumlah besar
- **Keamanan Berlapis** - Row Level Security (RLS) untuk isolasi data pengguna

## 🏗️ Arsitektur

### Database Schema
Platform ini menggunakan skema PostgreSQL yang dirancang dengan baik dengan 8 tabel utama:

1. **users** - Profil pengguna dan informasi media sosial
2. **user_themes** - Kustomisasi tampilan (warna, font, gaya tombol)
3. **link_groups** - Organisasi tautan dalam kategori
4. **links** - Tautan utama dengan status dan penjadwalan
5. **link_clicks** - Data analitik detail untuk setiap klik
6. **contact_form_submissions** - Submisi formulir dengan schema dinamis
7. **bulk_import_jobs** - Pekerjaan import batch
8. **bulk_import_records** - Record individual dalam import batch

### Keamanan
- **Row Level Security (RLS)** diaktifkan pada semua tabel
- Isolasi data pengguna - pengguna hanya dapat mengakses data mereka sendiri
- Profil publik dapat diakses tanpa otentikasi untuk konten yang dipublikasikan
- Hashing IP address untuk privasi dalam pelacakan analitik

### Fungsi Helper (RPC)
- `record_link_click()` - Mencatat klik tautan dengan data analitik lengkap
- `update_link_ordering()` - Update urutan tautan via drag-and-drop
- `update_link_group_ordering()` - Update urutan grup tautan
- `get_user_public_profile()` - API untuk mengambil profil publik

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ dan npm/yarn
- Supabase CLI (`npm install -g supabase`)
- Akun Supabase (untuk deployment)

### Setup Lokal

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd [project-name]
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local dengan konfigurasi Anda
   ```

4. **Setup Database**
   ```bash
   # Initialize Supabase
   supabase init
   
   # Start local development
   supabase start
   
   # Run migrations and seed data
   supabase db reset
   psql "postgresql://postgres:postgres@localhost:5432/postgres" -f supabase/seed.sql
   ```

5. **Generate TypeScript Types**
   ```bash
   supabase gen types typescript --local > src/types/database.types.ts
   ```

### Environment Variables

Buat file `.env.local` dengan variabel berikut:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# Authentication
NEXT_AUTH_SECRET=your-next-auth-secret
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

## 📊 Data Seed

Platform ini dilengkapi dengan data seed untuk development:

- **3 Sample Users**: Tech blogger, UI/UX designer, content creator
- **Tema Kustom**: Berbagai skema warna dan font untuk setiap pengguna
- **Grup dan Tautan**: Contoh struktur tautan yang terorganisir
- **Data Analitik**: Sample click data untuk testing
- **Form Submissions**: Contoh kontak formulir untuk testing

## 🛠️ Development Workflow

### Database Migrations
```bash
# Create new migration
supabase migration new [migration_name]

# Apply migrations
supabase db push

# Reset local database
supabase db reset
```

### Testing
```bash
# Start development server
npm run dev

# Test RLS policies in Supabase SQL Editor
SELECT * FROM links WHERE auth.uid() = user_id;

# Test RPC functions
SELECT record_link_click('link-uuid', 'https://google.com', 'desktop', 'Windows', 'Chrome', 'US');
```

## 📚 Dokumentasi

- **[Schema Documentation](./supabase/SCHEMA_DOCUMENTATION.md)** - Dokumentasi lengkap skema dalam Bahasa
- **[Migration Files](./supabase/migrations/)** - File SQL untuk setup database
- **[Seed Data](./supabase/seed.sql)** - Sample data untuk development

## 🔒 Keamanan

### Row Level Security
Semua tabel memiliki RLS diaktifkan dengan kebijakan berikut:

- Pengguna hanya dapat mengakses data mereka sendiri
- Profil publik dapat dibaca tanpa otentikasi
- Pencatatan klik dapat dilakukan oleh anyone (untuk tracking publik)
- Fungsi RPC menggunakan `SECURITY DEFINER` untuk permissions yang tepat

### Privacy
- IP addresses di-hash untuk tracking yang menjaga privasi
- Data sensitif di-encode dengan aman
- Logs di-anonymized untuk production

## 🎨 Theming System

Sistem theming yang fleksibel memungkinkan kustomisasi lengkap:

- **Color Palette**: Warna primer, sekunder, aksen, background, dan teks
- **Typography**: Font untuk heading, body text, dan tombol
- **Button Styles**: Bentuk (sharp/rounded), ukuran, dan animasi
- **Background**: Solid, gradient, image, atau video dengan opacity control
- **Custom CSS**: Support untuk styling tambahan

## 📈 Analytics

Sistem analitik komprehensif melacak:

- **Device Information**: Tipe perangkat, OS, browser
- **Location Data**: Negara, kota, koordinat (dengan privacy)
- **Referrer Analysis**: Sumber traffic dan domain
- **Session Tracking**: ID sesi dan UTM parameters
- **Click Patterns**: Frekuensi, waktu, dan trend

## 🔧 API Reference

### RPC Functions

#### `record_link_click()`
Mencatat klik tautan dengan data analitik lengkap.

```typescript
const clickId = await supabase.rpc('record_link_click', {
    p_link_id: linkId,
    p_referrer: document.referrer,
    p_device_type: getDeviceType(),
    p_os_name: 'Windows',
    p_browser_name: 'Chrome',
    p_country: 'US',
    p_session_id: generateSessionId()
});
```

#### `update_link_ordering()`
Update urutan tautan via drag-and-drop.

```typescript
await supabase.rpc('update_link_ordering', {
    p_user_id: userId,
    p_link_orders: {
        "550e8400-e29b-41d4-a716-446655440001": 1,
        "550e8400-e29b-41d4-a716-446655440002": 2
    }
});
```

#### `get_user_public_profile()`
Mengambil profil publik lengkap.

```typescript
const { data } = await supabase.rpc('get_user_public_profile', {
    p_username_slug: 'johndoe'
});
```

## 🚀 Deployment

### Production Setup
1. Buat project Supabase baru
2. Run migrations: `supabase db push`
3. Setup environment variables untuk production
4. Deploy aplikasi ke platform pilihan Anda

### Environment Variables untuk Production
```bash
NODE_ENV=production
NEXT_PUBLIC_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

## 📝 License

[Your License Here]

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

Untuk pertanyaan atau support, silakan:
- Buka issue di GitHub
- Check dokumentasi lengkap di [Schema Documentation](./supabase/SCHEMA_DOCUMENTATION.md)
- Review example code dalam seed data

---

**Status**: ✅ Ready for Development  
**Database**: ✅ Schema Complete  
**Security**: ✅ RLS Policies Implemented  
**Documentation**: ✅ Comprehensive (Bahasa)  
**Seed Data**: ✅ Ready for Testing