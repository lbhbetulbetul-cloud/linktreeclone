-- =============================================================================
-- SEED DATA FOR LOCAL DEVELOPMENT
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SAMPLE USERS
-- =============================================================================

-- Sample user 1: John Doe (Tech Blogger)
INSERT INTO users (id, email, username, username_slug, full_name, bio, avatar_url, website_url, twitter_handle, instagram_handle, linkedin_handle, github_handle, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'johndoe', 'johndoe', 'John Doe', 'Tech blogger and developer passionate about web technologies and open source.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', 'https://johndoe.dev', 'johndoetech', 'johndoedev', 'johndoe-tech', 'johndoeopensource', true);

-- Sample user 2: Sarah Smith (Designer)
INSERT INTO users (id, email, username, username_slug, full_name, bio, avatar_url, website_url, twitter_handle, instagram_handle, linkedin_handle, behance_handle, youtube_handle, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'sarah.smith@example.com', 'sarahsmith', 'sarahsmith', 'Sarah Smith', 'UI/UX Designer with 8+ years of experience. Creating beautiful and functional digital experiences.', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', 'https://sarahsmith.design', 'sarahdesigns', 'sarahsmith_design', 'sarah-smith-designer', 'sarahsmithux', 'sarahsmithdesigns', true);

-- Sample user 3: Mike Johnson (Content Creator)
INSERT INTO users (id, email, username, username_slug, full_name, bio, avatar_url, website_url, twitter_handle, instagram_handle, youtube_handle, tiktok_handle, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'mike.johnson@example.com', 'mikejohnson', 'mikejohnson', 'Mike Johnson', 'Content creator focused on tech reviews, tutorials, and the latest in software development.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', 'https://mikejohnson.tv', 'mikejohnsontech', 'mikejohnson_yt', 'mikejohnsontech', 'mikejohnsontiktok', false);

-- =============================================================================
-- USER THEMES
-- =============================================================================

-- John's theme (Tech/Developer)
INSERT INTO user_themes (
    user_id, primary_color, secondary_color, accent_color, background_color, text_color,
    heading_font, body_font, button_style, button_size, button_animation,
    background_type, background_value
) VALUES
('550e8400-e29b-41d4-a716-446655440001', '#3B82F6', '#1E40AF', '#10B981', '#F8FAFC', '#1E293B', 'Fira Code', 'Inter', 'sharp', 'medium', 'bounce', 'gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');

-- Sarah's theme (Designer/Creative)
INSERT INTO user_themes (
    user_id, primary_color, secondary_color, accent_color, background_color, text_color,
    heading_font, body_font, button_style, button_size, button_animation,
    background_type, background_value
) VALUES
('550e8400-e29b-41d4-a716-446655440002', '#EC4899', '#BE185D', '#F59E0B', '#FFFBFF', '#374151', 'Playfair Display', 'Poppins', 'rounded', 'large', 'pulse', 'image', 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop');

-- Mike's theme (Content Creator/Social)
INSERT INTO user_themes (
    user_id, primary_color, secondary_color, accent_color, background_color, text_color,
    heading_font, body_font, button_style, button_size, button_animation,
    background_type, background_value
) VALUES
('550e8400-e29b-41d4-a716-446655440003', '#FF6B6B', '#EE5A52', '#4ECDC4', '#FAFAFA', '#2C3E50', 'Montserrat', 'Open Sans', 'rounded', 'medium', 'shake', 'gradient', 'linear-gradient(45deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)');

-- =============================================================================
-- LINK GROUPS
-- =============================================================================

-- John's groups
INSERT INTO link_groups (id, user_id, name, description, display_order) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Social Media', 'Find me on social platforms', 1),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'My Projects', 'Open source projects and contributions', 2),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Resources', 'Useful tools and resources I recommend', 3);

-- Sarah's groups
INSERT INTO link_groups (id, user_id, name, description, display_order) VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Portfolio', 'My design work and case studies', 1),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Social', 'Follow my design journey', 2),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Design Tools', 'Tools that help me create', 3);

-- Mike's groups
INSERT INTO link_groups (id, user_id, name, description, display_order) VALUES
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'YouTube', 'Subscribe to my channel', 1),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Social Media', 'Follow me everywhere', 2),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Merch', 'Get your tech swag', 3);

-- =============================================================================
-- LINKS
-- =============================================================================

