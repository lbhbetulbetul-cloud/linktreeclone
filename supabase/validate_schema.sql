-- =============================================================================
-- VALIDATION SCRIPT UNTUK SCHEMA SUPABASE
-- =============================================================================
-- Script ini dijalankan untuk memvalidasi bahwa semua tabel, indexes, 
-- constraints, dan policies telah dibuat dengan benar
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    function_count INTEGER;
    index_count INTEGER;
BEGIN
    RAISE NOTICE '=== SUPABASE SCHEMA VALIDATION ===';
    RAISE NOTICE '';

    -- Validasi tabel utama
    RAISE NOTICE '=== TABLES VALIDATION ===';
    
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'users', 'user_themes', 'link_groups', 'links', 
        'link_clicks', 'contact_form_submissions', 
        'bulk_import_jobs', 'bulk_import_records'
    );
    
    RAISE NOTICE 'Expected 8 core tables, found: %', table_count;
    
    IF table_count = 8 THEN
        RAISE NOTICE '✅ All core tables created successfully';
    ELSE
        RAISE NOTICE '❌ Missing tables - expected 8, found %', table_count;
    END IF;
    
    RAISE NOTICE '';

    -- Validasi RLS policies
    RAISE NOTICE '=== RLS POLICIES VALIDATION ===';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'user_themes', 'link_groups', 'links', 
        'link_clicks', 'contact_form_submissions', 
        'bulk_import_jobs', 'bulk_import_records'
    );
    
    RAISE NOTICE 'Found % RLS policies', policy_count;
    
    IF policy_count >= 10 THEN
        RAISE NOTICE '✅ RLS policies created successfully';
    ELSE
        RAISE NOTICE '❌ Missing RLS policies - found only %', policy_count;
    END IF;
    
    RAISE NOTICE '';

    -- Validasi functions
    RAISE NOTICE '=== HELPER FUNCTIONS VALIDATION ===';
    
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'record_link_click', 'update_link_ordering', 
        'update_link_group_ordering', 'get_user_public_profile'
    );
    
    RAISE NOTICE 'Found % helper functions', function_count;
    
    IF function_count >= 4 THEN
        RAISE NOTICE '✅ All helper functions created successfully';
    ELSE
        RAISE NOTICE '❌ Missing helper functions - found only %', function_count;
    END IF;
    
    RAISE NOTICE '';

    -- Validasi indexes
    RAISE NOTICE '=== INDEXES VALIDATION ===';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'user_themes', 'link_groups', 'links', 
        'link_clicks', 'contact_form_submissions', 
        'bulk_import_jobs', 'bulk_import_records'
    );
    
    RAISE NOTICE 'Found % indexes', index_count;
    
    IF index_count >= 20 THEN
        RAISE NOTICE '✅ Performance indexes created successfully';
    ELSE
        RAISE NOTICE '❌ Missing indexes - found only %', index_count;
    END IF;
    
    RAISE NOTICE '';

    -- Validasi specific critical indexes
    RAISE NOTICE '=== CRITICAL INDEXES CHECK ===';
    
    -- Check for specific important indexes
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_users_email') THEN
        RAISE NOTICE '✅ User email index found';
    ELSE
        RAISE NOTICE '❌ User email index missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_links_user_id') THEN
        RAISE NOTICE '✅ Links user_id index found';
    ELSE
        RAISE NOTICE '❌ Links user_id index missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_link_clicks_link_id') THEN
        RAISE NOTICE '✅ Link clicks link_id index found';
    ELSE
        RAISE NOTICE '❌ Link clicks link_id index missing';
    END IF;
    
    RAISE NOTICE '';

    -- Validasi constraints
    RAISE NOTICE '=== CONSTRAINTS VALIDATION ===';
    
    -- Check unique constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'users_email_key' AND table_name = 'users') THEN
        RAISE NOTICE '✅ Users email unique constraint found';
    ELSE
        RAISE NOTICE '❌ Users email unique constraint missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'users_username_key' AND table_name = 'users') THEN
        RAISE NOTICE '✅ Users username unique constraint found';
    ELSE
        RAISE NOTICE '❌ Users username unique constraint missing';
    END IF;
    
    -- Check foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'user_themes') THEN
        RAISE NOTICE '✅ User themes foreign key constraint found';
    ELSE
        RAISE NOTICE '❌ User themes foreign key constraint missing';
    END IF;
    
    RAISE NOTICE '';

    -- Test basic functionality
    RAISE NOTICE '=== BASIC FUNCTIONALITY TESTS ===';
    
    -- Test enum creation
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'link_status') THEN
        RAISE NOTICE '✅ link_status enum created';
    ELSE
        RAISE NOTICE '❌ link_status enum missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_type') THEN
        RAISE NOTICE '✅ device_type enum created';
    ELSE
        RAISE NOTICE '❌ device_type enum missing';
    END IF;
    
    -- Test views
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'link_analytics') THEN
        RAISE NOTICE '✅ link_analytics view created';
    ELSE
        RAISE NOTICE '❌ link_analytics view missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_dashboard_stats') THEN
        RAISE NOTICE '✅ user_dashboard_stats view created';
    ELSE
        RAISE NOTICE '❌ user_dashboard_stats view missing';
    END IF;
    
    RAISE NOTICE '';

    -- Final summary
    RAISE NOTICE '=== VALIDATION SUMMARY ===';
    RAISE NOTICE 'Tables: % (expected 8)', table_count;
    RAISE NOTICE 'RLS Policies: %', policy_count;
    RAISE NOTICE 'Helper Functions: % (expected 4)', function_count;
    RAISE NOTICE 'Indexes: %', index_count;
    
    IF table_count = 8 AND policy_count >= 10 AND function_count >= 4 AND index_count >= 20 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ALL VALIDATIONS PASSED!';
        RAISE NOTICE 'Schema is ready for development!';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  SOME VALIDATIONS FAILED!';
        RAISE NOTICE 'Please check the migration files.';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VALIDATION COMPLETE ===';
END $$;