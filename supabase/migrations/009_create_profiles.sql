CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  subscription_tier TEXT,
  billing_status TEXT,
  payment_provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