-- John's links
INSERT INTO links (id, user_id, group_id, title, description, url, icon_url, qr_slug, display_order, status) VALUES
-- Social Media group
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'GitHub', 'Check out my code repositories', 'https://github.com/johndoeopensource', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', 'john-github', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Twitter', 'Follow my tech thoughts', 'https://twitter.com/johndoetech', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg', 'john-twitter', 2, 'active'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'LinkedIn', 'Connect professionally', 'https://linkedin.com/in/johndoe-tech', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', 'john-linkedin', 3, 'active'),

-- My Projects group
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'OpenSource Tracker', 'Track open source contributions', 'https://github.com/johndoeopensource/open-source-tracker', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', 'john-project-1', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Dev Blog', 'My technical blog', 'https://johndoe.dev/blog', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dev-dot-to.svg', 'john-blog', 2, 'active'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'VS Code Extensions', 'My VS Code extensions', 'https://marketplace.visualstudio.com/items?itemName=johndoeopensource', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/visualstudiocode.svg', 'john-vscode', 3, 'active'),

-- Resources group
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'Free Code Courses', 'Free programming courses', 'https://freecodecamp.org', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/freecodecamp.svg', 'freecodecamp', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'Developer Tools', 'Essential dev tools', 'https://devtools.tech', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dev-dot-to.svg', 'devtools', 2, 'active'),

