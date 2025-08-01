ALTER TABLE public.user_initial_dialogue_responses
  ADD COLUMN IF NOT EXISTS responses JSONB;
