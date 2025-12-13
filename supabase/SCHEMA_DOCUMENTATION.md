# Dokumentasi Skema Supabase

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Struktur Database](#struktur-database)
3. [Tabel dan Hubungan](#tabel-dan-hubungan)
4. [Kebijakan Keamanan (RLS)](#kebijakan-keamanan-rls)
5. [Fungsi Helper dan RPC](#fungsi-helper-dan-rpc)
6. [Workflow Supabase CLI](#workflow-supabase-cli)
7. [Variabel Lingkungan](#variabel-lingkungan)

---

## Pendahuluan

Skema database Supabase ini dirancang untuk aplikasi bio link (link-in-bio) yang memungkinkan pengguna membuat halaman profil terkustomisasi dengan berbagai tautan, grup tautan, analitik, dan formulir kontak.

### Fitur Utama:
- ✅ Profil pengguna dengan kustomisasi tema
- ✅ Grup tautan yang dapat diurutkan
- ✅ Sistem tautan dengan jadwal dan status
- ✅ Analitik klik terperinci dengan pelacakan geografis
- ✅ Formulir kontak dengan schema dinamis
- ✅ Bulk import untuk operasi skala besar
- ✅ Keamanan Row Level Security (RLS)
- ✅ Fungsi RPC untuk operasi khusus

---

## Struktur Database

### Teknologi yang Digunakan:
- **PostgreSQL** dengan ekstensi:
  - `uuid-ossp`: Untuk generate UUID
  - `pgcrypto`: Untuk hashing IP address
- **Enums**: `link_status`, `device_type`, `click_event_type`
- **JSONB**: Untuk data dinamis (form schema, submitted fields)

### Pola Desain:
- **Soft delete**: Menggunakan CASCADE delete
- **Audit trail**: Timestamp `created_at` dan `updated_at`
- **UUID primary keys**: Untuk keamanan dan skalabilitas
- **Constraints**: Validasi data di level database
- **Indexes**: Optimasi performa query

---

## Tabel dan Hubungan

### 1. **users** - Tabel Profil Pengguna
```sql
- id (UUID, PK) - ID unik pengguna
- email (VARCHAR, UNIQUE) - Email pengguna
- username (VARCHAR, UNIQUE) - Username yang mudah dibaca
- username_slug (VARCHAR, UNIQUE) - Versi lowercase untuk URL
- full_name (VARCHAR) - Nama lengkap
- bio (TEXT) - Bio profil
- avatar_url (TEXT) - URL foto profil
- website_url (TEXT) - Website pribadi
- social_handles (VARCHAR) - Handle media sosial
- custom_domain (VARCHAR) - Domain kustom
- is_public (BOOLEAN) - Apakah profil publik
- is_verified (BOOLEAN) - Status verifikasi
```

**Hubungan:**
- 1:1 dengan `user_themes`
- 1:N dengan `link_groups`, `links`, `contact_form_submissions`, `bulk_import_jobs`

### 2. **user_themes** - Kustomisasi Tampilan
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- Color palette: primary_color, secondary_color, accent_color, background_color, text_color
- Fonts: heading_font, body_font, button_font
- Button styles: button_style, button_size, button_animation
- Background: background_type, background_value, background_opacity
- Custom CSS support
```

**Tujuan:** Menyimpan preferensi tampilan pengguna untuk halaman profil mereka.

### 3. **link_groups** - Kelompok Tautan
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- name (VARCHAR) - Nama grup
- description (TEXT) - Deskripsi grup
- display_order (INTEGER) - Urutan tampilan
- is_visible (BOOLEAN) - Visibilitas grup
```

**Hubungan:**
- N:1 dengan `users`
- 1:N dengan `links`

### 4. **links** - Tautan Utama
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- group_id (UUID, FK → link_groups.id, NULLABLE)
- title (VARCHAR) - Judul tautan
- description (TEXT) - Deskripsi tautan
- url (TEXT) - URL tujuan
- icon_url (TEXT) - URL ikon
- qr_slug (VARCHAR, UNIQUE) - Slug untuk QR code
- display_order (INTEGER) - Urutan dalam grup
- status (link_status) - Status tautan
- start_date, end_date (TIMESTAMPTZ) - Jadwal penayangan
- Custom styling: title_color, bg_color, button_style, button_color
- Preview metadata: preview_image_url, preview_title, preview_description
- total_clicks (INTEGER) - Counter klik
```

**Status Tautan:**
- `active`: Tautan aktif dan dapat diakses
- `inactive`: Tautan nonaktif
- `scheduled`: Tautan terjadwal (akan aktif pada waktu tertentu)
- `archived`: Tautan diarsipkan

**Hubungan:**
- N:1 dengan `users` dan `link_groups`
- 1:N dengan `link_clicks`

### 5. **link_clicks** - Analitik Klik
```sql
- id (UUID, PK)
- link_id (UUID, FK → links.id)
- clicked_at (TIMESTAMPTZ) - Timestamp klik
- event_type (click_event_type) - Jenis event (click, qr_scan, preview)
- Referrer: referrer, referrer_domain
- Device info: device_type, os_name, os_version, browser_name, browser_version, user_agent
- Location: country, region, city, latitude, longitude
- Privacy: ip_address, ip_hash (hashed)
- Session: session_id
- UTM tracking: utm_source, utm_medium, utm_campaign
```

**Tujuan:** Menyimpan data analitik lengkap untuk setiap klik tautan.

### 6. **contact_form_submissions** - Submisi Formulir
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- form_schema (JSONB) - Schema/form structure
- form_title (VARCHAR) - Judul formulir
- submitted_fields (JSONB) - Data yang disubmit
- submitter_email (VARCHAR) - Email submitter
- submitted_at (TIMESTAMPTZ) - Timestamp submit
- ip_address, user_agent - Informasi submitter
- tags (TEXT[]) - Tag untuk kategorisasi
- is_read, is_archived - Status penanganan
```

**Tujuan:** Menyimpan submisi formulir kontak dengan schema dinamis.

### 7. **bulk_import_jobs** - Job Import Batch
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- import_type (VARCHAR) - Tipe import (links, contacts, etc.)
- file_name, file_size - Informasi file
- status (VARCHAR) - Status job
- total_records, processed_records, failed_records - Statistik
- error_log, success_log (JSONB) - Log hasil
```

### 8. **bulk_import_records** - Record Import Individual
```sql
- id (UUID, PK)
- job_id (UUID, FK → bulk_import_jobs.id)
- record_data (JSONB) - Data record
- status (VARCHAR) - Status record
- error_message (TEXT) - Pesan error jika gagal
- created_entity_id (UUID) - ID entitas yang dibuat
```

**Tujuan:** Mengelola operasi import data dalam jumlah besar.

---

## Kebijakan Keamanan (RLS)

### Prinsip RLS:
1. **Private by default**: Semua data private kecuali政策的明确允许
2. **User isolation**: Pengguna hanya dapat mengakses data mereka sendiri
3. **Public profiles**: Data profil publik dapat dibaca oleh anyone
4. **Secure RPCs**: Fungsi RPC menggunakan `SECURITY DEFINER`

### Kebijakan RLS:

#### **users**:
```sql
-- Pengguna dapat melihat profil mereka sendiri
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Siapa pun dapat melihat profil publik
CREATE POLICY "Anyone can view public profiles" ON users
    FOR SELECT USING (is_public = TRUE);
```

#### **user_themes, link_groups, links**:
```sql
-- Pengguna dapat mengelola data mereka sendiri
CREATE POLICY "Users can manage their own [table]" ON [table]
    FOR ALL USING (auth.uid() = user_id);
```

#### **link_clicks**:
```sql
-- Pengguna dapat melihat klik pada tautan mereka
CREATE POLICY "Users can view clicks on their links" ON link_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM links 
            WHERE links.id = link_clicks.link_id 
            AND links.user_id = auth.uid()
        )
    );

-- Siapa pun dapat mencatat klik (untuk tracking publik)
CREATE POLICY "Anyone can record link clicks" ON link_clicks
    FOR INSERT WITH CHECK (TRUE);
```

---

## Fungsi Helper dan RPC

### 1. **record_link_click()** - Mencatat Klik Tautan
```sql
CREATE OR REPLACE FUNCTION record_link_click(
    p_link_id UUID,
    p_referrer TEXT DEFAULT NULL,
    p_device_type device_type DEFAULT NULL,
    -- ... parameter lainnya
)
RETURNS UUID
```

**Fungsi:**
- Mencatat detail klik tautan
- Mengupdate counter `total_clicks` di tabel `links`
- Hashing IP address untuk privasi
- Menentukan referrer domain secara otomatis

**Penggunaan:**
```javascript
// Frontend call
const clickId = await supabase.rpc('record_link_click', {
    p_link_id: linkId,
    p_referrer: document.referrer,
    p_device_type: getDeviceType(),
    p_country: userCountry
});
```

### 2. **update_link_ordering()** - Update Urutan Drag-and-Drop
```sql
CREATE OR REPLACE FUNCTION update_link_ordering(
    p_user_id UUID,
    p_link_orders JSONB  // {"link-id-1": 1, "link-id-2": 2, ...}
)
RETURNS BOOLEAN
```

**Fungsi:**
- Update urutan tautan berdasarkan drag-and-drop
- Validasi akses pengguna
- Batch update dalam satu transaksi

**Penggunaan:**
```javascript
// Frontend call
await supabase.rpc('update_link_ordering', {
    p_user_id: userId,
    p_link_orders: {
        "550e8400-e29b-41d4-a716-446655440001": 1,
        "550e8400-e29b-41d4-a716-446655440002": 2
    }
});
```

### 3. **update_link_group_ordering()** - Update Urutan Grup
```sql
CREATE OR REPLACE FUNCTION update_link_group_ordering(
    p_user_id UUID,
    p_group_orders JSONB
)
RETURNS BOOLEAN
```

### 4. **get_user_public_profile()** - Mendapatkan Profil Publik
```sql
CREATE OR REPLACE FUNCTION get_user_public_profile(p_username_slug TEXT)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR(50),
    -- ... fields lainnya
    theme JSONB,
    groups JSONB,
    links JSONB
)
```

**Fungsi:**
- Mengambil profil publik lengkap dengan tema, grup, dan tautan
- Hanya menampilkan tautan aktif dan dalam jadwal yang valid
- Format JSON untuk easy frontend consumption

**Penggunaan:**
```javascript
// Get public profile
const { data } = await supabase.rpc('get_user_public_profile', {
    p_username_slug: 'johndoe'
});
```

---

## Workflow Supabase CLI

### 1. **Setup Awal**
```bash
# Install Supabase CLI
npm install -g supabase

# Login ke Supabase
supabase login

# Inisialisasi project
supabase init

# Link ke remote project
supabase link --project-ref [your-project-ref]
```

### 2. **Development Workflow**
```bash
# Start local development environment
supabase start

# Run migrations
supabase db reset  # Reset dan run semua migration
supabase db push   # Push changes ke remote

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts
```

### 3. **Migration Management**
```bash
# Create new migration
supabase migration new [migration_name]

# Apply migrations to remote
supabase db push

# Apply migrations to local
supabase db reset
```

### 4. **Testing RLS Policies**
```bash
# Create test user (dalam SQL editor)
INSERT INTO auth.users (id, email) VALUES ('test-uuid', 'test@example.com');

# Test RLS dalam SQL editor
SELECT * FROM links WHERE auth.uid() = user_id;
```

### 5. **Seed Data**
```bash
# Load seed data (setelah reset)
psql [connection-string] -f supabase/seed.sql

# Atau dalam Supabase SQL editor
\i supabase/seed.sql
```

---

## Variabel Lingkungan

### 1. **Supabase Configuration**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. **Required Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXT_AUTH_SECRET=your-next-auth-secret
NEXTAUTH_URL=http://localhost:3000

# Analytics (optional)
ANALYTICS_API_KEY=your-analytics-key

# Email (untuk notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

### 3. **Development vs Production**
```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_ENV=development

# Production
NODE_ENV=production
NEXT_PUBLIC_ENV=production
```

---

## Panduan Implementasi

### 1. **Setup Project**
```bash
# Clone project
git clone [your-repo]
cd [your-project]

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dengan nilai yang benar

# Setup database
supabase start
supabase db reset
```

### 2. **Test Data**
```bash
# Load seed data
psql "postgresql://postgres:postgres@localhost:5432/postgres" -f supabase/seed.sql
```

### 3. **Validation**
```bash
# Test RLS policies
# 1. Buka Supabase dashboard
# 2. Buka SQL Editor
# 3. Test queries dengan authenticated dan unauthenticated users

# Test RPC functions
SELECT record_link_click('link-uuid', 'https://google.com', 'desktop', 'Windows', 'Chrome', 'US');
```

### 4. **Common Issues**

#### **RLS Policy Not Working:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test policy manually
SET LOCAL role authenticated;
SELECT * FROM links WHERE user_id = auth.uid();
```

#### **Migration Errors:**
```bash
-- Reset database if migration fails
supabase db reset

-- Or fix migration manually
-- Edit migration file and re-run
```

#### **Seed Data Issues:**
```sql
-- Check if users exist (UUIDs dalam seed perlu disesuaikan)
SELECT id, username FROM users;
```

---

## Tips Keamanan

### 1. **Row Level Security**
- ✅ Selalu test RLS policies dengan user berbeda
- ✅ Gunakan `SECURITY DEFINER` untuk RPC functions
- ✅ Validate user permissions di application level

### 2. **Data Privacy**
- ✅ IP addresses di-hash untuk privacy
- ✅ Sensitive data di-encrypt
- ✅ Logs di-anonymized

### 3. **Performance**
- ✅ Indexes pada foreign keys dan frequently queried columns
- ✅ Query optimization untuk analytics
- ✅ Connection pooling untuk production

---

## Kesimpulan

Skema ini menyediakan foundation yang solid untuk aplikasi bio link dengan:
- ✅ Keamanan berlapis dengan RLS
- ✅ Analitik comprehensive
- ✅ Flexibility dengan JSONB fields
- ✅ Scalability dengan proper indexing
- ✅ Developer-friendly dengan seed data dan dokumentasi

Untuk development lokal, jalankan `supabase db reset` untuk provisioning schema tanpa error. Pastikan environment variables dikonfigurasi dengan benar untuk production deployment.