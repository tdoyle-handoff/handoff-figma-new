-- Contracts table, indexes, triggers, and RLS policies
-- Run this against your Supabase project (e.g., via CLI or SQL editor)

-- Ensure helper function exists (if not already created in other migrations)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1) Table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  type TEXT CHECK (type IN ('purchase-agreement','counter-offer','addendum','disclosure','other')) DEFAULT 'purchase-agreement',
  storage_bucket TEXT DEFAULT 'contracts',
  storage_path TEXT,
  status TEXT CHECK (status IN ('uploaded','analyzing','analyzed','error','pending-review')) DEFAULT 'uploaded',
  risk_level TEXT CHECK (risk_level IN ('low','medium','high')) DEFAULT 'medium',
  summary_text TEXT,
  analysis JSONB,
  error TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_started_at TIMESTAMPTZ,
  analysis_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_user_uploaded_at ON public.contracts(user_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);

-- 3) Trigger
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4) RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contracts" ON public.contracts;
CREATE POLICY "Users can view own contracts" ON public.contracts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own contracts" ON public.contracts;
CREATE POLICY "Users can insert own contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contracts" ON public.contracts;
CREATE POLICY "Users can update own contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own contracts" ON public.contracts;
CREATE POLICY "Users can delete own contracts" ON public.contracts
  FOR DELETE USING (auth.uid() = user_id);

-- 5) Storage bucket and policies (run separately in Storage UI or SQL)
-- Create a private bucket named "contracts" via Dashboard or CLI
-- Then add policies on storage.objects

-- Allow users to read their own objects under user_id/ prefix
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Users can read own contracts objects'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can read own contracts objects" ON storage.objects
      FOR SELECT
      USING (
        bucket_id = 'contracts'
        AND auth.uid()::text = split_part(name, '/', 1)
      );
  END IF;
END $$;

-- Allow users to upload into their own prefix
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Users can upload own contracts objects'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can upload own contracts objects" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'contracts'
        AND auth.uid()::text = split_part(name, '/', 1)
      );
  END IF;
END $$;

-- Allow users to update/delete their own objects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Users can update own contracts objects'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can update own contracts objects" ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'contracts'
        AND auth.uid()::text = split_part(name, '/', 1)
      )
      WITH CHECK (
        bucket_id = 'contracts'
        AND auth.uid()::text = split_part(name, '/', 1)
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Users can delete own contracts objects'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can delete own contracts objects" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'contracts'
        AND auth.uid()::text = split_part(name, '/', 1)
      );
  END IF;
END $$;

