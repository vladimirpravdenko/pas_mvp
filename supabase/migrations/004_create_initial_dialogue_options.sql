CREATE TABLE IF NOT EXISTS public.initial_dialogue_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.initial_dialogue_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.initial_dialogue_options (template_id, label, value, "order")
SELECT id, 'Happy', 'Happy', 1
FROM public.initial_dialogue_templates
WHERE field_name = 'mood';

INSERT INTO public.initial_dialogue_options (template_id, label, value, "order")
SELECT id, 'Calm', 'Calm', 2
FROM public.initial_dialogue_templates
WHERE field_name = 'mood';

INSERT INTO public.initial_dialogue_options (template_id, label, value, "order")
SELECT id, 'Energetic', 'Energetic', 3
FROM public.initial_dialogue_templates
WHERE field_name = 'mood';
