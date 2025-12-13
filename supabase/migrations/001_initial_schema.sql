-- =============================================================================
-- INITIAL SCHEMA MIGRATION
-- Creates all tables, indexes, constraints, RLS policies, and helper functions
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS AND TYPES
-- =============================================================================

CREATE TYPE link_status AS ENUM ('active', 'inactive', 'scheduled', 'archived');
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet');
CREATE TYPE click_event_type AS ENUM ('click', 'qr_scan', 'preview');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Users table with profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    username_slug VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    
    -- Social handles
    twitter_handle VARCHAR(50),
    instagram_handle VARCHAR(50),
    linkedin_handle VARCHAR(100),
    github_handle VARCHAR(50),
    youtube_handle VARCHAR(100),
    tiktok_handle VARCHAR(50),
    
    -- Profile customization
    custom_domain VARCHAR(255),
    custom_domain_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_username CHECK (username ~* '^[a-zA-Z0-9_-]+$'),
    CONSTRAINT username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 50),
    CONSTRAINT username_slug_lowercase CHECK (username_slug = LOWER(username_slug))
);

-- User themes for customization
CREATE TABLE user_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Color palette
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#64748B',
    accent_color VARCHAR(7) DEFAULT '#10B981',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    text_color VARCHAR(7) DEFAULT '#1F2937',
    
    -- Fonts
    heading_font VARCHAR(100) DEFAULT 'Inter',
    body_font VARCHAR(100) DEFAULT 'Inter',
    button_font VARCHAR(100) DEFAULT 'Inter',
    
    -- Button styles
    button_style VARCHAR(50) DEFAULT 'rounded',
    button_size VARCHAR(20) DEFAULT 'medium',
    button_animation VARCHAR(50) DEFAULT 'none',
    
    -- Background media
    background_type VARCHAR(20) DEFAULT 'solid', -- solid, gradient, image, video
    background_value TEXT, -- CSS gradient, image URL, video URL
    background_opacity DECIMAL(3,2) DEFAULT 1.0,
    
    -- Advanced customization
    custom_css TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Link groups for organization
CREATE TABLE link_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Group information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    
    -- Metadata
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_group_name CHECK (LENGTH(TRIM(name)) > 0),
    
    UNIQUE(user_id, name)
);

-- Main links table
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES link_groups(id) ON DELETE SET NULL,
    
    -- Link content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon_url TEXT,
    qr_slug VARCHAR(50),
    
    -- Ordering and visibility
    display_order INTEGER DEFAULT 0,
    status link_status DEFAULT 'active',
    
    -- Scheduling
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Style overrides (per-link customization)
    custom_title_color VARCHAR(7),
    custom_bg_color VARCHAR(7),
    custom_button_style VARCHAR(50),
    custom_button_color VARCHAR(7),
    
    -- Preview and metadata
    preview_image_url TEXT,
    preview_title VARCHAR(255),
    preview_description TEXT,
    
    -- Analytics and tracking
    total_clicks INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_url CHECK (url ~* '^https?://'),
    CONSTRAINT valid_qr_slug CHECK (qr_slug IS NULL OR qr_slug ~* '^[a-zA-Z0-9_-]+$'),
    CONSTRAINT no_scheduling_conflict CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date < end_date
    ),
    
    UNIQUE(user_id, qr_slug)
);

-- Link clicks tracking
CREATE TABLE link_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    
    -- Click information
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    event_type click_event_type DEFAULT 'click',
    
    -- Referrer information
    referrer TEXT,
    referrer_domain TEXT,
    
    -- Device and browser
    device_type device_type,
    os_name VARCHAR(50),
    os_version VARCHAR(20),
    browser_name VARCHAR(50),
    browser_version VARCHAR(20),
    user_agent TEXT,
    
    -- Location data
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Privacy and security
    ip_address INET,
    ip_hash VARCHAR(64), -- Hashed IP for privacy
    
    -- Additional metadata
    session_id VARCHAR(255),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100)
);

