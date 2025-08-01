CREATE TABLE IF NOT EXISTS public.song_dialogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
