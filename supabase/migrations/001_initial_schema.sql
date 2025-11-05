-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE DEFINITIONS
-- =====================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table with user_id
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL CHECK (char_length(job_title) <= 200),
  company TEXT NOT NULL CHECK (char_length(company) <= 200),
  date_applied DATE NOT NULL,
  job_link TEXT CHECK (char_length(job_link) <= 2000),
  salary TEXT CHECK (char_length(salary) <= 100),
  location TEXT CHECK (char_length(location) <= 200),
  status TEXT DEFAULT 'Applied' CHECK (char_length(status) <= 100),
  next_action_date DATE,
  notes TEXT CHECK (char_length(notes) <= 5000),
  application_platforms TEXT[] DEFAULT '{}' CHECK (array_length(application_platforms, 1) <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_statuses table (user-specific custom statuses)
CREATE TABLE IF NOT EXISTS user_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL CHECK (char_length(key) >= 2 AND char_length(key) <= 50 AND key ~ '^[a-z0-9_-]+$'),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key),
  UNIQUE(user_id, name)
);

-- Create user_platforms table (user-specific custom platforms)
CREATE TABLE IF NOT EXISTS user_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL CHECK (char_length(key) >= 2 AND char_length(key) <= 50 AND key ~ '^[a-z0-9_-]+$'),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key),
  UNIQUE(user_id, name)
);

-- Create default statuses table (system-wide defaults)
CREATE TABLE IF NOT EXISTS default_statuses (
  key TEXT PRIMARY KEY CHECK (char_length(key) >= 2 AND char_length(key) <= 50),
  name TEXT NOT NULL UNIQUE CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create default platforms table (system-wide defaults)
CREATE TABLE IF NOT EXISTS default_platforms (
  key TEXT PRIMARY KEY CHECK (char_length(key) >= 2 AND char_length(key) <= 50),
  name TEXT NOT NULL UNIQUE CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default statuses
INSERT INTO default_statuses (key, name) VALUES
  ('applied', 'Applied'),
  ('screening', 'Screening/Review'),
  ('interview', 'Interview Scheduled'),
  ('offer', 'Offer Received'),
  ('rejected', 'Rejected'),
  ('closed', 'No Follow-up Required')
ON CONFLICT (key) DO NOTHING;

-- Insert default platforms
INSERT INTO default_platforms (key, name) VALUES
  ('linkedin', 'LinkedIn'),
  ('company-website', 'Company Website'),
  ('hr-email', 'HR Email'),
  ('whatsapp', 'WhatsApp'),
  ('recruiter', 'Recruiter Contact'),
  ('other', 'Other')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied ON jobs(date_applied DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_user_statuses_user_id ON user_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_platforms_user_id ON user_platforms(user_id);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_jobs_user_date ON jobs(user_id, date_applied DESC);

-- Index for text search on job title and company
CREATE INDEX IF NOT EXISTS idx_jobs_job_title_gin ON jobs USING gin(to_tsvector('english', job_title));
CREATE INDEX IF NOT EXISTS idx_jobs_company_gin ON jobs USING gin(to_tsvector('english', company));

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_platforms ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- =====================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop ALL policies on ALL tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE '✅ All existing policies dropped';
END $$;

-- =====================================================
-- RLS POLICIES - FIXED (NO "TO authenticated")
-- =====================================================

-- Default tables: Public read (anyone can read, no auth restrictions)
CREATE POLICY "read_default_statuses" ON default_statuses
  FOR SELECT 
  USING (true);

CREATE POLICY "read_default_platforms" ON default_platforms
  FOR SELECT 
  USING (true);

-- Users table: User-specific (can only view/update own profile)
CREATE POLICY "read_own_profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "update_own_profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- Jobs table: User-specific (secure)
CREATE POLICY "read_own_jobs" ON jobs
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "create_own_jobs" ON jobs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_jobs" ON jobs
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "delete_own_jobs" ON jobs
  FOR DELETE 
  USING (auth.uid() = user_id);

-- User statuses: User-specific (secure)
CREATE POLICY "read_own_statuses" ON user_statuses
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "create_own_statuses" ON user_statuses
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_statuses" ON user_statuses
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "delete_own_statuses" ON user_statuses
  FOR DELETE 
  USING (auth.uid() = user_id);

-- User platforms: User-specific (secure)
CREATE POLICY "read_own_platforms" ON user_platforms
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "create_own_platforms" ON user_platforms
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_platforms" ON user_platforms
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "delete_own_platforms" ON user_platforms
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE jobs IS 'Stores job application records for users';
COMMENT ON TABLE user_statuses IS 'User-defined custom application statuses';
COMMENT ON TABLE user_platforms IS 'User-defined custom application platforms';
COMMENT ON TABLE default_statuses IS 'System-wide default application statuses';
COMMENT ON TABLE default_platforms IS 'System-wide default application platforms';
COMMENT ON COLUMN jobs.application_platforms IS 'Array of platform keys where application was submitted';
COMMENT ON COLUMN jobs.notes IS 'User notes about the application (max 5000 chars)';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify NO "TO authenticated" anywhere
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN roles IS NULL THEN '✅ NO ROLE RESTRICTION'
    ELSE '❌ HAS ROLE RESTRICTION: ' || array_to_string(roles, ', ')
  END as role_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'jobs', 'user_statuses', 'user_platforms', 'default_statuses', 'default_platforms')
ORDER BY tablename, policyname;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ DATABASE SCHEMA CREATED SUCCESSFULLY!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables Created:';
  RAISE NOTICE '  - public.users (user profiles)';
  RAISE NOTICE '  - jobs (job applications)';
  RAISE NOTICE '  - user_statuses (custom statuses)';
  RAISE NOTICE '  - user_platforms (custom platforms)';
  RAISE NOTICE '  - default_statuses (system defaults)';
  RAISE NOTICE '  - default_platforms (system defaults)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security Model:';
  RAISE NOTICE '  - default_statuses: Public read (no auth restrictions)';
  RAISE NOTICE '  - default_platforms: Public read (no auth restrictions)';
  RAISE NOTICE '  - users: User-specific (auth.uid() = id)';
  RAISE NOTICE '  - jobs: User-specific (auth.uid() = user_id)';
  RAISE NOTICE '  - user_statuses: User-specific (auth.uid() = user_id)';
  RAISE NOTICE '  - user_platforms: User-specific (auth.uid() = user_id)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Edge Functions can now:';
  RAISE NOTICE '  ✓ Read default tables';
  RAISE NOTICE '  ✓ Insert into user tables (with correct user_id)';
  RAISE NOTICE '  ✓ Update user tables (with correct user_id)';
  RAISE NOTICE '  ✓ Delete from user tables (with correct user_id)';
  RAISE NOTICE '';
  RAISE NOTICE '🛡️ Security Preserved:';
  RAISE NOTICE '  ✓ Users can only access their own data';
  RAISE NOTICE '  ✓ auth.uid() comes from verified JWT';
  RAISE NOTICE '  ✓ No user can access another users data';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to use!';
  RAISE NOTICE '================================================';
END $$;