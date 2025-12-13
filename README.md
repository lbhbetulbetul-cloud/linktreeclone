# Link Manager

A modern link management dashboard with drag-and-drop reordering, grouping, scheduling, and public profiles.

## Features

- **Dashboard**: Manage links with CRUD operations
- **Grouping**: Organize links into custom groups with icons and colors
- **Scheduling**: Set start and end dates for links with timezone support
- **Drag & Drop**: Reorder links and groups with visual feedback
- **Import/Export**: Bulk operations with CSV and JSON support
- **Public Profiles**: Share your links at `/u/:username`
- **Responsive Design**: Mobile-friendly interface
- **Bahasa UI**: Complete Indonesian language support

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI + Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

## Setup

### Prerequisites

- Node.js 18+
- Supabase project

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Set up the database schema using Supabase CLI or SQL directly.

### Database Schema

Create the following tables in Supabase:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  theme VARCHAR(10) DEFAULT 'auto',
  primary_color VARCHAR(7) DEFAULT '#3b82f6',
  secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Groups Table
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#8b5cf6',
  icon VARCHAR(10),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Links Table
```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(10),
  warna_tombol VARCHAR(7) DEFAULT '#3b82f6',
  gaya_tombol VARCHAR(20) DEFAULT 'solid',
  thumbnail_url TEXT,
  preview_title VARCHAR(255),
  preview_description TEXT,
  preview_image TEXT,
  share_twitter BOOLEAN DEFAULT FALSE,
  share_facebook BOOLEAN DEFAULT FALSE,
  share_linkedin BOOLEAN DEFAULT FALSE,
  share_whatsapp BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'aktif',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  timezone VARCHAR(50) DEFAULT 'UTC',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### RPC Functions

```sql
CREATE OR REPLACE FUNCTION reorder_links(
  p_user_id UUID,
  p_link_ids UUID[]
)
RETURNS TABLE (id UUID, "order" INTEGER) AS $$
DECLARE
  v_order INTEGER := 0;
  v_link_id UUID;
BEGIN
  FOREACH v_link_id IN ARRAY p_link_ids LOOP
    UPDATE links
    SET "order" = v_order
    WHERE id = v_link_id AND user_id = p_user_id;
    
    SELECT v_link_id, v_order INTO id, "order";
    RETURN NEXT;
    v_order := v_order + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reorder_groups(
  p_user_id UUID,
  p_group_ids UUID[]
)
RETURNS TABLE (id UUID, "order" INTEGER) AS $$
DECLARE
  v_order INTEGER := 0;
  v_group_id UUID;
BEGIN
  FOREACH v_group_id IN ARRAY p_group_ids LOOP
    UPDATE groups
    SET "order" = v_order
    WHERE id = v_group_id AND user_id = p_user_id;
    
    SELECT v_group_id, v_order INTO id, "order";
    RETURN NEXT;
    v_order := v_order + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Development

```bash
npm run dev
```

Visit http://localhost:3000

## Building

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── u/                 # Public profile pages
│   └── page.tsx          # Home redirect
├── components/
│   ├── LinkForm.tsx
│   ├── LinkItem.tsx
│   ├── GroupForm.tsx
│   ├── Modal.tsx
│   ├── DraggableList.tsx
│   ├── ImportExportPanel.tsx
│   └── providers/         # TanStack Query providers
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── queries.ts        # TanStack Query hooks
│   ├── validation.ts     # Zod schemas
│   ├── i18n.ts          # Bahasa translations
│   ├── import-export.ts  # CSV/JSON utilities
│   └── scheduling.ts     # Scheduling utilities
├── types/
│   └── database.types.ts # Generated Supabase types
└── styles/
    └── globals.css       # Tailwind styles
```

## Usage

### Dashboard
1. Login with your Supabase account
2. Create and manage links
3. Organize into groups
4. Set scheduling rules
5. Reorder with drag & drop
6. Import/export data

### Public Profile
Access at `/u/:username` to view:
- User profile information
- Grouped links
- Active links only (respecting scheduling)
- Social share options

## API Routes

All data is managed through Supabase:
- Queries through RLS policies
- Mutations through table operations
- RPC calls for bulk operations

## Contributing

Please follow the existing code style and patterns.

## License

MIT
