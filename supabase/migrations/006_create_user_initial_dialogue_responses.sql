CREATE TABLE IF NOT EXISTS public.user_initial_dialogue_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  template_id UUID NOT NULL REFERENCES public.initial_dialogue_templates(id),
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_initial_dialogue_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert" ON user_initial_dialogue_responses
  FOR INSERT
  WITH CHECK (true);