-- Contact form submissions
CREATE TABLE contact_form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Form identification
    form_schema JSONB NOT NULL, -- Stores the form structure/schema
    form_title VARCHAR(255) NOT NULL,
    
    -- Submission data
    submitted_fields JSONB NOT NULL, -- Actual form field values
    submitter_email VARCHAR(255),
    
    -- Metadata
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Tags and categorization
    tags TEXT[] DEFAULT '{}',
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT valid_form_schema CHECK (jsonb_typeof(form_schema) = 'object'),
    CONSTRAINT valid_submitted_fields CHECK (jsonb_typeof(submitted_fields) = 'object')
);

-- =============================================================================
-- HELPER TABLES FOR BULK OPERATIONS
-- =============================================================================

-- Bulk import tracking
CREATE TABLE bulk_import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Job information
    import_type VARCHAR(50) NOT NULL, -- 'links', 'contacts', etc.
    file_name VARCHAR(255),
    file_size INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    
    -- Results
    error_log JSONB,
    success_log JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_import_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Bulk import records
CREATE TABLE bulk_import_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES bulk_import_jobs(id) ON DELETE CASCADE,
    
    -- Record data
    record_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, success, failed
    error_message TEXT,
    created_entity_id UUID, -- ID of created record if successful
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username_slug ON users(username_slug);
CREATE INDEX idx_users_custom_domain ON users(custom_domain);

-- User themes indexes
CREATE INDEX idx_user_themes_user_id ON user_themes(user_id);

-- Link groups indexes
CREATE INDEX idx_link_groups_user_id ON link_groups(user_id);
CREATE INDEX idx_link_groups_display_order ON link_groups(user_id, display_order);

-- Links indexes
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_group_id ON links(group_id);
CREATE INDEX idx_links_display_order ON links(user_id, display_order);
CREATE INDEX idx_links_status ON links(status);
CREATE INDEX idx_links_qr_slug ON links(qr_slug);
CREATE INDEX idx_links_scheduling ON links(start_date, end_date);
CREATE INDEX idx_links_total_clicks ON links(total_clicks DESC);

-- Link clicks indexes
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at DESC);
CREATE INDEX idx_link_clicks_referrer ON link_clicks(referrer_domain);
CREATE INDEX idx_link_clicks_location ON link_clicks(country, city);
CREATE INDEX idx_link_clicks_device ON link_clicks(device_type, os_name, browser_name);
CREATE INDEX idx_link_clicks_ip_hash ON link_clicks(ip_hash);

-- Contact form submissions indexes
CREATE INDEX idx_contact_submissions_user_id ON contact_form_submissions(user_id);
CREATE INDEX idx_contact_submissions_submitted_at ON contact_form_submissions(submitted_at DESC);
CREATE INDEX idx_contact_submissions_tags ON contact_form_submissions USING GIN(tags);
CREATE INDEX idx_contact_submissions_is_read ON contact_form_submissions(is_read);

-- Bulk import indexes
CREATE INDEX idx_bulk_import_jobs_user_id ON bulk_import_jobs(user_id);
CREATE INDEX idx_bulk_import_jobs_status ON bulk_import_jobs(status);
CREATE INDEX idx_bulk_import_records_job_id ON bulk_import_records(job_id);
CREATE INDEX idx_bulk_import_records_status ON bulk_import_records(status);

-- =============================================================================
-- UPDATED AT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_user_themes_updated_at BEFORE UPDATE ON user_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_link_groups_updated_at BEFORE UPDATE ON link_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_bulk_import_jobs_updated_at BEFORE UPDATE ON bulk_import_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- HELPER FUNCTIONS AND RPCS
-- =============================================================================

-- Function to record link clicks
CREATE OR REPLACE FUNCTION record_link_click(
    p_link_id UUID,
    p_referrer TEXT DEFAULT NULL,
    p_device_type device_type DEFAULT NULL,
    p_os_name VARCHAR(50) DEFAULT NULL,
    p_os_version VARCHAR(20) DEFAULT NULL,
    p_browser_name VARCHAR(50) DEFAULT NULL,
    p_browser_version VARCHAR(20) DEFAULT NULL,
    p_country VARCHAR(2) DEFAULT NULL,
    p_region VARCHAR(100) DEFAULT NULL,
    p_city VARCHAR(100) DEFAULT NULL,
    p_latitude DECIMAL(10, 8) DEFAULT NULL,
    p_longitude DECIMAL(11, 8) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_utm_source VARCHAR(100) DEFAULT NULL,
    p_utm_medium VARCHAR(100) DEFAULT NULL,
    p_utm_campaign VARCHAR(100) DEFAULT NULL,
    p_event_type click_event_type DEFAULT 'click'
)
RETURNS UUID AS $$
DECLARE
    click_id UUID;
    user_ip_hash VARCHAR(64);
