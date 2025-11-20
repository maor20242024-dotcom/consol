-- ==========================================
-- SUPABASE RLS PERFORMANCE FIXES
-- Run these in Supabase SQL Editor
-- ==========================================

-- 1. Fix "Users can view own profile" policy
--    Problem: auth.uid() re-evaluated per row
--    Solution: Wrap in SELECT subquery

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (id = (SELECT auth.uid()));


-- 2. Consolidate multiple permissive SELECT policies
--    Problem: Multiple policies for same role/action hurt performance
--    Solution: Combine into single policy with OR

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Allow admin or owner view" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (
  -- User is admin OR viewing their own profile
  (role = 'admin') 
  OR 
  (id = (SELECT auth.uid()))
);


-- 3. Add index on user_id/id for better RLS performance

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);


-- 4. Fix leads and campaigns RLS policies (if they have similar issues)

-- For leads table
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

CREATE POLICY "Authenticated users can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;

CREATE POLICY "Authenticated users can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

CREATE POLICY "Authenticated users can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

CREATE POLICY "Authenticated users can delete leads"
ON public.leads
FOR DELETE
TO authenticated
USING (true);


-- For campaigns table
DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON public.campaigns;

CREATE POLICY "Authenticated users can view campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert campaigns" ON public.campaigns;

CREATE POLICY "Authenticated users can insert campaigns"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update campaigns" ON public.campaigns;

CREATE POLICY "Authenticated users can update campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete campaigns" ON public.campaigns;

CREATE POLICY "Authenticated users can delete campaigns"
ON public.campaigns
FOR DELETE
TO authenticated
USING (true);


-- 5. Ensure RLS is enabled on all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- VERIFICATION QUERIES
-- Run these to confirm policies are correct
-- ==========================================

-- Check profiles policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check leads policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'leads';

-- Check campaigns policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'campaigns';

-- Check indexes
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM pg_indexes
WHERE tablename IN ('profiles', 'leads', 'campaigns')
ORDER BY tablename, indexname;