-- Links without group
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', NULL, 'My Website', 'Visit my personal website', 'https://johndoe.dev', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/globe.svg', 'john-website', 1, 'active'),
('770e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Contact Me', 'Get in touch', 'mailto:john.doe@example.com', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mail-dot-ru.svg', 'john-contact', 2, 'active');

-- Sarah's links
INSERT INTO links (id, user_id, group_id, title, description, url, icon_url, qr_slug, display_order, status) VALUES
-- Portfolio group
('770e8400-e29b-41d4-a716-44665544000b', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Portfolio Website', 'View my latest design work', 'https://sarahsmith.design', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/behance.svg', 'sarah-portfolio', 1, 'active'),
('770e8400-e29b-41d4-a716-44665544000c', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Case Studies', 'Detailed project breakdowns', 'https://sarahsmith.design/case-studies', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg', 'sarah-cases', 2, 'active'),

-- Social group
('770e8400-e29b-41d4-a716-44665544000d', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'Dribbble', 'See my design shots', 'https://dribbble.com/sarahdesigns', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dribbble.svg', 'sarah-dribbble', 1, 'active'),
('770e8400-e29b-41d4-a716-44665544000e', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'Instagram', 'Design process behind the scenes', 'https://instagram.com/sarahsmith_design', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', 'sarah-instagram', 2, 'active'),

-- Design Tools group
('770e8400-e29b-41d4-a716-44665544000f', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006', 'Figma', 'My favorite design tool', 'https://figma.com', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg', 'figma', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006', 'Adobe Creative Suite', 'Professional design tools', 'https://adobe.com', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobecreativecloud.svg', 'adobe', 2, 'active'),

-- Links without group
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', NULL, 'Design Blog', 'Read my design insights', 'https://sarahsmith.design/blog', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dev-dot-to.svg', 'sarah-blog', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', NULL, 'Hire Me', 'Available for freelance work', 'mailto:sarah.smith@example.com', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mail-dot-ru.svg', 'sarah-hire', 2, 'active');

-- Mike's links
INSERT INTO links (id, user_id, group_id, title, description, url, icon_url, qr_slug, display_order, status) VALUES
-- YouTube group
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'Main Channel', 'Tech reviews and tutorials', 'https://youtube.com/@mikejohnsontech', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', 'mike-youtube', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'Live Streams', 'Live coding sessions', 'https://youtube.com/@mikejohnsontech/live', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', 'mike-livestream', 2, 'active'),

-- Social Media group
('770e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', 'TikTok', 'Short tech tips', 'https://tiktok.com/@mikejohnsontiktok', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg', 'mike-tiktok', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', 'Twitter', 'Daily tech thoughts', 'https://twitter.com/mikejohnsontech', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg', 'mike-twitter', 2, 'active'),

-- Merch group
('770e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440009', 'T-Shirts', 'Geeky programmer tees', 'https://teespring.com/mikejohnsontech', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tshirtdies.svg', 'mike-shirts', 1, 'active'),
('770e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440009', 'Stickers', 'Custom laptop stickers', 'https://stickermule.com/mikejohnsontech', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stickermule.svg', 'mike-stickers', 2, 'active'),

-- Links without group
('770e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440003', NULL, 'Newsletter', 'Weekly tech roundup', 'https://mikejohnson.tech/newsletter', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mail-dot-ru.svg', 'mike-newsletter', 1, 'active'),
('770e8400-e29b-41d4-a716-44665544001a', '550e8400-e29b-41d4-a716-446655440003', NULL, 'Business Inquiries', 'Contact for collaborations', 'mailto:mike.johnson@example.com', 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mail-dot-ru.svg', 'mike-business', 2, 'active');

-- =============================================================================
-- LINK CLICKS (Sample analytics data)
-- =============================================================================

-- Generate sample click data for John's links
INSERT INTO link_clicks (link_id, clicked_at, referrer, device_type, os_name, browser_name, country, city, session_id) VALUES
-- Recent clicks on John's GitHub link
('770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour', 'https://google.com', 'desktop', 'Windows', 'Chrome', 'US', 'New York', 'sess_001'),
('770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 hours', 'https://twitter.com', 'mobile', 'iOS', 'Safari', 'CA', 'Toronto', 'sess_002'),
('770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '3 hours', NULL, 'desktop', 'macOS', 'Safari', 'GB', 'London', 'sess_003'),
('770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day', 'https://dev.to', 'tablet', 'iPadOS', 'Safari', 'DE', 'Berlin', 'sess_004'),

-- Clicks on John's blog
('770e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '30 minutes', 'https://hnrss.org', 'desktop', 'Windows', 'Firefox', 'US', 'San Francisco', 'sess_005'),
('770e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '45 minutes', 'https://reddit.com', 'mobile', 'Android', 'Chrome', 'IN', 'Mumbai', 'sess_006'),
('770e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '2 days', 'https://google.com', 'desktop', 'Ubuntu', 'Chrome', 'BR', 'São Paulo', 'sess_007'),

-- Clicks on Sarah's portfolio
('770e8400-e29b-41d4-a716-44665544000b', NOW() - INTERVAL '15 minutes', 'https://dribbble.com', 'desktop', 'macOS', 'Chrome', 'FR', 'Paris', 'sess_008'),
('770e8400-e29b-41d4-a716-44665544000b', NOW() - INTERVAL '1 hour', 'https://behance.net', 'desktop', 'Windows', 'Edge', 'JP', 'Tokyo', 'sess_009'),
('770e8400-e29b-41d4-a716-44665544000b', NOW() - INTERVAL '3 days', 'https://instagram.com', 'mobile', 'iOS', 'Safari', 'AU', 'Sydney', 'sess_010'),

-- Clicks on Mike's YouTube channel
('770e8400-e29b-41d4-a716-446655440013', NOW() - INTERVAL '10 minutes', 'https://twitter.com', 'desktop', 'Windows', 'Chrome', 'MX', 'Mexico City', 'sess_011'),
('770e8400-e29b-41d4-a716-446655440013', NOW() - INTERVAL '25 minutes', 'https://reddit.com', 'mobile', 'Android', 'Chrome', 'AR', 'Buenos Aires', 'sess_012'),
('770e8400-e29b-41d4-a716-446655440013', NOW() - INTERVAL '1 day', NULL, 'desktop', 'macOS', 'Safari', 'US', 'Los Angeles', 'sess_013');

-- =============================================================================
-- CONTACT FORM SUBMISSIONS
-- =============================================================================

-- Sample contact form submissions
INSERT INTO contact_form_submissions (
    user_id, form_schema, form_title, submitted_fields, submitter_email, ip_address, tags
) VALUES
-- Submission for John
('550e8400-e29b-41d4-a716-446655440001', 
 '{"fields": [{"name": "name", "type": "text", "required": true}, {"name": "email", "type": "email", "required": true}, {"name": "message", "type": "textarea", "required": true}]}',
 'Contact Form',
 '{"name": "Alice Johnson", "email": "alice@example.com", "message": "Hi John, I love your blog posts! Could you write more about React Hooks?"}',
 'alice@example.com',
 '192.168.1.100'::INET,
 '{"blog-request", "react", "hooks"}'),

('550e8400-e29b-41d4-a716-446655440001',
 '{"fields": [{"name": "name", "type": "text", "required": true}, {"name": "company", "type": "text", "required": false}, {"name": "email", "type": "email", "required": true}, {"name": "project-type", "type": "select", "options": ["Web App", "Mobile App", "API"], "required": true}]}',
 'Freelance Inquiry',
 '{"name": "Bob Smith", "company": "Tech Startup Inc", "email": "bob@techstartup.com", "project-type": "Web App"}',
 'bob@techstartup.com',
 '10.0.0.50'::INET,
 '{"freelance", "web-app", "startup"}'),

-- Submission for Sarah
('550e8400-e29b-41d4-a716-446655440002',
 '{"fields": [{"name": "name", "type": "text", "required": true}, {"name": "email", "type": "email", "required": true}, {"name": "project-type", "type": "select", "options": ["Branding", "UI/UX Design", "Web Design"], "required": true}, {"name": "budget", "type": "select", "options": ["< $1000", "$1000 - $5000", "$5000 - $10000", "> $10000"], "required": true}]}',
 'Design Inquiry',
 '{"name": "Carol Wilson", "email": "carol@designcompany.com", "project-type": "Branding", "budget": "$5000 - $10000"}',
 'carol@designcompany.com',
 '172.16.0.200'::INET,
 '{"branding", "high-budget", "design"}'),

-- Submission for Mike
('550e8400-e29b-41d4-a716-446655440003',
 '{"fields": [{"name": "name", "type": "text", "required": true}, {"name": "email", "type": "email", "required": true}, {"name": "collaboration-type", "type": "select", "options": ["Sponsorship", "Product Review", "Joint Video"], "required": true}, {"name": "message", "type": "textarea", "required": true}]}',
 'Collaboration Proposal',
 '{"name": "David Brown", "email": "david@techcompany.com", "collaboration-type": "Product Review", "message": "We would love to send you our latest product for review on your channel."}',
 'david@techcompany.com',
 '203.0.113.10'::INET,
 '{"sponsorship", "review", "tech"}');

-- =============================================================================
-- BULK IMPORT EXAMPLES
-- =============================================================================

-- Sample bulk import job for John (importing links)
INSERT INTO bulk_import_jobs (
    id, user_id, import_type, file_name, file_size, status, total_records, processed_records, failed_records
) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'links', 'tech_links_import.csv', 2048, 'completed', 15, 13, 2);

-- Sample bulk import records
INSERT INTO bulk_import_records (job_id, record_data, status, error_message) VALUES
('880e8400-e29b-41d4-a716-446655440001', '{"title": "VS Code Tips", "url": "https://vscodetips.com", "description": "Useful VS Code tips"}', 'success', NULL),
('880e8400-e29b-41d4-a716-446655440001', '{"title": "Invalid URL", "url": "not-a-valid-url", "description": "This should fail"}', 'failed', 'Invalid URL format'),
('880e8400-e29b-41d4-a716-446655440001', '{"title": "JavaScript Resources", "url": "https://jsresources.org", "description": "Curated JavaScript resources"}', 'success', NULL);

-- =============================================================================
-- UPDATE LINK CLICK COUNTS
-- =============================================================================

-- Update the total_clicks counter based on actual click records
UPDATE links SET total_clicks = (
    SELECT COUNT(*) FROM link_clicks WHERE link_clicks.link_id = links.id
);

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Insert a completion log (this will be handled by application code in practice)
DO $$
BEGIN
    RAISE NOTICE 'Seed data created successfully!';
    RAISE NOTICE 'Sample users created:';
    RAISE NOTICE '  - johndoe (johndoe@example.com) - Tech blogger';
    RAISE NOTICE '  - sarahsmith (sarah.smith@example.com) - UI/UX Designer';
    RAISE NOTICE '  - mikejohnson (mike.johnson@example.com) - Content Creator';
    RAISE NOTICE '';
    RAISE NOTICE 'Total records created:';
    RAISE NOTICE '  - Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '  - Themes: %', (SELECT COUNT(*) FROM user_themes);
    RAISE NOTICE '  - Link Groups: %', (SELECT COUNT(*) FROM link_groups);
    RAISE NOTICE '  - Links: %', (SELECT COUNT(*) FROM links);
    RAISE NOTICE '  - Link Clicks: %', (SELECT COUNT(*) FROM link_clicks);
    RAISE NOTICE '  - Contact Submissions: %', (SELECT COUNT(*) FROM contact_form_submissions);
    RAISE NOTICE '  - Bulk Import Jobs: %', (SELECT COUNT(*) FROM bulk_import_jobs);
END $$;