CREATE TYPE field_type AS ENUM ('text', 'text[]', 'tag[]', 'paragraph');

CREATE TABLE IF NOT EXISTS public.initial_dialogue_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type field_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT initial_dialogue_templates_field_name_key UNIQUE(field_name)
);