BEGIN
    -- Hash IP address for privacy
    IF p_ip_address IS NOT NULL THEN
        user_ip_hash := encode(digest(p_ip_address::text || extract(epoch from now())::text, 'sha256'), 'hex');
    END IF;
    
    -- Insert click record
    INSERT INTO link_clicks (
        link_id, referrer, referrer_domain, device_type, os_name, os_version,
        browser_name, browser_version, country, region, city, latitude, longitude,
        ip_address, ip_hash, session_id, utm_source, utm_medium, utm_campaign, event_type
    ) VALUES (
        p_link_id, p_referrer, 
        CASE WHEN p_referrer IS NOT NULL THEN split_part(p_referrer, '/', 3) ELSE NULL END,
        p_device_type, p_os_name, p_os_version, p_browser_name, p_browser_version,
        p_country, p_region, p_city, p_latitude, p_longitude, p_ip_address,
        user_ip_hash, p_session_id, p_utm_source, p_utm_medium, p_utm_campaign, p_event_type
    ) RETURNING id INTO click_id;
    
    -- Update link click counter
    UPDATE links SET total_clicks = total_clicks + 1 WHERE id = p_link_id;
    
    RETURN click_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update link ordering (drag-and-drop)
CREATE OR REPLACE FUNCTION update_link_ordering(
    p_user_id UUID,
    p_link_orders JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    link_order JSONB;
    link_id UUID;
    new_order INTEGER;
BEGIN
    -- Loop through the JSONB object containing link_id -> order pairs
    FOR link_order IN SELECT * FROM jsonb_each(p_link_orders)
    LOOP
        link_id := (link_order.key)::UUID;
        new_order := (link_order.value)::INTEGER;
        
        -- Update the link's display order
        UPDATE links 
        SET display_order = new_order 
        WHERE id = link_id AND user_id = p_user_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Link not found or access denied for link_id: %', link_id;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update link group ordering
CREATE OR REPLACE FUNCTION update_link_group_ordering(
    p_user_id UUID,
    p_group_orders JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    group_order JSONB;
    group_id UUID;
    new_order INTEGER;
BEGIN
    -- Loop through the JSONB object containing group_id -> order pairs
    FOR group_order IN SELECT * FROM jsonb_each(p_group_orders)
    LOOP
        group_id := (group_order.key)::UUID;
        new_order := (group_order.value)::INTEGER;
        
        -- Update the group's display order
        UPDATE link_groups 
        SET display_order = new_order 
        WHERE id = group_id AND user_id = p_user_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Group not found or access denied for group_id: %', group_id;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's public profile
CREATE OR REPLACE FUNCTION get_user_public_profile(p_username_slug TEXT)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR(50),
    username_slug VARCHAR(50),
    full_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    custom_domain VARCHAR(255),
    theme JSONB,
    groups JSONB,
    links JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.username_slug,
        u.full_name,
        u.bio,
        u.avatar_url,
        u.website_url,
        u.custom_domain,
        (
            SELECT jsonb_build_object(
                'primary_color', ut.primary_color,
                'secondary_color', ut.secondary_color,
                'accent_color', ut.accent_color,
                'background_color', ut.background_color,
                'text_color', ut.text_color,
                'heading_font', ut.heading_font,
                'body_font', ut.body_font,
                'button_style', ut.button_style,
                'background_type', ut.background_type,
                'background_value', ut.background_value
            )
            FROM user_themes ut 
            WHERE ut.user_id = u.id
        ) as theme,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', lg.id,
                    'name', lg.name,
                    'description', lg.description,
                    'display_order', lg.display_order,
                    'links', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', l.id,
                                'title', l.title,
                                'description', l.description,
                                'url', l.url,
                                'icon_url', l.icon_url,
                                'preview_image_url', l.preview_image_url,
                                'status', l.status
                            )
                            ORDER BY l.display_order
                        )
                        FROM links l 
                        WHERE l.group_id = lg.id 
                        AND l.status = 'active'
                        AND (l.start_date IS NULL OR l.start_date <= NOW())
                        AND (l.end_date IS NULL OR l.end_date >= NOW())
                    )
                )
                ORDER BY lg.display_order
            )
            FROM link_groups lg
            WHERE lg.user_id = u.id AND lg.is_visible = TRUE
        ) as groups,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', l.id,
                    'title', l.title,
                    'description', l.description,
                    'url', l.url,
                    'icon_url', l.icon_url,
                    'preview_image_url', l.preview_image_url,
                    'status', l.status
                )
                ORDER BY l.display_order
            )
            FROM links l
            WHERE l.user_id = u.id 
            AND l.group_id IS NULL
            AND l.status = 'active'
            AND (l.start_date IS NULL OR l.start_date <= NOW())
            AND (l.end_date IS NULL OR l.end_date >= NOW())
        ) as links
    FROM users u
    WHERE u.username_slug = p_username_slug
    AND u.is_public = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_records ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view public profiles" ON users
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Authenticated users can create profiles" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User themes policies
CREATE POLICY "Users can view their own theme" ON user_themes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own theme" ON user_themes
    FOR ALL USING (auth.uid() = user_id);

-- Link groups policies
CREATE POLICY "Users can manage their own link groups" ON link_groups
    FOR ALL USING (auth.uid() = user_id);

-- Links policies
CREATE POLICY "Users can manage their own links" ON links
    FOR ALL USING (auth.uid() = user_id);

-- Link clicks policies
CREATE POLICY "Users can view clicks on their links" ON link_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM links 
            WHERE links.id = link_clicks.link_id 
            AND links.user_id = auth.uid()
        )
    );

-- Link clicks can be inserted by anyone (for public link tracking)
CREATE POLICY "Anyone can record link clicks" ON link_clicks
    FOR INSERT WITH CHECK (TRUE);

-- Contact form submissions policies
CREATE POLICY "Users can manage their form submissions" ON contact_form_submissions
    FOR ALL USING (auth.uid() = user_id);

-- Bulk import policies
CREATE POLICY "Users can manage their import jobs" ON bulk_import_jobs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their import records" ON bulk_import_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bulk_import_jobs 
            WHERE bulk_import_jobs.id = bulk_import_records.job_id
            AND bulk_import_jobs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their import records" ON bulk_import_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bulk_import_jobs 
            WHERE bulk_import_jobs.id = bulk_import_records.job_id
            AND bulk_import_jobs.user_id = auth.uid()
        )
    );

-- =============================================================================
-- VIEWS FOR EASIER QUERIES
-- =============================================================================

-- View for link analytics
CREATE VIEW link_analytics AS
SELECT 
    l.id as link_id,
    l.title,
    l.url,
    l.user_id,
    l.total_clicks,
    COUNT(lc.id) as recorded_clicks,
    COUNT(DISTINCT DATE(lc.clicked_at)) as active_days,
    COUNT(DISTINCT lc.ip_hash) as unique_visitors,
    MIN(lc.clicked_at) as first_click,
    MAX(lc.clicked_at) as last_click
FROM links l
LEFT JOIN link_clicks lc ON l.id = lc.link_id
GROUP BY l.id, l.title, l.url, l.user_id, l.total_clicks;

-- View for user dashboard stats
CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT l.id) as total_links,
    COUNT(DISTINCT lg.id) as total_groups,
    SUM(l.total_clicks) as total_link_clicks,
    COUNT(DISTINCT lcu.ip_hash) as unique_visitors,
    COUNT(DISTINCT cfs.id) as form_submissions
FROM users u
LEFT JOIN links l ON u.id = l.user_id
LEFT JOIN link_groups lg ON u.id = lg.user_id
LEFT JOIN link_clicks lcu ON l.id = lcu.link_id
LEFT JOIN contact_form_submissions cfs ON u.id = cfs.user_id
GROUP BY u.id, u.username;